import { useState, useRef, useEffect } from "react";
import { auth, db, googleProvider } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, deleteUser, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, addDoc, orderBy, limit as fbLimit, Timestamp, onSnapshot } from "firebase/firestore";


const LOUNGE_CATS = [
  {key:"all",label:"전체",icon:"🐾"},
  {key:"feed",label:"내 피드",icon:"💛"},
  {key:"hot",label:"인기",icon:"🔥"},
  {key:"walk",label:"동네산책",icon:"🏃"},
  {key:"vol",label:"봉사",icon:"🤝"},
  {key:"breed",label:"교배",icon:"💕"},
  {key:"hospital",label:"병원",icon:"🏥"},
  {key:"job",label:"알바",icon:"💼"},
  {key:"missing",label:"실종",icon:"🆘"},
  {key:"found",label:"발견",icon:"📢"},
];

const LOCATION_AREAS = [
  {name:"인천 연수구",lat:37.41,lng:126.68},{name:"인천 남동구",lat:37.45,lng:126.73},{name:"인천 미추홀구",lat:37.44,lng:126.65},
  {name:"인천 부평구",lat:37.51,lng:126.72},{name:"인천 계양구",lat:37.56,lng:126.74},{name:"인천 서구",lat:37.55,lng:126.68},
  {name:"인천 중구",lat:37.47,lng:126.62},{name:"인천 동구",lat:37.47,lng:126.64},{name:"인천 강화군",lat:37.75,lng:126.49},
  {name:"서울 강남구",lat:37.50,lng:127.03},{name:"서울 서초구",lat:37.48,lng:127.01},{name:"서울 송파구",lat:37.51,lng:127.11},
  {name:"서울 강동구",lat:37.53,lng:127.13},{name:"서울 마포구",lat:37.56,lng:126.91},{name:"서울 용산구",lat:37.53,lng:126.97},
  {name:"서울 종로구",lat:37.57,lng:126.98},{name:"서울 중구",lat:37.56,lng:126.99},{name:"서울 성동구",lat:37.56,lng:127.04},
  {name:"서울 광진구",lat:37.54,lng:127.08},{name:"서울 동대문구",lat:37.57,lng:127.04},{name:"서울 중랑구",lat:37.60,lng:127.09},
  {name:"서울 성북구",lat:37.59,lng:127.02},{name:"서울 강북구",lat:37.64,lng:127.01},{name:"서울 도봉구",lat:37.67,lng:127.03},
  {name:"서울 노원구",lat:37.65,lng:127.06},{name:"서울 은평구",lat:37.60,lng:126.93},{name:"서울 서대문구",lat:37.58,lng:126.94},
  {name:"서울 영등포구",lat:37.53,lng:126.90},{name:"서울 동작구",lat:37.51,lng:126.94},{name:"서울 관악구",lat:37.48,lng:126.95},
  {name:"서울 금천구",lat:37.46,lng:126.90},{name:"서울 구로구",lat:37.50,lng:126.89},{name:"서울 양천구",lat:37.52,lng:126.87},
  {name:"서울 강서구",lat:37.55,lng:126.85},{name:"경기 수원시",lat:37.26,lng:127.03},{name:"경기 성남시",lat:37.42,lng:127.13},
  {name:"경기 부천시",lat:37.50,lng:126.76},{name:"경기 안양시",lat:37.39,lng:126.92},{name:"경기 고양시",lat:37.66,lng:126.83},
  {name:"경기 용인시",lat:37.24,lng:127.18},{name:"경기 화성시",lat:37.20,lng:126.83},{name:"경기 파주시",lat:37.76,lng:126.78},
  {name:"경기 시흥시",lat:37.38,lng:126.80},{name:"경기 김포시",lat:37.62,lng:126.72},{name:"경기 광명시",lat:37.48,lng:126.86},
  {name:"경기 하남시",lat:37.54,lng:127.21},{name:"경기 평택시",lat:36.99,lng:127.09},
  {name:"부산 해운대구",lat:35.16,lng:129.16},{name:"부산 부산진구",lat:35.16,lng:129.05},{name:"부산 동래구",lat:35.20,lng:129.08},
  {name:"부산 남구",lat:35.14,lng:129.08},{name:"부산 중구",lat:35.10,lng:129.03},
  {name:"대구 중구",lat:35.87,lng:128.60},{name:"대구 수성구",lat:35.86,lng:128.63},{name:"대구 달서구",lat:35.83,lng:128.53},
  {name:"대전 유성구",lat:36.36,lng:127.36},{name:"대전 서구",lat:36.35,lng:127.38},
  {name:"광주 서구",lat:35.15,lng:126.89},{name:"광주 북구",lat:35.17,lng:126.91},
  {name:"울산 남구",lat:35.54,lng:129.33},{name:"세종시",lat:36.48,lng:127.00},
  {name:"제주시",lat:33.50,lng:126.53},{name:"서귀포시",lat:33.25,lng:126.56},
  {name:"춘천시",lat:37.88,lng:127.73},{name:"원주시",lat:37.34,lng:127.92},
  {name:"천안시",lat:36.81,lng:127.11},{name:"청주시",lat:36.64,lng:127.49},
  {name:"전주시",lat:35.82,lng:127.15},{name:"포항시",lat:36.02,lng:129.37},
  {name:"창원시",lat:35.23,lng:128.68},{name:"김해시",lat:35.23,lng:128.88},
];
const INIT_POSTS = [];

const WRITE_COST = 30;

const INIT_MEETINGS = [];

const G = "linear-gradient(135deg,#ec4899,#a855f7)";

const REGIONS = {
  "인천":{icon:"🏙",districts:["전체","연수구","남동구","미추홀구","부평구","계양구","서구","중구","동구","강화군","옹진군"]},
  "서울":{icon:"🗼",districts:["전체","강남구","서초구","송파구","마포구","용산구","성동구","광진구","동대문구","중랑구","강동구","기타"]},
  "경기":{icon:"🌳",districts:["전체","수원시","성남시","부천시","안양시","광명시","시흥시","안산시","고양시","의정부시","용인시","기타"]},
  "부산":{icon:"🌊",districts:["전체","해운대구","수영구","남구","동래구","부산진구","사하구","기장군","기타"]},
  "대구":{icon:"🏔",districts:["전체","중구","동구","서구","남구","북구","수성구","달서구","기타"]},
  "대전":{icon:"🔬",districts:["전체","유성구","서구","중구","동구","대덕구"]},
  "광주":{icon:"🎨",districts:["전체","동구","서구","남구","북구","광산구"]},
  "울산":{icon:"🏭",districts:["전체","중구","남구","동구","북구","울주군"]},
  "세종":{icon:"🏛",districts:["전체"]},
  "제주":{icon:"🍊",districts:["전체","제주시","서귀포시"]},
};

const MEMBER_AVATARS = {};

function Input({ label, type, placeholder, value, onChange, hint, onEnter }) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>
        {label} {hint && <span style={{fontWeight:400,color:"#9ca3af"}}>{hint}</span>}
      </label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onEnter && onEnter()}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{width:"100%",padding:"12px 14px",border:`2px solid ${focus?"#ec4899":"#e5e7eb"}`,borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box",transition:"border-color .15s"}}
      />
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [signup,   setSignup]   = useState(false);
  const [email,    setEmail]    = useState("");
  const [pw,       setPw]       = useState("");
  const [pwConfirm,setPwConfirm]= useState("");
  const [nick,     setNick]     = useState("");
  const [err,      setErr]      = useState("");
  const [user,     setUser]     = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // 추가 가입 정보
  const [signupGender, setSignupGender] = useState("");
  const [signupBirth, setSignupBirth] = useState("");
  const [signupRegion, setSignupRegion] = useState("인천 연수구");
  // 홈 카드 UI
  const [photoIdx, setPhotoIdx] = useState(0);
  const [superLikeConfirm, setSuperLikeConfirm] = useState(null); // 슈퍼좋아요 확인 모달
  // 글/댓글 수정삭제
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState("");
  // 온보딩 튜토리얼
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  // 신고/차단
  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [blockedUsers, setBlockedUsers] = useState(new Set());
  // 일일 스와이프 제한
  const [dailySwipes, setDailySwipes] = useState(0);
  const DAILY_SWIPE_LIMIT = 20;
  // 프로필 부스트
  const [isBoosted, setIsBoosted] = useState(false);
  const [showRecoSettings, setShowRecoSettings] = useState(false);
  const [recoSettings, setRecoSettings] = useState({distance:10,petType:"all",ageRange:"all",gender:"all"});
  const [boostEndTime, setBoostEndTime] = useState(null);
  // 관심 탭 모드
  const [interestMode, setInterestMode] = useState("chat");
  // 관심사 태그 (가입 시 선택)
  const [signupInterests, setSignupInterests] = useState([]);
  // 프로필 인증
  const [isVerified, setIsVerified] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  // 나를 좋아한 사람 보기
  const [showSecretLikes, setShowSecretLikes] = useState(false);
  const [secretLikesUnlocked, setSecretLikesUnlocked] = useState(false);
  // (산책 데이트 기능 제거됨)

  // 로그인 옵션
  const [saveEmail,  setSaveEmail]  = useState(false);
  const [autoLogin,  setAutoLogin]  = useState(false);
  const [savedEmail, setSavedEmail] = useState(""); // 저장된 이메일
  const [savedPw,    setSavedPw]    = useState(""); // 자동로그인용
  const [savedNick,  setSavedNick]  = useState(""); // 자동로그인용
  const [autoLoginReady, setAutoLoginReady] = useState(false); // 자동로그인 데이터 존재 여부

  // 비밀번호 찾기
  const [findPwOpen,   setFindPwOpen]   = useState(false);
  const [findPwEmail,  setFindPwEmail]  = useState("");
  const [findPwStep,   setFindPwStep]   = useState(0); // 0: 이메일, 1: 전송완료
  const [findPwErr,    setFindPwErr]    = useState("");
  const [findPwSending,setFindPwSending]= useState(false);

  const [tab,      setTab]      = useState("home");
  const [idx,      setIdx]      = useState(0);
  const [matches,  setMatches]  = useState([]);
  const [liked,    setLiked]    = useState([]);
  const [nearbyPets, setNearbyPets] = useState([]);
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [anim,     setAnim]     = useState(null);
  const [popup,    setPopup]    = useState(null);
  const [chatPet,  setChatPet]  = useState(null);
  const [msgs,     setMsgs]     = useState([]);
  const [msgVal,   setMsgVal]   = useState("");

  // 라운지
  const [posts,        setPosts]        = useState(INIT_POSTS);
  const [loungeCat,    setLoungeCat]    = useState("all");
  const [loungeExpanded, setLoungeExpanded] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isWritePost,  setIsWritePost]  = useState(false);
  const [postForm,     setPostForm]     = useState({cat:"walk",content:"",imgs:[]});
  const [commentVal,   setCommentVal]   = useState("");
  const [replyTarget,  setReplyTarget]  = useState(null);
  const [replyVal,     setReplyVal]     = useState("");
  const writePostRef   = useRef(null);

  // 상대방 프로필 모달
  const [viewUserProfile, setViewUserProfile] = useState(null);
  const [photoViewer, setPhotoViewer] = useState(null); // {photos:[], idx:0}
  // postsRef, storiesRef는 myStories 선언 이후에 배치 (TDZ 방지)
  const [authorPhotoCache, setAuthorPhotoCache] = useState({}); // uid -> photoUrl // {name, img, bio, pets:[]}

  // 알림 클릭 → 해당 화면 이동
  const handleAlarmClick = (alarm) => {
    // 읽음 처리
    setAlarms(a=>a.map(x=>x.id===alarm.id?{...x,unread:false}:x));
    if(alarm._fid) updateDoc(doc(db,"notifications",alarm._fid),{read:true}).catch(()=>{});
    setShowAlarm(false);
    setShowAlarmSettings(false);
    const nav = alarm.nav;
    if(!nav) return;
    if(nav.type==="post") {
      // 라운지 게시글로 이동
      setTab("community");
      const p = posts.find(x=>x.id===nav.postId || x._fid===nav.postId);
      if(p) { setTimeout(()=>setSelectedPost(p),100); }
    } else if(nav.type==="chat") {
      // 채팅방으로 이동
      const m = matches.find(x=>x.uid===nav.uid);
      if(m) { openChat(m); }
      else { setTab("messages"); setInterestMode("chat"); }
    } else if(nav.type==="match") {
      // 매칭 목록으로 이동
      setTab("messages"); setInterestMode("chat");
    } else if(nav.type==="meeting") {
      setTab("meeting");
    } else if(nav.type==="story") {
      setTab("story");
    }
  };

  // 위치
  const [userLocation,    setUserLocation]    = useState("인천 연수구");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const pullStartY = useRef(0);
  const pullTabRef = useRef("");

  const handleTouchStart = (e, tabName) => {
    const el = e.currentTarget;
    if(el.scrollTop <= 0) { pullStartY.current = e.touches[0].clientY; pullTabRef.current = tabName; }
  };
  const handleTouchMove = (e) => {
    if(!pullStartY.current) return;
    const el = e.currentTarget;
    if(el.scrollTop > 0) { pullStartY.current = 0; setPullY(0); setPulling(false); return; }
    const dy = e.touches[0].clientY - pullStartY.current;
    if(dy > 0) { setPullY(Math.min(dy * 0.5, 80)); setPulling(dy > 60); }
  };
  const handleTouchEnd = () => {
    if(pulling && !isRefreshing) {
      const t = pullTabRef.current;
      if(t==="community") refreshContent("community");
      else if(t==="story") refreshContent("story");
      else if(t==="meeting") refreshContent("meeting");
    }
    setPullY(0); setPulling(false); pullStartY.current = 0;
  };
  const [locationUpdating, setLocationUpdating] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // 프로필
  const [profilePhotos, setProfilePhotos] = useState([null,null,null,null,null]);
  const [profileRepIdx, setProfileRepIdx] = useState(0);
  const [profileBio,    setProfileBio]    = useState("");
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [editBioVal,    setEditBioVal]    = useState("");
  const [editNickVal,   setEditNickVal]   = useState("");
  const [nickCheckStatus, setNickCheckStatus] = useState(null); // null | "ok" | "dup" | "same"
  const NICK_COST = 150; // 닉네임 변경 포인트 비용
  const TAKEN_NICKS = ["테스트","관리자","admin","펫플","운영자","시스템"];

  const profileFileRef = useRef(null);
  const [activeProfileSlot, setActiveProfileSlot] = useState(0);

  // 반려동물
  const [myPets,       setMyPets]       = useState([]);
  const [isAddPet,     setIsAddPet]     = useState(false);
  const [editPetIdx,   setEditPetIdx]   = useState(null);
  const [petForm,      setPetForm]      = useState({ name:"", type:"강아지", breed:"", birth:"", gender:"남아", food:"", traits:[], photos:[null,null,null,null,null], repIdx:0 });

  const petFileRef = useRef(null);
  const [activePetSlot, setActivePetSlot] = useState(0);

  const PET_TRAITS = ["#애교쟁이","#활발함","#온순해요","#독립적","#겁쟁이","#먹보","#산책광","#수다쟁이","#겁없음","#잠꾸러기","#호기심왕","#사람좋아해","#다른동물OK","#훈련잘돼요","#에너자이저","#순둥이"];

  // 스토리
  const [myStories,      setMyStories]      = useState([]);
  const postsRef = useRef([]);
  const storiesRef = useRef([]);
  useEffect(()=>{postsRef.current=posts;},[posts]);
  useEffect(()=>{storiesRef.current=myStories;},[myStories]);
  const [showStoryFilter, setShowStoryFilter] = useState(false);
  const [storyFilter, setStoryFilter] = useState({petType:"all",region:"all",sort:"latest"});
  const [isAddStory,     setIsAddStory]     = useState(false);
  const [storyPetSel,    setStoryPetSel]    = useState(null); // 선택된 반려동물 id
  const [storyContent,   setStoryContent]   = useState("");
  const [storyImg,       setStoryImg]       = useState(null);
  const [viewStory,      setViewStory]      = useState(null); // 풀스크린 스토리
  const storyFileRef = useRef(null);

  // 모임
  const [meetings,       setMeetings]       = useState(INIT_MEETINGS);
  const [meetingView,    setMeetingView]    = useState("list"); // "list" | "detail"
  const [selectedMeeting,setSelectedMeeting]= useState(null);
  const [meetingTab,     setMeetingTab]     = useState("home");
  const [meetingMode,    setMeetingMode]    = useState("all"); // "all" | "mine"
  const [meetSearch,     setMeetSearch]     = useState({name:"",city:"",district:"",animal:""});
  // 모임 내부 입력
  const [mChatVal,       setMChatVal]       = useState("");
  const [mBoardForm,     setMBoardForm]     = useState({title:"",content:""});
  const [mBoardDetail,   setMBoardDetail]   = useState(null);
  const [mBoardCommentVal,setMBoardCommentVal]=useState("");
  const [mVoteForm,      setMVoteForm]      = useState({title:"",options:["",""]});
  const [isAddVote,      setIsAddVote]      = useState(false);
  const [mGreetVal,      setMGreetVal]      = useState("");
  const [mPhotoFile,     setMPhotoFile]     = useState(null);
  const [isCreateMeeting, setIsCreateMeeting] = useState(false);
  const [newMeetForm, setNewMeetForm] = useState({title:"",city:"인천",district:"연수구",animal:"강아지",desc:"",max:10,coverImg:null});
  const mPhotoRef = useRef(null);
  const chatEndRef = useRef(null);
  const [showAlarm, setShowAlarm] = useState(false);
  const [showAlarmSettings, setShowAlarmSettings] = useState(false);
  const [alarmSettings, setAlarmSettings] = useState({match:true,message:true,community:true,meeting:true,marketing:false});
  const [showPoints, setShowPoints] = useState(false);
  const [payModal,   setPayModal]   = useState(null); // {type:"point"|"sub", pkg:{...}}
  const [payMethod,  setPayMethod]  = useState(null);
  const [payStep,    setPayStep]    = useState(0); // 0:선택, 1:진행중, 2:완료
  const [isPlusSub,  setIsPlusSub]  = useState(false); // 펫플 플러스 구독 여부
  const [firstChatDone, setFirstChatDone] = useState(false); // 첫 대화 포인트
  const [pointsTab, setPointsTab] = useState("earn");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [points,   setPoints]   = useState(150);
  const [checkedIn, setCheckedIn] = useState(false);
  const [earnDone, setEarnDone] = useState({});
  const [pointLog, setPointLog] = useState([
    { icon:"🎁", label:"가입 환영 보너스", pt:150, type:"earn", date:"오늘" },
  ]);
  const [nickAvail, setNickAvail] = useState(null); // signup: null|"ok"|"dup"|"checking"
  const [deleteAccModal, setDeleteAccModal] = useState(false);
  const [chatOpened, setChatOpened] = useState(new Set()); // 대화 개설 추적

  const BUY_PACKAGES = [
    { icon:"🌱", label:"스타터", amount:500, price:"500원", popular:false },
    { icon:"🌿", label:"베이직", amount:1200, price:"1,000원", popular:false },
    { icon:"🌳", label:"스탠다드", amount:3000, price:"2,000원", popular:true },
    { icon:"🏆", label:"프리미엄", amount:8000, price:"5,000원", popular:false },
  ];
  const [alarms, setAlarms] = useState([
    { id:1, icon:"🐾", text:"펫플에 오신 것을 환영해요! 🎉", time:"방금 전", unread:true, nav:null },
  ]);

  const pet = nearbyPets.length > 0 ? nearbyPets[idx % nearbyPets.length] : null;

  // ── 이미지 압축 (Firestore 1MB 제한 대응) ──
  const compressImage = (dataUrl, maxSize=400) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let {width:w, height:h} = img;
      if(w>maxSize||h>maxSize){ const r=Math.min(maxSize/w,maxSize/h); w*=r; h*=r; }
      canvas.width=w; canvas.height=h;
      canvas.getContext("2d").drawImage(img,0,0,w,h);
      resolve(canvas.toDataURL("image/jpeg",0.6));
    };
    img.src = dataUrl;
  });

  // ── Firestore 게시글/스토리 동기화 헬퍼 ──
  // Firestore 즉시 동기화 - ref에서 항상 최신 _fid 탐색
  const syncPostToFirestore = (postId, data) => {
    const p = postsRef.current.find(x=>x.id===postId);
    const fid = p?._fid;
    if (!fid) { console.warn("syncPost: no _fid for",postId); return; }
    updateDoc(doc(db,"communityPosts",fid),{
      likes: data.likes||[],
      comments: (data.comments||[]).map(c=>({...c, byImg:null, replies:(c.replies||[]).map(r=>({...r,byImg:null}))})),
    }).catch(e=>console.error("Post sync error:",e));
  };

  const syncStoryToFirestore = (storyId, data) => {
    const s = storiesRef.current.find(x=>x.id===storyId);
    const fid = s?._fid;
    if (!fid) { console.warn("syncStory: no _fid for",storyId); return; }
    updateDoc(doc(db,"communityStories",fid),{
      likes: data.likes||[],
      comments: (data.comments||[]).map(c=>({...c,byImg:null})),
    }).catch(e=>console.error("Story sync error:",e));
  };

  // ── 상대방 프로필 Firestore 조회 ──
  const openProfile = async (name, fallbackImg) => {
    // 먼저 기본 정보로 즉시 표시
    setViewUserProfile({name, img:fallbackImg, location:"",bio:"",pets:[],photos:[],loading:true});
    try {
      const q = query(collection(db,"users"), where("nick","==",name), fbLimit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0].data();
        const photos = (d.profilePhotos||[]).filter(p=>p&&p!=="[img]");
        const pets = (d.myPets||[]).map(p=>{
          const petPhotos = (p.photos||[]).filter(x=>x&&x!=="[img]");
          const repPhoto = petPhotos[p.repIdx||0] || petPhotos[0] || null;
          return {
            name:p.name||"", type:p.type||"", breed:p.breed||"", 
            birth:p.birth||"", age:p.age||"", gender:p.gender||"",
            food:p.food||"", traits:p.traits||[],
            img:repPhoto, photos:petPhotos,
          };
        });
        setViewUserProfile({
          name:d.nick||name, img:photos[0]||fallbackImg,
          photos, location:d.userLocation||d.region||"",
          bio:d.profileBio||"", pets, gender:d.gender, birth:d.birth,
          interests:d.interests||[], verified:d.verified||false, loading:false,
        });
      } else { setViewUserProfile(v=>v?{...v,loading:false}:v); }
    } catch(e) { setViewUserProfile(v=>v?{...v,loading:false}:v); }
  };

  // ── 다른 사용자 프로필 로드 (펫친 추천) ──
  const loadNearbyUsers = async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, "users"), fbLimit(50));
      const snap = await getDocs(q);
      const otherUsers = [];
      snap.forEach(d => {
        const data = d.data();
        if (d.id === user.uid) return; // 자기 자신 제외
        if (!data.nick) return;
        const pets = data.myPets || [];
        const photo = (data.profilePhotos || []).find(p => p && p !== "[img]") || null;
        const defaultImg = "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.nick) + "&background=fce7f3&color=ec4899&size=400";
        const petDefaultImg = "https://ui-avatars.com/api/?name=🐾&background=fce7f3&color=ec4899&size=400";
        if (pets.length > 0) {
          pets.forEach((pet, pi) => {
            const petPhotos = (pet.photos||[]).filter(x=>x&&x!=="[img]");
            const petImg = petPhotos[pet.repIdx||0] || petPhotos[0] || (pet.photo && pet.photo !== "[img]" ? pet.photo : null) || petDefaultImg;
            const allPetImgs = petPhotos.length > 0 ? petPhotos : [petImg];
            otherUsers.push({
              id: d.id + "_" + pi,
              name: pet.name || data.nick + "의 반려동물",
              img: petImg,
              imgs: allPetImgs,
              breed: pet.breed || "믹스",
              age: pet.age ? Number(pet.age) : 1,
              gender: pet.gender || "미정",
              tags: data.interests || [],
              bio: data.profileBio || pet.name + "와 함께해요 🐾",
              dist: (Math.random() * 8 + 0.5).toFixed(1) + "km",
              location: data.userLocation || data.region || "근처",
              owner: data.nick,
              ownerRegion: data.userLocation || data.region || "",
              ownerGender: data.gender || "",
              ownerBirth: data.birth || "",
              ownerInterests: data.interests || [],
              verified: data.verified || false,
              uid: d.id,
            });
          });
        } else {
          // 반려동물 미등록 유저도 표시
          otherUsers.push({
            id: d.id + "_0",
            name: data.nick,
            img: petDefaultImg,
            imgs: [petDefaultImg],
            breed: "",
            age: 0,
            gender: "",
            tags: data.interests || [],
            bio: data.profileBio || "안녕하세요! 🐾",
            dist: (Math.random() * 8 + 0.5).toFixed(1) + "km",
            location: data.userLocation || data.region || "근처",
            owner: data.nick,
            ownerRegion: data.userLocation || data.region || "",
            ownerGender: data.gender || "",
            ownerBirth: data.birth || "",
            ownerInterests: data.interests || [],
            verified: data.verified || false,
            uid: d.id,
          });
        }
      });
      // 셔플
      for (let i = otherUsers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherUsers[i], otherUsers[j]] = [otherUsers[j], otherUsers[i]];
      }
      setNearbyPets(otherUsers);
      setIdx(0);
    } catch (e) { console.error("Load users error:", e); }
  };

  // ── 커뮤니티 데이터 새로고침 (Firestore 공유 컬렉션) ──
  const refreshContent = async (targetTab) => {
    if (!user?.uid) return;
    setIsRefreshing(true);
    try {
      if (targetTab === "community" || targetTab === "all") {
        const q = query(collection(db, "communityPosts"), orderBy("ts", "desc"), fbLimit(50));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const serverPosts = snap.docs.map(d => ({...d.data(), _fid: d.id}));
          setPosts(prev => {
            // 서버 데이터가 진짜 소스. 서버에 없는 로컬 전용(방금 작성, 아직 _fid 없는)만 보존
            const localOnly = prev.filter(p => !p._fid && !serverPosts.some(sp => sp.id === p.id));
            // 로컬 이미지 복원
            // localStorage 이미지 캐시에서 복원
            let imgCache = {};
            try { imgCache = JSON.parse(localStorage.getItem("petple_imgcache_"+user.uid)||"{}"); } catch(e){}
            // byImg가 없는 글의 작성자 uid 수집 → 프로필 사진 로드
            const missingUids = new Set();
            const merged = serverPosts.map(sp => {
              const local = prev.find(lp => lp.id === sp.id || lp._fid === sp._fid);
              let imgs = sp.imgs||[];
              imgs = imgs.map((img,i) => (img==="[img]" && imgCache["post_"+sp.id+"_"+i]) ? imgCache["post_"+sp.id+"_"+i] : (img==="[img]" && local?.imgs?.[i] && local.imgs[i]!=="[img]") ? local.imgs[i] : img);
              const byImg = sp.byImg||local?.byImg;
              if(!byImg && sp.uid) missingUids.add(sp.uid);
              // 로컬 좋아요/댓글이 서버보다 많으면 로컬 우선 (동기화 지연 대응)
              const likes = (local?.likes?.length||0) >= (sp.likes?.length||0) ? (local?.likes||sp.likes||[]) : (sp.likes||[]);
              const comments = (local?.comments?.length||0) >= (sp.comments?.length||0) ? (local?.comments||sp.comments||[]) : (sp.comments||[]);
              return {...sp, imgs, byImg, likes, comments};
            });
            // 캐시에 없는 작성자 프로필 사진 로드
            if(missingUids.size > 0) {
              missingUids.forEach(async uid => {
                if(authorPhotoCache[uid]) return;
                try {
                  const uDoc = await getDoc(doc(db,"users",uid));
                  if(uDoc.exists()){
                    const ph = (uDoc.data().profilePhotos||[]).find(p=>p&&p!=="[img]");
                    if(ph) setAuthorPhotoCache(c=>({...c,[uid]:ph}));
                  }
                } catch(e){}
              });
            }
            return [...localOnly, ...merged].sort((a,b) => (b.ts||0)-(a.ts||0)).slice(0,80);
          });
        }
      }
      if (targetTab === "story" || targetTab === "all") {
        const q = query(collection(db, "communityStories"), orderBy("ts", "desc"), fbLimit(30));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const serverStories = snap.docs.map(d => ({...d.data(), _fid: d.id}));
          setMyStories(prev => {
            const localOnly = prev.filter(s => !s._fid && !serverStories.some(ss => ss.id === s.id));
            let imgCacheS = {};
            try { imgCacheS = JSON.parse(localStorage.getItem("petple_imgcache_"+user.uid)||"{}"); } catch(e){}
            const TWELVE_HOURS = 12 * 60 * 60 * 1000;
            const now = Date.now();
            const merged = serverStories
              .filter(ss => (now - (ss.ts||0)) < TWELVE_HOURS)
              .map(ss => {
                const local = prev.find(ls => ls.id === ss.id || ls._fid === ss._fid);
                let img = ss.img;
                if (img === "[img]") img = imgCacheS["story_"+ss.id] || local?.img || img;
                const likes = (local?.likes?.length||0) >= (ss.likes?.length||0) ? (local?.likes||ss.likes||[]) : (ss.likes||[]);
                const comments = (local?.comments?.length||0) >= (ss.comments?.length||0) ? (local?.comments||ss.comments||[]) : (ss.comments||[]);
                return {...ss, img, byImg: ss.byImg||local?.byImg, likes, comments};
              });
            return [...localOnly, ...merged].sort((a,b) => (b.ts||0)-(a.ts||0)).slice(0,50);
          });
        }
      }
      if (targetTab === "meeting" || targetTab === "all") {
        const q = query(collection(db, "communityMeetings"), orderBy("ts", "desc"), fbLimit(30));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const serverMeetings = snap.docs.map(d => ({...d.data(), _fid: d.id}));
          setMeetings(prev => {
            const localOnly = prev.filter(m => !m._fid && !serverMeetings.some(sm => sm.id === m.id));
            return [...localOnly, ...serverMeetings].sort((a,b) => (b.ts||0)-(a.ts||0)).slice(0,50);
          });
        }
      }
    } catch (e) { console.error("Refresh error:", e); }
    setIsRefreshing(false);
  };

  // ── 위치 업데이트 (with UI feedback) ──
  const updateMyLocation = () => {
    setLocationUpdating(true);
    if (!navigator.geolocation) { setLocationUpdating(false); alert("이 기기에서 위치 서비스를 지원하지 않아요."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const {latitude:lat, longitude:lng} = pos.coords;
        const areas = LOCATION_AREAS;
        let nearest = areas[0], minDist = Infinity;
        areas.forEach(a => {
          const d = Math.sqrt((lat-a.lat)**2 + (lng-a.lng)**2);
          if (d < minDist) { minDist = d; nearest = a; }
        });
        setUserLocation(nearest.name);
        setLocationUpdating(false);
        alert("📍 위치가 업데이트 되었어요!\n" + nearest.name);
      },
      () => { setLocationUpdating(false); alert("위치 권한이 거부되었어요.\n설정에서 위치 권한을 허용해주세요."); },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // ── GPS 위치 자동 감지 ──
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const {latitude:lat, longitude:lng} = pos.coords;
        let nearest = LOCATION_AREAS[0], minDist = Infinity;
        LOCATION_AREAS.forEach(a => {
          const d = Math.sqrt((lat-a.lat)**2 + (lng-a.lng)**2);
          if (d < minDist) { minDist = d; nearest = a; }
        });
        setUserLocation(nearest.name);
      },
      () => {},
      { timeout: 8000, maximumAge: 300000 }
    );
  };

    // ── Firebase 인증 상태 감지 (자동 로그인) ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestore에서 유저 프로필 불러오기
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            setUser({ email: firebaseUser.email, name: data.nick, uid: firebaseUser.uid, gender: data.gender||"", birth: data.birth||"", region: data.region||"", interests: data.interests||[] });
            if(data.verified) setIsVerified(true);
            if(!data.onboardingDone) setShowOnboarding(true);
            setPoints(data.points ?? 150);
            if (data.pointLog) setPointLog(data.pointLog);
            if (data.profileBio) setProfileBio(data.profileBio);
            if (data.profilePhotos) setProfilePhotos(data.profilePhotos.map(p=>p==="[img]"?null:p));
            if (typeof data.profileRepIdx === "number") setProfileRepIdx(data.profileRepIdx);
            if (data.myPets) setMyPets(data.myPets);
            // posts/stories는 공유 컬렉션에서 로드 (refreshContent에서 처리)
            // user doc에 있던 옛 데이터는 무시
            if (data.matches) setMatches(data.matches);
            if (data.liked) setLiked(data.liked);
            if (data.userLocation) setUserLocation(data.userLocation);
            if (data.isBoosted) setIsBoosted(data.isBoosted);
            if (data.alarmSettings) setAlarmSettings(data.alarmSettings);
            if (data.receivedLikes) setReceivedLikes(data.receivedLikes);
            if (data.recoSettings) setRecoSettings(data.recoSettings);
            setLoggedIn(true);
          } else {
            // 구글 로그인으로 처음 들어온 경우 프로필 생성
            const gNick = firebaseUser.displayName || firebaseUser.email.split("@")[0];
            const newProfile = {
              email: firebaseUser.email,
              nick: gNick,
              points: 150,
              pointLog: [{ icon:"🎁", label:"가입 환영 보너스", pt:150, type:"earn", date:"오늘" }],
              created: new Date().toISOString(),
            };
            try {
              await setDoc(doc(db, "users", firebaseUser.uid), newProfile);
            } catch (writeErr) {
              console.error("Firestore write error:", writeErr);
              // Firestore 쓰기 실패해도 로그인은 진행 (로컬 상태만)
            }
            setUser({ email: firebaseUser.email, name: gNick, uid: firebaseUser.uid });
            setLoggedIn(true);
          }
        } catch (e) {
          console.error("Firestore read error:", e);
          // Firestore 읽기 실패해도 기본값으로 로그인 진행
          const fallbackNick = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "유저";
          setUser({ email: firebaseUser.email, name: fallbackNick, uid: firebaseUser.uid });
          setLoggedIn(true);
        }
      }
      if (firebaseUser) {
        detectLocation();
        // 온라인 상태 기록 (로그인 시)
        updateDoc(doc(db,"users",firebaseUser.uid),{lastSeen:Date.now(),online:true}).catch(()=>{});
        // 다른 유저 + 커뮤니티 콘텐츠 자동 로드 (약간 딜레이)
        setTimeout(() => { loadNearbyUsers(); refreshContent("all"); }, 500);
        // Firestore chatRooms에서 내 대화방 로드 → 매칭 목록 복원
        setTimeout(async()=>{
          try{
            const roomSnap=await getDocs(query(collection(db,"chatRooms"),where("users","array-contains",firebaseUser.uid)));
            if(!roomSnap.empty){
              const chatMatches=[];
              for(const rd of roomSnap.docs){
                const rData=rd.data();
                const otherUid=(rData.users||[]).find(u=>u!==firebaseUser.uid);
                if(!otherUid) continue;
                const otherName=rData.names?.[otherUid]||"펫친";
                // 상대 유저 정보 로드
                try{
                  const uDoc=await getDoc(doc(db,"users",otherUid));
                  if(uDoc.exists()){
                    const ud=uDoc.data();
                    const pets=ud.myPets||[];
                    const pet=pets[0];
                    const petPhotos=pet?(pet.photos||[]).filter(x=>x&&x!=="[img]"):[];
                    const petImg=petPhotos[0]||"https://ui-avatars.com/api/?name=🐾&background=fce7f3&color=ec4899&size=400";
                    chatMatches.push({
                      uid:otherUid,name:pet?.name||ud.nick||otherName,
                      img:petImg,breed:pet?.breed||"",age:pet?.age||0,
                      gender:pet?.gender||"",owner:ud.nick||otherName,
                      lastMsg:rData.lastMsg||"",lastTs:rData.lastTs||0,
                    });
                  }
                }catch(e){}
              }
              if(chatMatches.length>0){
                setMatches(prev=>{
                  const existingUids=new Set(prev.map(m=>m.uid));
                  const newOnes=chatMatches.filter(m=>!existingUids.has(m.uid));
                  return [...prev,...newOnes];
                });
              }
            }
          }catch(e){}
        },800);
        // 전체 유저 프로필 사진 캐시 (글 목록 아바타용)
        setTimeout(async()=>{
          try{
            const usnap=await getDocs(query(collection(db,"users"),fbLimit(100)));
            const cache={};
            usnap.docs.forEach(d=>{
              const ph=(d.data().profilePhotos||[]).find(p=>p&&p!=="[img]"&&!p.startsWith?.("data:"));
              if(ph) cache[d.id]=ph;
            });
            if(Object.keys(cache).length>0) setAuthorPhotoCache(c=>({...c,...cache}));
          }catch(e){}
        },1200);
        // 알림 로드
        setTimeout(async () => {
          try {
            const nq = query(collection(db,"notifications"), where("to","==",firebaseUser.uid), where("read","==",false), fbLimit(20));
            const nSnap = await getDocs(nq);
            if (!nSnap.empty) {
              const newAlarms = nSnap.docs.map(d=>{
                const n=d.data();
                const navInfo = n.type==="like"||n.type==="comment" ? {type:"post",postId:n.postId||null}
                  : n.type==="match" ? {type:"match",uid:n.matchData?.uid||null}
                  : n.type==="message" ? {type:"chat",uid:n.fromUid||null}
                  : null;
                return {id:d.id,icon:n.type==="like"?"❤️":n.type==="match"?"💕":"💬",text:n.from+"님이 "+n.text,time:"새 알림",unread:true,_fid:d.id,nav:navInfo};
              });
              setAlarms(a=>[...newAlarms,...a]);
            }
          } catch(e){}
        }, 1500);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Firestore에 프로필 사진 동기화 ──
  useEffect(() => {
    if (!user?.uid || !loggedIn) return;
    const timer = setTimeout(() => {
      updateDoc(doc(db, "users", user.uid), { profilePhotos, profileRepIdx }).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [profilePhotos, profileRepIdx]);

  // ── Firestore에 사용자 데이터 동기화 ──
  useEffect(() => {
    if (!user?.uid || !loggedIn) return;
    const timer = setTimeout(() => {
      // 공유 컬렉션이 진짜 소스 → user doc에는 매칭/설정만 저장
      // localStorage에 이미지 캐시 (빠른 로컬 복원용)
      try {
        const imgCache = {};
        myStories.forEach(s => { if(s.img && s.img.startsWith?.("data:")) imgCache["story_"+s.id] = s.img; });
        posts.forEach(p => { (p.imgs||[]).forEach((img,i) => { if(img && img.startsWith?.("data:")) imgCache["post_"+p.id+"_"+i] = img; }); });
        if(Object.keys(imgCache).length > 0) localStorage.setItem("petple_imgcache_"+user.uid, JSON.stringify(imgCache));
      } catch(e){}
      updateDoc(doc(db, "users", user.uid), {
        matches, liked, receivedLikes,
        userLocation, isBoosted, alarmSettings, recoSettings,
      }).catch(e => console.error("Firestore sync error:", e));
    }, 3000);
    return () => clearTimeout(timer);
  }, [myStories, posts, matches, liked, receivedLikes, userLocation, isBoosted, alarmSettings, recoSettings]);

  // ── Firestore에 포인트 동기화 ──
  useEffect(() => {
    if (!user?.uid || !loggedIn) return;
    const timer = setTimeout(() => {
      updateDoc(doc(db, "users", user.uid), { points, pointLog: pointLog.slice(0, 50) }).catch(() => {});
    }, 2000); // 2초 디바운스
    return () => clearTimeout(timer);
  }, [points, pointLog, user?.uid, loggedIn]);

  // 로그인/회원가입
  async function submit() {
    setErr("");
    if (submitting) return;
    if (!email.trim())         return setErr("이메일을 입력해주세요.");
    if (!email.includes("@"))  return setErr("올바른 이메일 형식을 입력해주세요.");
    if (pw.length < 6)         return setErr("비밀번호는 6자 이상이어야 합니다.");

    setSubmitting(true);
    try {
      if (signup) {
        // ── 회원가입 ──
        if (!signupGender)           { setSubmitting(false); return setErr("성별을 선택해주세요."); }
        if (!signupBirth)            { setSubmitting(false); return setErr("출생연도를 선택해주세요."); }
        if (!nick.trim())            { setSubmitting(false); return setErr("닉네임을 입력해주세요."); }
        if (nick.trim().length < 2)  { setSubmitting(false); return setErr("닉네임은 2자 이상이어야 합니다."); }
        if (nickAvail !== "ok")      { setSubmitting(false); return setErr("닉네임 중복 확인을 해주세요."); }
        if (pwConfirm !== pw)        { setSubmitting(false); return setErr("비밀번호가 일치하지 않습니다."); }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);
        try {
          await setDoc(doc(db, "users", cred.user.uid), {
            email: email.trim(),
            nick: nick.trim(),
            gender: signupGender,
            birth: signupBirth,
            region: signupRegion,
            interests: signupInterests,
            verified: false,
            points: 150,
            pointLog: [{ icon:"🎁", label:"가입 환영 보너스", pt:150, type:"earn", date:"오늘" }],
            created: new Date().toISOString(),
          });
        } catch (fsErr) {
          console.error("Firestore 저장 실패 (가입은 완료):", fsErr);
          // Auth 가입은 됐으니 onAuthStateChanged에서 처리
        }
        // onAuthStateChanged가 자동으로 로그인 처리
      } else {
        // ── 로그인 ──
        await signInWithEmailAndPassword(auth, email.trim(), pw);
        // onAuthStateChanged가 자동으로 로그인 처리
      }
    } catch (e) {
      const code = e.code || "";
      const msg = e.message || "";
      console.error("Auth error:", code, msg);
      if (code === "auth/email-already-in-use")       setErr("이미 가입된 이메일이에요.");
      else if (code === "auth/user-not-found")        setErr("가입되지 않은 이메일이에요.");
      else if (code === "auth/wrong-password")         setErr("비밀번호가 일치하지 않습니다.");
      else if (code === "auth/invalid-credential")     setErr("이메일 또는 비밀번호를 확인해주세요.");
      else if (code === "auth/invalid-email")          setErr("올바른 이메일 형식을 입력해주세요.");
      else if (code === "auth/weak-password")          setErr("비밀번호는 6자 이상이어야 합니다.");
      else if (code === "auth/too-many-requests")      setErr("로그인 시도가 너무 많아요. 잠시 후 다시 시도해주세요.");
      else if (code === "auth/network-request-failed") setErr("네트워크 연결을 확인해주세요.");
      else if (code === "auth/popup-closed-by-user")   setErr("로그인 창이 닫혔어요. 다시 시도해주세요.");
      else if (msg.includes("PERMISSION_DENIED") || msg.includes("permission"))
        setErr("데이터 저장 권한 오류 — Firestore 보안 규칙을 확인해주세요.");
      else setErr("오류: " + (code || msg || "알 수 없는 에러"));
    }
    setSubmitting(false);
  }

  // ── 구글 로그인 ──
  async function googleLogin() {
    setErr("");
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged가 자동 처리 (프로필 없으면 자동 생성)
    } catch (e) {
      const code = e.code || "";
      const msg = e.message || "";
      console.error("Google login error:", code, msg);
      if (code === "auth/popup-closed-by-user") {
        // 유저가 창 닫은 거라 무시
      } else if (code === "auth/unauthorized-domain") {
        setErr("이 도메인에서 구글 로그인이 허용되지 않았어요. Firebase 콘솔 → Authentication → Settings → 승인된 도메인에 현재 주소를 추가해주세요.");
      } else if (code === "auth/popup-blocked") {
        setErr("팝업이 차단됐어요. 브라우저에서 팝업을 허용해주세요.");
      } else if (code === "auth/network-request-failed") {
        setErr("네트워크 연결을 확인해주세요.");
      } else if (msg.includes("PERMISSION_DENIED") || msg.includes("permission")) {
        setErr("데이터 저장 권한 오류 — Firestore 보안 규칙을 확인해주세요.");
      } else {
        setErr("구글 로그인 실패: " + (code || msg || "알 수 없는 에러"));
      }
    }
  }

  // 스와이프
  function swipe(dir) {
    if (nearbyPets.length === 0) return;
    // 일일 스와이프 제한 (슈퍼좋아요는 포인트 소모라 제한 없음)
    if (dir !== "U" && dailySwipes >= DAILY_SWIPE_LIMIT) {
      alert("오늘의 스와이프 횟수를 모두 사용했어요!\n("+DAILY_SWIPE_LIMIT+"/"+DAILY_SWIPE_LIMIT+")\n\n내일 다시 이용하거나, 슈퍼좋아요(💎)는 계속 사용할 수 있어요!");
      return;
    }
    if (dir !== "U") setDailySwipes(d => d + 1);
    // 슈퍼좋아요는 모달에서 확인 후 호출됨
    setAnim(dir);
    const cur = nearbyPets[idx % nearbyPets.length];
    setPhotoIdx(0);
    setTimeout(() => {
      setAnim(null);
      setIdx(i => i + 1);
      if (dir === "U") {
        // 슈퍼좋아요: -30p 사용 + 매칭 100% 보장
        setPoints(p => p - 30);
        setPointLog(l => [
          {icon:"💎",label:"슈퍼좋아요 ("+cur.name+")",pt:-30,type:"use",date:"방금 전"},
          ...l
        ]);
        setMatches(m => [...m, cur]);
        setPopup(cur);
        setTimeout(() => setPopup(null), 2500);
        // 상대방에게 매칭 알림 + 채팅방 사전 생성
        if(cur.uid && user?.uid) {
          const roomId = [user.uid, cur.uid].sort().join("_");
          setDoc(doc(db,"chatRooms",roomId),{
            users:[user.uid, cur.uid],
            lastMsg:"매칭되었어요! 🎉",
            lastTs:Date.now(),
            names:{[user.uid]:user?.name,[cur.uid]:cur.owner||cur.name},
          },{merge:true}).catch(()=>{});
          addDoc(collection(db,"notifications"),{to:cur.uid,type:"match",from:user?.name,text:user?.name+"님과 매칭되었어요! 💕",time:new Date().toISOString(),read:false,matchData:{uid:user.uid,name:user?.name,img:profilePhotos[profileRepIdx]||null}}).catch(()=>{});
        }
      } else if (dir !== "L") {
        if (Math.random() < 0.35) {
          setMatches(m => [...m, cur]);
          setPopup(cur);
          setTimeout(() => setPopup(null), 2500);
          // 상대방에게 매칭 알림 + 채팅방 사전 생성
          if(cur.uid && user?.uid) {
            const roomId = [user.uid, cur.uid].sort().join("_");
            setDoc(doc(db,"chatRooms",roomId),{
              users:[user.uid, cur.uid],
              lastMsg:"매칭되었어요! 🎉",
              lastTs:Date.now(),
              names:{[user.uid]:user?.name,[cur.uid]:cur.owner||cur.name},
            },{merge:true}).catch(()=>{});
            addDoc(collection(db,"notifications"),{to:cur.uid,type:"match",from:user?.name,text:user?.name+"님과 매칭되었어요! 💕",time:new Date().toISOString(),read:false,matchData:{uid:user.uid,name:user?.name,img:profilePhotos[profileRepIdx]||null}}).catch(()=>{});
          }
        } else {
          setLiked(l => [...l, cur]);
        }
      }
    }, 320);
  }

  // 채팅
  function openChat(p) {
    if (!chatOpened.has(p.id)) {
      if (points < 10) {
        alert("새 대화를 시작하려면 🐾 10p가 필요해요!\n현재 보유: " + points + "p");
        return;
      }
      setPoints(pt => pt - 10);
      setPointLog(l => [{icon:"💌",label:"대화방 개설 ("+p.name+")",pt:-10,type:"use",date:"방금 전"},...l]);
      setChatOpened(s => new Set([...s, p.id]));
    }
    // 상대방 온라인 상태 확인
    if(p.uid){
      getDoc(doc(db,"users",p.uid)).then(d=>{
        if(d.exists()){
          const ls=d.data().lastSeen||0;
          const isOnline=(Date.now()-ls)<30000; // 30초 이내 활동 = 온라인
          setChatPet({...p,online:isOnline});
        }else{setChatPet(p);}
      }).catch(()=>setChatPet(p));
    }else{setChatPet(p);}
    // Firestore 실시간 채팅 로드
    const chatRoomId = [user.uid, p.uid].sort().join("_");
    setChatRoomId(chatRoomId);
    setChatMenu(false);
    loadChatMessages(chatRoomId);
    setTab("chat");
  }

  const [chatRoomId, setChatRoomId] = useState(null);
  const [chatMenu, setChatMenu] = useState(false);
  const chatContainerRef = useRef(null);
  const [chatAtBottom, setChatAtBottom] = useState(true);
  const [newMsgAlert, setNewMsgAlert] = useState(false);
  const prevMsgCountRef = useRef(0);
  const chatPollRef = useRef(null);

  async function loadChatMessages(roomId) {
    try {
      const q = query(collection(db, "chatRooms", roomId, "messages"), orderBy("ts","asc"), fbLimit(100));
      const snap = await getDocs(q);
      const loaded = snap.docs.map(d => ({id:d.id, ...d.data(), me: d.data().uid === user?.uid}));
      setMsgs(loaded.length > 0 ? loaded : [{id:"welcome",me:false,text:"매칭되었어요! 🎉 대화를 시작해보세요."}]);
      prevMsgCountRef.current = loaded.length;
      setChatAtBottom(true);
      setNewMsgAlert(false);
      setTimeout(()=>{chatContainerRef.current?.scrollTo({top:chatContainerRef.current.scrollHeight});},100);
      // 상대 메시지 읽음 처리
      snap.docs.forEach(d=>{
        const data=d.data();
        if(data.uid!==user?.uid && !(data.readBy||[]).includes(user?.uid)){
          updateDoc(doc(db,"chatRooms",roomId,"messages",d.id),{readBy:[...(data.readBy||[]),user?.uid]}).catch(()=>{});
        }
      });
    } catch(e) {
      setMsgs([{id:"welcome",me:false,text:"매칭되었어요! 🎉 대화를 시작해보세요."}]);
    }
    // 3초마다 새 메시지 폴링 + 읽음 갱신
    if(chatPollRef.current) clearInterval(chatPollRef.current);
    chatPollRef.current = setInterval(async()=>{
      try {
        const q2 = query(collection(db,"chatRooms",roomId,"messages"),orderBy("ts","asc"),fbLimit(100));
        const snap2 = await getDocs(q2);
        const msgs2 = snap2.docs.map(d=>({id:d.id,...d.data(),me:d.data().uid===user?.uid}));
        if(msgs2.length>0){
          const hadNew = msgs2.length > prevMsgCountRef.current;
          const lastIsOther = msgs2.length>0 && !msgs2[msgs2.length-1].me;
          setMsgs(msgs2);
          prevMsgCountRef.current = msgs2.length;
          if(hadNew){
            if(chatAtBottom){
              setTimeout(()=>{chatContainerRef.current?.scrollTo({top:chatContainerRef.current.scrollHeight,behavior:"smooth"});},50);
            } else if(lastIsOther){
              setNewMsgAlert(true);
            }
          }
        }
        // 상대 메시지 읽음 처리
        snap2.docs.forEach(d=>{
          const data=d.data();
          if(data.uid!==user?.uid && !(data.readBy||[]).includes(user?.uid)){
            updateDoc(doc(db,"chatRooms",roomId,"messages",d.id),{readBy:[...(data.readBy||[]),user?.uid]}).catch(()=>{});
          }
        });
      } catch(e){}
      // 내 lastSeen 갱신 (채팅 읽는 중 = 온라인)
      if(user?.uid) updateDoc(doc(db,"users",user.uid),{lastSeen:Date.now(),online:true}).catch(()=>{});
      // 상대방 온라인 상태 갱신 (30초 이내 활동 = 온라인)
      if(chatPet?.uid){
        try{
          const uDoc=await getDoc(doc(db,"users",chatPet.uid));
          if(uDoc.exists()){
            const ls=uDoc.data().lastSeen||0;
            const isOnline=(Date.now()-ls)<30000;
            setChatPet(prev=>prev?{...prev,online:isOnline}:prev);
          }
        }catch(e){}
      }
    }, 3000);
  }

  // 채팅 탭 벗어나면 폴링 중지
  useEffect(()=>{
    if(tab!=="chat" && chatPollRef.current){clearInterval(chatPollRef.current);chatPollRef.current=null;}
    return ()=>{if(chatPollRef.current)clearInterval(chatPollRef.current);};
  },[tab]);

  function sendMsg() {
    if (!msgVal.trim() || !chatRoomId) return;
    const msg = {uid:user?.uid, by:user?.name, text:msgVal.trim(), ts:Date.now(), readBy:[user?.uid]};
    setMsgs(m => [...m, {...msg, id:Date.now(), me:true}]);
    setMsgVal("");
    // 내 메시지 → 항상 스크롤 다운
    setTimeout(()=>{chatContainerRef.current?.scrollTo({top:chatContainerRef.current.scrollHeight,behavior:"smooth"});},50);
    // 온라인 상태 갱신
    if(user?.uid) updateDoc(doc(db,"users",user.uid),{lastSeen:Date.now(),online:true}).catch(()=>{});
    // Firestore에 저장
    addDoc(collection(db,"chatRooms",chatRoomId,"messages"), msg).catch(()=>{});
    // 채팅방 메타 업데이트
    setDoc(doc(db,"chatRooms",chatRoomId),{
      users:[user?.uid, chatPet?.uid].filter(Boolean),
      lastMsg:msgVal.trim().slice(0,50),
      lastTs:Date.now(),
      names:{[user?.uid]:user?.name, [chatPet?.uid||"?"]:chatPet?.owner||chatPet?.name},
    },{merge:true}).catch(()=>{});
    // 상대방에게 메시지 알림 전송
    if(chatPet?.uid) {
      addDoc(collection(db,"notifications"),{
        to:chatPet.uid,type:"message",from:user?.name,fromUid:user?.uid,
        text:"새 메시지: "+msgVal.trim().slice(0,30),
        time:new Date().toISOString(),read:false
      }).catch(()=>{});
    }
    if (!firstChatDone) {
      setFirstChatDone(true);
      setPoints(p=>p+10);
      setPointLog(l=>[{icon:"💬",label:"첫 대화 시작",pt:10,type:"earn",date:"방금 전"},...l]);
    }
  }

  async function logout() {
    try { await signOut(auth); } catch {}
    setLoggedIn(false); setUser(null); setPw(""); setPwConfirm(""); setNick(""); setErr(""); setSignup(false);
    setMatches([]); setLiked([]); setReceivedLikes([]); setIdx(0); setTab("home"); setChatPet(null);
    setPoints(150); setPointLog([{icon:"🎁",label:"가입 환영 보너스",pt:150,type:"earn",date:"오늘"}]);
    setProfileBio(""); setProfilePhotos([null,null,null,null,null]); setProfileRepIdx(0);
    setMyPets([]); setMyStories([]); setPosts([]);
    setIsVerified(false); setIsBoosted(false); setUserLocation("인천 연수구");
    setDailySwipes(0); setNearbyPets([]);
  }

  // ── 로딩 화면 (Firebase 인증 확인 중) ──
  if (authLoading) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff 50%,#eff6ff)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16,animation:"pulse 1.5s ease-in-out infinite"}}>🐾</div>
        <p style={{fontSize:18,fontWeight:800,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>펫플</p>
        <p style={{margin:"6px 0 0",fontSize:13,color:"#9ca3af"}}>로딩 중...</p>
        <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // ── 로그인 화면 ──────────────────────────────────────────
  if (!loggedIn) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fdf2f8,#f3e8ff 50%,#eff6ff)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:"white",borderRadius:28,boxShadow:"0 24px 60px rgba(236,72,153,.15)",padding:"36px 28px",width:"100%",maxWidth:400}}>
        {/* 로고 */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:68,height:68,background:G,borderRadius:20,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>🐾</div>
          <h1 style={{margin:"0 0 4px",fontSize:30,fontWeight:800,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>펫플</h1>
          <p style={{margin:0,color:"#9ca3af",fontSize:13}}>우리 아이 사회성 레벨업 프로젝트</p>
        </div>
        {/* 탭 */}
        <div style={{display:"flex",background:"#f3f4f6",borderRadius:14,padding:4,marginBottom:22}}>
          {[[false,"로그인"],[true,"회원가입"]].map(([mode,label]) => (
            <button key={label} onClick={() => { setSignup(mode); setErr(""); setPwConfirm(""); setNickAvail(null); }}
              style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,transition:"all .2s",
                background:signup===mode?"white":"transparent",color:signup===mode?"#ec4899":"#9ca3af",
                boxShadow:signup===mode?"0 2px 8px rgba(0,0,0,.08)":"none"}}>
              {label}
            </button>
          ))}
        </div>
        {/* 폼 */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Input label="이메일" type="email" placeholder="petple@example.com" value={email} onChange={setEmail} onEnter={submit} />
          {signup && (<>
            {/* 성별/출생연도/지역 */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>성별</label>
                <div style={{display:"flex",gap:6}}>
                  {["남","여"].map(g=>(
                    <button key={g} onClick={()=>setSignupGender(g)}
                      style={{flex:1,padding:"10px 0",borderRadius:10,border:signupGender===g?"2px solid #ec4899":"2px solid #e5e7eb",
                        background:signupGender===g?"#fdf2f8":"white",color:signupGender===g?"#ec4899":"#6b7280",
                        fontWeight:600,fontSize:14,cursor:"pointer"}}>{g==="남"?"🙋‍♂️ 남":"🙋‍♀️ 여"}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>출생연도</label>
                <select value={signupBirth} onChange={e=>setSignupBirth(e.target.value)}
                  style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:14,color:signupBirth?"#374151":"#9ca3af",outline:"none",background:"white",cursor:"pointer"}}>
                  <option value="">선택</option>
                  {Array.from({length:30},(_,i)=>2006-i).map(y=><option key={y} value={y}>{y}년생</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>지역</label>
              <select value={signupRegion} onChange={e=>setSignupRegion(e.target.value)}
                style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"2px solid #e5e7eb",fontSize:14,color:"#374151",outline:"none",background:"white",cursor:"pointer"}}>
                {["인천 연수구","인천 남동구","인천 미추홀구","인천 부평구","인천 계양구","인천 서구","인천 중구","인천 동구","인천 강화군","서울","경기 수원","경기 성남","경기 부천","기타"].map(r=>
                  <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {/* 프로필 완성도 */}
          {(() => {
            const items = [
              {label:"프로필 사진",done:profilePhotos.some(p=>p)},
              {label:"자기소개",done:!!profileBio},
              {label:"반려동물 등록",done:myPets.length>0},
              {label:"관심사 설정",done:!!(user?.interests && user.interests.length>0)},
              {label:"위치 설정",done:userLocation!=="인천 연수구"},
              {label:"프로필 인증",done:isVerified},
            ];
            const pct = Math.round(items.filter(i=>i.done).length/items.length*100);
            return pct < 100 ? (
              <div style={{margin:"0 20px 12px",background:"white",borderRadius:16,padding:16,boxShadow:"0 2px 10px rgba(0,0,0,.04)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <p style={{margin:0,fontWeight:700,fontSize:14}}>프로필 완성도</p>
                  <span style={{fontSize:14,fontWeight:800,color:pct>=80?"#16a34a":pct>=50?"#f59e0b":"#ef4444"}}>{pct}%</span>
                </div>
                <div style={{background:"#f3f4f6",borderRadius:6,height:8,marginBottom:10,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:6,background:pct>=80?"#16a34a":pct>=50?G:"#f59e0b",width:pct+"%",transition:"width .5s ease"}}/>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {items.map((it,i)=>(
                    <span key={i} style={{fontSize:11,padding:"3px 8px",borderRadius:8,fontWeight:600,
                      background:it.done?"#dcfce7":"#fef2f2",color:it.done?"#16a34a":"#ef4444"}}>
                      {it.done?"✓":"○"} {it.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* 관심사 태그 */}
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>관심사 <span style={{fontWeight:400,color:"#9ca3af"}}>(최대 5개)</span></label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {["산책","카페탐방","캠핑","운동","요리","사진찍기","여행","맛집","독서","영화","게임","패션","음악","반려동물봉사","훈련/교육"].map(tag=>(
                  <button key={tag} onClick={()=>setSignupInterests(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):prev.length<5?[...prev,tag]:prev)}
                    style={{padding:"6px 12px",borderRadius:20,border:signupInterests.includes(tag)?"2px solid #ec4899":"2px solid #e5e7eb",
                      background:signupInterests.includes(tag)?"#fdf2f8":"white",color:signupInterests.includes(tag)?"#ec4899":"#6b7280",
                      fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s"}}>{tag}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontWeight:600,fontSize:14,color:"#374151",display:"block",marginBottom:5}}>닉네임</label>
              <div style={{display:"flex",gap:8}}>
                <input type="text" placeholder="닉네임을 입력하세요" value={nick}
                  onChange={e=>{setNick(e.target.value);setNickAvail(null);}}
                  onKeyDown={e=>e.key==="Enter"&&submit()}
                  style={{flex:1,padding:"12px 14px",border:`2px solid ${nickAvail==="ok"?"#16a34a":nickAvail==="dup"?"#ef4444":"#e5e7eb"}`,borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box",transition:"border-color .15s"}}/>
                <button onClick={async ()=>{
                  if(!nick.trim()||nick.trim().length<2){setNickAvail(null);return alert("닉네임은 2자 이상 입력해주세요.");}
                  setNickAvail("checking");
                  const taken=[...TAKEN_NICKS,"테스트","관리자","admin","펫플"];
                  if(taken.map(n=>n.toLowerCase()).includes(nick.trim().toLowerCase())){setNickAvail("dup");return;}
                  try {
                    const q = query(collection(db,"users"), where("nick","==",nick.trim()));
                    const snap = await getDocs(q);
                    setNickAvail(snap.empty ? "ok" : "dup");
                  } catch(e) {
                    console.error("닉네임 체크 에러:", e);
                    setNickAvail("ok");
                  }
                }}
                  style={{padding:"0 16px",background:G,color:"white",border:"none",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                  {nickAvail==="checking"?"확인 중...":"중복 확인"}
                </button>
              </div>
              {nickAvail==="ok" && <p style={{margin:"4px 0 0",fontSize:12,color:"#16a34a",fontWeight:600}}>✅ 사용 가능한 닉네임이에요!</p>}
              {nickAvail==="dup" && <p style={{margin:"4px 0 0",fontSize:12,color:"#ef4444",fontWeight:600}}>❌ 이미 사용 중인 닉네임이에요</p>}
            </div>
          </>)}
          <Input label="비밀번호" type="password" placeholder="••••••••" value={pw} onChange={setPw} hint="(6자 이상)" onEnter={submit} />
          {signup && (
            <div>
              <Input label="비밀번호 확인" type="password" placeholder="비밀번호를 다시 입력해주세요" value={pwConfirm} onChange={setPwConfirm} onEnter={submit} />
              {pwConfirm.length > 0 && (
                pw === pwConfirm
                  ? <p style={{margin:"4px 0 0",fontSize:12,color:"#16a34a",fontWeight:600}}>✅ 비밀번호가 일치합니다</p>
                  : <p style={{margin:"4px 0 0",fontSize:12,color:"#ef4444",fontWeight:600}}>❌ 비밀번호가 일치하지 않습니다</p>
              )}
            </div>
          )}

          {/* 자동로그인 + 비밀번호 찾기 */}
          {!signup && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:-2}}>
              <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:"#6b7280"}}>
                <input type="checkbox" checked={autoLogin} onChange={e=>setAutoLogin(e.target.checked)}
                  style={{width:16,height:16,accentColor:"#ec4899",cursor:"pointer"}} />
                자동 로그인
              </label>
              <button onClick={()=>{setFindPwOpen(true);setFindPwStep(0);setFindPwEmail(email||"");setFindPwErr("");setFindPwCode("");setFindPwNewPw("");}}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:"#9ca3af",padding:0,textDecoration:"underline"}}>
                비밀번호 찾기
              </button>
            </div>
          )}

          {err && <div style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",padding:"10px 14px",borderRadius:10,fontSize:13}}>{err}</div>}

          <button onClick={submit} disabled={submitting}
            style={{background:submitting?"#d1d5db":G,color:"white",border:"none",padding:"14px 0",borderRadius:14,fontSize:16,fontWeight:700,cursor:submitting?"not-allowed":"pointer",boxShadow:submitting?"none":"0 6px 18px rgba(236,72,153,.35)",marginTop:2,transition:"all .2s"}}>
            {submitting ? "처리 중..." : signup ? "🐾 가입하고 시작하기" : "로그인"}
          </button>

          {/* 구분선 + 구글 로그인 */}
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"4px 0"}}>
            <div style={{flex:1,height:1,background:"#e5e7eb"}}/>
            <span style={{fontSize:12,color:"#9ca3af",whiteSpace:"nowrap"}}>또는</span>
            <div style={{flex:1,height:1,background:"#e5e7eb"}}/>
          </div>
          <button onClick={googleLogin}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",background:"white",border:"2px solid #e5e7eb",padding:"12px 0",borderRadius:14,fontSize:14,fontWeight:600,cursor:"pointer",color:"#374151",transition:"all .15s"}}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google 계정으로 시작하기
          </button>



          {/* 이용약관 동의 안내 */}
          {signup && (
            <p style={{margin:"6px 0 0",textAlign:"center",fontSize:11,color:"#9ca3af",lineHeight:1.6}}>
              가입 시 <span style={{color:"#ec4899",cursor:"pointer",textDecoration:"underline"}} onClick={()=>alert("펫플 서비스 이용약관\n\n제1조 (목적)\n이 약관은 펫플(이하 \'서비스\')의 이용 조건을 규정합니다.\n\n제2조 (이용자 의무)\n이용자는 타인의 반려동물을 존중하며 건전한 커뮤니티 문화를 유지해야 합니다.")}>이용약관</span> 및{" "}
              <span style={{color:"#ec4899",cursor:"pointer",textDecoration:"underline"}} onClick={()=>alert("개인정보 처리방침\n\n펫플은 이용자의 개인정보를 중요시하며,\n관련 법령을 준수합니다.\n\n수집 항목: 이메일, 닉네임, 위치 정보\n수집 목적: 서비스 제공 및 개선\n보유 기간: 회원 탈퇴 시까지")}>개인정보 처리방침</span>에 동의하게 됩니다.
            </p>
          )}
        </div>

        <div style={{marginTop:24,textAlign:"center"}}>
          <p style={{margin:0,fontSize:10,color:"#e5e7eb"}}>© 2025 Petple. All rights reserved.</p>
        </div>

        {/* 비밀번호 찾기 모달 */}
        {findPwOpen && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
            onClick={()=>setFindPwOpen(false)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:24,padding:"32px 26px",width:"100%",maxWidth:380,boxShadow:"0 20px 50px rgba(0,0,0,.15)"}}>
              {findPwStep===0 ? (<>
                <div style={{textAlign:"center",marginBottom:20}}>
                  <div style={{width:56,height:56,background:"linear-gradient(135deg,#fce7f3,#ede9fe)",borderRadius:16,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🔑</div>
                  <h3 style={{margin:"0 0 4px",fontSize:20,fontWeight:800}}>비밀번호 재설정</h3>
                  <p style={{margin:0,fontSize:13,color:"#9ca3af"}}>가입한 이메일로 재설정 링크를 보내드려요</p>
                </div>
                <input value={findPwEmail} onChange={e=>setFindPwEmail(e.target.value)} placeholder="petple@example.com" type="email"
                  style={{width:"100%",padding:"13px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:12}}/>
                {findPwErr && <p style={{margin:"0 0 10px",fontSize:13,color:findPwErr.includes("전송")?"#16a34a":"#dc2626"}}>{findPwErr}</p>}
                <button disabled={findPwSending} onClick={async()=>{
                  if(!findPwEmail.trim()||!findPwEmail.includes("@")) return setFindPwErr("올바른 이메일을 입력해주세요.");
                  setFindPwSending(true); setFindPwErr("");
                  try{
                    await sendPasswordResetEmail(auth, findPwEmail.trim());
                    setFindPwStep(1);
                  }catch(e){
                    if(e.code==="auth/user-not-found") setFindPwErr("가입되지 않은 이메일이에요.");
                    else if(e.code==="auth/too-many-requests") setFindPwErr("잠시 후 다시 시도해주세요.");
                    else setFindPwErr("오류: "+(e.code||e.message));
                  }
                  setFindPwSending(false);
                }} style={{width:"100%",background:findPwSending?"#d1d5db":G,color:"white",border:"none",padding:"13px 0",borderRadius:12,fontSize:15,fontWeight:700,cursor:findPwSending?"default":"pointer"}}>
                  {findPwSending?"전송 중...":"재설정 링크 보내기"}
                </button>
              </>) : (<>
                <div style={{textAlign:"center",padding:"10px 0"}}>
                  <div style={{width:64,height:64,background:"linear-gradient(135deg,#dcfce7,#bbf7d0)",borderRadius:"50%",margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>📧</div>
                  <h3 style={{margin:"0 0 8px",fontSize:20,fontWeight:800}}>메일을 확인해주세요!</h3>
                  <p style={{margin:"0 0 6px",fontSize:14,color:"#374151",fontWeight:600}}>{findPwEmail}</p>
                  <p style={{margin:"0 0 20px",fontSize:13,color:"#9ca3af",lineHeight:1.6}}>비밀번호 재설정 링크를 보냈어요.<br/>메일함을 확인하고 링크를 클릭해주세요.<br/><span style={{fontSize:11}}>(스팸함도 확인해주세요)</span></p>
                  <button onClick={()=>{setFindPwOpen(false);setFindPwStep(0);setFindPwEmail("");setPw("");}}
                    style={{background:G,color:"white",border:"none",padding:"13px 32px",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer"}}>
                    로그인으로 돌아가기
                  </button>
                </div>
              </>)}
            </div>
          </div>
        )}

      </div>
    </div>
  );

  // ── 메인 앱 ──────────────────────────────────────────────
  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui,sans-serif",paddingBottom:tab==="chat"?0:72}}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      {/* 드롭다운 오버레이 */}
      {/* (알람 오버레이는 바텀시트 모달 내부에서 처리) */}

      {/* 헤더 */}
      <div style={{background:"white",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #f3f4f6",position:"sticky",top:0,zIndex:20}}>
        {tab==="chat" ? (
          <>
            <button onClick={() => setTab("messages")} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,lineHeight:1,padding:4}}>←</button>
            <div onClick={()=>openProfile(chatPet?.owner||chatPet?.name, chatPet?.img)}
              style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
              <img src={chatPet?.img} alt="" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover"}}/>
              <div><p style={{margin:0,fontWeight:700,fontSize:15}}>{chatPet?.name}</p><p style={{margin:0,fontSize:11,color:chatPet?.online?"#10b981":"#9ca3af"}}>{chatPet?.online?"온라인":"오프라인"}</p></div>
            </div>
            <button onClick={()=>setChatMenu(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,padding:4}}>⋮</button>
          </>
        ) : (
          <>
            {/* 왼쪽: 로고 */}
            <button onClick={() => setTab("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0}}>
              <span style={{fontSize:22}}>🐾</span>
              <h1 style={{margin:0,fontSize:22,fontWeight:800,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>펫플</h1>
            </button>
            {/* 오른쪽: 포인트 + 알람 + 마이페이지 */}
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              {/* 발자국 포인트 */}
              <button onClick={() => { setShowPoints(p=>!p); setShowAlarm(false); }}
                style={{border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:"6px 10px",borderRadius:20,background:showPoints?"#fce7f3":"transparent"}}>
                <span style={{fontSize:16}}>🐾</span>
                <span style={{fontSize:13,fontWeight:700,color:"#ec4899"}}>{points.toLocaleString()}</span>
              </button>
              {/* 알람 */}
              <button onClick={() => { setShowAlarm(a=>!a); setShowPoints(false); }}
                style={{background:showAlarm?"#f3e8ff":"none",border:"none",cursor:"pointer",width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",fontSize:20}}>
                🔔
                {alarms.some(a=>a.unread) && <span style={{position:"absolute",top:1,right:1,minWidth:16,height:16,background:"#ef4444",borderRadius:8,border:"2px solid white",fontSize:9,color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,padding:"0 2px"}}>
                  {alarms.filter(a=>a.unread).length}
                </span>}
              </button>
              {/* 마이페이지 */}
              <button onClick={() => setTab("profile")}
                style={{background:tab==="profile"?"linear-gradient(135deg,#fce7f3,#ede9fe)":"#f3f4f6",border:"none",cursor:"pointer",width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
                👤
              </button>
            </div>
          </>
        )}
      </div>

      {/* 포인트 모달 */}
      {showPoints && (
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",flexDirection:"column"}}>
          {/* 배경 딤 */}
          <div onClick={() => setShowPoints(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(2px)"}} />
          {/* 모달 시트 */}
          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderRadius:"24px 24px 0 0",height:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 -8px 40px rgba(0,0,0,.2)"}}>
            {/* 핸들 */}
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,margin:"12px auto 0"}} />

            {/* 헤더 */}
            <div style={{padding:"16px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <h2 style={{margin:"0 0 2px",fontSize:18,fontWeight:800}}>🐾 발자국 포인트</h2>
                <p style={{margin:0,fontSize:12,color:"#9ca3af"}}>펫플의 기본 화폐예요</p>
              </div>
              <button onClick={() => setShowPoints(false)} style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:32,height:32,borderRadius:"50%",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:"#6b7280"}}>✕</button>
            </div>

            {/* 잔액 카드 */}
            <div style={{margin:"14px 20px",background:`linear-gradient(135deg,#ec4899,#a855f7)`,borderRadius:20,padding:"20px 24px",color:"white",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,background:"rgba(255,255,255,.08)",borderRadius:"50%"}} />
              <div style={{position:"absolute",bottom:-30,right:20,width:140,height:140,background:"rgba(255,255,255,.05)",borderRadius:"50%"}} />
              <p style={{margin:"0 0 4px",fontSize:12,opacity:.8}}>보유 포인트</p>
              <p style={{margin:"0 0 12px",fontSize:36,fontWeight:900,letterSpacing:-1}}>{points.toLocaleString()}<span style={{fontSize:16,fontWeight:600,marginLeft:4}}>p</span></p>
              <button onClick={() => { if(!checkedIn){ setPoints(p=>p+5); setCheckedIn(true); setEarnDone(d=>({...d,checkin:true})); setPointLog(l=>[{icon:"✅",label:"출석 체크",pt:5,type:"earn",date:"방금 전"},...l]); } }}
                style={{background:checkedIn?"rgba(255,255,255,.2)":"white",border:"none",padding:"8px 18px",borderRadius:20,fontSize:13,fontWeight:700,cursor:checkedIn?"not-allowed":"pointer",color:checkedIn?"rgba(255,255,255,.6)":"#ec4899"}}>
                {checkedIn ? "✓ 출석 완료" : "출석 체크 +5p"}
              </button>
            </div>

            {/* 탭 */}
            <div style={{display:"flex",margin:"0 20px 4px",background:"#f3f4f6",borderRadius:14,padding:4}}>
              {[["earn","🎁 포인트 획득"],["buy","💳 구매"],["history","📋 포인트 내역"]].map(([t,label])=>(
                <button key={t} onClick={()=>setPointsTab(t)}
                  style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,transition:"all .2s",
                    background:pointsTab===t?"white":"transparent",color:pointsTab===t?"#ec4899":"#9ca3af",
                    boxShadow:pointsTab===t?"0 2px 8px rgba(0,0,0,.08)":"none"}}>
                  {label}
                </button>
              ))}
            </div>

            {/* 포인트 내역 탭: 필터 버튼 스크롤 영역 밖에 고정 */}
            {pointsTab==="history" && (
              <div style={{padding:"8px 20px 0",display:"flex",gap:8,borderBottom:"1px solid #f3f4f6",paddingBottom:10}}>
                {[["all","전체"],["earn","획득"],["use","사용"]].map(([val,label])=>(
                  <button key={val} onClick={()=>setHistoryFilter(val)}
                    style={{padding:"6px 16px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,
                      background:historyFilter===val?"linear-gradient(135deg,#ec4899,#a855f7)":"#f3f4f6",
                      color:historyFilter===val?"white":"#6b7280",
                      boxShadow:historyFilter===val?"0 2px 8px rgba(236,72,153,.3)":"none"}}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* 탭 컨텐츠 (스크롤 영역) */}
            <div style={{flex:1,overflowY:"auto",padding:"12px 20px 16px"}}>

              {/* 획득 */}
              {pointsTab==="earn" && (
                <div>
                  <p style={{margin:"0 0 12px",fontSize:13,color:"#6b7280"}}>활동하면 자동으로 포인트가 적립돼요!</p>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                    {[
                      {key:"checkin", icon:"✅",label:"출석 체크",pt:5,desc:"매일 1회",color:"#dcfce7",tcolor:"#16a34a", action:"checkin"},
                      {key:"lounge",  icon:"📝",label:"라운지 글쓰기",pt:5,desc:"1일 1회",color:"#fce7f3",tcolor:"#be185d", action:"auto"},
                      {key:"chat",    icon:"💬",label:"첫 대화",pt:10,desc:"1회 보너스",color:"#eff6ff",tcolor:"#1d4ed8", action:"auto"},
                      {key:"story",   icon:"📸",label:"스토리 업로드",pt:5,desc:"1일 1회",color:"#fef9c3",tcolor:"#92400e", action:"auto"},
                      {key:"review",  icon:"⭐",label:"리뷰 작성",pt:10,desc:"만남 후",color:"#fff7ed",tcolor:"#c2410c", action:"auto"},
                      {key:"meeting", icon:"🏃",label:"모임 가입",pt:10,desc:"가입 시",color:"#ecfdf5",tcolor:"#065f46", action:"auto"},
                      {key:"invite",  icon:"👥",label:"친구 초대",pt:100,desc:"가입 확인 시",color:"#fdf2f8",tcolor:"#9d174d", action:"invite"},
                    ].map((item)=>{
                      const done = item.action==="checkin" && checkedIn;
                      return (
                        <div key={item.key} onClick={()=>{
                          if(item.action==="checkin" && !checkedIn){
                            setCheckedIn(true);
                            setPoints(p=>p+item.pt);
                            setPointLog(l=>[{icon:item.icon,label:item.label,pt:item.pt,type:"earn",date:"방금 전"},...l]);
                          } else if(item.action==="invite"){
                            if(navigator.share){navigator.share({title:"펫플 - 반려동물 소셜",text:"우리 아이 친구 만들기! 펫플에서 만나요 🐾",url:"https://petple.app/invite"}).catch(()=>{});}
                            else{navigator.clipboard?.writeText("https://petple.app/invite");alert("초대 링크가 복사되었어요!");}
                          }
                        }}
                          style={{background:done?"#f3f4f6":item.color,borderRadius:16,padding:"14px 12px",cursor:item.action==="auto"||item.action==="info"?"default":done?"not-allowed":"pointer",opacity:done?.6:1,position:"relative",overflow:"hidden"}}>
                          {done && <div style={{position:"absolute",top:0,right:0,background:"rgba(0,0,0,.06)",fontSize:10,fontWeight:700,color:"#9ca3af",padding:"3px 8px",borderRadius:"0 16px 0 10px"}}>완료</div>}
                          {item.action==="auto" && <div style={{position:"absolute",top:0,right:0,background:"rgba(0,0,0,.04)",fontSize:9,fontWeight:700,color:"#6b7280",padding:"3px 8px",borderRadius:"0 16px 0 10px"}}>자동</div>}
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                            <span style={{fontSize:22}}>{item.icon}</span>
                            <span style={{fontWeight:800,fontSize:14,color:done?"#9ca3af":item.tcolor}}>{item.action==="info"?`-${WRITE_COST}p`:`+${item.pt}p`}</span>
                          </div>
                          <p style={{margin:"0 0 2px",fontWeight:700,fontSize:13,color:done?"#9ca3af":"#1f2937"}}>{item.label}</p>
                          <p style={{margin:0,fontSize:11,color:"#6b7280"}}>{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                  {/* 포인트 사용처 안내 */}
                  <div style={{background:"linear-gradient(135deg,#fdf2f8,#ede9fe)",borderRadius:16,padding:16,marginBottom:16}}>
                    <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14}}>🔥 포인트 사용처</p>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {[
                        {icon:"💎",label:"슈퍼좋아요",cost:30,desc:"100% 매칭 보장"},
                        {icon:"💌",label:"대화 시작",cost:10,desc:"새 대화 개설"},
                        {icon:"📝",label:"라운지 글쓰기",cost:30,desc:"글 등록"},
                        {icon:"✏️",label:"닉네임 변경",cost:150,desc:"1회"},
                      ].map((s,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.7)",borderRadius:10,padding:"8px 12px"}}>
                          <span style={{fontSize:18}}>{s.icon}</span>
                          <div style={{flex:1}}>
                            <p style={{margin:0,fontSize:13,fontWeight:600,color:"#374151"}}>{s.label}</p>
                            <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{s.desc}</p>
                          </div>
                          <span style={{fontSize:13,fontWeight:800,color:"#ef4444"}}>-{s.cost}p</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 나를 좋아한 사람 보기 */}
                  <div style={{background:"linear-gradient(135deg,#fdf2f8,#ede9fe)",borderRadius:16,padding:16,marginBottom:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <span style={{fontSize:28}}>👀</span>
                      <div style={{flex:1}}>
                        <p style={{margin:"0 0 2px",fontWeight:700,fontSize:14}}>나를 좋아한 사람 {liked.length>0?`(${liked.length}명)`:""}</p>
                        <p style={{margin:0,fontSize:12,color:"#6b7280"}}>누가 내 프로필에 좋아요를 눌렀는지 확인하세요</p>
                      </div>
                    </div>
                    {secretLikesUnlocked ? (
                      <button onClick={()=>setShowSecretLikes(true)}
                        style={{width:"100%",background:G,color:"white",border:"none",padding:"10px 0",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                        👀 확인하기
                      </button>
                    ) : (
                      <button onClick={()=>{
                        if(points<100){alert("🐾 100p가 필요해요!\n현재 보유: "+points+"p");return;}
                        if(!confirm("🐾 100p를 사용해서 나를 좋아한 사람을 확인하시겠어요?")) return;
                        setPoints(p=>p-100);
                        setPointLog(l=>[{icon:"👀",label:"좋아한 사람 보기 해금",pt:-100,type:"use",date:"방금 전"},...l]);
                        setSecretLikesUnlocked(true);
                        setShowSecretLikes(true);
                      }}
                        style={{width:"100%",background:"linear-gradient(135deg,#f59e0b,#fbbf24)",color:"white",border:"none",padding:"10px 0",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(245,158,11,.3)"}}>
                        🔓 100p로 해금하기
                      </button>
                    )}
                  </div>

                  {/* 기타 프리미엄 기능 (잠금) */}
                  <div style={{background:"#f9fafb",border:"2px dashed #e5e7eb",borderRadius:16,padding:16,marginBottom:16,position:"relative"}}>
                    <div style={{position:"absolute",top:-8,right:12,background:"#f59e0b",color:"white",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:10}}>SOON</div>
                    <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14}}>🔓 프리미엄 기능 (출시 예정)</p>
                    <div style={{display:"flex",flexDirection:"column",gap:8,opacity:.6}}>
                      {[
                        {icon:"🔥",label:"프로필 부스트 (3일간)",cost:50},
                        {icon:"♾️",label:"무제한 스와이프 (1주)",cost:500},
                        {icon:"🎨",label:"프로필 테마 꾸미기",cost:100},
                      ].map((s,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"white",borderRadius:10,padding:"8px 12px"}}>
                          <span style={{fontSize:18}}>{s.icon}</span>
                          <p style={{margin:0,fontSize:13,fontWeight:600,color:"#374151",flex:1}}>{s.label}</p>
                          <span style={{fontSize:13,fontWeight:800,color:"#9ca3af"}}>{s.cost}p</span>
                          <span style={{fontSize:11}}>🔒</span>
                        </div>
                      ))}
                    </div>
                    <p style={{margin:"10px 0 0",fontSize:11,color:"#9ca3af",textAlign:"center"}}>💡 매일 꾸준히 활동하면 약 30~40p를 모을 수 있어요</p>
                  </div>

                  <div style={{background:"#f9fafb",borderRadius:16,padding:16}}>
                    <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14}}>📅 최근 획득 내역</p>
                    {pointLog.filter(h=>h.type==="earn").length===0
                      ? <p style={{textAlign:"center",color:"#9ca3af",fontSize:13,padding:"12px 0"}}>아직 획득 내역이 없어요</p>
                      : pointLog.filter(h=>h.type==="earn").map((h,i,arr)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<arr.length-1?"1px solid #e5e7eb":"none"}}>
                          <span style={{fontSize:20,width:32,textAlign:"center"}}>{h.icon}</span>
                          <div style={{flex:1}}>
                            <p style={{margin:"0 0 1px",fontSize:13,fontWeight:600}}>{h.label}</p>
                            <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{h.date}</p>
                          </div>
                          <span style={{fontSize:14,fontWeight:800,color:"#10b981"}}>+{h.pt}p</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* 구매 */}
              {pointsTab==="buy" && (
                <div>
                  {/* 서비스 준비 중 배너 */}
                  <div style={{background:"linear-gradient(135deg,#fef3c7,#fef9c3)",borderRadius:16,padding:"16px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:28}}>🚀</span>
                    <div>
                      <p style={{margin:"0 0 2px",fontWeight:700,fontSize:14,color:"#92400e"}}>결제 서비스 준비 중이에요!</p>
                      <p style={{margin:0,fontSize:12,color:"#a16207"}}>곧 포인트 충전과 구독이 가능해져요</p>
                    </div>
                  </div>

                  <p style={{margin:"0 0 12px",fontSize:13,color:"#6b7280"}}>출시 예정 상품을 미리 확인해보세요</p>
                  <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20,opacity:.55,pointerEvents:"none"}}>
                    {BUY_PACKAGES.map((pkg,i)=>(
                      <div key={i}
                        style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:"white",border:`2px solid ${pkg.popular?"#ec4899":"#f3f4f6"}`,borderRadius:18,position:"relative",textAlign:"left",boxShadow:pkg.popular?"0 4px 16px rgba(236,72,153,.2)":"none"}}>
                        {pkg.popular && <div style={{position:"absolute",top:-1,right:14,background:G,color:"white",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:"0 0 10px 10px"}}>BEST</div>}
                        <span style={{fontSize:28}}>{pkg.icon}</span>
                        <div style={{flex:1}}>
                          <p style={{margin:"0 0 2px",fontWeight:700,fontSize:15,color:"#1f2937"}}>{pkg.label}</p>
                          <p style={{margin:0,fontSize:13,fontWeight:800,color:"#ec4899"}}>{pkg.amount.toLocaleString()}p</p>
                        </div>
                        <div style={{background:pkg.popular?G:"#f3f4f6",color:pkg.popular?"white":"#374151",padding:"8px 16px",borderRadius:20,fontSize:14,fontWeight:700,whiteSpace:"nowrap"}}>{pkg.price}</div>
                      </div>
                    ))}
                  </div>

                  {/* 펫플 플러스 구독 (비활성) */}
                  <div style={{background:"linear-gradient(135deg,#fef9c3,#fef3c7)",borderRadius:18,padding:18,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:10,right:12,background:"#92400e",color:"white",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:10}}>출시 예정</div>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                      <span style={{fontSize:28}}>👑</span>
                      <div style={{flex:1}}>
                        <p style={{margin:"0 0 2px",fontWeight:700,fontSize:15}}>펫플 플러스</p>
                        <p style={{margin:0,fontSize:12,color:"#92400e"}}>프리미엄 혜택을 누려보세요!</p>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                      {[
                        "매달 3,000p 자동 적립",
                        "슈퍼 좋아요 무제한",
                        "프로필 부스트 (3일마다)",
                        "광고 제거",
                        "읽음 확인 기능",
                      ].map((b,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:12,color:"#ec4899"}}>✓</span>
                          <span style={{fontSize:13,color:"#374151"}}>{b}</span>
                        </div>
                      ))}
                    </div>
                    <button disabled style={{width:"100%",background:"#e5e7eb",color:"#9ca3af",border:"none",padding:"11px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"not-allowed"}}>
                      서비스 준비 중
                    </button>
                  </div>

                  {/* 사전 알림 신청 */}
                  <div style={{marginTop:16,background:"#f9fafb",borderRadius:14,padding:"14px 16px",textAlign:"center"}}>
                    <p style={{margin:"0 0 8px",fontSize:13,color:"#6b7280"}}>결제 서비스가 열리면 알려드릴까요?</p>
                    <button onClick={()=>alert("사전 알림이 등록되었어요! 🔔\n서비스가 시작되면 알려드릴게요.")}
                      style={{background:"white",border:"2px solid #ec4899",color:"#ec4899",padding:"9px 24px",borderRadius:20,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                      🔔 사전 알림 신청
                    </button>
                  </div>
                </div>
              )}

              {/* 포인트 내역 - 리스트만 */}
              {pointsTab==="history" && (
                <div>
                  {pointLog.filter(h=>historyFilter==="all"||h.type===historyFilter).length===0
                    ? <div style={{textAlign:"center",padding:"48px 0"}}><p style={{fontSize:40,margin:"0 0 10px"}}>📋</p><p style={{color:"#9ca3af",fontSize:14}}>내역이 없어요</p></div>
                    : pointLog.filter(h=>historyFilter==="all"||h.type===historyFilter).map((h,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"white",borderRadius:14,marginBottom:8,boxShadow:"0 2px 6px rgba(0,0,0,.04)"}}>
                        <div style={{width:42,height:42,background:h.type==="earn"?"#dcfce7":"#fef2f2",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{h.icon}</div>
                        <div style={{flex:1}}>
                          <p style={{margin:"0 0 2px",fontSize:14,fontWeight:600,color:"#1f2937"}}>{h.label}</p>
                          <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{h.date}</p>
                        </div>
                        <span style={{fontSize:15,fontWeight:800,color:h.type==="earn"?"#10b981":"#ef4444"}}>
                          {h.type==="earn"?"+":""}{h.pt}p
                        </span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* 포인트 내역 탭: 요약 바 스크롤 밖 하단 고정 */}
            {pointsTab==="history" && (
              <div style={{padding:"12px 20px 20px",borderTop:"1px solid #f3f4f6",background:"white",display:"flex",justifyContent:"space-around",flexShrink:0}}>
                <div style={{textAlign:"center"}}>
                  <p style={{margin:"0 0 2px",fontSize:18,fontWeight:800,color:"#10b981"}}>+{pointLog.filter(h=>h.type==="earn").reduce((s,h)=>s+h.pt,0)}p</p>
                  <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>총 획득</p>
                </div>
                <div style={{width:1,background:"#e5e7eb"}}/>
                <div style={{textAlign:"center"}}>
                  <p style={{margin:"0 0 2px",fontSize:18,fontWeight:800,color:"#ef4444"}}>{pointLog.filter(h=>h.type==="use").reduce((s,h)=>s+h.pt,0)}p</p>
                  <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>총 사용</p>
                </div>
                <div style={{width:1,background:"#e5e7eb"}}/>
                <div style={{textAlign:"center"}}>
                  <p style={{margin:"0 0 2px",fontSize:18,fontWeight:800,color:"#ec4899"}}>{points.toLocaleString()}p</p>
                  <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>현재 잔액</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 결제 준비 중 알림 */}
      {payModal && (
        <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={()=>{setPayModal(null);}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)"}}/>
          <div style={{position:"relative",background:"white",borderRadius:24,padding:"36px 28px",maxWidth:320,width:"90%",textAlign:"center",boxShadow:"0 20px 50px rgba(0,0,0,.2)"}}>
            <div style={{width:64,height:64,background:"linear-gradient(135deg,#fef9c3,#fef3c7)",borderRadius:"50%",margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>🚀</div>
            <h3 style={{margin:"0 0 8px",fontSize:18,fontWeight:800}}>결제 서비스 준비 중</h3>
            <p style={{margin:"0 0 20px",fontSize:14,color:"#6b7280",lineHeight:1.6}}>곧 결제 기능이 오픈돼요!<br/>조금만 기다려주세요 🐾</p>
            <button onClick={()=>{
              setPayModal(null);
              alert("사전 알림이 등록되었어요! 🔔\n결제 서비스가 시작되면 알려드릴게요.");
            }} style={{width:"100%",background:G,color:"white",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8,boxShadow:"0 4px 12px rgba(236,72,153,.3)"}}>
              🔔 오픈 알림 받기
            </button>
            <button onClick={()=>setPayModal(null)}
              style={{width:"100%",background:"#f3f4f6",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",color:"#6b7280"}}>
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 알림 바텀시트 */}
      {showAlarm && (
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",flexDirection:"column"}}>
          <div onClick={()=>{setShowAlarm(false);setShowAlarmSettings(false);}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(2px)"}} />
          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderRadius:"24px 24px 0 0",maxHeight:"70vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 -8px 40px rgba(0,0,0,.2)"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,margin:"12px auto 0",flexShrink:0}} />
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px 10px"}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:800}}>{showAlarmSettings?"알림 설정":"알림"}</h3>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setShowAlarmSettings(s=>!s)} style={{background:showAlarmSettings?"#fdf2f8":"#f3f4f6",border:"none",cursor:"pointer",width:32,height:32,borderRadius:"50%",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>{showAlarmSettings?"←":"⚙️"}</button>
                <button onClick={()=>{setShowAlarm(false);setShowAlarmSettings(false);}} style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:32,height:32,borderRadius:"50%",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"0 20px 20px"}}>
              {showAlarmSettings ? (
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {[
                    {key:"match",icon:"💕",label:"매칭 알림",desc:"새 매칭, 슈퍼좋아요"},
                    {key:"message",icon:"💬",label:"메시지 알림",desc:"새 대화, 채팅"},
                    {key:"community",icon:"🧡",label:"라운지 알림",desc:"댓글, 좋아요, 대댓글"},
                    {key:"meeting",icon:"🏃",label:"모임 알림",desc:"가입 승인, 새 글"},
                    
                    {key:"marketing",icon:"📢",label:"이벤트/마케팅 알림",desc:"혜택, 이벤트 소식"},
                  ].map(item=>(
                    <div key={item.key} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 12px",borderRadius:14,background:alarmSettings[item.key]?"#fdf2f8":"#f9fafb"}}>
                      <span style={{fontSize:22,flexShrink:0}}>{item.icon}</span>
                      <div style={{flex:1}}>
                        <p style={{margin:"0 0 2px",fontSize:14,fontWeight:600}}>{item.label}</p>
                        <p style={{margin:0,fontSize:12,color:"#9ca3af"}}>{item.desc}</p>
                      </div>
                      <button onClick={()=>setAlarmSettings(s=>({...s,[item.key]:!s[item.key]}))}
                        style={{width:48,height:28,borderRadius:14,border:"none",cursor:"pointer",position:"relative",
                          background:alarmSettings[item.key]?"#ec4899":"#d1d5db",transition:"background .2s",padding:0,flexShrink:0}}>
                        <div style={{width:22,height:22,borderRadius:"50%",background:"white",position:"absolute",top:3,
                          left:alarmSettings[item.key]?23:3,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
                      </button>
                    </div>
                  ))}
                  <p style={{margin:"12px 0 0",fontSize:11,color:"#9ca3af",textAlign:"center"}}>알림 설정은 이 기기에만 적용돼요</p>
                </div>
              ) : (
                <>
                  {alarms.length===0 ? (
                    <div style={{textAlign:"center",padding:"40px 0"}}>
                      <p style={{fontSize:40,margin:"0 0 10px"}}>🔔</p>
                      <p style={{margin:0,fontSize:14,color:"#9ca3af"}}>새로운 알림이 없어요</p>
                    </div>
                  ) : alarms.map(a => (
                    <div key={a.id} onClick={()=>handleAlarmClick(a)}
                      style={{display:"flex",gap:12,padding:"14px 8px",borderBottom:"1px solid #f3f4f6",background:a.unread?"#fdf2f8":"transparent",borderRadius:12,marginBottom:2,cursor:a.nav?"pointer":"default",transition:"background .15s"}}
                      onMouseDown={e=>{if(a.nav)e.currentTarget.style.background="#fce7f3";}}
                      onMouseUp={e=>{e.currentTarget.style.background=a.unread?"#fdf2f8":"transparent";}}>
                      <span style={{fontSize:24,flexShrink:0}}>{a.icon}</span>
                      <div style={{flex:1}}>
                        <p style={{margin:"0 0 3px",fontSize:14,fontWeight:a.unread?600:400,color:"#1f2937"}}>{a.text}</p>
                        <p style={{margin:0,fontSize:12,color:"#9ca3af"}}>{a.time}</p>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                        {a.unread && <span style={{width:8,height:8,background:"#ec4899",borderRadius:"50%"}} />}
                        {a.nav && <span style={{fontSize:14,color:"#d1d5db"}}>›</span>}
                      </div>
                    </div>
                  ))}
                  {alarms.length>0 && (
                    <button onClick={()=>setAlarms(a=>a.map(x=>({...x,unread:false})))}
                      style={{width:"100%",marginTop:12,background:"#f3f4f6",border:"none",padding:"10px 0",borderRadius:12,fontSize:13,fontWeight:600,color:"#9ca3af",cursor:"pointer"}}>
                      모두 읽음 처리
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 펫친 추천 설정 모달 */}
      {showRecoSettings && (
        <div style={{position:"fixed",inset:0,zIndex:55,display:"flex",flexDirection:"column"}}>
          <div onClick={()=>setShowRecoSettings(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(2px)"}} />
          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderRadius:"24px 24px 0 0",maxHeight:"75vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 -8px 40px rgba(0,0,0,.2)"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,margin:"12px auto 0"}} />
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px 8px"}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:800}}>⚙️ 펫친 추천 설정</h3>
              <button onClick={()=>setShowRecoSettings(false)} style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:32,height:32,borderRadius:"50%",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"8px 20px 24px"}}>
              {/* 거리 */}
              <div style={{marginBottom:20}}>
                <p style={{margin:"0 0 8px",fontWeight:700,fontSize:14}}>📍 거리 범위</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[["5","5km 이내"],["10","10km 이내"],["30","30km 이내"],["all","전국"]].map(([val,label])=>(
                    <button key={val} onClick={()=>setRecoSettings(s=>({...s,distance:val==="all"?val:Number(val)}))}
                      style={{padding:"8px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                        background:String(recoSettings.distance)===val?G:"#f3f4f6",
                        color:String(recoSettings.distance)===val?"white":"#6b7280",
                        boxShadow:String(recoSettings.distance)===val?"0 2px 8px rgba(236,72,153,.3)":"none"}}>{label}</button>
                  ))}
                </div>
              </div>
              {/* 반려동물 종류 */}
              <div style={{marginBottom:20}}>
                <p style={{margin:"0 0 8px",fontWeight:700,fontSize:14}}>🐾 반려동물 종류</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[["all","전체"],["강아지","🐶 강아지"],["고양이","🐱 고양이"],["소동물","🐹 소동물"],["기타","기타"]].map(([val,label])=>(
                    <button key={val} onClick={()=>setRecoSettings(s=>({...s,petType:val}))}
                      style={{padding:"8px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                        background:recoSettings.petType===val?G:"#f3f4f6",
                        color:recoSettings.petType===val?"white":"#6b7280",
                        boxShadow:recoSettings.petType===val?"0 2px 8px rgba(236,72,153,.3)":"none"}}>{label}</button>
                  ))}
                </div>
              </div>
              {/* 나이대 */}
              <div style={{marginBottom:20}}>
                <p style={{margin:"0 0 8px",fontWeight:700,fontSize:14}}>🎂 반려동물 나이</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[["all","전체"],["0-2","0~2살"],["3-5","3~5살"],["6-9","6~9살"],["10+","10살 이상"]].map(([val,label])=>(
                    <button key={val} onClick={()=>setRecoSettings(s=>({...s,ageRange:val}))}
                      style={{padding:"8px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                        background:recoSettings.ageRange===val?G:"#f3f4f6",
                        color:recoSettings.ageRange===val?"white":"#6b7280",
                        boxShadow:recoSettings.ageRange===val?"0 2px 8px rgba(236,72,153,.3)":"none"}}>{label}</button>
                  ))}
                </div>
              </div>
              {/* 성별 */}
              <div style={{marginBottom:20}}>
                <p style={{margin:"0 0 8px",fontWeight:700,fontSize:14}}>⚥ 보호자 성별</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[["all","무관"],["남","남성"],["여","여성"]].map(([val,label])=>(
                    <button key={val} onClick={()=>setRecoSettings(s=>({...s,gender:val}))}
                      style={{padding:"8px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                        background:recoSettings.gender===val?G:"#f3f4f6",
                        color:recoSettings.gender===val?"white":"#6b7280",
                        boxShadow:recoSettings.gender===val?"0 2px 8px rgba(236,72,153,.3)":"none"}}>{label}</button>
                  ))}
                </div>
              </div>
              <button onClick={()=>{setShowRecoSettings(false);alert("✅ 추천 설정이 저장되었어요!\n새로운 기준으로 펫친을 추천해드릴게요 🐾");}}
                style={{width:"100%",background:G,color:"white",border:"none",padding:14,borderRadius:14,fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:"0 4px 16px rgba(236,72,153,.3)"}}>
                설정 저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 슈퍼좋아요 확인 모달 */}
      {superLikeConfirm && (
        <div style={{position:"fixed",inset:0,zIndex:110,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={()=>setSuperLikeConfirm(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)"}}/>
          <div style={{position:"relative",background:"white",borderRadius:24,padding:"28px 24px",maxWidth:320,width:"90%",textAlign:"center",boxShadow:"0 20px 50px rgba(0,0,0,.2)"}}>
            <div style={{width:64,height:64,background:"linear-gradient(135deg,#fbbf24,#f59e0b)",borderRadius:"50%",margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>💎</div>
            <h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:800}}>슈퍼좋아요</h3>
            <p style={{margin:"0 0 4px",fontSize:14,color:"#6b7280"}}>{superLikeConfirm.name}에게 슈퍼좋아요를 보내면<br/><b>100% 매칭</b>이 보장돼요!</p>
            <div style={{background:"#fef9c3",borderRadius:12,padding:"10px 14px",margin:"12px 0 18px"}}>
              <p style={{margin:0,fontSize:14,fontWeight:700,color:"#92400e"}}>🐾 30p를 사용합니다</p>
              <p style={{margin:"2px 0 0",fontSize:12,color:"#a16207"}}>현재 보유: {points}p → 사용 후 {points-30}p</p>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setSuperLikeConfirm(null)}
                style={{flex:1,background:"#f3f4f6",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",color:"#6b7280"}}>
                취소
              </button>
              <button onClick={()=>{setSuperLikeConfirm(null);swipe("U");}}
                style={{flex:1,background:"linear-gradient(135deg,#fbbf24,#f59e0b)",color:"white",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(251,191,36,.4)"}}>
                💎 보내기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 홈 */}
      {tab==="home" && (
        <div style={{padding:"20px 16px"}}>
          {/* 새로고침 + 스와이프 카운터 */}
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
            <button onClick={()=>{loadNearbyUsers();}} disabled={isRefreshing}
              style={{background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",border:"none",padding:"5px 12px",borderRadius:16,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              🔄 새 펫친 불러오기
            </button>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:13,color:dailySwipes>=DAILY_SWIPE_LIMIT?"#ef4444":"#6b7280",fontWeight:600}}>
                🐾 {DAILY_SWIPE_LIMIT-dailySwipes}/{DAILY_SWIPE_LIMIT} 남음
              </span>
              {dailySwipes>=DAILY_SWIPE_LIMIT && <span style={{fontSize:11,color:"#ef4444"}}>내일 초기화돼요</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {isBoosted && <span style={{background:"linear-gradient(135deg,#f59e0b,#fbbf24)",color:"white",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:10}}>🔥 부스트 ON</span>}
              <button onClick={()=>setShowRecoSettings(true)}
                style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚙️</button>
            </div>
          </div>
          {nearbyPets.length===0 || idx>=nearbyPets.length ? (
            <div style={{background:"white",borderRadius:24,boxShadow:"0 8px 32px rgba(0,0,0,.1)",padding:"60px 24px",textAlign:"center"}}>
              <div style={{fontSize:64,marginBottom:16}}>🐾</div>
              <h2 style={{margin:"0 0 8px",fontSize:20,fontWeight:800,color:"#1f2937"}}>아직 주변에 펫친이 없어요</h2>
              <p style={{margin:"0 0 20px",fontSize:14,color:"#9ca3af",lineHeight:1.6}}>새로운 펫친이 가입하면 알려드릴게요!<br/>프로필을 완성하고 기다려보세요 🐶</p>
              <button onClick={()=>setTab("profile")}
                style={{background:G,color:"white",border:"none",padding:"12px 24px",borderRadius:20,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 4px 14px rgba(236,72,153,.35)"}}>
                프로필 꾸미러 가기 ✨
              </button>
            </div>
          ) : (<>
          <div style={{background:"white",borderRadius:24,boxShadow:"0 8px 32px rgba(0,0,0,.1)",overflow:"hidden",
            transform:anim==="L"?"translateX(-110%) rotate(-18deg)":anim==="R"?"translateX(110%) rotate(18deg)":anim==="U"?"translateY(-100%)":"none",
            opacity:anim?0:1,transition:anim?"all .32s ease":"none"}}>
            {/* 사진 캐러셀 */}
            <div style={{position:"relative",height:390,overflow:"hidden",touchAction:"pan-y"}}>
              <div style={{display:"flex",width:`${(pet.imgs||[pet.img]).length*100}%`,transform:`translateX(-${photoIdx*(100/(pet.imgs||[pet.img]).length)}%)`,transition:"transform .3s ease"}}>
                {(pet.imgs||[pet.img]).map((img,i)=>(
                  <img key={i} src={img} alt="" style={{width:`${100/(pet.imgs||[pet.img]).length}%`,height:390,objectFit:"cover",flexShrink:0}}/>
                ))}
              </div>
              {/* 좌우 터치 영역 */}
              <div onClick={()=>setPhotoIdx(i=>Math.max(0,i-1))} style={{position:"absolute",top:0,left:0,width:"35%",height:"100%",cursor:"pointer"}}/>
              <div onClick={()=>setPhotoIdx(i=>Math.min((pet.imgs||[pet.img]).length-1,i+1))} style={{position:"absolute",top:0,right:0,width:"35%",height:"100%",cursor:"pointer"}}/>
              {/* 사진 인디케이터 */}
              {(pet.imgs||[pet.img]).length>1 && (
                <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
                  {(pet.imgs||[pet.img]).map((_,i)=>(
                    <div key={i} style={{width:i===photoIdx?20:6,height:4,borderRadius:3,background:i===photoIdx?"white":"rgba(255,255,255,.5)",transition:"all .2s"}}/>
                  ))}
                </div>
              )}
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 50%,rgba(0,0,0,.7))",pointerEvents:"none"}} />

              <div style={{position:"absolute",bottom:14,left:14,color:"white"}}>
                <h2 style={{margin:"0 0 2px",fontSize:24,fontWeight:800,textShadow:"0 1px 4px rgba(0,0,0,.3)"}}>{pet.name}</h2>
                <p style={{margin:0,fontSize:14,textShadow:"0 1px 3px rgba(0,0,0,.3)"}}>{pet.breed} · {pet.age}살 · {pet.gender}</p>
              </div>
              <div style={{position:"absolute",bottom:14,right:14,background:"rgba(0,0,0,.5)",color:"white",padding:"4px 10px",borderRadius:20,fontSize:12}}>📍 {pet.dist}</div>
            </div>
            <div style={{padding:"16px 20px 20px"}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                {pet.tags.map((t,i) => <span key={i} style={{background:"#fce7f3",color:"#be185d",padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>{t}</span>)}
              </div>
              <p style={{margin:"0 0 14px",fontSize:14,color:"#374151",lineHeight:1.6}}>{pet.bio}</p>
              {/* 주인 정보 카드 */}
              <div style={{background:"linear-gradient(135deg,#fdf2f8,#ede9fe)",borderRadius:14,padding:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{width:40,height:40,background:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,flexShrink:0,fontSize:16}}>{pet.owner[0]}</div>
                  <div style={{flex:1}}>
                    <p style={{margin:"0 0 1px",fontWeight:700,fontSize:14}}>{pet.owner} {pet.verified && <span title="인증됨" style={{display:"inline-block",background:"#3b82f6",color:"white",fontSize:9,fontWeight:800,padding:"1px 5px",borderRadius:6,verticalAlign:"middle",marginLeft:3}}>✓ 인증</span>}</p>
                    <p style={{margin:0,color:"#9ca3af",fontSize:12}}>{pet.ownerRegion||pet.location}</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {pet.ownerGender && <span style={{background:"white",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,color:"#7c3aed"}}>{pet.ownerGender==="남"?"🙋‍♂️ 남성":"🙋‍♀️ 여성"}</span>}
                  {pet.ownerBirth && <span style={{background:"white",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,color:"#7c3aed"}}>{pet.ownerBirth}년생</span>}
                  <span style={{background:"white",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,color:"#7c3aed"}}>📍 {pet.ownerRegion||pet.location}</span>
                </div>
                {/* 관심사 */}
                {pet.ownerInterests && pet.ownerInterests.length>0 && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
                    {pet.ownerInterests.map((t,i)=><span key={i} style={{background:"rgba(124,58,237,.1)",color:"#7c3aed",padding:"2px 8px",borderRadius:12,fontSize:10,fontWeight:600}}>#{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 액션 버튼 */}
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:20,marginTop:24}}>
            <button onClick={() => swipe("L")} style={{width:62,height:62,background:"white",border:"none",borderRadius:"50%",cursor:"pointer",fontSize:26,boxShadow:"0 4px 16px rgba(0,0,0,.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>❌</button>
            <button onClick={() => {
              if(points<30){alert("슈퍼좋아요에는 🐾 30p가 필요해요!\n현재 보유: "+points+"p");return;}
              setSuperLikeConfirm(pet);
            }} style={{width:76,height:76,background:"linear-gradient(135deg,#fbbf24,#f59e0b)",border:"none",borderRadius:"50%",cursor:"pointer",fontSize:30,boxShadow:"0 6px 20px rgba(251,191,36,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>💎</button>
            <button onClick={() => swipe("R")} style={{width:62,height:62,background:"white",border:"none",borderRadius:"50%",cursor:"pointer",fontSize:26,boxShadow:"0 4px 16px rgba(0,0,0,.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>🐾</button>
          </div>
          <p style={{textAlign:"center",fontSize:12,color:"#d1d5db",marginTop:10}}>❌ 패스 &nbsp;|&nbsp; 💎 슈퍼좋아요 <span style={{color:"#f59e0b",fontWeight:700}}>30p</span> &nbsp;|&nbsp; 🐾 좋아요</p>
          </>)}
        </div>
      )}

      {/* 탐색 */}
      {tab==="explore_disabled" && (
        <div style={{padding:"20px 16px"}}>
          <h2 style={{margin:"0 0 16px",fontSize:22,fontWeight:800}}>근처 펫친 탐색</h2>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {["1km","3km","5km","10km"].map((d,i) => (
              <button key={d} style={{padding:"6px 16px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,background:i===1?G:"#f3f4f6",color:i===1?"white":"#6b7280"}}>{d}</button>
            ))}
          </div>
          {nearbyPets.length===0 ? (
            <div style={{background:"white",borderRadius:18,padding:"40px 20px",textAlign:"center"}}>
              <p style={{fontSize:40,margin:"0 0 8px"}}>🔍</p>
              <p style={{margin:"0 0 4px",fontWeight:600,color:"#374151"}}>아직 주변에 펫친이 없어요</p>
              <p style={{margin:0,fontSize:13,color:"#9ca3af"}}>새 친구가 생기면 여기에 나타나요!</p>
            </div>
          ) : (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {nearbyPets.map(p => (
              <div key={p.id} style={{background:"white",borderRadius:18,overflow:"hidden",boxShadow:"0 4px 12px rgba(0,0,0,.06)"}}>
                <div style={{position:"relative",height:140}}>
                  <img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  <span style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.5)",color:"white",fontSize:11,padding:"3px 8px",borderRadius:10}}>📍{p.dist}</span>
                </div>
                <div style={{padding:"10px 12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><h3 style={{margin:0,fontSize:15,fontWeight:700}}>{p.name}</h3><span style={{fontSize:11,color:"#6b7280"}}>{p.age}살</span></div>
                  <p style={{margin:"2px 0 0",fontSize:12,color:"#9ca3af"}}>{p.breed} · {p.age}살</p>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* 라운지 */}
      {tab==="community" && !selectedPost && (
        <div onTouchStart={e=>handleTouchStart(e,"community")} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          {/* 당겨서 새로고침 인디케이터 */}
          {pullY > 5 && pullTabRef.current==="community" && (
            <div style={{display:"flex",justifyContent:"center",padding:pullY*0.15+"px 0",background:"#fdf2f8",transition:pulling?"none":"padding .2s"}}>
              <span style={{fontSize:16,transform:`rotate(${Math.min(pullY*4,360)}deg)`,transition:pulling?"none":"transform .2s"}}>🔄</span>
              <span style={{fontSize:12,color:"#ec4899",fontWeight:600,marginLeft:6}}>{pulling?"놓으면 새로고침":"당겨서 새로고침"}</span>
            </div>
          )}
          {isRefreshing && (
            <div style={{display:"flex",justifyContent:"center",padding:"6px 0",background:"#fdf2f8"}}>
              <span style={{fontSize:14,animation:"spin 1s linear infinite"}}>🔄</span>
              <span style={{fontSize:12,color:"#ec4899",fontWeight:600,marginLeft:6}}>불러오는 중...</span>
            </div>
          )}
          {/* 카테고리 탭 - 항상 펼침 */}
          <div style={{background:"white",borderBottom:"1px solid #f3f4f6",position:"sticky",top:57,zIndex:9,padding:"10px 12px 8px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
              {LOUNGE_CATS.map(c=>(
                <button key={c.key} onClick={()=>setLoungeCat(c.key)}
                  style={{padding:"8px 4px",borderRadius:14,border:"none",cursor:"pointer",
                    fontWeight:700,fontSize:11,textAlign:"center",
                    background:loungeCat===c.key?"linear-gradient(135deg,#ec4899,#a855f7)":"#f3f4f6",
                    color:loungeCat===c.key?"white":"#6b7280",
                    boxShadow:loungeCat===c.key?"0 2px 8px rgba(236,72,153,.3)":"none"}}>
                  <div style={{fontSize:16,marginBottom:2}}>{c.icon}</div>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 글 목록 */}
          <div style={{padding:"12px 14px 80px"}}>
            {(() => {
              const filtered = posts.filter(p =>
                loungeCat==="all" ? true :
                loungeCat==="hot" ? p.likes.length>=2 :
                loungeCat==="feed" ? p.by===user?.name :
                p.cat===loungeCat
              ).sort((a,b)=>b.ts-a.ts);

              if (filtered.length===0) return (
                <div style={{textAlign:"center",padding:"60px 20px"}}>
                  <p style={{fontSize:40,margin:"0 0 10px"}}>📝</p>
                  <p style={{color:"#9ca3af",fontSize:14,marginBottom:8}}>아직 글이 없어요</p>
                  <p style={{color:"#d1d5db",fontSize:12}}>첫 번째 글을 작성해보세요! ✏️</p>
                  <p style={{color:"#d1d5db",fontSize:12,marginTop:4}}>첫 번째 글을 작성해보세요!</p>
                </div>
              );

              return filtered.map(p => {
                const catInfo = LOUNGE_CATS.find(c=>c.key===p.cat)||{icon:"🐾",label:p.cat};
                const isLiked = p.likes.includes(user?.name);
                const openAuthorProfile = (e) => {
                  e.stopPropagation();
                  openProfile(p.by, p.byImg);
                };
                return (
                  <div key={p.id} onClick={()=>setSelectedPost(p)}
                    style={{background:"white",borderRadius:18,padding:16,marginBottom:10,boxShadow:"0 2px 8px rgba(0,0,0,.05)",cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div onClick={openAuthorProfile} style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#fce7f3,#ede9fe)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,cursor:"pointer",overflow:"hidden"}}>
                        {(p.byImg||authorPhotoCache[p.uid]) ? <img src={p.byImg||authorPhotoCache[p.uid]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : p.by?.[0]||"🐾"}
                      </div>
                      <div style={{flex:1}}>
                        <p onClick={openAuthorProfile} style={{margin:0,fontWeight:700,fontSize:13,cursor:"pointer",display:"inline-block"}}>{p.by}</p>
                        <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{p.ago}</p>
                      </div>
                      <span style={{background:"#f3f4f6",color:"#6b7280",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{catInfo.icon} {catInfo.label}</span>
                    </div>
                    <p style={{margin:"0 0 10px",fontSize:14,color:"#1f2937",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.content}</p>
                    {p.imgs.length>0 && (
                      <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto"}}>
                        {p.imgs.map((img,i)=><img key={i} src={img} alt="" style={{width:80,height:80,borderRadius:12,objectFit:"cover",flexShrink:0}} />)}
                      </div>
                    )}
                    <div style={{display:"flex",gap:14,alignItems:"center"}}>
                      <span style={{fontSize:13,color:isLiked?"#ec4899":"#9ca3af",fontWeight:isLiked?700:400}}>
                        {isLiked?"❤️":"🤍"} {p.likes.length}
                      </span>
                      <span style={{fontSize:13,color:"#9ca3af"}}>💬 {p.comments.length}</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* 글쓰기 버튼 */}
          <button onClick={()=>{
            if(points < WRITE_COST){ alert(`글 작성에는 🐾 ${WRITE_COST}p가 필요해요!\n현재 보유: ${points}p`); return; }
            setPostForm({cat:"walk",content:"",imgs:[]});
            setIsWritePost(true);
          }}
            style={{position:"fixed",bottom:80,right:20,width:52,height:52,borderRadius:"50%",background:G,color:"white",border:"none",cursor:"pointer",fontSize:24,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 18px rgba(236,72,153,.45)",zIndex:10}}>
            ✏️
          </button>
        </div>
      )}

      {/* 글 상세 */}
      {tab==="community" && selectedPost && (() => {
        const post = posts.find(p=>p.id===selectedPost.id) || selectedPost;
        const catInfo = LOUNGE_CATS.find(c=>c.key===post.cat)||{icon:"🐾",label:post.cat};
        const isLiked = post.likes.includes(user?.name);

        const addLike = () => {
          const newLikes = isLiked ? post.likes.filter(n=>n!==user?.name) : [...post.likes, user?.name];
          setPosts(ps => ps.map(p => p.id===post.id ? {...p, likes: newLikes} : p));
          setSelectedPost(p => ({...p, likes: newLikes}));
          // Firestore 즉시 동기화
          syncPostToFirestore(post.id, {likes:newLikes, comments:post.comments});
          if (!isLiked && post.by !== user?.name) {
            setAlarms(a=>[{id:Date.now(),icon:"❤️",text:`${user?.name}님이 회원님의 글에 좋아요를 눌렀어요`,time:"방금 전",unread:true,nav:{type:"post",postId:post.id}},...a]);
            if(post.uid) addDoc(collection(db,"notifications"),{to:post.uid,type:"like",from:user?.name,postId:post.id,text:"회원님의 글에 좋아요를 눌렀어요 ❤️",time:new Date().toISOString(),read:false}).catch(()=>{});
          }
        };

        const addComment = () => {
          if (!commentVal.trim()) return;
          const newC = {id:Date.now(),by:user?.name,byImg:profilePhotos[profileRepIdx]||null,text:commentVal.trim(),time:"방금 전",likes:[],replies:[]};
          const updatedComments = [...post.comments, newC];
          setPosts(ps=>ps.map(p=>p.id===post.id ? {...p,comments:updatedComments} : p));
          setSelectedPost(p=>({...p,comments:updatedComments}));
          // Firestore 즉시 동기화
          syncPostToFirestore(post.id, {likes:post.likes, comments:updatedComments});
          setCommentVal("");
          if (post.by !== user?.name) {
            setAlarms(a=>[{id:Date.now(),icon:"💬",text:`${user?.name}님이 댓글을 달았어요: "${commentVal.trim().slice(0,20)}..."`,time:"방금 전",unread:true,nav:{type:"post",postId:post.id}},...a]);
            if(post.uid) addDoc(collection(db,"notifications"),{to:post.uid,type:"comment",from:user?.name,postId:post.id,text:commentVal.trim().slice(0,30)+"...",time:new Date().toISOString(),read:false}).catch(()=>{});
          }
        };

        const addReply = (commentId) => {
          if (!replyVal.trim()) return;
          const newR = {id:Date.now(),by:user?.name,byImg:profilePhotos[profileRepIdx]||null,text:replyVal.trim(),time:"방금 전"};
          const updateComments = cs => cs.map(c => c.id===commentId ? {...c,replies:[...c.replies,newR]} : c);
          const updatedComments = updateComments(post.comments);
          setPosts(ps=>ps.map(p=>p.id===post.id ? {...p,comments:updatedComments} : p));
          setSelectedPost(p=>({...p,comments:updatedComments}));
          syncPostToFirestore(post.id, {likes:post.likes, comments:updatedComments});
          const comment = post.comments.find(c=>c.id===commentId);
          setReplyTarget(null); setReplyVal("");
          if (comment && comment.by !== user?.name) {
            setAlarms(a=>[{id:Date.now(),icon:"↩️",text:`${user?.name}님이 대댓글을 달았어요`,time:"방금 전",unread:true,nav:{type:"post",postId:post.id}},...a]);
          }
        };

        const likeComment = (commentId) => {
          const updateCs = cs => cs.map(c => c.id===commentId
            ? {...c, likes: c.likes.includes(user?.name) ? c.likes.filter(n=>n!==user?.name) : [...c.likes,user?.name]}
            : c);
          const updatedComments = updateCs(post.comments);
          setPosts(ps=>ps.map(p=>p.id===post.id ? {...p,comments:updatedComments} : p));
          setSelectedPost(p=>({...p,comments:updatedComments}));
          syncPostToFirestore(post.id, {likes:post.likes, comments:updatedComments});
        };

        return (
          <div style={{paddingBottom:100}}>
            {/* 헤더 */}
            <div style={{background:"white",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #f3f4f6",position:"sticky",top:57,zIndex:9}}>
              <button onClick={()=>{setSelectedPost(null);setCommentVal("");setReplyTarget(null);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,padding:4}}>←</button>
              <span style={{fontWeight:800,fontSize:15,flex:1}}>{catInfo.icon} {catInfo.label}</span>
            </div>

            {/* 글 본문 */}
            <div style={{background:"white",padding:18,margin:"0 0 8px",borderBottom:"1px solid #f3f4f6"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div onClick={()=>openProfile(post.by, post.byImg)}
                  style={{width:42,height:42,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white",fontWeight:700,cursor:"pointer",overflow:"hidden"}}>
                  {(post.byImg||authorPhotoCache[post.uid]) ? <img src={post.byImg||authorPhotoCache[post.uid]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : post.by?.[0]||"🐾"}
                </div>
                <div style={{flex:1,cursor:"pointer"}} onClick={()=>openProfile(post.by, post.byImg)}>
                  <p style={{margin:0,fontWeight:700,fontSize:14}}>{post.by}</p>
                  <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{post.ago}</p>
                </div>
                {/* 내 글: 수정/삭제 */}
                {post.by===user?.name && (
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{setEditingPost(post.id);setEditPostContent(post.content);}}
                      style={{background:"#f3f4f6",border:"none",cursor:"pointer",padding:"4px 10px",borderRadius:8,fontSize:12,color:"#6b7280"}}>수정</button>
                    <button onClick={()=>{
                      if(!confirm("이 글을 삭제하시겠어요?")) return;
                      setPosts(ps=>ps.filter(p=>p.id!==post.id));
                      setSelectedPost(null);
                    }}
                      style={{background:"#fef2f2",border:"none",cursor:"pointer",padding:"4px 10px",borderRadius:8,fontSize:12,color:"#ef4444"}}>삭제</button>
                  </div>
                )}
              </div>
              {/* 수정 모드 */}
              {editingPost===post.id && (
                <div style={{marginBottom:12,background:"#f9fafb",borderRadius:12,padding:12}}>
                  <textarea value={editPostContent} onChange={e=>setEditPostContent(e.target.value)}
                    style={{width:"100%",minHeight:80,border:"2px solid #ec4899",borderRadius:10,padding:10,fontSize:14,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
                  <div style={{display:"flex",gap:8,marginTop:8,justifyContent:"flex-end"}}>
                    <button onClick={()=>setEditingPost(null)} style={{background:"#e5e7eb",border:"none",cursor:"pointer",padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600}}>취소</button>
                    <button onClick={()=>{
                      setPosts(ps=>ps.map(p=>p.id===post.id?{...p,content:editPostContent,ago:"수정됨"}:p));
                      setSelectedPost(sp=>({...sp,content:editPostContent,ago:"수정됨"}));
                      setEditingPost(null);
                    }} style={{background:G,color:"white",border:"none",cursor:"pointer",padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600}}>수정 완료</button>
                  </div>
                </div>
              )}
              {editingPost!==post.id && <p style={{margin:"0 0 12px",fontSize:15,color:"#1f2937",lineHeight:1.7}}>{post.content}</p>}
              {post.imgs.length>0 && (
                <div style={{display:"flex",gap:8,marginBottom:12,overflowX:"auto"}}>
                  {post.imgs.map((img,i)=><img key={i} src={img} alt="" style={{width:140,height:140,borderRadius:14,objectFit:"cover",flexShrink:0}} />)}
                </div>
              )}
              {/* 좋아요 버튼 */}
              <div style={{display:"flex",gap:16,paddingTop:12,borderTop:"1px solid #f3f4f6"}}>
                <button onClick={addLike}
                  style={{display:"flex",alignItems:"center",gap:6,background:isLiked?"#fce7f3":"#f9fafb",border:"none",cursor:"pointer",padding:"8px 16px",borderRadius:20,fontWeight:700,fontSize:13,color:isLiked?"#ec4899":"#9ca3af",transition:"all .15s"}}>
                  {isLiked?"❤️":"🤍"} 좋아요 {post.likes.length}
                </button>
                <button style={{display:"flex",alignItems:"center",gap:6,background:"#f9fafb",border:"none",cursor:"pointer",padding:"8px 16px",borderRadius:20,fontWeight:700,fontSize:13,color:"#9ca3af"}}>
                  💬 댓글 {post.comments.length}
                </button>
              </div>
            </div>

            {/* 댓글 목록 */}
            <div style={{background:"white",padding:"0 16px"}}>
              {post.comments.length===0
                ? <p style={{textAlign:"center",padding:"24px 0",color:"#9ca3af",fontSize:13}}>첫 댓글을 달아보세요 💬</p>
                : post.comments.map(c=>(
                  <div key={c.id} style={{padding:"14px 0",borderBottom:"1px solid #f9fafb"}}>
                    <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,fontWeight:700,overflow:"hidden"}}>
                        {c.byImg ? <img src={c.byImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : c.by?.[0]||"🐾"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                          <span style={{fontWeight:700,fontSize:13}}>{c.by}</span>
                          <span style={{fontSize:11,color:"#9ca3af"}}>{c.time}</span>
                        </div>
                        <p style={{margin:"0 0 6px",fontSize:14,color:"#1f2937",lineHeight:1.5}}>{c.text}</p>
                        <div style={{display:"flex",gap:12,alignItems:"center"}}>
                          <button onClick={()=>likeComment(c.id)}
                            style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:c.likes.includes(user?.name)?"#ec4899":"#9ca3af",padding:0,fontWeight:600}}>
                            {c.likes.includes(user?.name)?"❤️":"🤍"} {c.likes.length}
                          </button>
                          <button onClick={()=>setReplyTarget(replyTarget?.commentId===c.id?null:{postId:post.id,commentId:c.id})}
                            style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#9ca3af",padding:0,fontWeight:600}}>
                            ↩️ 대댓글 {c.replies.length>0?c.replies.length:""}
                          </button>
                          {c.by===user?.name && (
                            <button onClick={()=>{
                              if(!confirm("댓글을 삭제하시겠어요?")) return;
                              const del=cs=>cs.filter(x=>x.id!==c.id);
                              setPosts(ps=>ps.map(p=>p.id===post.id?{...p,comments:del(p.comments)}:p));
                              setSelectedPost(sp=>({...sp,comments:del(sp.comments)}));
                            }}
                              style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#ef4444",padding:0,fontWeight:600}}>
                              🗑️ 삭제
                            </button>
                          )}
                        </div>
                        {/* 대댓글 목록 */}
                        {c.replies.length>0 && (
                          <div style={{marginTop:10,paddingLeft:4,borderLeft:"2px solid #f3e8ff"}}>
                            {c.replies.map(r=>(
                              <div key={r.id} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                                <div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#fce7f3,#ede9fe)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0,fontWeight:700}}>
                                  {r.by?.[0]||"🐾"}
                                </div>
                                <div>
                                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                                    <span style={{fontWeight:700,fontSize:12}}>{r.by}</span>
                                    <span style={{fontSize:10,color:"#9ca3af"}}>{r.time}</span>
                                  </div>
                                  <p style={{margin:0,fontSize:13,color:"#374151"}}>{r.text}</p>
                                  {r.by===user?.name && (
                                    <button onClick={()=>{
                                      if(!confirm("대댓글을 삭제하시겠어요?")) return;
                                      const delReply=cs=>cs.map(x=>x.id===c.id?{...x,replies:x.replies.filter(rr=>rr.id!==r.id)}:x);
                                      setPosts(ps=>ps.map(p=>p.id===post.id?{...p,comments:delReply(p.comments)}:p));
                                      setSelectedPost(sp=>({...sp,comments:delReply(sp.comments)}));
                                    }}
                                      style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#ef4444",padding:"2px 0 0",fontWeight:600}}>
                                      삭제
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* 대댓글 입력 */}
                        {replyTarget?.commentId===c.id && (
                          <div style={{display:"flex",gap:8,marginTop:10,background:"#f9fafb",borderRadius:14,padding:"8px 12px"}}>
                            <input value={replyVal} onChange={e=>setReplyVal(e.target.value)}
                              placeholder={`@${c.by}에게 대댓글 달기`}
                              style={{flex:1,background:"none",border:"none",outline:"none",fontSize:13,color:"#1f2937"}}
                              onKeyDown={e=>e.key==="Enter"&&addReply(c.id)}
                              autoFocus />
                            <button onClick={()=>addReply(c.id)}
                              style={{background:G,color:"white",border:"none",cursor:"pointer",borderRadius:10,padding:"4px 12px",fontSize:12,fontWeight:700,flexShrink:0}}>
                              등록
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* 댓글 입력창 - 하단 고정 */}
            <div style={{position:"fixed",bottom:72,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderTop:"1px solid #f3f4f6",padding:"10px 14px",boxSizing:"border-box",zIndex:10,display:"flex",gap:10}}>
              <input value={commentVal} onChange={e=>setCommentVal(e.target.value)}
                placeholder="댓글을 입력하세요..."
                style={{flex:1,background:"#f3f4f6",border:"none",outline:"none",borderRadius:22,padding:"10px 16px",fontSize:14,color:"#1f2937"}}
                onKeyDown={e=>e.key==="Enter"&&addComment()} />
              <button onClick={addComment}
                style={{flexShrink:0,background:commentVal.trim()?G:"#e5e7eb",color:commentVal.trim()?"white":"#9ca3af",border:"none",cursor:commentVal.trim()?"pointer":"default",borderRadius:"50%",width:40,height:40,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                ↑
              </button>
            </div>
          </div>
        );
      })()}

      {/* 메시지 */}
      {tab==="messages" && (
        <div>
          {/* 서브탭: 매칭대화 / 보낸좋아요 / 받은좋아요 */}
          <div style={{padding:"14px 20px 0",borderBottom:"1px solid #f3f4f6"}}>
            <div style={{display:"flex",gap:0}}>
              {[["chat","💬 대화",matches.length],["liked","💗 보낸",liked.length],["received","💜 받은",receivedLikes.length]].map(([id,label,cnt])=>(
                <button key={id} onClick={()=>setInterestMode(id)}
                  style={{flex:1,background:"none",border:"none",cursor:"pointer",padding:"10px 0 12px",fontSize:14,fontWeight:700,
                    color:interestMode===id?"#ec4899":"#9ca3af",borderBottom:interestMode===id?"3px solid #ec4899":"3px solid transparent",transition:"all .15s"}}>
                  {label} {cnt>0&&<span style={{background:interestMode===id?"#fce7f3":"#f3f4f6",color:interestMode===id?"#ec4899":"#9ca3af",fontSize:11,fontWeight:800,padding:"2px 6px",borderRadius:8,marginLeft:4}}>{cnt}</span>}
                </button>
              ))}
            </div>
          </div>

          {interestMode==="chat" ? (
            <>
              {matches.length===0 ? (
                <div style={{textAlign:"center",padding:"70px 20px"}}>
                  <p style={{fontSize:48,margin:"0 0 12px"}}>💬</p>
                  <p style={{color:"#9ca3af",fontSize:15}}>아직 매칭된 펫친이 없어요</p>
                  <p style={{color:"#d1d5db",fontSize:13,marginTop:4}}>카드를 넘겨 펫친을 만나보세요!</p>
                  <button onClick={() => setTab("home")} style={{marginTop:20,background:G,color:"white",border:"none",padding:"11px 22px",borderRadius:20,fontWeight:700,cursor:"pointer",fontSize:14,boxShadow:"0 4px 14px rgba(236,72,153,.35)"}}>펫친 찾으러 가기 🐾</button>
                </div>
              ) : matches.map((m,i) => {
                const petData = nearbyPets.find(p=>p.owner===m.name||p.name===m.name);
                const buildProfile = () => setViewUserProfile({name:m.name,img:m.img,location:petData?.location||"인천 연수구",bio:petData?.bio||"",pets:petData?[{name:petData.name,type:"강아지",breed:petData.breed,img:petData.img,gender:petData.gender,traits:petData.tags}]:[]});
                return (
                <div key={i} onClick={() => openChat(m)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:"1px solid #f9fafb",cursor:"pointer",background:"white"}}>
                  <div onClick={e=>{e.stopPropagation();buildProfile();}} style={{position:"relative",cursor:"pointer"}}>
                    <img src={m.img} alt={m.name} style={{width:52,height:52,borderRadius:"50%",objectFit:"cover"}} />
                    <span style={{position:"absolute",bottom:1,right:1,width:12,height:12,background:m.online?"#10b981":"#d1d5db",borderRadius:"50%",border:"2px solid white"}} />
                  </div>
                  <div style={{flex:1}}>
                    <p style={{margin:"0 0 2px",fontWeight:700,fontSize:15}}>{m.name}</p>
                    <p style={{margin:0,color:"#9ca3af",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{m.lastMsg||"새로운 매칭 🎉"}</p>
                  </div>

                </div>
                );
              })}
            </>
          ) : interestMode==="liked" ? (
            <>
              {liked.length===0 ? (
                <div style={{textAlign:"center",padding:"60px 20px"}}>
                  <p style={{fontSize:48,margin:"0 0 12px"}}>💗</p>
                  <p style={{color:"#9ca3af",fontSize:15}}>아직 관심 표시한 펫친이 없어요</p>
                  <button onClick={() => setTab("home")} style={{marginTop:20,background:G,color:"white",border:"none",padding:"11px 22px",borderRadius:20,fontWeight:700,cursor:"pointer",fontSize:14}}>펫친 찾으러 가기 🐾</button>
                </div>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,padding:16}}>
                  {liked.map((p,i) => (
                    <div key={i} style={{background:"white",borderRadius:18,overflow:"hidden",boxShadow:"0 4px 12px rgba(0,0,0,.06)"}}>
                      <div style={{position:"relative",height:150}}>
                        <img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                        <div style={{position:"absolute",bottom:8,right:8,background:"rgba(255,255,255,.9)",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>💗</div>
                      </div>
                      <div style={{padding:"10px 12px"}}>
                        <h3 style={{margin:"0 0 2px",fontSize:15,fontWeight:700}}>{p.name}</h3>
                        <p style={{margin:0,fontSize:12,color:"#9ca3af"}}>{p.breed} · {p.age}살</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : interestMode==="received" ? (
            <>
              {receivedLikes.length===0 ? (
                <div style={{textAlign:"center",padding:"60px 20px"}}>
                  <p style={{fontSize:48,margin:"0 0 12px"}}>💜</p>
                  <p style={{color:"#9ca3af",fontSize:15}}>아직 좋아요를 받지 못했어요</p>
                  <p style={{color:"#d1d5db",fontSize:13,marginTop:4}}>프로필을 완성하면 좋아요를 받을 확률이 올라가요!</p>
                  <button onClick={()=>setTab("profile")} style={{marginTop:20,background:G,color:"white",border:"none",padding:"11px 22px",borderRadius:20,fontWeight:700,cursor:"pointer",fontSize:14}}>프로필 꾸미러 가기 ✨</button>
                </div>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,padding:16}}>
                  {receivedLikes.map((p,i)=>(
                    <div key={i} onClick={()=>setViewUserProfile({name:p.name,img:p.img,location:p.location||"",bio:p.bio||"",pets:[]})}
                      style={{background:"white",borderRadius:18,overflow:"hidden",boxShadow:"0 4px 12px rgba(0,0,0,.06)",cursor:"pointer"}}>
                      <div style={{position:"relative",height:150}}>
                        <img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                        <div style={{position:"absolute",bottom:8,right:8,background:"rgba(168,85,247,.9)",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"white"}}>💜</div>
                      </div>
                      <div style={{padding:"10px 12px"}}>
                        <h3 style={{margin:"0 0 2px",fontSize:15,fontWeight:700}}>{p.name}</h3>
                        <p style={{margin:0,fontSize:12,color:"#9ca3af"}}>{p.breed} · {p.age}살</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* 채팅 */}
      {tab==="chat" && (
        <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 65px)"}}>
          {/* 채팅 메뉴 */}
          {chatMenu && (
            <div style={{position:"fixed",inset:0,zIndex:50}} onClick={()=>setChatMenu(false)}>
              <div style={{position:"absolute",top:55,right:12,background:"white",borderRadius:14,boxShadow:"0 8px 30px rgba(0,0,0,.15)",overflow:"hidden",minWidth:160}}>
                <button onClick={(e)=>{e.stopPropagation();setChatMenu(false);openProfile(chatPet?.owner||chatPet?.name,chatPet?.img);}} style={{display:"block",width:"100%",padding:"12px 16px",border:"none",background:"white",cursor:"pointer",fontSize:13,fontWeight:600,textAlign:"left",color:"#374151"}}>👤 프로필 보기</button>
                <button onClick={(e)=>{e.stopPropagation();setChatMenu(false);if(!confirm("대화방을 나가시겠어요? 대화 기록이 삭제됩니다."))return;if(chatRoomId){deleteDoc(doc(db,"chatRooms",chatRoomId)).catch(()=>{});}setMatches(ms=>ms.filter(x=>x.uid!==chatPet?.uid&&x.name!==chatPet?.name));setChatPet(null);setChatRoomId(null);setTab("messages");alert("대화방에서 나갔습니다.");}}
                  style={{display:"block",width:"100%",padding:"12px 16px",border:"none",background:"white",cursor:"pointer",fontSize:13,fontWeight:600,textAlign:"left",color:"#ef4444",borderTop:"1px solid #f3f4f6"}}>🚪 대화방 나가기</button>
              </div>
            </div>
          )}
          <div ref={chatContainerRef} onScroll={(e)=>{const el=e.target;const atBot=el.scrollHeight-el.scrollTop-el.clientHeight<60;setChatAtBottom(atBot);if(atBot)setNewMsgAlert(false);}}
            style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10,position:"relative"}}>
            {msgs.map((m,mi) => (
              <div key={m.id||mi} style={{display:"flex",flexDirection:"column",alignItems:m.me?"flex-end":"flex-start"}}>
                <div style={{display:"flex",alignItems:m.me?"flex-end":"flex-start",gap:8,maxWidth:"80%"}}>
                  {!m.me && <img onClick={()=>openProfile(chatPet?.owner||chatPet?.name,chatPet?.img)} src={chatPet?.img} alt="" style={{width:30,height:30,borderRadius:"50%",objectFit:"cover",cursor:"pointer",flexShrink:0}} />}
                  <div style={{maxWidth:"100%",padding:"10px 14px",borderRadius:m.me?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.me?G:"white",color:m.me?"white":"#1f2937",fontSize:14,boxShadow:"0 2px 8px rgba(0,0,0,.07)",lineHeight:1.5}}>
                    {m.text}
                  </div>
                </div>
                {m.me && <span style={{fontSize:10,color:(m.readBy||[]).length>=2?"#3b82f6":"#d1d5db",marginTop:2,marginRight:4,fontWeight:600}}>{(m.readBy||[]).length>=2?"읽음":"전송됨"}</span>}
              </div>
            ))}
          </div>
          {/* 새 메시지 알림 버튼 */}
          {newMsgAlert && (
            <div style={{position:"absolute",bottom:80,left:"50%",transform:"translateX(-50%)",zIndex:5}}>
              <button onClick={()=>{chatContainerRef.current?.scrollTo({top:chatContainerRef.current.scrollHeight,behavior:"smooth"});setNewMsgAlert(false);}}
                style={{background:G,color:"white",border:"none",padding:"8px 18px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(236,72,153,.4)",display:"flex",alignItems:"center",gap:6}}>
                ↓ 새 메시지
              </button>
            </div>
          )}
          <div style={{padding:"12px 14px",background:"white",borderTop:"1px solid #f3f4f6",display:"flex",gap:10}}>
            <input value={msgVal} onChange={e => setMsgVal(e.target.value)} onKeyDown={e => e.key==="Enter"&&sendMsg()} placeholder="메시지를 입력하세요..."
              style={{flex:1,padding:"10px 16px",border:"2px solid #f3f4f6",borderRadius:24,fontSize:14,outline:"none"}} />
            <button onClick={sendMsg} disabled={!msgVal.trim()}
              style={{width:44,height:44,background:G,border:"none",borderRadius:"50%",cursor:"pointer",color:"white",fontSize:18,opacity:msgVal.trim()?1:.4,display:"flex",alignItems:"center",justifyContent:"center"}}>➤</button>
          </div>
        </div>
      )}

      {/* 프로필 */}
      {tab==="profile" && (
        <div style={{paddingBottom:20}}>
          {/* 상단 헤더 카드 */}
          <div style={{background:"linear-gradient(135deg,#fce7f3,#ede9fe)",padding:"24px 20px 20px"}}>
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              {/* 프로필 사진 */}
              <div style={{width:72,height:72,borderRadius:"50%",border:"3px solid white",overflow:"hidden",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:"white",fontWeight:800,boxShadow:"0 4px 16px rgba(0,0,0,.12)",flexShrink:0}}>
                {profilePhotos[profileRepIdx]
                  ? <img src={profilePhotos[profileRepIdx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  : user?.name?.[0]||"🐾"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <h2 style={{margin:0,fontSize:20,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</h2>
                  {isVerified && <span style={{background:"#3b82f6",color:"white",fontSize:9,fontWeight:800,padding:"2px 6px",borderRadius:6,flexShrink:0}}>✓</span>}
                  {isBoosted && <span style={{background:"#f59e0b",color:"white",fontSize:9,fontWeight:800,padding:"2px 6px",borderRadius:6,flexShrink:0}}>🔥</span>}
                </div>
                <p style={{margin:"0 0 4px",fontSize:12,color:"#6b7280"}}>{user?.gender ? (user.gender==="남"?"남성":"여성")+" · " : ""}{user?.birth ? user.birth+"년생 · " : ""}{user?.region||""}</p>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <p style={{margin:0,fontSize:12,color:"#374151",display:"flex",alignItems:"center",gap:4}}>📍 {userLocation}</p>
                  <button onClick={updateMyLocation} disabled={locationUpdating}
                    style={{background:locationUpdating?"#f3f4f6":"#fdf2f8",color:locationUpdating?"#9ca3af":"#ec4899",border:"1px solid #fce7f3",padding:"3px 8px",borderRadius:10,fontSize:10,fontWeight:700,cursor:locationUpdating?"default":"pointer",display:"flex",alignItems:"center",gap:3,whiteSpace:"nowrap"}}>
                    <span style={{display:"inline-block",animation:locationUpdating?"spin 1s linear infinite":"none"}}>📍</span>{locationUpdating?"감지중...":"위치 갱신"}
                  </button>
                </div>
              </div>
            </div>
            {profileBio && <p style={{margin:"12px 0 0",fontSize:13,color:"#374151",lineHeight:1.5,background:"rgba(255,255,255,.7)",borderRadius:10,padding:"8px 12px"}}>{profileBio}</p>}
            {/* 관심사 태그 - 프로필수정 버튼 위에 배치 */}
            {user?.interests && user.interests.length>0 && (
              <div style={{marginTop:12,display:"flex",flexWrap:"wrap",gap:4}}>
                {user.interests.map((t,i)=><span key={i} style={{background:"rgba(255,255,255,.8)",color:"#be185d",padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>#{t}</span>)}
              </div>
            )}
            <button onClick={() => { setEditBioVal(profileBio); setEditNickVal(user?.name||""); setIsEditProfile(true); }}
              style={{marginTop:10,background:"rgba(255,255,255,.85)",color:"#ec4899",border:"none",padding:"8px 18px",borderRadius:20,fontSize:13,fontWeight:700,cursor:"pointer",width:"100%"}}>
              ✏️ 프로필 수정
            </button>
          </div>

          {/* 인증 + 완성도 */}
          {!isVerified && (
            <div style={{margin:"0 20px 8px",background:"#eff6ff",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>🛡️</span>
              <p style={{margin:0,fontSize:12,fontWeight:600,color:"#374151",flex:1}}>인증하면 매칭률 UP!</p>
              <button onClick={()=>setVerifyModal(true)} style={{background:"#3b82f6",color:"white",border:"none",padding:"5px 12px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer"}}>인증</button>
            </div>
          )}
          {(() => {
            const items=[
              {l:"사진",d:profilePhotos.some(p=>p)},{l:"소개",d:!!profileBio},
              {l:"반려동물",d:myPets.length>0},{l:"관심사",d:!!(user?.interests&&user.interests.length>0)},
              {l:"인증",d:isVerified}
            ];
            const pct=Math.round(items.filter(i=>i.d).length/items.length*100);
            return pct<100?(
              <div style={{margin:"0 20px 8px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,background:"#f3f4f6",borderRadius:4,height:6,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:4,background:G,width:pct+"%",transition:"width .5s"}}/>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:"#ec4899",flexShrink:0}}>{pct}%</span>
              </div>
            ):null;
          })()}

          {/* 통계 */}
          <div style={{padding:"12px 20px",display:"flex",gap:8}}>
            {[[matches.length,"매칭","💕"],[liked.length,"좋아요","💗"],[nearbyPets.length?idx%nearbyPets.length:0,"프로필","👀"]].map(([n,label,icon],i)=>(
              <div key={i} style={{flex:1,background:"white",borderRadius:14,padding:"10px 8px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                <p style={{margin:"0 0 2px",fontSize:18,fontWeight:800}}>{icon} {n}</p>
                <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{label}</p>
              </div>
            ))}
          </div>

          {/* 나의 반려동물 */}
          <div style={{padding:"16px 20px",borderBottom:"1px solid #f3f4f6"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:800}}>🐾 나의 반려동물</h3>
              <button onClick={() => { setPetForm({name:"",type:"강아지",breed:"",birth:"",gender:"남아",food:"",traits:[],photos:[null,null,null,null,null],repIdx:0}); setEditPetIdx(null); setIsAddPet(true); }}
                style={{background:G,color:"white",border:"none",padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ 추가하기</button>
            </div>
            {myPets.length===0
              ? <div style={{background:"#f9fafb",borderRadius:16,padding:"28px 20px",textAlign:"center"}}>
                  <p style={{fontSize:36,margin:"0 0 8px"}}>🐶</p>
                  <p style={{margin:"0 0 4px",fontWeight:600,color:"#374151"}}>아직 등록된 반려동물이 없어요</p>
                  <p style={{margin:"0 0 14px",fontSize:13,color:"#9ca3af"}}>반려동물을 등록하고 친구를 사귀어보세요!</p>
                  <button onClick={() => { setPetForm({name:"",type:"강아지",breed:"",birth:"",gender:"남아",food:"",traits:[],photos:[null,null,null,null,null],repIdx:0}); setEditPetIdx(null); setIsAddPet(true); }}
                    style={{background:G,color:"white",border:"none",padding:"10px 20px",borderRadius:20,fontWeight:700,fontSize:13,cursor:"pointer"}}>반려동물 등록하기</button>
                </div>
              : <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {myPets.map((pet,i) => (
                    <div key={i} style={{background:"white",borderRadius:18,padding:14,boxShadow:"0 2px 10px rgba(0,0,0,.06)"}}>
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        <div style={{width:56,height:56,borderRadius:14,overflow:"hidden",background:"#f3f4f6",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
                          {pet.photos[pet.repIdx]
                            ? <img src={pet.photos[pet.repIdx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                            : "🐾"}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                            <h4 style={{margin:0,fontSize:14,fontWeight:800}}>{pet.name}</h4>
                            <span style={{fontSize:11,color:"#9ca3af"}}>{pet.type} · {pet.breed}</span>
                          </div>
                          <p style={{margin:0,fontSize:12,color:"#9ca3af"}}>{pet.gender} · {pet.birth}</p>
                        </div>
                        <div style={{display:"flex",gap:4,flexShrink:0}}>
                          <button onClick={()=>{
                            setPetForm({...pet});
                            setEditPetIdx(i);
                            setIsAddPet(true);
                          }} style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:30,height:30,borderRadius:8,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
                          <button onClick={()=>{
                            if(!confirm(pet.name+"을(를) 삭제하시겠어요?")) return;
                            setMyPets(p=>{
                              const updated=p.filter((_,j)=>j!==i);
                              if(user?.uid) updateDoc(doc(db,"users",user.uid),{myPets:updated}).catch(()=>{});
                              return updated;
                            });
                          }} style={{background:"#fef2f2",border:"none",cursor:"pointer",width:30,height:30,borderRadius:8,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑️</button>
                        </div>
                      </div>
                      {pet.traits.length>0 && (
                        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8,paddingLeft:68}}>
                          {pet.traits.slice(0,4).map((t,j)=><span key={j} style={{background:"#fce7f3",color:"#be185d",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:10}}>{t}</span>)}
                          {pet.traits.length>4 && <span style={{fontSize:10,color:"#9ca3af"}}>+{pet.traits.length-4}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* 메뉴 섹션 */}
          <div style={{padding:"12px 20px"}}>
            {/* 부스트 */}
            {isBoosted ? (
              <div style={{background:"linear-gradient(135deg,#fef3c7,#fbbf24)",borderRadius:14,padding:"10px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>🔥</span>
                <p style={{margin:0,fontSize:13,fontWeight:700,color:"#92400e",flex:1}}>부스트 활성화 중</p>
              </div>
            ) : (
              <button onClick={()=>{
                if(points<50){alert("🐾 50p가 필요해요! (보유: "+points+"p)");return;}
                if(!confirm("🔥 50p로 프로필 부스트?\n3일간 우선 노출!")) return;
                setPoints(p=>p-50);
                setPointLog(l=>[{icon:"🔥",label:"프로필 부스트",pt:-50,type:"use",date:"방금 전"},...l]);
                setIsBoosted(true);
              }} style={{width:"100%",background:"linear-gradient(135deg,#f59e0b,#fbbf24)",color:"white",border:"none",padding:"11px 0",borderRadius:14,fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:8,boxShadow:"0 2px 10px rgba(245,158,11,.2)"}}>
                🔥 프로필 부스트 (50p · 3일)
              </button>
            )}
          </div>

          {/* 설정 & 로그아웃 */}
          <div style={{padding:"0 20px 16px"}}>
            <div style={{display:"flex",flexDirection:"column",gap:0,marginBottom:12}}>
              {[
                {icon:"📢",label:"공지사항",action:()=>alert("📢 펫플 v1.0 출시!\n\n반려동물 친구 만들기 서비스 펫플이 정식 출시되었습니다. 🐾")},
                {icon:"💡",label:"자주 묻는 질문",action:()=>alert("Q. 매칭은 어떻게 되나요?\nA. 홈에서 프로필을 스와이프하세요. 오른쪽=좋아요, 왼쪽=패스!\n\nQ. 포인트는 어떻게 모으나요?\nA. 출석체크, 스토리 업로드 등 활동하면 자동 적립돼요.")},
                {icon:"📄",label:"이용약관",action:()=>alert("펫플 서비스 이용약관\n\n제1조 이 약관은 펫플 서비스의 이용 조건을 규정합니다.\n제2조 이용자는 건전한 커뮤니티 문화를 유지해야 합니다.")},
                {icon:"🔒",label:"개인정보 처리방침",action:()=>alert("수집 항목: 이메일, 닉네임, 위치 정보\n수집 목적: 서비스 제공 및 개선\n보유 기간: 회원 탈퇴 시까지")},
                {icon:"💬",label:"고객센터",action:()=>alert("📮 support@petple.app\n운영시간: 평일 10:00 ~ 18:00")},
                {icon:"🚪",label:"회원탈퇴",action:()=>setDeleteAccModal(true),danger:true},
              ].map((item,i)=>(
                <button key={i} onClick={item.action}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"13px 4px",background:"none",border:"none",cursor:"pointer",textAlign:"left",borderBottom:i<4?"1px solid #f3f4f6":"none"}}>
                  <span style={{fontSize:16,width:24,textAlign:"center"}}>{item.icon}</span>
                  <span style={{fontSize:14,color:item.danger?"#ef4444":"#374151",fontWeight:item.danger?600:500}}>{item.label}</span>
                  <span style={{marginLeft:"auto",fontSize:14,color:"#d1d5db"}}>›</span>
                </button>
              ))}
            </div>
            <button onClick={logout} style={{width:"100%",background:"#f3f4f6",border:"none",padding:"12px 0",borderRadius:12,color:"#6b7280",fontWeight:600,fontSize:14,cursor:"pointer",marginBottom:12}}>로그아웃</button>
            <p style={{margin:0,fontSize:10,color:"#d1d5db",textAlign:"center",lineHeight:1.8}}>
              🐾 펫플 v1.0.0 | 상호: 펫플 | 대표: 김영웅<br/>사업자등록번호: 743-09-03086 | support@petple.app
            </p>
          </div>
        </div>
      )}

      {/* 스토리 */}
      {tab==="story" && (
        <div style={{paddingBottom:20}} onTouchStart={e=>handleTouchStart(e,"story")} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          {/* 필터 바 */}
          {pullY > 5 && pullTabRef.current==="story" && (
            <div style={{display:"flex",justifyContent:"center",padding:pullY*0.15+"px 0",background:"#fdf2f8",transition:pulling?"none":"padding .2s"}}>
              <span style={{fontSize:16,transform:`rotate(${Math.min(pullY*4,360)}deg)`,transition:pulling?"none":"transform .2s"}}>🔄</span>
              <span style={{fontSize:12,color:"#ec4899",fontWeight:600,marginLeft:6}}>{pulling?"놓으면 새로고침":"당겨서 새로고침"}</span>
            </div>
          )}
          {isRefreshing && pullTabRef.current==="story" && (
            <div style={{display:"flex",justifyContent:"center",padding:"6px 0",background:"#fdf2f8"}}>
              <span style={{fontSize:14,animation:"spin 1s linear infinite"}}>🔄</span>
              <span style={{fontSize:12,color:"#ec4899",fontWeight:600,marginLeft:6}}>불러오는 중...</span>
            </div>
          )}
          <div style={{padding:"8px 14px",background:"white",display:"flex",justifyContent:"flex-start",alignItems:"center"}}>
            <button onClick={()=>setShowStoryFilter(true)}
              style={{background:storyFilter.petType!=="all"||storyFilter.region!=="all"?"#fdf2f8":"#f3f4f6",color:storyFilter.petType!=="all"||storyFilter.region!=="all"?"#ec4899":"#6b7280",border:storyFilter.petType!=="all"||storyFilter.region!=="all"?"1px solid #fce7f3":"1px solid #e5e7eb",padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              🔍 필터 {(storyFilter.petType!=="all"||storyFilter.region!=="all")?"✓":""}
            </button>
          </div>
          {/* 스토리 필터 모달 */}
          {showStoryFilter && (
            <div style={{position:"fixed",inset:0,zIndex:55,display:"flex",flexDirection:"column"}}>
              <div onClick={()=>setShowStoryFilter(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)"}} />
              <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderRadius:"24px 24px 0 0",padding:"0 0 24px",boxShadow:"0 -8px 40px rgba(0,0,0,.2)"}}>
                <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,margin:"12px auto 0"}} />
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px 8px"}}>
                  <h3 style={{margin:0,fontSize:17,fontWeight:800}}>🔍 스토리 필터</h3>
                  <button onClick={()=>setShowStoryFilter(false)} style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:32,height:32,borderRadius:"50%",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                </div>
                <div style={{padding:"8px 20px"}}>
                  <div style={{marginBottom:16}}>
                    <p style={{margin:"0 0 8px",fontWeight:700,fontSize:14}}>🐾 반려동물 종류</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {[["all","전체"],["강아지","🐶 강아지"],["고양이","🐱 고양이"],["소동물","🐹 소동물"],["기타","기타"]].map(([val,label])=>(
                        <button key={val} onClick={()=>setStoryFilter(s=>({...s,petType:val}))}
                          style={{padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                            background:storyFilter.petType===val?G:"#f3f4f6",color:storyFilter.petType===val?"white":"#6b7280"}}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:16}}>
                    <p style={{margin:"0 0 8px",fontWeight:700,fontSize:14}}>📍 지역</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {[["all","전국"],["인천","인천"],["서울","서울"],["경기","경기"],["부산","부산"],["기타","기타"]].map(([val,label])=>(
                        <button key={val} onClick={()=>setStoryFilter(s=>({...s,region:val}))}
                          style={{padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                            background:storyFilter.region===val?G:"#f3f4f6",color:storyFilter.region===val?"white":"#6b7280"}}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:16}}>
                    <p style={{margin:"0 0 8px",fontWeight:700,fontSize:14}}>🔃 정렬</p>
                    <div style={{display:"flex",gap:6}}>
                      {[["latest","최신순"],["popular","인기순"]].map(([val,label])=>(
                        <button key={val} onClick={()=>setStoryFilter(s=>({...s,sort:val}))}
                          style={{padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                            background:storyFilter.sort===val?G:"#f3f4f6",color:storyFilter.sort===val?"white":"#6b7280"}}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{setStoryFilter({petType:"all",region:"all",sort:"latest"});setShowStoryFilter(false);}}
                      style={{flex:1,background:"#f3f4f6",color:"#6b7280",border:"none",padding:"12px 0",borderRadius:14,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                      초기화
                    </button>
                    <button onClick={()=>setShowStoryFilter(false)}
                      style={{flex:2,background:G,color:"white",border:"none",padding:"12px 0",borderRadius:14,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 4px 14px rgba(236,72,153,.3)"}}>
                      적용하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* 숨겨진 파일 인풋 */}
          <input ref={storyFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
            const file=e.target.files[0]; if(!file) return;
            const r=new FileReader(); r.onload=ev=>setStoryImg(ev.target.result); r.readAsDataURL(file); e.target.value="";
          }}/>

          <div style={{padding:"16px 16px 8px"}}>
            <h2 style={{margin:"0 0 14px",fontSize:22,fontWeight:800}}>스토리</h2>

            {/* 스토리 원형 목록 */}
            <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8,marginBottom:20,scrollbarWidth:"none"}}>
              {/* 내 스토리 추가 버튼 */}
              <div onClick={()=>{setStoryPetSel(null);setStoryContent("");setStoryImg(null);setIsAddStory(true);}}
                style={{flexShrink:0,textAlign:"center",cursor:"pointer"}}>
                <div style={{width:64,height:64,borderRadius:"50%",border:"2px dashed #e5e7eb",background:"#f9fafb",
                  display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                  <span style={{fontSize:24,color:"#9ca3af"}}>＋</span>
                </div>
                <p style={{margin:"4px 0 0",fontSize:11,color:"#374151",fontWeight:600,width:64,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>내 스토리</p>
              </div>
              {/* 내가 올린 스토리들 (12시간 이내) */}
              {myStories.filter(s=>(Date.now()-(s.ts||0))<43200000).map((s,i)=>(
                <div key={i} onClick={()=>setViewStory(s)} style={{flexShrink:0,textAlign:"center",cursor:"pointer"}}>
                  <div style={{width:64,height:64,borderRadius:"50%",padding:2,boxSizing:"border-box",
                    background:`linear-gradient(135deg,#ec4899,#a855f7)`,overflow:"hidden"}}>
                    {s.img
                      ? <img src={s.img} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover",border:"2px solid white"}}/>
                      : <div style={{width:"100%",height:"100%",borderRadius:"50%",background:G,border:"2px solid white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{s.petIcon||"🐾"}</div>}
                  </div>
                  <p style={{margin:"4px 0 0",fontSize:11,color:"#374151",fontWeight:700,width:64,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.petName||user?.name}</p>
                </div>
              ))}
              {/* 스토리 없을 때 안내 */}
              {myStories.length===0 && (
                <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:"#f9fafb",borderRadius:20}}>
                  <span style={{fontSize:14}}>💡</span>
                  <span style={{fontSize:12,color:"#9ca3af"}}>첫 스토리를 올려보세요!</span>
                </div>
              )}
            </div>
          </div>

          {/* 그리드 피드 */}
          {myStories.length===0 && (
            <div style={{textAlign:"center",padding:"48px 20px"}}>
              <p style={{fontSize:48,margin:"0 0 12px"}}>📸</p>
              <h3 style={{margin:"0 0 6px",fontSize:16,fontWeight:800,color:"#374151"}}>아직 스토리가 없어요</h3>
              <p style={{margin:"0 0 16px",fontSize:13,color:"#9ca3af",lineHeight:1.6}}>우리 아이의 일상을 공유해보세요!<br/>반려동물 사진이나 영상을 올릴 수 있어요 🐾</p>
              <button onClick={()=>{setStoryPetSel(null);setStoryContent("");setStoryImg(null);setIsAddStory(true);}}
                style={{background:G,color:"white",border:"none",padding:"10px 24px",borderRadius:20,fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(236,72,153,.3)"}}>
                첫 스토리 올리기
              </button>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px"}}>
            {myStories.filter(s=>(Date.now()-(s.ts||0))<43200000).map(s=>({...s,isMine:true})).map((s,i)=>(
              <div key={i} onClick={()=>setViewStory(s)} style={{background:"white",borderRadius:18,overflow:"hidden",boxShadow:"0 4px 12px rgba(0,0,0,.06)",cursor:"pointer",position:"relative"}}>
                <div style={{height:160,background:"#f3f4f6",overflow:"hidden"}}>
                  {s.img
                    ? <img src={s.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <div style={{width:"100%",height:"100%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>{s.petIcon||"🐾"}</div>}
                </div>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.65))"}}/>
                <div style={{position:"absolute",bottom:8,left:8,color:"white"}}>
                  <p style={{margin:"0 0 1px",fontWeight:700,fontSize:13}}>{s.petName}</p>
                  <p onClick={e=>{
                    e.stopPropagation();
                    const petData=nearbyPets.find(p=>p.owner===s.by||p.name===s.petName);
                    openProfile(s.by||user?.name, s.byImg||s.img);
                  }} style={{margin:0,fontSize:11,opacity:.8,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}>{s.by||user?.name}</p>
                </div>
                {s.isMine && (<>
                  <div style={{position:"absolute",top:8,right:8,background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:8}}>내 스토리</div>
                  <button onClick={e=>{
                    e.stopPropagation();
                    if(!confirm("이 스토리를 삭제하시겠어요?")) return;
                    setMyStories(ss=>ss.filter((_,idx)=>idx!==i));
                  }} style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,.5)",color:"white",border:"none",cursor:"pointer",width:24,height:24,borderRadius:"50%",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                </>)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 스토리 추가 모달 */}
      {isAddStory && (
        <div style={{position:"fixed",inset:0,zIndex:60}}>
          <div onClick={()=>setIsAddStory(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}}/>
          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderRadius:"24px 24px 0 0",maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,margin:"12px auto 0",flexShrink:0}}/>
            <div style={{padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f3f4f6",flexShrink:0}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:800}}>스토리 올리기</h3>
              <button onClick={()=>setIsAddStory(false)} style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:30,height:30,borderRadius:"50%",fontSize:14}}>✕</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"18px"}}>
              {/* 반려동물 선택 */}
              <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14}}>어떤 반려동물의 스토리인가요? <span style={{color:"#ef4444"}}>*</span></p>
              {myPets.length===0
                ? <div style={{background:"#fef9c3",borderRadius:14,padding:"14px 16px",marginBottom:16}}>
                    <p style={{margin:0,fontSize:13,color:"#92400e"}}>⚠️ 등록된 반려동물이 없어요. 먼저 프로필에서 반려동물을 등록해주세요!</p>
                  </div>
                : <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8,marginBottom:16,scrollbarWidth:"none"}}>
                    {myPets.map((pet,i)=>(
                      <div key={i} onClick={()=>setStoryPetSel(i)}
                        style={{flexShrink:0,textAlign:"center",cursor:"pointer"}}>
                        <div style={{width:64,height:64,borderRadius:"50%",padding:2,boxSizing:"border-box",
                          background:storyPetSel===i?"linear-gradient(135deg,#ec4899,#a855f7)":"#e5e7eb",overflow:"hidden"}}>
                          {pet.photos[pet.repIdx]
                            ? <img src={pet.photos[pet.repIdx]} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover",border:"2px solid white"}}/>
                            : <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"#f9fafb",border:"2px solid white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🐾</div>}
                        </div>
                        <p style={{margin:"4px 0 0",fontSize:12,fontWeight:storyPetSel===i?800:600,color:storyPetSel===i?"#ec4899":"#374151"}}>{pet.name}</p>
                        {storyPetSel===i && <p style={{margin:0,fontSize:10,color:"#ec4899"}}>✓ 선택됨</p>}
                      </div>
                    ))}
                  </div>
              }

              {/* 사진 */}
              <p style={{margin:"0 0 8px",fontWeight:700,fontSize:14}}>사진 <span style={{color:"#9ca3af",fontWeight:400}}>(선택)</span></p>
              <div style={{marginBottom:16}}>
                {storyImg
                  ? <div style={{position:"relative",width:"100%",height:200,borderRadius:16,overflow:"hidden"}}>
                      <img src={storyImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      <button onClick={()=>setStoryImg(null)} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.6)",color:"white",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:14}}>✕</button>
                    </div>
                  : <button onClick={()=>storyFileRef.current.click()}
                      style={{width:"100%",height:120,background:"#f3f4f6",border:"2px dashed #d1d5db",borderRadius:16,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,color:"#9ca3af"}}>
                      <span style={{fontSize:28}}>📷</span>
                      <span style={{fontSize:13,fontWeight:600}}>사진 추가하기</span>
                    </button>}
              </div>

              {/* 한 마디 */}
              <p style={{margin:"0 0 6px",fontWeight:700,fontSize:14}}>한 마디 <span style={{color:"#9ca3af",fontWeight:400}}>(선택)</span></p>
              <textarea value={storyContent} onChange={e=>setStoryContent(e.target.value)} placeholder="오늘 우리 아이 이야기를 들려주세요 🐾" rows={3}
                style={{width:"100%",padding:"11px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:14,outline:"none",resize:"none",boxSizing:"border-box",lineHeight:1.6,fontFamily:"inherit"}}
                onFocus={e=>e.target.style.borderColor="#ec4899"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            </div>
            <div style={{padding:"12px 18px 28px",borderTop:"1px solid #f3f4f6",flexShrink:0}}>
              <button onClick={()=>{
                if(myPets.length===0||storyPetSel===null) return;
                const pet=myPets[storyPetSel];
                const newStory = {id:Date.now(),petName:pet.name,petIcon:"🐾",img:storyImg,content:storyContent,by:user?.name,byImg:profilePhotos[profileRepIdx]||null,uid:user?.uid,time:"방금 전",isMine:true,ts:Date.now(),likes:[],comments:[]};
                setMyStories(ss=>[...ss,newStory]);
                // Firestore 공유 컬렉션에 저장 (이미지 제외)
                addDoc(collection(db,"communityStories"),{...newStory, img:"[img]", uid:user?.uid}).then(ref=>{
                  setMyStories(ss=>ss.map(s=>s.id===newStory.id?{...s,_fid:ref.id}:s));
                }).catch(()=>{});
                setPointLog(l=>[{icon:"📸",label:"스토리 업로드",pt:5,type:"earn",date:"방금 전"},...l]);
                setPoints(p=>p+5);
                setIsAddStory(false);
              }} disabled={myPets.length===0||storyPetSel===null}
                style={{width:"100%",background:myPets.length>0&&storyPetSel!==null?G:"#e5e7eb",color:myPets.length>0&&storyPetSel!==null?"white":"#9ca3af",border:"none",padding:14,borderRadius:14,fontWeight:700,fontSize:16,cursor:myPets.length>0&&storyPetSel!==null?"pointer":"not-allowed"}}>
                스토리 올리기 (+5p)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 스토리 풀스크린 뷰어 */}
      {viewStory && (()=>{
        const sLiked = (viewStory.likes||[]).includes(user?.name);
        const toggleStoryLike = (e) => {
          e.stopPropagation();
          const newLikes = sLiked ? viewStory.likes.filter(n=>n!==user?.name) : [...(viewStory.likes||[]),user?.name];
          setViewStory(s=>({...s,likes:newLikes}));
          setMyStories(ss=>ss.map(s=>s.id===viewStory.id?{...s,likes:newLikes}:s));
          syncStoryToFirestore(viewStory.id, {likes:newLikes, comments:viewStory.comments||[]});
        };
        const addStoryComment = (e) => {
          e.stopPropagation();
          const text = prompt("댓글을 입력하세요:");
          if (!text?.trim()) return;
          const nc = {id:Date.now(),by:user?.name,text:text.trim(),time:"방금 전"};
          const updComments = [...(viewStory.comments||[]),nc];
          setViewStory(s=>({...s,comments:updComments}));
          setMyStories(ss=>ss.map(s=>s.id===viewStory.id?{...s,comments:updComments}:s));
          syncStoryToFirestore(viewStory.id, {likes:viewStory.likes||[], comments:updComments});
        };
        return (
        <div onClick={()=>setViewStory(null)} style={{position:"fixed",inset:0,zIndex:70,background:"black",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <button onClick={()=>setViewStory(null)} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.2)",border:"none",color:"white",width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:18,zIndex:2}}>✕</button>
          {/* 상단 - 작성자 + 반려동물 정보 */}
          <div style={{position:"absolute",top:0,left:0,right:0,padding:"16px 20px",background:"linear-gradient(to bottom,rgba(0,0,0,.6),transparent)",zIndex:2}}>
            <div onClick={e=>{e.stopPropagation();openProfile(viewStory.by, viewStory.byImg||viewStory.img);}}
              style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",width:"fit-content"}}>
              <div style={{width:36,height:36,borderRadius:"50%",overflow:"hidden",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"white",fontWeight:700}}>
                {viewStory.byImg ? <img src={viewStory.byImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : viewStory.by?.[0]||"🐾"}
              </div>
              <div>
                <p style={{margin:0,fontWeight:700,fontSize:14,color:"white"}}>{viewStory.petName} <span style={{fontWeight:400,fontSize:12,color:"rgba(255,255,255,.7)"}}>({viewStory.by}의 반려동물)</span></p>
                <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,.7)"}}>{viewStory.by} · {viewStory.time}</p>
              </div>
            </div>
          </div>
          {viewStory.img
            ? <img src={viewStory.img} alt="" style={{maxWidth:"100%",maxHeight:"70vh",objectFit:"contain"}}/>
            : <div style={{width:200,height:200,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:80}}>{viewStory.petIcon||"🐾"}</div>}
          {/* 하단 - 텍스트 + 좋아요/댓글 */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 24px",zIndex:2}} onClick={e=>e.stopPropagation()}>
            {viewStory.content && (
              <div style={{background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)",borderRadius:16,padding:"12px 16px",marginBottom:10}}>
                <p style={{margin:0,fontSize:15,color:"white",lineHeight:1.6}}>{viewStory.content}</p>
              </div>
            )}
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              <button onClick={toggleStoryLike} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,display:"flex",alignItems:"center",gap:4}}>
                <span>{sLiked?"❤️":"🤍"}</span><span style={{color:"white",fontSize:13,fontWeight:600}}>{(viewStory.likes||[]).length}</span>
              </button>
              <button onClick={addStoryComment} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,display:"flex",alignItems:"center",gap:4}}>
                <span>💬</span><span style={{color:"white",fontSize:13,fontWeight:600}}>{(viewStory.comments||[]).length}</span>
              </button>
            </div>
            {(viewStory.comments||[]).length>0 && (
              <div style={{maxHeight:120,overflowY:"auto",marginTop:8}}>
                {(viewStory.comments||[]).slice(-5).map((c,i)=>(
                  <div key={i} style={{marginBottom:4}}><span style={{color:"white",fontWeight:700,fontSize:12}}>{c.by}</span> <span style={{color:"rgba(255,255,255,.8)",fontSize:12}}>{c.text}</span></div>
                ))}
              </div>
            )}
          </div>
        </div>);
      })()}
      {/* 모임 */}
      {tab==="meeting" && meetingView==="list" && (
        <div style={{paddingBottom:20}} onTouchStart={e=>handleTouchStart(e,"meeting")} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          {/* 당겨서 새로고침 인디케이터 */}
          {pullY > 5 && pullTabRef.current==="meeting" && (
            <div style={{display:"flex",justifyContent:"center",padding:pullY*0.15+"px 0",background:"#fdf2f8",transition:pulling?"none":"padding .2s"}}>
              <span style={{fontSize:16,transform:`rotate(${Math.min(pullY*4,360)}deg)`,transition:pulling?"none":"transform .2s"}}>🔄</span>
              <span style={{fontSize:12,color:"#ec4899",fontWeight:600,marginLeft:6}}>{pulling?"놓으면 새로고침":"당겨서 새로고침"}</span>
            </div>
          )}
          {isRefreshing && pullTabRef.current==="meeting" && (
            <div style={{display:"flex",justifyContent:"center",padding:"6px 0",background:"#fdf2f8"}}>
              <span style={{fontSize:14,animation:"spin 1s linear infinite"}}>🔄</span>
              <span style={{fontSize:12,color:"#ec4899",fontWeight:600,marginLeft:6}}>불러오는 중...</span>
            </div>
          )}
          {/* 검색 영역 */}
          <div style={{padding:"14px 16px",background:"white",borderBottom:"1px solid #f3f4f6"}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <div style={{flex:1,position:"relative"}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#9ca3af"}}>🔍</span>
                <input value={meetSearch.name} onChange={e=>setMeetSearch(s=>({...s,name:e.target.value}))}
                  placeholder="모임 이름 검색" style={{width:"100%",padding:"9px 12px 9px 34px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:13,outline:"none",boxSizing:"border-box"}}
                  onFocus={e=>e.target.style.borderColor="#ec4899"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <div style={{flex:1,position:"relative"}}>
                <select value={meetSearch.city} onChange={e=>setMeetSearch(s=>({...s,city:e.target.value,district:""}))}
                  style={{width:"100%",padding:"8px 28px 8px 10px",border:"2px solid #e5e7eb",borderRadius:10,fontSize:12,outline:"none",appearance:"none",background:"white",color:meetSearch.city?"#1f2937":"#9ca3af",boxSizing:"border-box"}}>
                  <option value="">📍 도시</option>
                  {Object.keys(REGIONS).map(c=><option key={c} value={c}>{REGIONS[c].icon} {c}</option>)}
                </select>
                <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#9ca3af",fontSize:11}}>▾</span>
              </div>
              {meetSearch.city && (
                <div style={{flex:1,position:"relative"}}>
                  <select value={meetSearch.district} onChange={e=>setMeetSearch(s=>({...s,district:e.target.value}))}
                    style={{width:"100%",padding:"8px 28px 8px 10px",border:"2px solid #e5e7eb",borderRadius:10,fontSize:12,outline:"none",appearance:"none",background:"white",color:meetSearch.district?"#1f2937":"#9ca3af",boxSizing:"border-box"}}>
                    <option value="">구/군</option>
                    {REGIONS[meetSearch.city].districts.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                  <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#9ca3af",fontSize:11}}>▾</span>
                </div>
              )}
              <div style={{flex:1,position:"relative"}}>
                <select value={meetSearch.animal} onChange={e=>setMeetSearch(s=>({...s,animal:e.target.value}))}
                  style={{width:"100%",padding:"8px 28px 8px 10px",border:"2px solid #e5e7eb",borderRadius:10,fontSize:12,outline:"none",appearance:"none",background:"white",color:meetSearch.animal?"#1f2937":"#9ca3af",boxSizing:"border-box"}}>
                  <option value="">🐾 동물</option>
                  {["강아지","고양이","전체"].map(a=><option key={a} value={a}>{a}</option>)}
                </select>
                <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#9ca3af",fontSize:11}}>▾</span>
              </div>
            </div>
          </div>

          {/* 전체/내모임 탭 */}
          <div style={{padding:"10px 16px 0",display:"flex",gap:8}}>
            {[["all","전체모임"],["mine","내 모임"]].map(([v,l])=>(
              <button key={v} onClick={()=>setMeetingMode(v)}
                style={{padding:"8px 20px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
                  background:meetingMode===v?"linear-gradient(135deg,#ec4899,#a855f7)":"#f3f4f6",
                  color:meetingMode===v?"white":"#6b7280",
                  boxShadow:meetingMode===v?"0 2px 8px rgba(236,72,153,.3)":"none"}}>
                {l}
              </button>
            ))}
          </div>

          {/* 모임 카드 목록 */}
          <div style={{padding:"12px 16px 80px"}}>
            {meetings.filter(m=>{
              if(meetingMode==="mine" && !m.myJoined && !m.members.some(mb=>mb.name===user?.name)) return false;
              if(meetSearch.name && !m.title.includes(meetSearch.name)) return false;
              if(meetSearch.city && !m.region.startsWith(meetSearch.city)) return false;
              if(meetSearch.district && meetSearch.district!=="전체" && !m.region.includes(meetSearch.district)) return false;
              if(meetSearch.animal && meetSearch.animal!=="전체" && m.animal!==meetSearch.animal && m.animal!=="전체") return false;
              return true;
            }).length===0 ? (
              <div style={{background:"white",borderRadius:18,padding:"40px 20px",textAlign:"center",marginBottom:12}}>
                <p style={{fontSize:40,margin:"0 0 8px"}}>🏃</p>
                <p style={{margin:"0 0 4px",fontWeight:600,color:"#374151"}}>아직 모임이 없어요</p>
                <p style={{margin:"0 0 14px",fontSize:13,color:"#9ca3af"}}>첫 번째 모임을 만들어보세요!</p>
                <button onClick={()=>setIsCreateMeeting(true)}
                  style={{background:G,color:"white",border:"none",padding:"10px 20px",borderRadius:20,fontWeight:700,fontSize:13,cursor:"pointer"}}>모임 만들기 🐾</button>
              </div>
            ) : meetings.filter(m=>{
              if(meetingMode==="mine" && !m.myJoined && !m.members.some(mb=>mb.name===user?.name)) return false;
              if(meetSearch.name && !m.title.includes(meetSearch.name)) return false;
              if(meetSearch.city && !m.region.startsWith(meetSearch.city)) return false;
              if(meetSearch.district && meetSearch.district!=="전체" && !m.region.includes(meetSearch.district)) return false;
              if(meetSearch.animal && meetSearch.animal!=="전체" && m.animal!==meetSearch.animal && m.animal!=="전체") return false;
              return true;
            }).map(m=>{
              const isMember = m.myJoined || m.members.some(mb=>mb.name===user?.name);
              return (
                <div key={m.id} onClick={()=>{setSelectedMeeting(m);setMeetingView("detail");setMeetingTab("members");}}
                  style={{background:"white",borderRadius:18,padding:18,marginBottom:12,boxShadow:"0 4px 14px rgba(0,0,0,.06)",cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <h3 style={{margin:0,fontSize:15,fontWeight:700,flex:1,lineHeight:1.4}}>{m.title}</h3>
                    <span style={{background:m.members.length>=m.max-1?"#fef2f2":"#f0fdf4",color:m.members.length>=m.max-1?"#dc2626":"#16a34a",fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:20,whiteSpace:"nowrap",marginLeft:8}}>
                      {m.members.length}/{m.max}명
                    </span>
                  </div>
                  <p style={{margin:"0 0 6px",fontSize:13,color:"#374151",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{m.desc}</p>
                  <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                    <span style={{background:"#eff6ff",color:"#1d4ed8",fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20}}>📍 {m.region}</span>
                    <span style={{background:"#f0fdf4",color:"#15803d",fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20}}>🐾 {m.animal}</span>
                    {m.tags.slice(0,2).map((t,j)=><span key={j} style={{background:"#fce7f3",color:"#be185d",fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20}}>#{t}</span>)}
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      {m.members.slice(0,3).map((mb,j)=>(
                        <div key={j} style={{width:24,height:24,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"white",fontWeight:700,border:"2px solid white",marginLeft:j>0?-8:0,overflow:"hidden"}}>
                          {(mb.name===user?.name && profilePhotos[profileRepIdx]) ? <img src={profilePhotos[profileRepIdx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : MEMBER_AVATARS[mb.name] ? <img src={MEMBER_AVATARS[mb.name]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : mb.name[0]}
                        </div>
                      ))}
                      {m.members.length>3 && <span style={{fontSize:11,color:"#9ca3af",marginLeft:4}}>+{m.members.length-3}</span>}
                    </div>
                    {isMember
                      ? <span style={{background:"#f3f4f6",color:"#6b7280",fontSize:12,fontWeight:700,padding:"6px 14px",borderRadius:20}}>✓ 가입됨</span>
                      : (()=>{
                        const cardPending = m.pending.some(p=>p.name===user?.name);
                        return cardPending
                          ? <span style={{background:"#f3f4f6",color:"#9ca3af",fontSize:12,fontWeight:700,padding:"6px 14px",borderRadius:20}}>⏳ 대기중</span>
                          : <button onClick={(e)=>{e.stopPropagation();setMeetings(ms=>ms.map(x=>x.id===m.id?{...x,pending:[...x.pending,{name:user?.name,petName:myPets[0]?.name||"",petBreed:myPets[0]?.breed||"",msg:"안녕하세요! 가입 신청합니다.",time:"방금 전"}]}:x));}}
                            style={{background:G,color:"white",fontSize:12,fontWeight:700,padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer"}}>가입하기</button>;
                      })()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 모임 만들기 버튼 */}
          <button onClick={()=>setIsCreateMeeting(true)} style={{position:"fixed",bottom:80,right:20,width:52,height:52,borderRadius:"50%",background:G,color:"white",border:"none",cursor:"pointer",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 18px rgba(236,72,153,.45)",zIndex:10}}>＋</button>
        </div>
      )}

      {/* 모임 만들기 모달 */}
      {isCreateMeeting && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"white",borderRadius:22,width:"100%",maxWidth:380,maxHeight:"80vh",overflow:"auto",padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h3 style={{margin:0,fontSize:18,fontWeight:800}}>🐾 새 모임 만들기</h3>
              <button onClick={()=>setIsCreateMeeting(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <label style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:4,display:"block"}}>📸 모임 대표 사진</label>
                <div onClick={()=>{const inp=document.createElement("input");inp.type="file";inp.accept="image/*";inp.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");const sz=Math.min(img.width,img.height,600);c.width=sz;c.height=sz;const ctx=c.getContext("2d");ctx.drawImage(img,(img.width-sz)/2,(img.height-sz)/2,sz,sz,0,0,sz,sz);setNewMeetForm(f2=>({...f2,coverImg:c.toDataURL("image/jpeg",0.6)}));};img.src=ev.target.result;};r.readAsDataURL(f);};inp.click();}}
                  style={{width:"100%",height:120,borderRadius:14,border:"2px dashed #e5e7eb",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"#f9fafb",marginBottom:12}}>
                  {newMeetForm.coverImg
                    ? <img src={newMeetForm.coverImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <span style={{fontSize:13,color:"#9ca3af"}}>📷 탭하여 사진 추가</span>}
                </div>
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:4,display:"block"}}>모임 이름</label>
                <input value={newMeetForm.title} onChange={e=>setNewMeetForm(f=>({...f,title:e.target.value}))} placeholder="모임 이름을 입력하세요"
                  style={{width:"100%",padding:"10px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:4,display:"block"}}>소개</label>
                <textarea value={newMeetForm.desc} onChange={e=>setNewMeetForm(f=>({...f,desc:e.target.value}))} placeholder="모임을 소개해주세요" rows={3}
                  style={{width:"100%",padding:"10px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:14,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
              </div>
              <div style={{display:"flex",gap:10}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:4,display:"block"}}>도시</label>
                  <select value={newMeetForm.city} onChange={e=>setNewMeetForm(f=>({...f,city:e.target.value,district:REGIONS[e.target.value]?.districts[1]||""}))}
                    style={{width:"100%",padding:"10px 12px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:13,outline:"none",background:"white"}}>
                    {Object.keys(REGIONS).map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:4,display:"block"}}>구/군</label>
                  <select value={newMeetForm.district} onChange={e=>setNewMeetForm(f=>({...f,district:e.target.value}))}
                    style={{width:"100%",padding:"10px 12px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:13,outline:"none",background:"white"}}>
                    {(REGIONS[newMeetForm.city]?.districts||[]).filter(d=>d!=="전체").map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:4,display:"block"}}>동물</label>
                  <select value={newMeetForm.animal} onChange={e=>setNewMeetForm(f=>({...f,animal:e.target.value}))}
                    style={{width:"100%",padding:"10px 12px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:13,outline:"none",background:"white"}}>
                    {["강아지","고양이","전체"].map(a=><option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:4,display:"block"}}>최대 인원</label>
                <input type="number" min={2} max={50} value={newMeetForm.max} onChange={e=>setNewMeetForm(f=>({...f,max:Number(e.target.value)}))}
                  style={{width:100,padding:"10px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <button onClick={()=>{
                if(!newMeetForm.title.trim()||!newMeetForm.desc.trim()) return;
                const nm={id:Date.now(),title:newMeetForm.title.trim(),region:newMeetForm.city+" "+newMeetForm.district,animal:newMeetForm.animal,
                  desc:newMeetForm.desc.trim(),max:newMeetForm.max,tags:[],coverImg:newMeetForm.coverImg||null,homeContent:newMeetForm.desc.trim(),
                  members:[{name:user?.name,role:"운영자",joined:new Date().toISOString().slice(0,7).replace("-",".")}],
                  greetings:[],board:[],photos:[],votes:[],chats:[],pending:[],myJoined:true};
                setMeetings(ms=>[nm,...ms]);
                // Firestore 공유 컬렉션에 저장
                addDoc(collection(db,"communityMeetings"),{...nm, coverImg:null, ts:Date.now(), uid:user?.uid}).then(ref=>{
                  setMeetings(ms=>ms.map(x=>x.id===nm.id?{...x,_fid:ref.id}:x));
                }).catch(()=>{});
                setIsCreateMeeting(false);
                setNewMeetForm({title:"",city:"인천",district:"연수구",animal:"강아지",desc:"",max:10,coverImg:null});
              }} disabled={!newMeetForm.title.trim()||!newMeetForm.desc.trim()}
                style={{background:(!newMeetForm.title.trim()||!newMeetForm.desc.trim())?"#e5e7eb":G,color:(!newMeetForm.title.trim()||!newMeetForm.desc.trim())?"#9ca3af":"white",border:"none",padding:"13px 0",borderRadius:14,fontWeight:700,fontSize:15,cursor:(!newMeetForm.title.trim()||!newMeetForm.desc.trim())?"default":"pointer",marginTop:4}}>
                모임 만들기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모임 상세 */}
      {tab==="meeting" && meetingView==="detail" && selectedMeeting && (()=>{
        const m = meetings.find(x=>x.id===selectedMeeting.id)||selectedMeeting;
        const isMember = m.myJoined || m.members.some(mb=>mb.name===user?.name);
        const isOwner  = m.members[0]?.name===user?.name;
        const MTABS = [
          {key:"home",   label:"홈",icon:"🏠"},
          {key:"members",label:"멤버",icon:"👥"},
          {key:"greet",  label:"가입인사",icon:"👋"},
          {key:"board",  label:"게시판",icon:"📋",memberOnly:true},
          {key:"photos", label:"사진첩",icon:"📸",memberOnly:true},
          {key:"vote",   label:"투표",icon:"🗳️",memberOnly:true},
          {key:"chat",   label:"채팅",icon:"💬",memberOnly:true},
          {key:"manage", label:"가입관리",icon:"⚙️"},
        ];

        const updMeeting = fn => {
          const updated = fn(m);
          setMeetings(ms=>ms.map(x=>x.id===m.id?updated:x));
          setSelectedMeeting(updated);
          // Firestore 동기화
          if(m._fid) {
            const clean = {...updated};
            delete clean._fid;
            updateDoc(doc(db,"communityMeetings",m._fid), clean).catch(()=>{});
          }
        };

        return (
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 57px - 64px)"}}>
            {/* 헤더 */}
            <div style={{background:"white",padding:"10px 14px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid #f3f4f6",flexShrink:0}}>
              <button onClick={()=>setMeetingView("list")} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,padding:4}}>←</button>
              <div style={{flex:1}}>
                <p style={{margin:0,fontWeight:800,fontSize:14,lineHeight:1.3}}>{m.title}</p>
                <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{m.members.length}명 · {m.region}</p>
              </div>
              {!isMember && (()=>{
                const isPending = m.pending.some(p=>p.name===user?.name);
                return isPending
                  ? <span style={{background:"#f3f4f6",color:"#9ca3af",padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:700}}>⏳ 승인 대기중</span>
                  : <button onClick={(e)=>{e.stopPropagation();updMeeting(x=>({...x,pending:[...x.pending,{name:user?.name,petName:myPets[0]?.name||"",petBreed:myPets[0]?.breed||"",msg:"안녕하세요! 가입 신청합니다.",time:"방금 전"}]}));}}
                    style={{background:G,color:"white",border:"none",padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer"}}>가입 신청</button>;
              })()}
            </div>

            {/* 서브 탭 */}
            <div style={{background:"white",borderBottom:"1px solid #f3f4f6",flexShrink:0}}>
              <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none"}}>
                {MTABS.map(t=>(
                  <button key={t.key} onClick={()=>{if(t.memberOnly&&!isMember){alert("모임 가입 후 이용할 수 있어요!");return;}setMeetingTab(t.key);}}
                    style={{flexShrink:0,padding:"10px 12px",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:"none",
                      color:meetingTab===t.key?"#ec4899":"#9ca3af",
                      borderBottom:meetingTab===t.key?"2px solid #ec4899":"2px solid transparent",
                      transition:"all .15s",whiteSpace:"nowrap"}}>
                    {t.icon}<br/>{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 탭 콘텐츠 */}
            <div style={{flex:1,overflowY:"auto",padding:16}}>

              {/* 모임 홈 */}
              {meetingTab==="home" && (
                <div>
                  {m.coverImg && <img src={m.coverImg} alt="" style={{width:"100%",height:180,objectFit:"cover",borderRadius:16,marginBottom:14}}/>}
                  <h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:800}}>{m.title}</h3>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                    <span style={{fontSize:12,color:"#6b7280",background:"#f3f4f6",padding:"3px 10px",borderRadius:12}}>📍 {m.region}</span>
                    <span style={{fontSize:12,color:"#6b7280",background:"#f3f4f6",padding:"3px 10px",borderRadius:12}}>🐾 {m.animal||"전체"}</span>
                    <span style={{fontSize:12,color:"#6b7280",background:"#f3f4f6",padding:"3px 10px",borderRadius:12}}>👥 {m.members.length}/{m.max||50}명</span>
                  </div>
                  <div style={{background:"#f9fafb",borderRadius:14,padding:"14px 16px",marginBottom:14}}>
                    <p style={{margin:0,fontSize:14,color:"#374151",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.homeContent||m.desc||"아직 모임 소개가 작성되지 않았어요."}</p>
                  </div>
                  {(isOwner || m.members.find(x=>x.name===user?.name)?.role==="운영진") && (
                    <button onClick={()=>{
                      const newContent = prompt("모임 소개를 수정하세요:", m.homeContent||m.desc||"");
                      if(newContent!==null) updMeeting(x=>({...x, homeContent:newContent}));
                    }} style={{background:"#f3f4f6",color:"#6b7280",border:"none",padding:"8px 16px",borderRadius:12,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                      ✏️ 소개 수정
                    </button>
                  )}
                </div>
              )}

              {/* 비회원 접근 차단 가드 */}
              {!isMember && ["board","photos","vote","chat"].includes(meetingTab) && (
                <div style={{textAlign:"center",padding:"60px 20px"}}>
                  <p style={{fontSize:48,margin:"0 0 12px"}}>🔒</p>
                  <p style={{fontSize:15,fontWeight:700,color:"#374151",margin:"0 0 6px"}}>가입 후 이용할 수 있어요</p>
                  <p style={{fontSize:13,color:"#9ca3af"}}>모임에 가입 신청 후 승인을 받으면<br/>게시판, 사진첩, 투표, 채팅을 이용할 수 있어요</p>
                </div>
              )}

              {/* 멤버 */}
              {meetingTab==="members" && (
                <div>
                  {m.members.map((mb,i)=>{
                    const isMe = mb.name===user?.name;
                    const isStaff = mb.role==="운영자"||mb.role==="운영진";
                    const roleLabel = mb.role==="운영자"?"모임장":mb.role==="운영진"?"운영진":"멤버";
                    const roleBg = mb.role==="운영자"?"linear-gradient(135deg,#ec4899,#a855f7)":mb.role==="운영진"?"linear-gradient(135deg,#f59e0b,#ef4444)":"#e5e7eb";
                    const roleColor = mb.role==="멤버"?"#6b7280":"white";
                    return (
                    <div key={i} style={{background:"white",borderRadius:14,padding:"12px 14px",marginBottom:8,boxShadow:"0 2px 6px rgba(0,0,0,.04)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div onClick={()=>{if(!isMe)openProfile(mb.name,null);}} style={{width:44,height:44,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white",fontWeight:700,flexShrink:0,overflow:"hidden",cursor:isMe?"default":"pointer"}}>
                          {(isMe && profilePhotos[profileRepIdx]) ? <img src={profilePhotos[profileRepIdx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : mb.name[0]}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <p style={{margin:0,fontWeight:700,fontSize:14}}>{mb.name}{isMe?" (나)":""}</p>
                            <span style={{background:roleBg,color:roleColor,fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:8}}>{roleLabel}</span>
                          </div>
                          <p style={{margin:0,fontSize:12,color:"#9ca3af"}}>가입 {mb.joined}</p>
                        </div>
                        {/* 관리 버튼 */}
                        {(isOwner && !isMe) && (
                          <div style={{display:"flex",gap:4}}>
                            {mb.role==="멤버" && <button onClick={()=>{if(confirm(mb.name+"님을 운영진으로 임명할까요?"))updMeeting(x=>({...x,members:x.members.map((m2,j)=>j===i?{...m2,role:"운영진"}:m2)}));}}
                              style={{background:"#fef3c7",border:"none",padding:"4px 8px",borderRadius:8,fontSize:10,fontWeight:700,color:"#92400e",cursor:"pointer"}}>운영진</button>}
                            {mb.role==="운영진" && <button onClick={()=>{if(confirm(mb.name+"님을 일반 멤버로 해제할까요?"))updMeeting(x=>({...x,members:x.members.map((m2,j)=>j===i?{...m2,role:"멤버"}:m2)}));}}
                              style={{background:"#f3f4f6",border:"none",padding:"4px 8px",borderRadius:8,fontSize:10,fontWeight:700,color:"#6b7280",cursor:"pointer"}}>해제</button>}
                            <button onClick={()=>{if(confirm(mb.name+"님에게 모임장을 양도할까요?\n이 작업은 되돌릴 수 없습니다."))updMeeting(x=>({...x,members:x.members.map((m2,j)=>j===0?{...m2,role:"멤버"}:j===i?{...m2,role:"운영자"}:m2).sort((a,b)=>a.role==="운영자"?-1:b.role==="운영자"?1:0)}));}}
                              style={{background:"#ede9fe",border:"none",padding:"4px 8px",borderRadius:8,fontSize:10,fontWeight:700,color:"#7c3aed",cursor:"pointer"}}>양도</button>
                            <button onClick={()=>{if(confirm("⚠️ "+mb.name+"님을 강제탈퇴 시킬까요?"))updMeeting(x=>({...x,members:x.members.filter((_,j)=>j!==i)}));}}
                              style={{background:"#fef2f2",border:"none",padding:"4px 8px",borderRadius:8,fontSize:10,fontWeight:700,color:"#dc2626",cursor:"pointer"}}>강퇴</button>
                          </div>
                        )}
                        {/* 운영진도 강퇴 가능 (운영자/운영진 제외) */}
                        {(!isOwner && m.members.find(x=>x.name===user?.name)?.role==="운영진" && !isMe && !isStaff) && (
                          <button onClick={()=>{if(confirm("⚠️ "+mb.name+"님을 강제탈퇴 시킬까요?"))updMeeting(x=>({...x,members:x.members.filter((_,j)=>j!==i)}));}}
                            style={{background:"#fef2f2",border:"none",padding:"4px 8px",borderRadius:8,fontSize:10,fontWeight:700,color:"#dc2626",cursor:"pointer"}}>강퇴</button>
                        )}
                      </div>
                    </div>);
                  })}
                  {/* 모임 탈퇴 */}
                  {isMember && !isOwner && (
                    <button onClick={()=>{
                      if(!confirm("이 모임에서 탈퇴하시겠어요?")) return;
                      updMeeting(x=>({...x,members:x.members.filter(mb=>mb.name!==user?.name),myJoined:false}));
                      setMeetingView("list"); setSelectedMeeting(null);
                      alert("모임에서 탈퇴했습니다.");
                    }} style={{width:"100%",marginTop:12,background:"#f3f4f6",color:"#6b7280",border:"none",padding:"11px 0",borderRadius:14,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                      모임 탈퇴하기
                    </button>
                  )}
                </div>
              )}

              {/* 가입인사 */}
              {meetingTab==="greet" && (
                <div>
                  {m.greetings.map((g,i)=>(
                    <div key={i} style={{background:"white",borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 6px rgba(0,0,0,.04)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <div style={{width:34,height:34,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"white",fontWeight:700,overflow:"hidden"}}>
                          {(g.by===user?.name && profilePhotos[profileRepIdx]) ? <img src={profilePhotos[profileRepIdx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : MEMBER_AVATARS[g.by] ? <img src={MEMBER_AVATARS[g.by]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : g.by[0]}
                        </div>
                        <div><p style={{margin:0,fontWeight:700,fontSize:13}}>{g.by}</p><p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{g.time}</p></div>
                      </div>
                      <p style={{margin:0,fontSize:14,color:"#1f2937",lineHeight:1.6}}>{g.text}</p>
                    </div>
                  ))}
                  {m.greetings.length===0 && <div style={{textAlign:"center",padding:"40px 0"}}><p style={{fontSize:36,margin:"0 0 8px"}}>👋</p><p style={{color:"#9ca3af",fontSize:13}}>아직 가입인사가 없어요</p></div>}
                  {isMember && !m.greetings.some(g=>g.by===user?.name) && (
                    <div style={{marginTop:16,background:"#f9fafb",borderRadius:14,padding:14}}>
                      <p style={{margin:"0 0 8px",fontWeight:700,fontSize:13}}>가입 인사 남기기 👋</p>
                      <textarea value={mGreetVal} onChange={e=>setMGreetVal(e.target.value)} placeholder="반갑습니다! 저는..." rows={3}
                        style={{width:"100%",padding:"10px 12px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:13,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
                      <button onClick={()=>{
                        if(!mGreetVal.trim()) return;
                        updMeeting(x=>({...x,greetings:[...x.greetings,{by:user?.name,text:mGreetVal.trim(),time:"방금 전"}]}));
                        setMGreetVal("");
                      }} style={{marginTop:8,background:G,color:"white",border:"none",padding:"9px 20px",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer"}}>등록</button>
                    </div>
                  )}
                </div>
              )}

              {/* 게시판 */}
              {meetingTab==="board" && !mBoardDetail && (
                <div>
                  {isMember && (
                    <div style={{background:"#f9fafb",borderRadius:14,padding:14,marginBottom:16}}>
                      <input value={mBoardForm.title} onChange={e=>setMBoardForm(f=>({...f,title:e.target.value}))} placeholder="제목"
                        style={{width:"100%",padding:"9px 12px",border:"2px solid #e5e7eb",borderRadius:10,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
                      <textarea value={mBoardForm.content} onChange={e=>setMBoardForm(f=>({...f,content:e.target.value}))} placeholder="내용을 입력하세요" rows={3}
                        style={{width:"100%",padding:"9px 12px",border:"2px solid #e5e7eb",borderRadius:10,fontSize:13,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
                      <button onClick={()=>{
                        if(!mBoardForm.title.trim()||!mBoardForm.content.trim()) return;
                        const newPost={id:Date.now(),by:user?.name,title:mBoardForm.title.trim(),content:mBoardForm.content.trim(),time:"방금 전",likes:[],comments:[]};
                        updMeeting(x=>({...x,board:[newPost,...x.board]}));
                        setMBoardForm({title:"",content:""});
                      }} style={{marginTop:8,background:G,color:"white",border:"none",padding:"9px 20px",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer"}}>등록</button>
                    </div>
                  )}
                  {m.board.map(post=>(
                    <div key={post.id} onClick={()=>setMBoardDetail(post)}
                      style={{background:"white",borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 6px rgba(0,0,0,.04)",cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <h4 style={{margin:0,fontSize:14,fontWeight:700}}>{post.title}</h4>
                        <span style={{fontSize:11,color:"#9ca3af"}}>{post.time}</span>
                      </div>
                      <p style={{margin:"0 0 8px",fontSize:13,color:"#6b7280",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{post.content}</p>
                      <div style={{display:"flex",gap:12}}>
                        <span style={{fontSize:12,color:"#9ca3af"}}>❤️ {post.likes.length}</span>
                        <span style={{fontSize:12,color:"#9ca3af"}}>💬 {post.comments.length}</span>
                        <span style={{fontSize:12,color:"#9ca3af"}}>by {post.by}</span>
                      </div>
                    </div>
                  ))}
                  {m.board.length===0 && <div style={{textAlign:"center",padding:"40px 0"}}><p style={{fontSize:36,margin:"0 0 8px"}}>📋</p><p style={{color:"#9ca3af",fontSize:13}}>게시글이 없어요</p></div>}
                </div>
              )}

              {/* 게시판 상세 */}
              {meetingTab==="board" && mBoardDetail && (
                <div>
                  <button onClick={()=>setMBoardDetail(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:"#ec4899",fontWeight:700,marginBottom:12,padding:0}}>← 목록으로</button>
                  <div style={{background:"white",borderRadius:14,padding:16,marginBottom:12,boxShadow:"0 2px 6px rgba(0,0,0,.04)"}}>
                    <h3 style={{margin:"0 0 6px",fontSize:16,fontWeight:800}}>{mBoardDetail.title}</h3>
                    <p style={{margin:"0 0 12px",fontSize:12,color:"#9ca3af"}}>{mBoardDetail.by} · {mBoardDetail.time}</p>
                    <p style={{margin:"0 0 12px",fontSize:14,color:"#1f2937",lineHeight:1.7}}>{mBoardDetail.content}</p>
                    <button onClick={()=>{
                      const isLiked=mBoardDetail.likes.includes(user?.name);
                      const newLikes=isLiked?mBoardDetail.likes.filter(n=>n!==user?.name):[...mBoardDetail.likes,user?.name];
                      const updated={...mBoardDetail,likes:newLikes};
                      updMeeting(x=>({...x,board:x.board.map(p=>p.id===mBoardDetail.id?updated:p)}));
                      setMBoardDetail(updated);
                    }} style={{background:mBoardDetail.likes.includes(user?.name)?"#fce7f3":"#f3f4f6",border:"none",cursor:"pointer",padding:"7px 16px",borderRadius:20,fontSize:13,fontWeight:700,color:mBoardDetail.likes.includes(user?.name)?"#ec4899":"#6b7280"}}>
                      {mBoardDetail.likes.includes(user?.name)?"❤️":"🤍"} {mBoardDetail.likes.length}
                    </button>
                  </div>
                  {mBoardDetail.comments.map((c,i)=>(
                    <div key={i} style={{background:"white",borderRadius:14,padding:"12px 14px",marginBottom:8,boxShadow:"0 2px 4px rgba(0,0,0,.03)"}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                        <div style={{width:28,height:28,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white",fontWeight:700,overflow:"hidden"}}>
                          {(c.by===user?.name && profilePhotos[profileRepIdx]) ? <img src={profilePhotos[profileRepIdx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : MEMBER_AVATARS[c.by] ? <img src={MEMBER_AVATARS[c.by]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : c.by[0]}
                        </div>
                        <span style={{fontWeight:700,fontSize:13}}>{c.by}</span>
                        <span style={{fontSize:11,color:"#9ca3af"}}>{c.time}</span>
                      </div>
                      <p style={{margin:"0 0 0 36px",fontSize:13,color:"#1f2937"}}>{c.text}</p>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:8,marginTop:12}}>
                    <input value={mBoardCommentVal} onChange={e=>setMBoardCommentVal(e.target.value)}
                      placeholder="댓글 달기..." style={{flex:1,padding:"10px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                    <button onClick={()=>{
                      if(!mBoardCommentVal.trim()) return;
                      const newC={by:user?.name,text:mBoardCommentVal.trim(),time:"방금 전"};
                      const updated={...mBoardDetail,comments:[...mBoardDetail.comments,newC]};
                      updMeeting(x=>({...x,board:x.board.map(p=>p.id===mBoardDetail.id?updated:p)}));
                      setMBoardDetail(updated); setMBoardCommentVal("");
                    }} style={{background:G,color:"white",border:"none",padding:"0 16px",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer",flexShrink:0}}>등록</button>
                  </div>
                </div>
              )}

              {/* 사진첩 */}
              {meetingTab==="photos" && (
                <div>
                  <input ref={mPhotoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                    const file=e.target.files[0]; if(!file) return;
                    const r=new FileReader(); r.onload=ev=>{
                      updMeeting(x=>({...x,photos:[{url:ev.target.result,by:user?.name,time:"방금 전"},...x.photos]}));
                    }; r.readAsDataURL(file); e.target.value="";
                  }}/>
                  {isMember && <button onClick={()=>mPhotoRef.current.click()}
                    style={{width:"100%",background:G,color:"white",border:"none",padding:12,borderRadius:14,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:14}}>📷 사진 올리기</button>}
                  {m.photos.length===0
                    ? <div style={{textAlign:"center",padding:"40px 0"}}><p style={{fontSize:36,margin:"0 0 8px"}}>📸</p><p style={{color:"#9ca3af",fontSize:13}}>아직 사진이 없어요</p></div>
                    : <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                        {m.photos.map((ph,i)=>(
                          <div key={i} style={{aspectRatio:"1",borderRadius:12,overflow:"hidden",position:"relative"}}>
                            <img src={ph.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,.5)",padding:"3px 6px"}}>
                              <p style={{margin:0,fontSize:9,color:"white"}}>{ph.by}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              )}

              {/* 투표 */}
              {meetingTab==="vote" && (
                <div>
                  {isMember && !isAddVote && <button onClick={()=>setIsAddVote(true)}
                    style={{width:"100%",background:G,color:"white",border:"none",padding:12,borderRadius:14,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:14}}>🗳️ 투표 만들기</button>}
                  {isAddVote && (
                    <div style={{background:"#f9fafb",borderRadius:14,padding:14,marginBottom:16}}>
                      <p style={{margin:"0 0 8px",fontWeight:700,fontSize:14}}>새 투표</p>
                      <input value={mVoteForm.title} onChange={e=>setMVoteForm(f=>({...f,title:e.target.value}))} placeholder="투표 주제" style={{width:"100%",padding:"9px 12px",border:"2px solid #e5e7eb",borderRadius:10,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
                      {mVoteForm.options.map((opt,i)=>(
                        <input key={i} value={opt} onChange={e=>{const o=[...mVoteForm.options];o[i]=e.target.value;setMVoteForm(f=>({...f,options:o}));}}
                          placeholder={`선택지 ${i+1}`} style={{width:"100%",padding:"9px 12px",border:"2px solid #e5e7eb",borderRadius:10,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
                      ))}
                      <div style={{display:"flex",gap:8,marginTop:4}}>
                        <button onClick={()=>setMVoteForm(f=>({...f,options:[...f.options,""]}))} style={{background:"#f3f4f6",border:"none",cursor:"pointer",padding:"7px 14px",borderRadius:10,fontSize:12,fontWeight:700}}>+ 선택지 추가</button>
                        <button onClick={()=>{
                          if(!mVoteForm.title.trim()) return;
                          const votes={};mVoteForm.options.forEach((_,i)=>{votes[i]=[];});
                          updMeeting(x=>({...x,votes:[...x.votes,{id:Date.now(),title:mVoteForm.title,options:mVoteForm.options.filter(o=>o.trim()),votes,closed:false}]}));
                          setIsAddVote(false);setMVoteForm({title:"",options:["",""]});
                        }} style={{background:G,color:"white",border:"none",cursor:"pointer",padding:"7px 18px",borderRadius:10,fontSize:13,fontWeight:700}}>등록</button>
                      </div>
                    </div>
                  )}
                  {m.votes.map(v=>{
                    const total=Object.values(v.votes).flat().length;
                    const myVote=Object.entries(v.votes).find(([,names])=>names.includes(user?.name))?.[0];
                    return (
                      <div key={v.id} style={{background:"white",borderRadius:14,padding:16,marginBottom:12,boxShadow:"0 2px 6px rgba(0,0,0,.04)"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                          <h4 style={{margin:0,fontSize:14,fontWeight:700}}>{v.title}</h4>
                          {v.closed && <span style={{background:"#f3f4f6",color:"#9ca3af",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:8}}>종료</span>}
                        </div>
                        {v.options.map((opt,i)=>{
                          const cnt=v.votes[i]?.length||0;
                          const pct=total>0?Math.round(cnt/total*100):0;
                          const voted=myVote===String(i);
                          return (
                            <div key={i} onClick={()=>{
                              if(v.closed||myVote) return;
                              const nv={...v.votes};nv[i]=[...nv[i],user?.name];
                              updMeeting(x=>({...x,votes:x.votes.map(vt=>vt.id===v.id?{...vt,votes:nv}:vt)}));
                            }} style={{marginBottom:8,cursor:v.closed||myVote?"default":"pointer"}}>
                              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                                <span style={{fontSize:13,fontWeight:voted?700:400,color:voted?"#ec4899":"#1f2937"}}>{voted?"✓ ":""}{opt}</span>
                                <span style={{fontSize:12,color:"#9ca3af"}}>{cnt}표 ({pct}%)</span>
                              </div>
                              <div style={{height:6,background:"#f3f4f6",borderRadius:6,overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${pct}%`,background:voted?"linear-gradient(135deg,#ec4899,#a855f7)":"#d1d5db",borderRadius:6,transition:"width .4s"}}/>
                              </div>
                            </div>
                          );
                        })}
                        {isOwner && !v.closed && <button onClick={()=>updMeeting(x=>({...x,votes:x.votes.map(vt=>vt.id===v.id?{...vt,closed:true}:vt)}))}
                          style={{marginTop:4,background:"#f3f4f6",border:"none",cursor:"pointer",padding:"6px 14px",borderRadius:10,fontSize:12,fontWeight:600,color:"#6b7280"}}>투표 종료</button>}
                      </div>
                    );
                  })}
                  {m.votes.length===0 && !isAddVote && <div style={{textAlign:"center",padding:"40px 0"}}><p style={{fontSize:36,margin:"0 0 8px"}}>🗳️</p><p style={{color:"#9ca3af",fontSize:13}}>진행 중인 투표가 없어요</p></div>}
                </div>
              )}

              {/* 채팅 */}
              {meetingTab==="chat" && (
                <div>
                  <div style={{display:"flex",flexDirection:"column",gap:10,paddingBottom:60}}>
                    {m.chats.map((c,i)=>{
                      const isMe=c.by===user?.name;
                      return (
                        <div key={i} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:8,alignItems:"flex-end"}}>
                          {!isMe && <div style={{width:30,height:30,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white",fontWeight:700,flexShrink:0,overflow:"hidden"}}>
                            {MEMBER_AVATARS[c.by] ? <img src={MEMBER_AVATARS[c.by]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : c.by[0]}
                          </div>}
                          <div>
                            {!isMe && <p style={{margin:"0 0 3px",fontSize:11,color:"#9ca3af",paddingLeft:2}}>{c.by}</p>}
                            <div style={{background:isMe?"linear-gradient(135deg,#ec4899,#a855f7)":"white",color:isMe?"white":"#1f2937",borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",fontSize:14,maxWidth:220,boxShadow:"0 2px 6px rgba(0,0,0,.06)",lineHeight:1.5}}>
                              {c.text}
                            </div>
                            <p style={{margin:"3px 0 0",fontSize:10,color:"#9ca3af",textAlign:isMe?"right":"left"}}>{c.time}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef}/>
                  </div>
                </div>
              )}

              {/* 가입관리 */}
              {meetingTab==="manage" && (
                <div>
                  {!isOwner && <div style={{background:"#fef9c3",borderRadius:14,padding:"12px 14px",marginBottom:14}}><p style={{margin:0,fontSize:13,color:"#92400e"}}>⚠️ 운영자만 가입 신청을 관리할 수 있어요</p></div>}
                  <h4 style={{margin:"0 0 10px",fontSize:14,fontWeight:700}}>가입 신청 <span style={{color:"#ec4899"}}>{m.pending.length}</span>건</h4>
                  {m.pending.length===0
                    ? <div style={{textAlign:"center",padding:"30px 0"}}><p style={{fontSize:36,margin:"0 0 8px"}}>⚙️</p><p style={{color:"#9ca3af",fontSize:13}}>대기 중인 신청이 없어요</p></div>
                    : m.pending.map((p,i)=>(
                      <div key={i} style={{background:"white",borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 6px rgba(0,0,0,.04)"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                          <div style={{width:38,height:38,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"white",fontWeight:700,overflow:"hidden"}}>
                            {MEMBER_AVATARS[p.name] ? <img src={MEMBER_AVATARS[p.name]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : p.name[0]}
                          </div>
                          <div style={{flex:1}}>
                            <p style={{margin:0,fontWeight:700,fontSize:14}}>{p.name}</p>
                            <p style={{margin:0,fontSize:12,color:"#9ca3af"}}>{p.petName&&`${p.petName}(${p.petBreed}) · `}{p.time}</p>
                          </div>
                        </div>
                        {p.msg && <p style={{margin:"0 0 10px",fontSize:13,color:"#374151",background:"#f9fafb",borderRadius:10,padding:"8px 12px"}}>{p.msg}</p>}
                        {isOwner && (
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={()=>{
                              updMeeting(x=>({...x,
                                members:[...x.members,{name:p.name,role:"멤버",joined:new Date().toISOString().slice(0,7).replace("-",".")}],
                                pending:x.pending.filter((_,j)=>j!==i),
                                greetings:[...x.greetings,{by:p.name,text:p.msg||"안녕하세요! 잘 부탁드려요.",time:"방금 전"}]
                              }));
                              // 가입 승인 알림
                              setAlarms(a=>[{id:Date.now(),icon:"🏃",text:`${p.name}님이 모임에 가입했어요!`,time:"방금 전",unread:true,nav:{type:"meeting"}},...a]);
                            }} style={{flex:1,background:G,color:"white",border:"none",padding:"9px 0",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer"}}>승인</button>
                            <button onClick={()=>updMeeting(x=>({...x,pending:x.pending.filter((_,j)=>j!==i)}))}
                              style={{flex:1,background:"#f3f4f6",color:"#6b7280",border:"none",padding:"9px 0",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer"}}>거절</button>
                          </div>
                        )}
                      </div>
                    ))
                  }
                  {/* 모임 해체 (운영자 전용) */}
                  {isOwner && (
                    <div style={{marginTop:24,padding:"16px 0",borderTop:"1px solid #f3f4f6"}}>
                      <button onClick={()=>{
                        if(!confirm("⚠️ 정말로 이 모임을 해체하시겠어요?\n\n모든 멤버가 탈퇴되고, 게시글·사진·채팅 등 모든 데이터가 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다.")) return;
                        if(!confirm("마지막 확인: 정말 해체하시겠어요?")) return;
                        setMeetings(ms=>ms.filter(x=>x.id!==m.id));
                        if(m._fid) deleteDoc(doc(db,"communityMeetings",m._fid)).catch(()=>{});
                        setMeetingView("list");
                        setSelectedMeeting(null);
                        alert("모임이 해체되었습니다.");
                      }}
                        style={{width:"100%",background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",padding:"12px 0",borderRadius:14,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                        🗑️ 모임 해체하기
                      </button>
                      <p style={{margin:"8px 0 0",fontSize:11,color:"#9ca3af",textAlign:"center"}}>운영자만 모임을 해체할 수 있어요</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 채팅 하단 입력 */}
            {meetingTab==="chat" && (
              <div style={{background:"white",borderTop:"1px solid #f3f4f6",padding:"10px 14px",flexShrink:0,display:"flex",gap:8}}>
                {!isMember
                  ? <p style={{margin:0,flex:1,textAlign:"center",fontSize:13,color:"#9ca3af",padding:"10px 0"}}>가입 후 채팅에 참여할 수 있어요</p>
                  : <>
                    <input value={mChatVal} onChange={e=>setMChatVal(e.target.value)} onKeyDown={e=>{
                      if(e.key==="Enter"&&mChatVal.trim()){
                        updMeeting(x=>({...x,chats:[...x.chats,{by:user?.name,text:mChatVal.trim(),time:"방금 전"}]}));
                        setMChatVal("");
                        setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:"smooth"}),50);
                      }
                    }} placeholder="메시지를 입력하세요..."
                      style={{flex:1,background:"#f3f4f6",border:"none",outline:"none",borderRadius:22,padding:"10px 16px",fontSize:14}}/>
                    <button onClick={()=>{
                      if(!mChatVal.trim()) return;
                      updMeeting(x=>({...x,chats:[...x.chats,{by:user?.name,text:mChatVal.trim(),time:"방금 전"}]}));
                      setMChatVal("");
                      setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:"smooth"}),50);
                    }} style={{background:mChatVal.trim()?G:"#e5e7eb",color:mChatVal.trim()?"white":"#9ca3af",border:"none",cursor:"pointer",borderRadius:"50%",width:40,height:40,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
                  </>}
              </div>
            )}
          </div>
        );
      })()}

      {/* 관심 - 대화 탭 통합 안내 (fallback) */}

      {/* 글쓰기 모달 */}
      {isWritePost && (
        <div style={{position:"fixed",inset:0,zIndex:60,display:"flex",flexDirection:"column"}}>
          <div onClick={()=>setIsWritePost(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.45)",backdropFilter:"blur(2px)"}} />
          <input ref={writePostRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{
            const files = Array.from(e.target.files).slice(0, 5 - postForm.imgs.length);
            files.forEach(file=>{
              const r = new FileReader();
              r.onload = ev => setPostForm(f=>f.imgs.length<5 ? {...f,imgs:[...f.imgs,ev.target.result]} : f);
              r.readAsDataURL(file);
            });
            e.target.value="";
          }} />
          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderRadius:"24px 24px 0 0",height:"80vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,margin:"12px auto 0",flexShrink:0}} />
            <div style={{padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f3f4f6",flexShrink:0}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:800}}>글쓰기</h3>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,color:"#ec4899",background:"#fce7f3",padding:"3px 10px",borderRadius:10,fontWeight:700}}>🐾 {WRITE_COST}p 사용</span>
                <button onClick={()=>setIsWritePost(false)} style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:30,height:30,borderRadius:"50%",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>

              {/* 카테고리 드롭다운 */}
              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:13,fontWeight:700,color:"#374151",marginBottom:6}}>카테고리 <span style={{color:"#ef4444"}}>*</span></label>
                <div style={{position:"relative"}}>
                  <select value={postForm.cat} onChange={e=>setPostForm(f=>({...f,cat:e.target.value}))}
                    style={{width:"100%",padding:"11px 36px 11px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:14,outline:"none",appearance:"none",background:"white",cursor:"pointer",boxSizing:"border-box",color:"#1f2937",fontWeight:600}}>
                    {LOUNGE_CATS.filter(c=>!["all","feed","hot"].includes(c.key)).map(c=>(
                      <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                  <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#9ca3af"}}>▾</span>
                </div>
              </div>

              {/* 내용 */}
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <label style={{fontSize:13,fontWeight:700,color:"#374151"}}>내용 <span style={{color:"#ef4444"}}>*</span></label>
                  <span style={{fontSize:11,color:postForm.content.length>90?"#ef4444":"#9ca3af"}}>{postForm.content.length}/100</span>
                </div>
                <textarea value={postForm.content} onChange={e=>e.target.value.length<=100&&setPostForm(f=>({...f,content:e.target.value}))}
                  placeholder="이웃 펫친들과 나누고 싶은 이야기를 적어보세요 🐾" rows={5}
                  style={{width:"100%",padding:"12px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:14,outline:"none",resize:"none",boxSizing:"border-box",lineHeight:1.6,fontFamily:"inherit",color:"#1f2937"}}
                  onFocus={e=>e.target.style.borderColor="#ec4899"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              </div>

              {/* 사진 */}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <label style={{fontSize:13,fontWeight:700,color:"#374151"}}>사진 <span style={{color:"#9ca3af",fontWeight:400}}>(최대 5장)</span></label>
                  <span style={{fontSize:11,color:"#9ca3af"}}>{postForm.imgs.length}/5</span>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {postForm.imgs.map((img,i)=>(
                    <div key={i} style={{position:"relative",width:72,height:72}}>
                      <img src={img} alt="" style={{width:"100%",height:"100%",borderRadius:12,objectFit:"cover"}} />
                      <button onClick={()=>setPostForm(f=>({...f,imgs:f.imgs.filter((_,j)=>j!==i)}))}
                        style={{position:"absolute",top:-6,right:-6,width:20,height:20,background:"#ef4444",border:"none",borderRadius:"50%",color:"white",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>
                    </div>
                  ))}
                  {postForm.imgs.length < 5 && (
                    <button onClick={()=>writePostRef.current.click()}
                      style={{width:72,height:72,background:"#f3f4f6",border:"2px dashed #d1d5db",borderRadius:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,color:"#9ca3af"}}>
                      <span style={{fontSize:22}}>+</span>
                      <span style={{fontSize:10}}>사진추가</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{padding:"12px 18px 28px",borderTop:"1px solid #f3f4f6",flexShrink:0}}>
              {points < WRITE_COST && <p style={{margin:"0 0 8px",fontSize:12,color:"#ef4444",textAlign:"center",fontWeight:600}}>포인트가 부족해요 (보유 {points}p / 필요 {WRITE_COST}p)</p>}
              <button onClick={()=>{
                if (!postForm.content.trim() || points < WRITE_COST) return;
                const catInfo = LOUNGE_CATS.find(c=>c.key===postForm.cat);
                const newPost = {
                  id: Date.now(), cat:postForm.cat, by:user?.name, byImg:(profilePhotos[profileRepIdx]&&profilePhotos[profileRepIdx]!=="[img]")?profilePhotos[profileRepIdx]:null, uid:user?.uid, ago:"방금 전", ts:Date.now(),
                  content:postForm.content.trim(), imgs:postForm.imgs,
                  likes:[], comments:[]
                };
                setPosts(ps=>[newPost,...ps]);
                // Firestore 공유 컬렉션에 저장 + _fid 돌려받기
                addDoc(collection(db,"communityPosts"),{...newPost, imgs:(newPost.imgs||[]).map(img=>img&&img.startsWith?.("data:")?"[img]":img), byImg:(newPost.byImg&&!newPost.byImg.startsWith?.("data:"))?newPost.byImg:null, uid:user?.uid}).then(ref=>{
                  setPosts(ps=>ps.map(p=>p.id===newPost.id?{...p,_fid:ref.id}:p));
                }).catch(()=>{});
                setPoints(p=>p-WRITE_COST);
                setPointLog(l=>[{icon:catInfo?.icon||"📝",label:`${catInfo?.label||"글"} 등록`,pt:-WRITE_COST,type:"use",date:"방금 전"},...l]);
                setIsWritePost(false);
                setLoungeCat("all");
              }}
                disabled={!postForm.content.trim() || points < WRITE_COST}
                style={{width:"100%",background:postForm.content.trim()&&points>=WRITE_COST?G:"#e5e7eb",color:postForm.content.trim()&&points>=WRITE_COST?"white":"#9ca3af",border:"none",padding:14,borderRadius:14,fontWeight:700,fontSize:16,cursor:postForm.content.trim()&&points>=WRITE_COST?"pointer":"not-allowed",boxShadow:postForm.content.trim()&&points>=WRITE_COST?"0 4px 16px rgba(236,72,153,.3)":"none"}}>
                글 등록하기 (-{WRITE_COST}p)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 프로필 수정 모달 */}
      {isEditProfile && (
        <div style={{position:"fixed",inset:0,zIndex:60,display:"flex",flexDirection:"column"}}>
          <div onClick={() => setIsEditProfile(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.45)",backdropFilter:"blur(2px)"}} />

          {/* 숨겨진 파일 인풋 */}
          <input ref={profileFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async ev => {
              const compressed = await compressImage(ev.target.result);
              setProfilePhotos(arr => { const n=[...arr]; n[activeProfileSlot]=compressed; return n; });
            };
            reader.readAsDataURL(file);
            e.target.value = "";
          }} />

          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderRadius:"24px 24px 0 0",height:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,margin:"12px auto 0",flexShrink:0}} />
            <div style={{padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f3f4f6",flexShrink:0}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:800}}>프로필 수정</h3>
              <button onClick={() => setIsEditProfile(false)} style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:32,height:32,borderRadius:"50%",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"20px"}}>

              {/* 프로필 사진 5장 */}
              <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14}}>프로필 사진 <span style={{color:"#9ca3af",fontWeight:400,fontSize:12}}>(최대 5장)</span></p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:6}}>
                {profilePhotos.map((ph,i) => (
                  <div key={i} style={{position:"relative",aspectRatio:"1"}}>
                    <div onClick={() => {
                      if (ph) {
                        // 사진 있으면 삭제
                        setProfilePhotos(arr => { const n=[...arr]; n[i]=null; return n; });
                        if (profileRepIdx === i) setProfileRepIdx(profilePhotos.findIndex((p,j)=>j!==i&&p) ?? 0);
                      } else {
                        // 없으면 파일 선택
                        setActiveProfileSlot(i);
                        profileFileRef.current.click();
                      }
                    }}
                      style={{width:"100%",height:"100%",aspectRatio:"1",borderRadius:14,overflow:"hidden",
                        background:ph?"transparent":"#f3f4f6",
                        border:profileRepIdx===i&&ph?"3px solid #ec4899":"3px solid transparent",
                        cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {ph ? <img src={ph} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                          : <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                              <span style={{fontSize:20,color:"#d1d5db"}}>＋</span>
                              <span style={{fontSize:9,color:"#d1d5db"}}>사진추가</span>
                            </div>}
                    </div>
                    {/* 대표사진 별 + 삭제 버튼 */}
                    {ph && (
                      <div onClick={e=>{e.stopPropagation();setProfileRepIdx(i);}}
                        style={{position:"absolute",bottom:4,right:4,background:profileRepIdx===i?"#ec4899":"rgba(0,0,0,.5)",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"white",cursor:"pointer",zIndex:2}}>
                        {profileRepIdx===i?"★":"☆"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p style={{margin:"0 0 20px",fontSize:11,color:"#9ca3af",textAlign:"center"}}>사진 탭 → 추가 · 다시 탭 → 삭제 · ★ → 대표사진</p>

              {/* 닉네임 */}
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <label style={{fontSize:13,fontWeight:700,color:"#374151"}}>닉네임</label>
                  <span style={{fontSize:11,color:"#9ca3af",background:"#fce7f3",padding:"2px 8px",borderRadius:10}}>변경 시 🐾 {NICK_COST}p 차감</span>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <input value={editNickVal}
                    onChange={e => { setEditNickVal(e.target.value); setNickCheckStatus(null); }}
                    style={{flex:1,padding:"11px 14px",border:`2px solid ${nickCheckStatus==="ok"?"#10b981":nickCheckStatus==="dup"?"#ef4444":"#e5e7eb"}`,borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box"}} />
                  <button onClick={() => {
                    const v = editNickVal.trim();
                    if (!v) return;
                    if (v === user?.name) { setNickCheckStatus("same"); return; }
                    if (TAKEN_NICKS.includes(v)) { setNickCheckStatus("dup"); return; }
                    setNickCheckStatus("ok");
                  }}
                    style={{flexShrink:0,background:G,color:"white",border:"none",padding:"0 14px",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>
                    중복확인
                  </button>
                </div>
                {nickCheckStatus==="ok"  && <p style={{margin:"5px 0 0",fontSize:12,color:"#10b981",fontWeight:600}}>✓ 사용 가능한 닉네임이에요! (저장 시 {NICK_COST}p 차감)</p>}
                {nickCheckStatus==="dup" && <p style={{margin:"5px 0 0",fontSize:12,color:"#ef4444",fontWeight:600}}>✗ 이미 사용 중인 닉네임이에요</p>}
                {nickCheckStatus==="same"&& <p style={{margin:"5px 0 0",fontSize:12,color:"#6b7280"}}>현재 닉네임과 같아요</p>}
                {editNickVal.trim() !== user?.name && editNickVal.trim() && nickCheckStatus===null &&
                  <p style={{margin:"5px 0 0",fontSize:12,color:"#9ca3af"}}>닉네임 변경 전 중복확인이 필요해요</p>}
              </div>

              {/* 프로필 문구 */}
              <div style={{marginBottom:20}}>
                <label style={{display:"block",fontSize:13,fontWeight:700,color:"#374151",marginBottom:6}}>프로필 문구 <span style={{color:"#9ca3af",fontWeight:400}}>(선택)</span></label>
                <textarea value={editBioVal} onChange={e=>setEditBioVal(e.target.value)} placeholder="나를 소개하는 문구를 써보세요 🐾" rows={3}
                  style={{width:"100%",padding:"11px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:14,outline:"none",resize:"none",boxSizing:"border-box",lineHeight:1.6,fontFamily:"inherit"}}
                  onFocus={e=>e.target.style.borderColor="#ec4899"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
                <p style={{margin:"4px 0 0",fontSize:11,color:"#9ca3af",textAlign:"right"}}>{editBioVal.length}/100</p>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div style={{padding:"14px 20px 28px",borderTop:"1px solid #f3f4f6",flexShrink:0}}>
              {(() => {
                const nickChanged = editNickVal.trim() !== user?.name;
                const nickOk = !nickChanged || nickCheckStatus==="ok";
                const notEnoughPoints = nickChanged && nickCheckStatus==="ok" && points < NICK_COST;
                const canSave = nickOk && !notEnoughPoints;
                return (
                  <>
                    {notEnoughPoints && <p style={{margin:"0 0 10px",fontSize:12,color:"#ef4444",textAlign:"center",fontWeight:600}}>포인트가 부족해요 (보유: {points}p / 필요: {NICK_COST}p)</p>}
                    {nickChanged && nickCheckStatus==="ok" && !notEnoughPoints && <p style={{margin:"0 0 10px",fontSize:12,color:"#ec4899",textAlign:"center"}}>닉네임 변경 시 🐾 {NICK_COST}p가 차감됩니다</p>}
                    <button onClick={() => {
                      if (!canSave) return;
                      if (nickChanged && nickCheckStatus==="ok") {
                        setPoints(p => p - NICK_COST);
                        setPointLog(l=>[{icon:"✏️",label:"닉네임 변경",pt:-NICK_COST,type:"use",date:"방금 전"},...l]);
                        setUser(u=>({...u,name:editNickVal.trim()}));
                      }
                      setProfileBio(editBioVal);
                      setNickCheckStatus(null);
                      setIsEditProfile(false);
                      // Firestore에 프로필 저장
                      if(user?.uid){
                        const updates = {profileBio:editBioVal};
                        if(nickChanged) updates.nick = editNickVal.trim();
                        updateDoc(doc(db,"users",user.uid),updates).catch(()=>{});
                      }
                    }}
                      style={{width:"100%",background:canSave?G:"#e5e7eb",color:canSave?"white":"#9ca3af",border:"none",padding:14,borderRadius:14,fontWeight:700,fontSize:16,cursor:canSave?"pointer":"not-allowed",boxShadow:canSave?"0 4px 16px rgba(236,72,153,.3)":"none"}}>
                      저장하기
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 반려동물 등록 모달 */}
      {isAddPet && (
        <div style={{position:"fixed",inset:0,zIndex:60,display:"flex",flexDirection:"column"}}>
          <div onClick={()=>{setIsAddPet(false);setEditPetIdx(null);}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.45)",backdropFilter:"blur(2px)"}} />

          {/* 숨겨진 파일 인풋 */}
          <input ref={petFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async ev => {
              const compressed = await compressImage(ev.target.result);
              setPetForm(f => { const p=[...f.photos]; p[activePetSlot]=compressed; return {...f,photos:p}; });
            };
            reader.readAsDataURL(file);
            e.target.value = "";
          }} />

          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderRadius:"24px 24px 0 0",height:"93vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,margin:"12px auto 0",flexShrink:0}} />
            <div style={{padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f3f4f6",flexShrink:0}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:800}}>{editPetIdx!==null?"✏️ 반려동물 수정":"🐾 반려동물 등록"}</h3>
              <button onClick={()=>{setIsAddPet(false);setEditPetIdx(null);}} style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:32,height:32,borderRadius:"50%",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"20px"}}>

              {/* 반려동물 사진 5장 */}
              <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14}}>반려동물 사진 <span style={{color:"#9ca3af",fontWeight:400,fontSize:12}}>(최대 5장)</span></p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:6}}>
                {petForm.photos.map((ph,i) => (
                  <div key={i} style={{position:"relative",aspectRatio:"1"}}>
                    <div onClick={() => {
                      if (ph) {
                        setPetForm(f => { const p=[...f.photos]; p[i]=null; return {...f,photos:p}; });
                      } else {
                        setActivePetSlot(i);
                        petFileRef.current.click();
                      }
                    }}
                      style={{width:"100%",height:"100%",aspectRatio:"1",borderRadius:14,overflow:"hidden",
                        background:ph?"transparent":"#f3f4f6",
                        border:petForm.repIdx===i&&ph?"3px solid #ec4899":"3px solid transparent",
                        cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {ph ? <img src={ph} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                          : <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                              <span style={{fontSize:20,color:"#d1d5db"}}>＋</span>
                              <span style={{fontSize:9,color:"#d1d5db"}}>사진추가</span>
                            </div>}
                    </div>
                    {ph && (
                      <div onClick={e=>{e.stopPropagation();setPetForm(f=>({...f,repIdx:i}));}}
                        style={{position:"absolute",bottom:4,right:4,background:petForm.repIdx===i?"#ec4899":"rgba(0,0,0,.5)",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"white",cursor:"pointer",zIndex:2}}>
                        {petForm.repIdx===i?"★":"☆"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p style={{margin:"0 0 20px",fontSize:11,color:"#9ca3af",textAlign:"center"}}>사진 탭 → 추가 · 다시 탭 → 삭제 · ★ → 대표사진</p>

              {/* 이름 */}
              <div style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:13,fontWeight:700,color:"#374151",marginBottom:6}}>이름 <span style={{color:"#ef4444"}}>*</span></label>
                <input value={petForm.name} onChange={e=>setPetForm(f=>({...f,name:e.target.value}))} placeholder="예: 몽이"
                  style={{width:"100%",padding:"11px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box"}}
                  onFocus={e=>e.target.style.borderColor="#ec4899"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              </div>

              {/* 종류 + 성별 */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div>
                  <label style={{display:"block",fontSize:13,fontWeight:700,color:"#374151",marginBottom:6}}>종류</label>
                  <div style={{display:"flex",gap:6}}>
                    {["강아지","고양이","기타"].map(t=>(
                      <button key={t} onClick={()=>setPetForm(f=>({...f,type:t}))}
                        style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:petForm.type===t?G:"#f3f4f6",color:petForm.type===t?"white":"#6b7280"}}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{display:"block",fontSize:13,fontWeight:700,color:"#374151",marginBottom:6}}>성별</label>
                  <div style={{display:"flex",gap:6}}>
                    {["남아","여아"].map(g=>(
                      <button key={g} onClick={()=>setPetForm(f=>({...f,gender:g}))}
                        style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,background:petForm.gender===g?G:"#f3f4f6",color:petForm.gender===g?"white":"#6b7280"}}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 품종 + 생년월일 */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div>
                  <label style={{display:"block",fontSize:13,fontWeight:700,color:"#374151",marginBottom:6}}>품종</label>
                  <input value={petForm.breed} onChange={e=>setPetForm(f=>({...f,breed:e.target.value}))} placeholder="예: 포메라니안"
                    style={{width:"100%",padding:"11px 12px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    onFocus={e=>e.target.style.borderColor="#ec4899"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
                </div>
                <div>
                  <label style={{display:"block",fontSize:13,fontWeight:700,color:"#374151",marginBottom:6}}>생년월일</label>
                  <input value={petForm.birth} onChange={e=>setPetForm(f=>({...f,birth:e.target.value}))} placeholder="예: 2022.03.15"
                    style={{width:"100%",padding:"11px 12px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:13,outline:"none",boxSizing:"border-box"}}
                    onFocus={e=>e.target.style.borderColor="#ec4899"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
                </div>
              </div>

              {/* 선호 사료 */}
              <div style={{marginBottom:18}}>
                <label style={{display:"block",fontSize:13,fontWeight:700,color:"#374151",marginBottom:6}}>선호하는 사료 <span style={{color:"#9ca3af",fontWeight:400}}>(선택)</span></label>
                <input value={petForm.food} onChange={e=>setPetForm(f=>({...f,food:e.target.value}))} placeholder="예: 로얄캐닌, 힐스, 직접 만든 자연식 등"
                  style={{width:"100%",padding:"11px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:13,outline:"none",boxSizing:"border-box"}}
                  onFocus={e=>e.target.style.borderColor="#ec4899"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              </div>

              {/* 특징 태그 */}
              <div style={{marginBottom:8}}>
                <label style={{display:"block",fontSize:13,fontWeight:700,color:"#374151",marginBottom:4}}>반려동물 특징 <span style={{color:"#9ca3af",fontWeight:400}}>(여러 개 선택 가능)</span></label>
                <p style={{margin:"0 0 10px",fontSize:12,color:"#9ca3af"}}>선택됨: {petForm.traits.length}개</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {PET_TRAITS.map(t=>{
                    const sel = petForm.traits.includes(t);
                    return (
                      <button key={t} onClick={()=>setPetForm(f=>({...f,traits:sel?f.traits.filter(x=>x!==t):[...f.traits,t]}))}
                        style={{padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,
                          background:sel?G:"#f3f4f6",color:sel?"white":"#6b7280",
                          boxShadow:sel?"0 2px 8px rgba(236,72,153,.3)":"none",transition:"all .15s"}}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 등록 버튼 */}
            <div style={{padding:"14px 20px 28px",borderTop:"1px solid #f3f4f6",flexShrink:0}}>
              <button onClick={() => {
                if(!petForm.name.trim()) return;
                // Firestore에는 사진을 작게 리사이즈하여 저장
                const cleanPetForFirestore = (pet) => ({
                  ...pet,
                  photos: (pet.photos||[]).map(p => {
                    if(!p || p==="[img]") return null;
                    if(!p.startsWith?.("data:")) return p;
                    // base64가 너무 크면 Firestore 1MB 제한에 걸림 → [img]로 대체
                    if(p.length > 200000) return "[img]";
                    return p;
                  }),
                });
                if(editPetIdx!==null){
                  setMyPets(p=>{
                    const updated=p.map((pet,j)=>j===editPetIdx?{...petForm}:pet);
                    if(user?.uid) updateDoc(doc(db,"users",user.uid),{myPets:updated.map(cleanPetForFirestore)}).catch(()=>{});
                    return updated;
                  });
                } else {
                  setMyPets(p=>{
                    const updated = [...p,{...petForm}];
                    if(user?.uid) updateDoc(doc(db,"users",user.uid),{myPets:updated.map(cleanPetForFirestore)}).catch(()=>{});
                    return updated;
                  });
                }
                setIsAddPet(false);
                setEditPetIdx(null);
              }} disabled={!petForm.name.trim()}
                style={{width:"100%",background:petForm.name.trim()?G:"#e5e7eb",color:petForm.name.trim()?"white":"#9ca3af",border:"none",padding:14,borderRadius:14,fontWeight:700,fontSize:16,cursor:petForm.name.trim()?"pointer":"not-allowed",boxShadow:petForm.name.trim()?"0 4px 16px rgba(236,72,153,.3)":"none"}}>
                {editPetIdx!==null?"수정 완료 ✓":"등록하기 🐾"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 탭바 */}
      {tab!=="chat" && (
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderTop:"1px solid #f3f4f6",display:"flex",zIndex:10}}>
          {[["home","🏠","홈"],["community","🧡","라운지"],["story","📸","스토리"],["meeting","🏃","모임"],["messages","💬","대화"]].map(([id,icon,label]) => (
            <button key={id} onClick={() => { setTab(id); }} style={{flex:1,background:"none",border:"none",cursor:"pointer",padding:"8px 0 5px",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
              <span style={{fontSize:18,filter:tab===id?"none":"grayscale(1) opacity(.4)"}}>{icon}</span>
              <span style={{fontSize:10,fontWeight:700,color:tab===id?"#ec4899":"#9ca3af"}}>{label}</span>
              {id==="messages" && matches.length>0 && <span style={{position:"absolute",width:6,height:6,background:"#ef4444",borderRadius:"50%",marginTop:-14,marginLeft:18}} />}
            </button>
          ))}
        </div>
      )}

      {/* 상대방 프로필 모달 */}
      {viewUserProfile && (
        <div style={{position:"fixed",inset:0,zIndex:80}}>
          <div onClick={()=>setViewUserProfile(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)"}}/>
          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderRadius:"24px 24px 0 0",maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 -8px 40px rgba(0,0,0,.2)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px 0"}}>
              <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,flex:1}}/>
              {viewUserProfile.name!==user?.name && (
                <button onClick={()=>setReportModal({name:viewUserProfile.name})}
                  style={{background:"#f3f4f6",border:"none",cursor:"pointer",padding:"4px 10px",borderRadius:8,fontSize:11,color:"#9ca3af",fontWeight:600,marginLeft:8}}>🚨 신고/차단</button>
              )}
            </div>
            {/* 커버 + 프로필 사진 */}
            <div style={{position:"relative",marginBottom:50,flexShrink:0}}>
              <div style={{height:90,background:"linear-gradient(135deg,#fce7f3,#ede9fe)"}}/>
              <div style={{position:"absolute",bottom:-40,left:20,width:80,height:80,borderRadius:"50%",border:"4px solid white",overflow:"hidden",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,color:"white",fontWeight:800,boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>
                {viewUserProfile.img
                  ? <img onClick={(e)=>{e.stopPropagation();if(viewUserProfile.photos?.length>0)setPhotoViewer({photos:viewUserProfile.photos,idx:0});}} src={viewUserProfile.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",cursor:viewUserProfile.photos?.length?"pointer":"default"}}/>
                  : viewUserProfile.name?.[0]||"🐾"}
              </div>
              <button onClick={()=>setViewUserProfile(null)} style={{position:"absolute",top:12,right:14,background:"rgba(255,255,255,.85)",border:"none",cursor:"pointer",width:30,height:30,borderRadius:"50%",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>
            </div>
            {viewUserProfile.loading && <div style={{textAlign:"center",padding:"10px 0"}}><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>🔄</span> 프로필 불러오는 중...</div>}
            <div style={{flex:1,overflowY:"auto",padding:"0 20px 28px"}}>
              {/* 이름 + 위치 + 배지 */}
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  <h3 style={{margin:0,fontSize:20,fontWeight:800}}>{viewUserProfile.name}</h3>
                  {viewUserProfile.verified && <span style={{background:"#3b82f6",color:"white",fontSize:9,fontWeight:800,padding:"2px 6px",borderRadius:6}}>✓</span>}
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                  {viewUserProfile.location && <span style={{fontSize:12,color:"#6b7280"}}>📍 {viewUserProfile.location}</span>}
                  {viewUserProfile.gender && <span style={{fontSize:12,color:"#6b7280"}}>{viewUserProfile.gender==="남"?"🙋‍♂️ 남성":"🙋‍♀️ 여성"}</span>}
                  {viewUserProfile.birth && <span style={{fontSize:12,color:"#6b7280"}}>{viewUserProfile.birth}년생</span>}
                </div>
                {viewUserProfile.bio
                  ? <p style={{margin:0,fontSize:14,color:"#374151",lineHeight:1.6,background:"#f9fafb",borderRadius:12,padding:"10px 14px"}}>{viewUserProfile.bio}</p>
                  : <p style={{margin:0,fontSize:13,color:"#9ca3af",fontStyle:"italic"}}>아직 프로필 문구가 없어요</p>}
                {viewUserProfile.interests?.length>0 && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
                    {viewUserProfile.interests.map((t,i)=><span key={i} style={{background:"#fce7f3",color:"#be185d",fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:12}}>#{t}</span>)}
                  </div>
                )}
              </div>
              {/* 프로필 사진 갤러리 */}
              {viewUserProfile.photos?.length>1 && (
                <div style={{marginBottom:14}}>
                  <h4 style={{margin:"0 0 8px",fontSize:14,fontWeight:800}}>📸 사진</h4>
                  <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
                    {viewUserProfile.photos.map((ph,i)=>(
                      <img key={i} src={ph} alt="" onClick={()=>setPhotoViewer({photos:viewUserProfile.photos,idx:i})}
                        style={{width:70,height:70,borderRadius:12,objectFit:"cover",flexShrink:0,cursor:"pointer",border:"2px solid #f3f4f6"}}/>
                    ))}
                  </div>
                </div>
              )}
              {/* 반려동물 */}
              {viewUserProfile.pets && viewUserProfile.pets.length>0 && (
                <div style={{marginBottom:14}}>
                  <h4 style={{margin:"0 0 10px",fontSize:14,fontWeight:800}}>🐾 반려동물</h4>
                  {viewUserProfile.pets.map((pet,i)=>(
                    <div key={i} style={{background:"#f9fafb",borderRadius:14,padding:"12px",marginBottom:8}}>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <div onClick={()=>{if(pet.photos?.length>0)setPhotoViewer({photos:pet.photos,idx:0});else if(pet.img)setPhotoViewer({photos:[pet.img],idx:0});}}
                          style={{width:52,height:52,borderRadius:14,background:"#e5e7eb",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,cursor:(pet.img||pet.photos?.length)?"pointer":"default"}}>
                          {pet.img ? <img src={pet.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "🐾"}
                        </div>
                        <div style={{flex:1}}>
                          <p style={{margin:"0 0 2px",fontWeight:700,fontSize:15}}>{pet.name}</p>
                          <p style={{margin:0,fontSize:12,color:"#6b7280"}}>{[pet.type,pet.breed,pet.gender].filter(Boolean).join(" · ")}</p>
                          {pet.birth && <p style={{margin:"2px 0 0",fontSize:11,color:"#9ca3af"}}>🎂 {pet.birth}</p>}
                        </div>
                      </div>
                      {pet.food && <p style={{margin:"6px 0 0 0",fontSize:12,color:"#6b7280",paddingLeft:62}}>🍖 {pet.food}</p>}
                      {pet.traits?.length>0 && <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6,paddingLeft:62}}>{pet.traits.map((t,j)=><span key={j} style={{background:"#fce7f3",color:"#be185d",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:10}}>{t}</span>)}</div>}
                      {pet.photos?.length>1 && (
                        <div style={{display:"flex",gap:4,marginTop:8,paddingLeft:62,overflowX:"auto"}}>
                          {pet.photos.map((ph,j)=>(
                            <img key={j} src={ph} alt="" onClick={()=>setPhotoViewer({photos:pet.photos,idx:j})}
                              style={{width:44,height:44,borderRadius:8,objectFit:"cover",cursor:"pointer",flexShrink:0,border:"2px solid white"}}/>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {(!viewUserProfile.pets || viewUserProfile.pets.length===0) && !viewUserProfile.loading && (
                <div style={{background:"#f9fafb",borderRadius:14,padding:"16px",textAlign:"center",marginBottom:14}}>
                  <p style={{margin:0,fontSize:13,color:"#9ca3af"}}>등록된 반려동물이 없어요</p>
                </div>
              )}
              {/* 대화하기 버튼 (매칭된 경우에만) */}
              {matches.some(m=>m.name===viewUserProfile.name) && (
                <button onClick={()=>{
                  const pet=matches.find(m=>m.name===viewUserProfile.name);
                  if(pet){openChat(pet);}
                  setViewUserProfile(null);
                }} style={{width:"100%",background:G,color:"white",border:"none",padding:14,borderRadius:14,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:"0 4px 16px rgba(236,72,153,.3)"}}>
                  💬 대화하기
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 사진 뷰어 모달 */}
      {photoViewer && (
        <div style={{position:"fixed",inset:0,zIndex:90,background:"rgba(0,0,0,.95)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}
          onClick={()=>setPhotoViewer(null)}>
          <button onClick={()=>setPhotoViewer(null)} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.2)",border:"none",color:"white",width:40,height:40,borderRadius:"50%",cursor:"pointer",fontSize:20,zIndex:2}}>✕</button>
          <img src={photoViewer.photos[photoViewer.idx]} alt="" style={{maxWidth:"92%",maxHeight:"80vh",objectFit:"contain",borderRadius:8}}/>
          {photoViewer.photos.length>1 && (
            <div style={{display:"flex",gap:12,marginTop:16}}>
              <button onClick={e=>{e.stopPropagation();setPhotoViewer(v=>({...v,idx:Math.max(0,v.idx-1)}));}}
                style={{background:"rgba(255,255,255,.15)",border:"none",color:"white",width:44,height:44,borderRadius:"50%",cursor:"pointer",fontSize:18}}>◀</button>
              <span style={{color:"white",fontSize:14,display:"flex",alignItems:"center"}}>{photoViewer.idx+1} / {photoViewer.photos.length}</span>
              <button onClick={e=>{e.stopPropagation();setPhotoViewer(v=>({...v,idx:Math.min(v.photos.length-1,v.idx+1)}));}}
                style={{background:"rgba(255,255,255,.15)",border:"none",color:"white",width:44,height:44,borderRadius:"50%",cursor:"pointer",fontSize:18}}>▶</button>
            </div>
          )}
        </div>
      )}

      {/* 회원탈퇴 모달 */}
      {deleteAccModal && (
        <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={()=>setDeleteAccModal(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)"}}/>
          <div style={{position:"relative",background:"white",borderRadius:24,padding:"32px 24px",maxWidth:340,width:"90%",textAlign:"center",boxShadow:"0 20px 50px rgba(0,0,0,.2)"}}>
            <div style={{width:56,height:56,background:"#fef2f2",borderRadius:"50%",margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>😢</div>
            <h3 style={{margin:"0 0 8px",fontSize:18,fontWeight:800}}>정말 탈퇴하시겠어요?</h3>
            <p style={{margin:"0 0 6px",fontSize:14,color:"#6b7280",lineHeight:1.6}}>탈퇴하면 모든 데이터가 삭제되고<br/>복구할 수 없어요.</p>
            <div style={{background:"#fef2f2",borderRadius:12,padding:"10px 14px",marginBottom:20}}>
              <p style={{margin:0,fontSize:12,color:"#dc2626"}}>⚠️ 보유 포인트 {points.toLocaleString()}p가 소멸됩니다</p>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setDeleteAccModal(false)}
                style={{flex:1,background:"#f3f4f6",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",color:"#374151"}}>
                취소
              </button>
              <button onClick={async ()=>{
                try {
                  if(user?.uid) await deleteDoc(doc(db,"users",user.uid)).catch(()=>{});
                  if(auth.currentUser) await deleteUser(auth.currentUser);
                } catch(e) {
                  if(e.code==="auth/requires-recent-login"){
                    alert("보안을 위해 다시 로그인 후 탈퇴해주세요.");
                    setDeleteAccModal(false);
                    try{await signOut(auth);}catch{}
                    setLoggedIn(false);setUser(null);
                    return;
                  }
                }
                setDeleteAccModal(false);
                setLoggedIn(false);setUser(null);setPw("");setNick("");setEmail("");
                setMatches([]);setLiked([]);setIdx(0);setTab("home");setChatPet(null);
                setPoints(0);setPointLog([]);setMyPets([]);setMyStories([]);
                alert("회원 탈퇴가 완료되었습니다.\n그동안 펫플을 이용해주셔서 감사합니다. 🐾");
              }}
                style={{flex:1,background:"#ef4444",color:"white",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 프로필 인증 모달 */}
      {verifyModal && (
        <div style={{position:"fixed",inset:0,zIndex:110,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={()=>setVerifyModal(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)"}}/>
          <div style={{position:"relative",background:"white",borderRadius:24,padding:"28px 24px",maxWidth:340,width:"90%",textAlign:"center"}}>
            <div style={{width:64,height:64,background:"#eff6ff",borderRadius:"50%",margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>🛡️</div>
            <h3 style={{margin:"0 0 8px",fontSize:18,fontWeight:800}}>프로필 인증</h3>
            <p style={{margin:"0 0 16px",fontSize:13,color:"#6b7280",lineHeight:1.6}}>반려동물과 함께 찍은 사진을 프로필에 등록하면<br/>인증 뱃지를 받을 수 있어요!<br/><br/>인증된 프로필은 매칭 시 더 높은 신뢰도를 보여줘요 💙</p>
            <div style={{background:"#f9fafb",borderRadius:12,padding:12,marginBottom:16,textAlign:"left",fontSize:12,color:"#6b7280",lineHeight:1.8}}>
              <p style={{margin:0}}>✅ 반려동물 사진 1장 이상 등록</p>
              <p style={{margin:0}}>✅ 프로필 문구 작성</p>
              <p style={{margin:0}}>✅ 닉네임 설정 완료</p>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setVerifyModal(false)}
                style={{flex:1,background:"#f3f4f6",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",color:"#6b7280"}}>나중에</button>
              <button onClick={()=>{
                if(myPets.length===0||!myPets.some(p=>p.photos.some(ph=>ph))){
                  alert("반려동물 사진을 먼저 등록해주세요!");return;}
                if(!profileBio){alert("프로필 문구를 먼저 작성해주세요!");return;}
                setIsVerified(true);setVerifyModal(false);
                if(user?.uid){updateDoc(doc(db,"users",user.uid),{verified:true}).catch(()=>{});}
                alert("🎉 프로필 인증이 완료되었어요!\n이제 인증 뱃지가 표시됩니다.");
              }}
                style={{flex:1,background:"#3b82f6",color:"white",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>인증 신청</button>
            </div>
          </div>
        </div>
      )}

      {/* 나를 좋아한 사람 모달 */}
      {showSecretLikes && (
        <div style={{position:"fixed",inset:0,zIndex:110,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={()=>setShowSecretLikes(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)"}}/>
          <div style={{position:"relative",background:"white",borderRadius:24,padding:"24px",maxWidth:380,width:"90%",maxHeight:"70vh",overflow:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{margin:0,fontSize:18,fontWeight:800}}>👀 나를 좋아한 사람</h3>
              <button onClick={()=>setShowSecretLikes(false)} style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:30,height:30,borderRadius:"50%",fontSize:14}}>✕</button>
            </div>
            {liked.length===0
              ? <div style={{textAlign:"center",padding:"24px 0"}}>
                  <p style={{fontSize:36,margin:"0 0 8px"}}>💝</p>
                  <p style={{color:"#9ca3af",fontSize:13}}>아직 좋아요를 보낸 사람이 없어요<br/>프로필을 매력적으로 꾸며보세요!</p>
                </div>
              : <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {nearbyPets.slice(0,3).map((p,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:"#f9fafb",borderRadius:14,padding:12}}>
                      <img src={p.img} alt="" style={{width:50,height:50,borderRadius:"50%",objectFit:"cover"}}/>
                      <div style={{flex:1}}>
                        <p style={{margin:"0 0 2px",fontWeight:700,fontSize:14}}>{p.owner}{p.verified?" ✓":""}</p>
                        <p style={{margin:0,fontSize:12,color:"#9ca3af"}}>{p.name}({p.breed}) · {p.ownerBirth}년생</p>
                      </div>
                      <button onClick={()=>{setShowSecretLikes(false);swipe("R");}}
                        style={{background:G,color:"white",border:"none",padding:"6px 12px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer"}}>좋아요</button>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      )}

      
      {/* 온보딩 튜토리얼 */}
      {showOnboarding && (
        <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(5px)"}}>
          <div style={{background:"white",borderRadius:28,padding:"36px 28px",maxWidth:360,width:"90%",textAlign:"center"}}>
            {[
              {icon:"🐾",title:"환영해요!",desc:"펫플은 반려동물을 기반으로\n새로운 인연을 만드는 소셜 앱이에요"},
              {icon:"💎",title:"스와이프로 매칭해요",desc:"좋아요(🐾)로 관심 표현!\n슈퍼좋아요(💎)는 100% 매칭 보장!\n매일 "+DAILY_SWIPE_LIMIT+"번 스와이프할 수 있어요"},
              {icon:"🐶",title:"반려동물을 등록하세요",desc:"프로필에 반려동물을 등록하면\n매칭 확률이 크게 올라가요!\n사진도 잊지 마세요 📸"},
              {icon:"🤝",title:"모임에 참여해보세요",desc:"전국 산책 모임에 참여하고\n새로운 펫 친구를 만들어보세요!\n즐거운 경험이 기다리고 있어요 💕"},
            ][onboardingStep] && (() => {
              const step = [{icon:"🐾",title:"환영해요!",desc:"펫플은 반려동물을 기반으로\n새로운 인연을 만드는 소셜 앱이에요"},
                {icon:"💎",title:"스와이프로 매칭해요",desc:"좋아요(🐾)로 관심 표현!\n슈퍼좋아요(💎)는 100% 매칭 보장!\n매일 "+DAILY_SWIPE_LIMIT+"번 스와이프할 수 있어요"},
                {icon:"🐶",title:"반려동물을 등록하세요",desc:"프로필에 반려동물을 등록하면\n매칭 확률이 크게 올라가요!\n사진도 잊지 마세요 📸"},
                {icon:"🤝",title:"모임에 참여해보세요",desc:"전국 산책 모임에 참여하고\n새로운 펫 친구를 만들어보세요!\n즐거운 경험이 기다리고 있어요 💕"}][onboardingStep];
              return (<>
                <div style={{fontSize:64,marginBottom:14}}>{step.icon}</div>
                <h2 style={{margin:"0 0 8px",fontSize:22,fontWeight:800}}>{step.title}</h2>
                <p style={{margin:"0 0 24px",fontSize:14,color:"#6b7280",lineHeight:1.7,whiteSpace:"pre-line"}}>{step.desc}</p>
                <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:20}}>
                  {[0,1,2,3].map(i=><div key={i} style={{width:i===onboardingStep?24:8,height:8,borderRadius:4,background:i===onboardingStep?"#ec4899":"#e5e7eb",transition:"all .2s"}}/>)}
                </div>
                <div style={{display:"flex",gap:8}}>
                  {onboardingStep>0 && <button onClick={()=>setOnboardingStep(s=>s-1)} style={{flex:1,background:"#f3f4f6",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",color:"#6b7280"}}>이전</button>}
                  <button onClick={()=>{
                    if(onboardingStep<3) setOnboardingStep(s=>s+1);
                    else { setShowOnboarding(false); if(user?.uid) updateDoc(doc(db,"users",user.uid),{onboardingDone:true}).catch(()=>{}); }
                  }} style={{flex:2,background:G,color:"white",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>
                    {onboardingStep<3?"다음":"시작하기! 🐾"}
                  </button>
                </div>
              </>);
            })()}
          </div>
        </div>
      )}

      {/* 신고 모달 */}
      {reportModal && (
        <div style={{position:"fixed",inset:0,zIndex:120,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={()=>setReportModal(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)"}}/>
          <div style={{position:"relative",background:"white",borderRadius:24,padding:"28px 24px",maxWidth:340,width:"90%"}}>
            <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:800,textAlign:"center"}}>🚨 {reportModal.name} 신고하기</h3>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
              {["부적절한 프로필 사진","욕설/비하 발언","스팸/광고","사기 의심","성적 불쾌감","기타"].map(r=>(
                <button key={r} onClick={()=>setReportReason(r)}
                  style={{padding:"10px 14px",borderRadius:10,border:reportReason===r?"2px solid #ef4444":"2px solid #e5e7eb",
                    background:reportReason===r?"#fef2f2":"white",color:reportReason===r?"#ef4444":"#374151",
                    fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left"}}>{r}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setReportModal(null);setReportReason("");}}
                style={{flex:1,background:"#f3f4f6",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",color:"#6b7280"}}>취소</button>
              <button onClick={()=>{
                if(!reportReason){alert("신고 사유를 선택해주세요.");return;}
                // Firestore reports 컬렉션에 저장
                addDoc(collection(db,"reports"),{
                  reporterUid:user?.uid,reporterName:user?.name,
                  targetName:reportModal.name,targetUid:reportModal.uid||null,
                  reason:reportReason,
                  ts:Date.now(),time:new Date().toISOString(),
                  status:"pending"
                }).catch(()=>{});
                alert("신고가 접수되었어요. 검토 후 조치하겠습니다.");
                setReportModal(null);setReportReason("");
              }} style={{flex:1,background:"#ef4444",color:"white",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>신고하기</button>
            </div>
            <div style={{marginTop:12,borderTop:"1px solid #f3f4f6",paddingTop:12}}>
              <button onClick={()=>{
                if(!confirm(reportModal.name+"님을 차단하시겠어요?\n차단하면 서로의 프로필이 보이지 않아요.")) return;
                setBlockedUsers(s=>new Set([...s,reportModal.name]));
                setReportModal(null);setReportReason("");
                alert("차단되었어요. 해당 유저의 프로필이 더 이상 표시되지 않습니다.");
              }} style={{width:"100%",background:"none",border:"1px solid #e5e7eb",padding:"10px 0",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",color:"#6b7280"}}>
                🚫 이 사용자 차단하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 매칭 팝업 */}
      {popup && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(4px)"}}>
          <div style={{background:"white",borderRadius:28,padding:"38px 30px",textAlign:"center",maxWidth:280,width:"90%",boxShadow:"0 28px 60px rgba(0,0,0,.25)"}}>
            <p style={{fontSize:60,margin:"0 0 8px"}}>🎉</p>
            <h2 style={{margin:"0 0 8px",fontSize:26,fontWeight:800,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>매칭 성공!</h2>
            <p style={{margin:"0 0 6px",color:"#374151",fontSize:16,fontWeight:600}}>{popup.name}와 친구가 됐어요!</p>
            <div style={{display:"inline-block",background:"#dcfce7",color:"#16a34a",padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,marginBottom:6}}>🐾 +15p 획득!</div>
            <p style={{margin:0,color:"#9ca3af",fontSize:13}}>멍냥톡에서 대화를 시작해보세요 🐾</p>
          </div>
        </div>
      )}
    </div>
  );
}
