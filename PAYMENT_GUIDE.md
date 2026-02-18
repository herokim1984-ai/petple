# 🐾 펫플 결제 연동 가이드

## 전체 구조

```
유저가 포인트 구매 클릭
  → 포트원 SDK가 결제창 팝업 (카드/카카오페이 등)
  → 결제 완료
  → Firebase Cloud Functions에서 결제 검증
  → 검증 성공 시 포인트 지급
```

---

## 1단계: 포트원 가입 + 테스트 코드 발급

### 1-1. 포트원 가입
1. https://portone.io 접속
2. 회원가입 (이메일)
3. 관리자 콘솔 진입

### 1-2. 테스트 채널 설정
1. 관리자 콘솔 → **결제 연동** → **테스트 연동 관리**
2. **채널 추가** 클릭
3. PG사: **토스페이먼츠** 선택
4. 채널명: "펫플 테스트" 입력
5. 저장

### 1-3. 가맹점 코드 확인
1. 관리자 콘솔 → **상점·계정 관리** → **내 식별코드**
2. `imp` 로 시작하는 코드 복사 (예: `imp12345678`)

### 1-4. REST API 키 확인
1. 관리자 콘솔 → **상점·계정 관리** → **내 식별코드**
2. **REST API Key** 복사
3. **REST API Secret** 복사

---

## 2단계: 코드에 가맹점 코드 입력

### App.jsx 수정
`src/App.jsx` 에서 아래 부분을 찾아 실제 코드로 교체:

```javascript
const IMP_CODE = "imp00000000"; // ← 여기를 실제 가맹점코드로 교체
```

예시:
```javascript
const IMP_CODE = "imp12345678"; // 포트원에서 발급받은 코드
```

---

## 3단계: Firebase Cloud Functions 배포

### 3-1. Firebase CLI 설치 (이미 설치되어 있으면 스킵)
```bash
npm install -g firebase-tools
```

### 3-2. Firebase 로그인
```bash
firebase login
```

### 3-3. functions 디렉토리에서 의존성 설치
```bash
cd functions
npm install
```

### 3-4. REST API 키 설정

**방법 A: 환경변수로 설정 (권장)**
```bash
firebase functions:config:set iamport.key="REST_API_키" iamport.secret="REST_API_시크릿"
```
→ 이 방법 사용 시 index.js의 환경변수 부분을 아래로 수정:
```javascript
const IMP_REST_KEY = functions.config().iamport.key;
const IMP_REST_SECRET = functions.config().iamport.secret;
```

**방법 B: 직접 입력 (간단하지만 보안 주의)**
`functions/index.js` 에서:
```javascript
const IMP_REST_KEY = "여기에_REST_API_키";
const IMP_REST_SECRET = "여기에_REST_API_시크릿";
```

### 3-5. 배포
```bash
cd ..  # petple-deploy 루트로 이동
firebase deploy --only functions
```

배포 성공 시 이런 URL이 나옵니다:
```
✓ Function verifyPayment deployed
  https://us-central1-petpleclaude.cloudfunctions.net/verifyPayment
```

---

## 4단계: 테스트 결제

### 4-1. 테스트 카드번호
포트원 테스트 모드에서는 아무 카드번호나 입력해도 됩니다:
- 카드번호: `4242-4242-4242-4242`
- 유효기간: 아무거나
- 비밀번호 앞 2자리: 아무거나
- 생년월일: 아무거나

### 4-2. 테스트 시나리오
1. ✅ 포인트 상점 → 스타터 500p 구매 → 결제 성공 → 포인트 반영 확인
2. ✅ 결제 중 취소 → 에러 메시지 없이 조용히 닫힘 확인
3. ✅ Firebase Console → Firestore → payments 컬렉션에 기록 확인

### 4-3. 확인 체크리스트
- [ ] 결제창이 정상적으로 뜨는가?
- [ ] 테스트 결제 성공 후 포인트가 증가하는가?
- [ ] Firestore payments 컬렉션에 기록이 남는가?
- [ ] 결제 취소 시 에러가 발생하지 않는가?

---

## 5단계: 실결제 전환

테스트가 다 되면:

1. 포트원 관리자 콘솔 → **결제 연동** → **실 연동 관리**
2. **채널 추가** → 토스페이먼츠 선택
3. 서류 제출:
   - 사업자등록증
   - 통신판매업 신고증
   - 앱 캡처화면 (결제 경로 PPT)
4. 심사 대기 (3~5영업일)
5. 승인 후 App.jsx의 `IMP_CODE`를 실결제용 코드로 교체
6. `pg: "tosspayments"` 의 PG 코드도 실결제용으로 변경

---

## Firestore 보안 규칙 (결제용 추가)

Firebase Console → Firestore → 규칙에 추가:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // payments 컬렉션: 서버(Cloud Functions)만 쓰기 가능
    match /payments/{paymentId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.uid;
      allow write: if false; // 클라이언트에서 직접 쓰기 불가
    }
  }
}
```

---

## 관리자: 결제 내역 확인

브라우저에서:
```
https://us-central1-petpleclaude.cloudfunctions.net/getPayments?key=petple-admin-2024
```
→ 최근 50건의 결제 내역을 JSON으로 확인

또는 Firebase Console → Firestore → payments 컬렉션에서 직접 확인

---

## 문제 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| 결제창이 안 뜸 | SDK 로드 실패 | index.html에 script 태그 확인 |
| "결제 모듈을 불러오는 중" | IMP 객체 없음 | 새로고침 후 재시도 |
| 결제 후 포인트 미반영 | 검증 서버 오류 | Cloud Functions 로그 확인 |
| "금액 불일치" | 위변조 시도 | 자동 환불 처리됨 |
| CORS 에러 | Functions에 cors 미설정 | cors 패키지 설치 확인 |
