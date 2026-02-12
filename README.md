# 🐾 펫플 (Petple) - 반려동물 소셜 매칭

> 우리 아이 친구 만들기! 반려동물 매칭, 산책 모임, 펫 스토리

---

## 🚀 배포 가이드 (처음이어도 10분이면 됩니다!)

### Step 1: GitHub 가입 & 저장소 만들기

1. **[github.com](https://github.com)** 접속 → `Sign up` 클릭
2. 이메일, 비밀번호, 유저네임 입력하면 가입 완료
3. 가입 후 우측 상단 `+` 버튼 → `New repository` 클릭
4. 설정:
   - Repository name: `petple`
   - 공개 여부: `Public` 선택
   - `Add a README file` 체크 **하지 마세요** (우리가 만든 게 있으니까)
   - `Create repository` 클릭

### Step 2: 파일 업로드

1. 생성된 저장소 페이지에서 `uploading an existing file` 링크 클릭
2. 이 폴더의 **모든 파일과 폴더**를 드래그 앤 드롭
   - 📁 `src/` 폴더
   - 📁 `public/` 폴더
   - 📄 `package.json`
   - 📄 `vite.config.js`
   - 📄 `index.html`
   - 📄 `.gitignore`
3. 하단에 `Commit changes` 클릭

> ⚠️ 파일을 하나씩 올리지 말고, 폴더째로 드래그하세요!
> 만약 폴더 업로드가 안 되면 아래 "Git 명령어로 올리기" 참고

### Step 3: Vercel 배포

1. **[vercel.com](https://vercel.com)** 접속 → `Sign Up` → `Continue with GitHub` 클릭
2. GitHub 계정 연동 허용
3. 대시보드에서 `Add New...` → `Project` 클릭
4. `Import Git Repository`에서 `petple` 저장소 선택 → `Import`
5. 설정 화면:
   - Framework Preset: `Vite` (자동 감지됨)
   - 나머지는 기본값 그대로!
   - `Deploy` 클릭
6. 1~2분 기다리면 배포 완료! 🎉
7. `petple-xxxxx.vercel.app` 주소가 생성됨

### Step 4: 주소 확인 & 공유

- Vercel 대시보드 → 프로젝트 → `Settings` → `Domains`
- 기본 주소: `petple-xxxxx.vercel.app`
- 이 링크를 카카오톡, 인스타그램에 공유하면 끝!

---

## 🌐 커스텀 도메인 연결 (선택)

`petple.app` 같은 도메인을 사고 싶다면:

1. [가비아](https://gabia.com) 또는 [Namecheap](https://namecheap.com)에서 도메인 구매
2. Vercel 대시보드 → `Settings` → `Domains` → 도메인 입력
3. 가비아/Namecheap DNS 설정에서 Vercel이 알려주는 값 입력
4. 10~30분 후 연결 완료

---

## 📱 홈 화면에 추가하는 법 (유저에게 안내)

이 앱은 PWA(Progressive Web App)로 설정되어 있어서
유저가 홈 화면에 추가하면 진짜 앱처럼 사용할 수 있어요!

**아이폰(Safari):**
1. 사이트 접속
2. 하단 공유 버튼 (□↑) 탭
3. "홈 화면에 추가" 선택

**안드로이드(Chrome):**
1. 사이트 접속
2. 우측 상단 점 3개 (⋮) 탭
3. "홈 화면에 추가" 선택

---

## 🛠 로컬에서 테스트하기

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 http://localhost:5173 접속
```

---

## 📂 프로젝트 구조

```
petple/
├── public/
│   ├── manifest.json    ← PWA 설정
│   ├── sw.js            ← 서비스워커 (오프라인 지원)
│   ├── favicon.svg      ← 파비콘
│   ├── icon-192.png     ← PWA 아이콘 (작은)
│   ├── icon-512.png     ← PWA 아이콘 (큰)
│   └── og-image.png     ← 카카오톡/SNS 공유 이미지
├── src/
│   ├── App.jsx          ← 메인 앱 코드
│   └── main.jsx         ← React 엔트리포인트
├── index.html           ← HTML 템플릿 (SEO + PWA)
├── package.json         ← 프로젝트 설정
├── vite.config.js       ← 빌드 설정
└── README.md            ← 이 파일
```

---

## 💡 Git 명령어로 올리기 (선택)

파일이 많아서 GitHub 웹에서 올리기 어려우면:

```bash
# Git 설치 후 터미널에서:
cd petple
git init
git add .
git commit -m "🐾 펫플 v1.0.0 런칭"
git branch -M main
git remote add origin https://github.com/내아이디/petple.git
git push -u origin main
```

---

## 📋 런칭 체크리스트

- [ ] GitHub 저장소 생성
- [ ] 파일 업로드
- [ ] Vercel 배포
- [ ] 배포 URL 확인
- [ ] 카카오톡으로 링크 공유 테스트
- [ ] 모바일에서 접속 테스트
- [ ] "홈 화면에 추가" 테스트
- [ ] SNS 공유 시 미리보기 이미지 확인
- [ ] 인스타그램 공식 계정 개설
- [ ] 초기 홍보 시작!

---

© 2025 펫플 (Petple). 대표 김영웅
