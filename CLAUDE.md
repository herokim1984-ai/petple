# 펫플 (Petple) - 프로젝트 가이드

## 프로젝트 개요
반려동물 소셜 매칭 PWA 앱. React 단일 파일(App.jsx ~4900줄) + Firebase 백엔드.
대표: 김영웅 | 사업자번호: 743-09-03086

## 기술 스택
- **프론트엔드**: React 18 (단일 컴포넌트), Vite 5 빌드
- **백엔드**: Firebase (Auth + Firestore)
- **배포**: Vercel (PWA)
- **인증**: 이메일/비밀번호 + Google 로그인
- **결제**: Digital Goods API + Payment Request API (Google Play TWA)

## 빌드 & 실행
```bash
npm install
npm run dev        # 개발 서버 (localhost:5173)
npm run build      # 프로덕션 빌드 (dist/)
```

## 프로젝트 구조
```
src/
├── App.jsx        # 메인 앱 (모든 UI + 로직)
├── firebase.js    # Firebase 설정 (auth, db, googleProvider export)
└── main.jsx       # React 엔트리포인트
public/
├── manifest.json  # PWA 설정
├── sw.js          # 서비스워커
├── privacy.html   # 개인정보 처리방침
└── child-safety.html  # 아동 안전 정책
```

## Firestore 컬렉션 구조
| 컬렉션 | 용도 |
|---|---|
| `users` | 유저 프로필 (nick, profilePhotos, points, petInfo 등) |
| `communityPosts` | 라운지 게시글 (likes, comments, imgs, reportCount) |
| `communityStories` | 스토리 (likes, comments, img) |
| `communityMeetings` | 모임 (members, board, chats, photos, votes) |
| `chatRooms` | 1:1 채팅방 (users, messages) |
| `messages` | 채팅 메시지 |
| `notifications` | 알림 (to, type, read, ts) |
| `reports` | 유저 신고 |
| `postReports` | 게시글 신고 |

## 앱 주요 탭 (하단 네비게이션)
- **home**: 반려동물 매칭 (스와이프 카드)
- **community**: 라운지 (게시글, 댓글, 대댓글)
- **story**: 펫 스토리 (사진+텍스트)
- **meeting**: 모임 (게시판, 사진, 투표, 채팅)
- **messages**: 1:1 채팅 + 관심 목록

## 주요 상수/설정
- `LOUNGE_CATS`: 라운지 카테고리 (전체/내피드/인기/동네산책/봉사/교배/병원/알바/실종/발견)
- `REGIONS`: 전국 지역 목록 (서울/경기/부산/인천 등 18개 시도)
- `LOCATION_AREAS`: 좌표 기반 지역 (lat/lng)
- `BAD_WORDS`: 욕설 필터 단어 목록
- `WRITE_COST`: 글 작성 비용 (현재 0)
- `DAILY_SWIPE_LIMIT`: 일일 스와이프 제한 (20)
- `BUY_PACKAGES`: 포인트 구매 패키지 (50/150/500/1200p)
- `G`: 그라데이션 테마색 (`linear-gradient(135deg,#ec4899,#a855f7)`)

## 핵심 동기화 패턴
- 게시글/스토리에는 `_fid` (Firestore Document ID) 필드가 있음
- `syncPostToFirestore()` / `syncStoryToFirestore()`: 좋아요/댓글을 Firestore에 즉시 동기화
- `postsRef.current` / `storiesRef.current`: useRef로 최신 상태 추적
- 이미지는 base64 압축 후 저장 (Firestore 1MB 제한), 큰 이미지는 `[img]`로 대체 후 localStorage 캐시
- 로컬 좋아요/댓글이 서버보다 많으면 로컬 우선 (동기화 지연 대응)

## 한글 입력 (IME) 주의사항
모든 `onKeyDown` Enter 핸들러에는 반드시 `!e.isComposing` 체크 필요.
한글 조합 중 Enter 시 의도치 않은 전송 방지.
```jsx
// 올바른 패턴
onKeyDown={e => e.key === "Enter" && !e.isComposing && handleSubmit()}
```

## 결제 시스템
- `purchasePoints(pkg)`: Digital Goods API → Payment Request API → 웹 안내 순으로 시도
- `appAlert` state + `showAlert()`: 브라우저 alert 대신 커스텀 모달 사용 (URL 노출 방지)
- `productId`: Google Play 상품 ID (point_50, point_150, point_500, point_1200)

## 코드 수정 시 주의사항
1. **단일 파일 구조**: 모든 로직이 `App.jsx` 하나에 있어 수정 시 사이드이펙트 주의
2. **Firestore 동기화**: 게시글/스토리 수정 시 `syncPostToFirestore`/`syncStoryToFirestore` 호출 필요
3. **이미지 처리**: `compressImage()`로 400px 이하로 리사이즈 + JPEG 60% 압축
4. **욕설 필터**: `hasBadWord()` 체크 후 `filterBadWords()`로 마스킹
5. **포인트 시스템**: 활동으로 획득, 글 작성/슈퍼좋아요 등에 소비. Firestore에 동기화됨
6. **차단 유저**: `blockedUsers` Set으로 관리, 매칭/게시글/채팅에서 필터링
7. **신고 시스템**: `reportCount >= 5`이면 게시글 자동 숨김
