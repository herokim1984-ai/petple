const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// ═══════════════════════════════════════════════════════════════
// ⚠️ 반드시 실제 포트원 REST API 키로 교체하세요
// Firebase Console → Functions → 환경변수 또는 아래 직접 입력
// ═══════════════════════════════════════════════════════════════
const IMP_REST_KEY = process.env.IMP_REST_KEY || "여기에_REST_API_키";
const IMP_REST_SECRET = process.env.IMP_REST_SECRET || "여기에_REST_API_시크릿";

// 상품 정의 (프론트와 일치해야 함)
const PRODUCTS = {
  point_500:  { amount: 500,  price: 500,  label: "스타터" },
  point_1200: { amount: 1200, price: 1000, label: "베이직" },
  point_3000: { amount: 3000, price: 2000, label: "스탠다드" },
  point_8000: { amount: 8000, price: 5000, label: "프리미엄" },
};

// ── 포트원 액세스 토큰 발급 ──
async function getImpToken() {
  const res = await axios.post("https://api.iamport.kr/users/getToken", {
    imp_key: IMP_REST_KEY,
    imp_secret: IMP_REST_SECRET,
  });
  return res.data.response.access_token;
}

// ── 결제 검증 API ──
exports.verifyPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // POST만 허용
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const { imp_uid, merchant_uid, item_id, expected_amount, uid } = req.body;

    // 필수 파라미터 검증
    if (!imp_uid || !merchant_uid || !item_id || !uid) {
      return res.status(400).json({ success: false, message: "필수 파라미터가 누락되었습니다" });
    }

    // 상품 존재 확인
    const product = PRODUCTS[item_id];
    if (!product) {
      return res.status(400).json({ success: false, message: "존재하지 않는 상품입니다" });
    }

    try {
      // 1. 포트원 액세스 토큰 발급
      const token = await getImpToken();

      // 2. 포트원에서 결제 정보 조회
      const paymentRes = await axios.get(
        `https://api.iamport.kr/payments/${imp_uid}`,
        { headers: { Authorization: token } }
      );
      const payment = paymentRes.data.response;

      // 3. 결제 상태 확인
      if (payment.status !== "paid") {
        return res.status(400).json({
          success: false,
          message: `결제 상태 이상: ${payment.status}`,
        });
      }

      // 4. 금액 검증 (프론트 금액 / 서버 상품 금액 / 실제 결제 금액 3중 체크)
      if (payment.amount !== product.price) {
        // 금액 불일치 → 위변조 시도 가능
        console.error("금액 불일치!", {
          paid: payment.amount,
          expected: product.price,
          item_id,
          uid,
          imp_uid,
        });

        // 자동 환불 처리
        try {
          await axios.post(
            "https://api.iamport.kr/payments/cancel",
            { imp_uid, reason: "금액 위변조 감지" },
            { headers: { Authorization: token } }
          );
        } catch (cancelErr) {
          console.error("자동 환불 실패:", cancelErr);
        }

        return res.status(400).json({
          success: false,
          message: "결제 금액이 일치하지 않습니다. 자동 환불 처리됩니다.",
        });
      }

      // 5. 중복 결제 확인 (같은 imp_uid로 이미 처리됐는지)
      const dupCheck = await db.collection("payments")
        .where("imp_uid", "==", imp_uid)
        .limit(1)
        .get();

      if (!dupCheck.empty) {
        return res.status(400).json({
          success: false,
          message: "이미 처리된 결제입니다",
        });
      }

      // 6. 유저에게 포인트 지급
      const userRef = db.doc(`users/${uid}`);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(400).json({ success: false, message: "유저를 찾을 수 없습니다" });
      }

      const currentPoints = userSnap.data().points || 0;
      await userRef.update({
        points: currentPoints + product.amount,
      });

      // 7. 결제 기록 저장
      await db.collection("payments").add({
        uid,
        imp_uid,
        merchant_uid,
        item_id,
        product_label: product.label,
        amount_paid: payment.amount,
        points_given: product.amount,
        status: "completed",
        pg_provider: payment.pg_provider || "tosspayments",
        pay_method: payment.pay_method || "card",
        buyer_name: payment.buyer_name || "",
        ts: admin.firestore.FieldValue.serverTimestamp(),
        created_at: new Date().toISOString(),
      });

      // 8. 성공 응답
      console.log(`결제 성공: ${uid} → ${product.amount}p (${payment.amount}원)`);
      return res.status(200).json({
        success: true,
        message: "결제가 완료되었습니다",
        points_given: product.amount,
      });

    } catch (error) {
      console.error("결제 검증 오류:", error);
      return res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다. 고객센터로 문의해주세요.",
      });
    }
  });
});

// ── 결제 내역 조회 API (관리자용) ──
exports.getPayments = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      return res.status(405).json({ success: false });
    }

    // 간단한 관리자 키 체크 (실제로는 Firebase Auth 토큰 검증 권장)
    const adminKey = req.query.key;
    if (adminKey !== "petple-admin-2024") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    try {
      const snap = await db.collection("payments")
        .orderBy("ts", "desc")
        .limit(50)
        .get();

      const payments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.status(200).json({ success: true, payments });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  });
});
