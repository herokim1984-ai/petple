import { useState, useRef } from "react";

const PETS = [
  { id:1, name:"몽이", age:3, breed:"포메라니안", gender:"남아",
    tags:["#에너자이저","#사람좋아해","#산책광"], bio:"활발하고 사교적인 3살 포메예요. 매일 산책 가는 걸 좋아해요!",
    owner:"몽이엄마", location:"송도국제도시", dist:"0.8km", score:95,
    img:"https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&h=500&fit=crop" },
  { id:2, name:"루이", age:2, breed:"웰시코기", gender:"남아",
    tags:["#젠틀해요","#훈련잘돼요","#친화력갑"], bio:"순하고 사교성 좋은 코기입니다. 다른 강아지들과 잘 지내요!",
    owner:"루이아빠", location:"인천 연수구", dist:"1.2km", score:92,
    img:"https://images.unsplash.com/photo-1612536980005-c9f02a78e4e4?w=400&h=500&fit=crop" },
  { id:3, name:"까미", age:4, breed:"코리안숏헤어", gender:"여아",
    tags:["#수줍은미녀","#조용해요","#독립적"], bio:"조용하고 차분한 성격이에요. 친해지면 진짜 애교쟁이!",
    owner:"까미집사", location:"센트럴파크", dist:"1.5km", score:88,
    img:"https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=500&fit=crop" },
  { id:4, name:"초코", age:5, breed:"골든리트리버", gender:"남아",
    tags:["#온순해요","#대형견친화","#물놀이최고"], bio:"착하고 온순한 대형견이에요. 바다 산책을 제일 좋아해요!",
    owner:"초코맘", location:"을왕리", dist:"2.3km", score:97,
    img:"https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=500&fit=crop" },
  { id:5, name:"뽀미", age:1, breed:"말티즈", gender:"여아",
    tags:["#에너지폭발","#애교만렙","#호기심왕"], bio:"1살 아기 말티즈예요. 세상 모든 게 신기하고 재밌어요!",
    owner:"뽀미언니", location:"달빛축제공원", dist:"0.5km", score:85,
    img:"https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&h=500&fit=crop" },
];

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

const INIT_POSTS = [
  { id:1, cat:"walk", by:"몽이엄마", ago:"10분 전", ts:Date.now()-600000,
    content:"오늘 저녁 7시 센트럴파크에서 같이 산책하실 분 구해요! 소형견 환영 🌳 연락주세요~",
    imgs:[], likes:[], comments:[
      {id:1,by:"루이아빠",text:"저도 가고 싶어요!",time:"9분 전",likes:[],replies:[
        {id:1,by:"몽이엄마",text:"오세요! 반갑게 맞이할게요 😊",time:"8분 전"}
      ]},
      {id:2,by:"뽀미언니",text:"뽀미도 데리고 갈게요",time:"5분 전",likes:[],replies:[]}
    ]},
  { id:2, cat:"hospital", by:"루이아빠", ago:"1시간 전", ts:Date.now()-3600000,
    content:"인천 연수구 근처 강아지 슬개골 잘 보는 동물병원 추천해주세요 🏥 루이가 요즘 다리를 자주 들어요 ㅠ",
    imgs:[], likes:["뽀미언니","까미집사"], comments:[
      {id:1,by:"초코맘",text:"연수구 ○○동물병원 진짜 잘해요! DM 드릴게요",time:"50분 전",likes:["루이아빠"],replies:[]}
    ]},
  { id:3, cat:"vol", by:"까미집사", ago:"3시간 전", ts:Date.now()-10800000,
    content:"이번 주말 인천 유기동물보호소 봉사 같이 하실 분 있나요? 🤝 사전 신청 필요 없고 당일 방문 가능해요!",
    imgs:[], likes:["몽이엄마","루이아빠","뽀미언니"], comments:[]},
  { id:4, cat:"found", by:"펫플러버", ago:"어제", ts:Date.now()-86400000,
    content:"📢 송도 1동 근처에서 발견된 강아지예요. 갈색 포메라니안, 목줄 없음. 주인분 연락주세요! 010-XXXX-XXXX",
    imgs:[], likes:["몽이엄마","까미집사","초코맘","루이아빠"], comments:[
      {id:1,by:"몽이엄마",text:"공유할게요 ㅠ 빨리 찾길",time:"어제",likes:[],replies:[]}
    ]},
];

const WRITE_COST = 30;

const INIT_MEETINGS = [
  { id:1, title:"🌳 센트럴파크 저녁 산책 모임", region:"인천 연수구", animal:"강아지",
    desc:"매주 화/목 저녁 6시 센트럴파크에서 함께 산책해요! 소형견 환영, 초보 보호자도 OK 🐾",
    max:10, tags:["소형견환영","초보OK","저녁산책"],
    members:[{name:"몽이엄마",role:"운영자",joined:"2024.11"},{name:"뽀미언니",role:"멤버",joined:"2024.12"},{name:"루이아빠",role:"멤버",joined:"2025.01"}],
    greetings:[{by:"루이아빠",text:"반갑습니다! 루이(웰시코기 2살)와 함께 가입했어요 🐕",time:"2025.01.15"}],
    board:[{id:1,by:"몽이엄마",title:"이번 주 화요일 날씨가 좋네요!",content:"모두 나오실 분들 댓글 달아주세요 😊",time:"2일 전",likes:[],comments:[]}],
    photos:[{url:"https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",by:"몽이엄마",time:"3일 전"}],
    votes:[{id:1,title:"정기 모임 시간 변경할까요?",options:["6시 유지","7시로 변경","주말로 변경"],votes:{0:["몽이엄마"],1:["루이아빠"],2:[]},closed:false}],
    chats:[{by:"몽이엄마",text:"오늘 산책 날씨 최고! 🌟",time:"10분 전"},{by:"뽀미언니",text:"저도 지금 출발해요!",time:"8분 전"}],
    pending:[{name:"초코맘",petName:"초코",petBreed:"골든리트리버",msg:"안녕하세요! 대형견인데 참여 가능한가요?",time:"1시간 전"}],
    myJoined:false },
  { id:2, title:"🏖 을왕리 해변 달리기", region:"인천 중구", animal:"강아지",
    desc:"을왕리 해변에서 매주 토요일 아침 달리기! 중대형견 환영합니다. 체력왕들 모여라 💪",
    max:8, tags:["중대형견","체력왕","주말달리기"],
    members:[{name:"초코맘",role:"운영자",joined:"2024.10"},{name:"루이아빠",role:"멤버",joined:"2024.11"}],
    greetings:[],
    board:[],
    photos:[{url:"https://images.unsplash.com/photo-1612536980005-c9f02a78e4e4?w=400&h=300&fit=crop",by:"초코맘",time:"1주 전"}],
    votes:[],
    chats:[{by:"초코맘",text:"이번 토요일 날씨 확인했는데 맑아요!",time:"어제"}],
    pending:[],
    myJoined:false },
  { id:3, title:"☕ 애견카페 소셜 모임", region:"인천 연수구", animal:"전체",
    desc:"매달 첫째 주 일요일 송도 펫카페에서 만나요! 모든 반려동물 환영 🐾🐱",
    max:15, tags:["전견종","고양이OK","친목"],
    members:[{name:"까미집사",role:"운영자",joined:"2024.09"},{name:"몽이엄마",role:"멤버",joined:"2024.10"},{name:"뽀미언니",role:"멤버",joined:"2024.11"},{name:"초코맘",role:"멤버",joined:"2024.12"}],
    greetings:[{by:"뽀미언니",text:"뽀미(말티즈 1살)와 함께 가입했어요! 잘 부탁드려요",time:"2024.11.01"}],
    board:[{id:1,by:"까미집사",title:"12월 모임 날짜 공지",content:"12월 모임은 12/1(일) 오후 2시입니다. 많이 참여해주세요!",time:"5일 전",likes:["몽이엄마"],comments:[{by:"몽이엄마",text:"참석할게요!",time:"4일 전"}]}],
    photos:[{url:"https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop",by:"까미집사",time:"한 달 전"}],
    votes:[{id:1,title:"다음 카페 어디로 할까요?",options:["펫파라다이스","멍냥카페","코지펫"],votes:{0:["까미집사","몽이엄마"],1:["뽀미언니"],2:["초코맘"]},closed:false}],
    chats:[{by:"까미집사",text:"다들 12월 모임 오실 거죠? 😊",time:"3일 전"},{by:"뽀미언니",text:"물론이죠!",time:"3일 전"},{by:"몽이엄마",text:"저도요~",time:"2일 전"}],
    pending:[],
    myJoined:true },
];

const G = "linear-gradient(135deg,#ec4899,#a855f7)";

const MEMBER_AVATARS = {
  "몽이엄마":"https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=100&h=100&fit=crop&crop=face",
  "루이아빠":"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop&crop=face",
  "뽀미언니":"https://images.unsplash.com/photo-1583337130417-13571c1c6b3e?w=100&h=100&fit=crop&crop=face",
  "까미집사":"https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop&crop=face",
  "초코맘":"https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=100&h=100&fit=crop&crop=face",
  "펫플러버":"https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&h=100&fit=crop&crop=face",
  "익명의집사":"https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=100&h=100&fit=crop&crop=face",
};

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
  const [nick,     setNick]     = useState("");
  const [err,      setErr]      = useState("");
  const [user,     setUser]     = useState(null);

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
  const [findPwStep,   setFindPwStep]   = useState(0); // 0: 이메일입력, 1: 인증번호, 2: 새비번, 3: 완료
  const [findPwCode,   setFindPwCode]   = useState("");
  const [findPwNewPw,  setFindPwNewPw]  = useState("");
  const [findPwErr,    setFindPwErr]    = useState("");
  const [findPwTimer,  setFindPwTimer]  = useState(0);
  const findPwTimerRef = useRef(null);

  const [tab,      setTab]      = useState("home");
  const [idx,      setIdx]      = useState(0);
  const [matches,  setMatches]  = useState([]);
  const [liked,    setLiked]    = useState([]);
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
  const [viewUserProfile, setViewUserProfile] = useState(null); // {name, img, bio, pets:[]}

  // 위치
  const [userLocation,    setUserLocation]    = useState("인천 연수구");
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
  const TAKEN_NICKS = ["몽이엄마","루이아빠","까미집사","초코맘","뽀미언니","펫플러버","익명의집사"];

  const profileFileRef = useRef(null);
  const [activeProfileSlot, setActiveProfileSlot] = useState(0);

  // 반려동물
  const [myPets,       setMyPets]       = useState([]);
  const [isAddPet,     setIsAddPet]     = useState(false);
  const [petForm,      setPetForm]      = useState({ name:"", type:"강아지", breed:"", birth:"", gender:"남아", food:"", traits:[], photos:[null,null,null,null,null], repIdx:0 });

  const petFileRef = useRef(null);
  const [activePetSlot, setActivePetSlot] = useState(0);

  const PET_TRAITS = ["#애교쟁이","#활발함","#온순해요","#독립적","#겁쟁이","#먹보","#산책광","#수다쟁이","#겁없음","#잠꾸러기","#호기심왕","#사람좋아해","#다른동물OK","#훈련잘돼요","#에너자이저","#순둥이"];

  // 스토리
  const [myStories,      setMyStories]      = useState([]);
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
  const [meetingTab,     setMeetingTab]     = useState("members");
  const [meetingMode,    setMeetingMode]    = useState("all"); // "all" | "mine"
  const [meetSearch,     setMeetSearch]     = useState({name:"",region:"",animal:""});
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
  const [newMeetForm, setNewMeetForm] = useState({title:"",region:"인천 연수구",animal:"강아지",desc:"",max:10});
  const mPhotoRef = useRef(null);
  const chatEndRef = useRef(null);
  const [showAlarm, setShowAlarm] = useState(false);
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
    { id:1, icon:"🐾", text:"몽이가 회원님을 좋아해요!", time:"방금 전", unread:true },
    { id:2, icon:"🎉", text:"루이와 매칭됐어요! 대화를 시작해보세요", time:"5분 전", unread:true },
    { id:3, icon:"💬", text:"까미집사님이 메시지를 보냈어요", time:"20분 전", unread:false },
    { id:4, icon:"🏃", text:"근처에서 산책 번개 모임이 생겼어요!", time:"1시간 전", unread:false },
  ]);

  const pet = PETS[idx % PETS.length];

  // 로그인/회원가입
  function submit() {
    setErr("");
    if (!email.trim())         return setErr("이메일을 입력해주세요.");
    if (!email.includes("@"))  return setErr("올바른 이메일 형식을 입력해주세요.");
    if (pw.length < 6)         return setErr("비밀번호는 6자 이상이어야 합니다.");
    if (signup && !nick.trim()) return setErr("닉네임을 입력해주세요.");
    if (signup && nick.trim().length < 2) return setErr("닉네임은 2자 이상이어야 합니다.");
    if (signup && nickAvail !== "ok") return setErr("닉네임 중복 확인을 해주세요.");
    const userName = signup ? nick.trim() : email.split("@")[0];
    setUser({ email, name: userName });
    setLoggedIn(true);
    // 이메일 저장
    if (saveEmail) { setSavedEmail(email); } else { setSavedEmail(""); }
    // 자동 로그인 저장
    if (autoLogin) { setSavedEmail(email); setSavedPw(pw); setSavedNick(userName); setAutoLoginReady(true); }
    else { setSavedPw(""); setSavedNick(""); setAutoLoginReady(false); }
  }

  // 스와이프
  function swipe(dir) {
    // 슈퍼좋아요(위로 스와이프) 포인트 체크
    if (dir === "U" && points < 30) {
      alert("슈퍼좋아요에는 🐾 30p가 필요해요!\n현재 보유: " + points + "p");
      return;
    }
    setAnim(dir);
    const cur = PETS[idx % PETS.length];
    setTimeout(() => {
      setAnim(null);
      setIdx(i => i + 1);
      if (dir === "U") {
        // 슈퍼좋아요: -30p 사용 + 매칭 보장 + 15p 획득 (net -15p)
        setPoints(p => p - 30 + 15);
        setPointLog(l => [
          {icon:"🎉",label:"매칭 성공",pt:15,type:"earn",date:"방금 전"},
          {icon:"💎",label:"슈퍼좋아요",pt:-30,type:"use",date:"방금 전"},
          ...l
        ]);
        setMatches(m => [...m, cur]);
        setPopup(cur);
        setTimeout(() => setPopup(null), 2500);
      } else if (dir !== "L") {
        if (Math.random() < 0.35) {
          setMatches(m => [...m, cur]);
          setPopup(cur);
          setPoints(p => p + 15);
          setPointLog(l => [{icon:"🎉",label:"매칭 성공",pt:15,type:"earn",date:"방금 전"},...l]);
          setTimeout(() => setPopup(null), 2500);
        } else {
          setLiked(l => [...l, cur]);
        }
      }
    }, 320);
  }

  // 채팅
  function openChat(p) {
    // 새 대화 개설 비용: 10p (이미 대화한 상대는 무료)
    if (!chatOpened.has(p.id)) {
      if (points < 10) {
        alert("새 대화를 시작하려면 🐾 10p가 필요해요!\n현재 보유: " + points + "p");
        return;
      }
      setPoints(pt => pt - 10);
      setPointLog(l => [{icon:"💌",label:"대화방 개설 ("+p.name+")",pt:-10,type:"use",date:"방금 전"},...l]);
      setChatOpened(s => new Set([...s, p.id]));
    }
    setChatPet(p);
    setMsgs([{ id:1, me:false, text:`안녕하세요! 저 ${p.name}이에요 🐾 반갑습니다!` }]);
    setTab("chat");
  }
  function sendMsg() {
    if (!msgVal.trim()) return;
    setMsgs(m => [...m, { id:m.length+1, me:true,  text:msgVal }]);
    setMsgVal("");
    // 첫 대화 포인트
    if (!firstChatDone) {
      setFirstChatDone(true);
      setPoints(p=>p+10);
      setPointLog(l=>[{icon:"💬",label:"첫 대화 시작",pt:10,type:"earn",date:"방금 전"},...l]);
    }
    setTimeout(() => setMsgs(m => [...m, { id:m.length+1, me:false, text:"앗 정말요? 저희 같이 산책해요! 🐕" }]), 900);
  }

  function logout() {
    setLoggedIn(false); setUser(null); setPw(""); setNick(""); setErr(""); setSignup(false);
    setMatches([]); setLiked([]); setIdx(0); setTab("home"); setChatPet(null);
    // 저장된 이메일 복원
    if (savedEmail) { setEmail(savedEmail); } else { setEmail(""); }
    // 자동로그인 데이터가 있으면 바로 로그인 화면에서 보여줌
    if (autoLoginReady) {
      setEmail(savedEmail); setPw(savedPw); setAutoLogin(true); setSaveEmail(true);
    }
  }

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
            <button key={label} onClick={() => { setSignup(mode); setErr(""); }}
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
          {signup && (
            <div>
              <label style={{fontWeight:600,fontSize:14,color:"#374151",display:"block",marginBottom:5}}>닉네임</label>
              <div style={{display:"flex",gap:8}}>
                <input type="text" placeholder="몽이엄마" value={nick}
                  onChange={e=>{setNick(e.target.value);setNickAvail(null);}}
                  onKeyDown={e=>e.key==="Enter"&&submit()}
                  style={{flex:1,padding:"12px 14px",border:`2px solid ${nickAvail==="ok"?"#16a34a":nickAvail==="dup"?"#ef4444":"#e5e7eb"}`,borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box",transition:"border-color .15s"}}/>
                <button onClick={()=>{
                  if(!nick.trim()||nick.trim().length<2){setNickAvail(null);return alert("닉네임은 2자 이상 입력해주세요.");}
                  setNickAvail("checking");
                  setTimeout(()=>{
                    const taken=[...TAKEN_NICKS,"테스트","관리자","admin","펫플"];
                    if(taken.map(n=>n.toLowerCase()).includes(nick.trim().toLowerCase())){setNickAvail("dup");}
                    else{setNickAvail("ok");}
                  },600);
                }}
                  style={{padding:"0 16px",background:G,color:"white",border:"none",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                  {nickAvail==="checking"?"확인 중...":"중복 확인"}
                </button>
              </div>
              {nickAvail==="ok" && <p style={{margin:"4px 0 0",fontSize:12,color:"#16a34a",fontWeight:600}}>✅ 사용 가능한 닉네임이에요!</p>}
              {nickAvail==="dup" && <p style={{margin:"4px 0 0",fontSize:12,color:"#ef4444",fontWeight:600}}>❌ 이미 사용 중인 닉네임이에요</p>}
            </div>
          )}
          <Input label="비밀번호" type="password" placeholder="••••••••" value={pw} onChange={setPw} hint="(6자 이상)" onEnter={submit} />

          {/* 이메일 저장 / 자동 로그인 / 비밀번호 찾기 */}
          {!signup && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:-4}}>
              <div style={{display:"flex",gap:14}}>
                {/* 이메일 저장 */}
                <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:13,color:"#6b7280",userSelect:"none"}}
                  onClick={()=>{setSaveEmail(!saveEmail); if(autoLogin && !saveEmail===false){setAutoLogin(false);}}}>
                  <div style={{width:18,height:18,borderRadius:5,border:saveEmail?"none":"2px solid #d1d5db",background:saveEmail?"linear-gradient(135deg,#ec4899,#a855f7)":"white",
                    display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0}}>
                    {saveEmail && <span style={{color:"white",fontSize:11,fontWeight:800}}>✓</span>}
                  </div>
                  이메일 저장
                </label>
                {/* 자동 로그인 */}
                <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:13,color:"#6b7280",userSelect:"none"}}
                  onClick={()=>{const next=!autoLogin; setAutoLogin(next); if(next) setSaveEmail(true);}}>
                  <div style={{width:18,height:18,borderRadius:5,border:autoLogin?"none":"2px solid #d1d5db",background:autoLogin?"linear-gradient(135deg,#ec4899,#a855f7)":"white",
                    display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0}}>
                    {autoLogin && <span style={{color:"white",fontSize:11,fontWeight:800}}>✓</span>}
                  </div>
                  자동 로그인
                </label>
              </div>
              {/* 비밀번호 찾기 */}
              <button onClick={()=>{setFindPwOpen(true);setFindPwStep(0);setFindPwEmail(email||"");setFindPwErr("");setFindPwCode("");setFindPwNewPw("");}}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:"#9ca3af",padding:0,textDecoration:"underline"}}>
                비밀번호 찾기
              </button>
            </div>
          )}

          {err && <div style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",padding:"10px 14px",borderRadius:10,fontSize:13}}>{err}</div>}

          {/* 자동 로그인 안내 */}
          {autoLoginReady && !signup && (
            <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>🔒</span>
              <div style={{flex:1}}>
                <p style={{margin:0,fontSize:13,color:"#15803d",fontWeight:600}}>자동 로그인이 설정되어 있어요</p>
                <p style={{margin:"2px 0 0",fontSize:11,color:"#6b7280"}}>{savedEmail}</p>
              </div>
              <button onClick={()=>{
                setEmail(savedEmail); setPw(savedPw);
                setUser({email:savedEmail, name:savedNick}); setLoggedIn(true);
              }} style={{background:G,color:"white",border:"none",padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                바로 로그인
              </button>
            </div>
          )}

          <button onClick={submit}
            style={{background:G,color:"white",border:"none",padding:"14px 0",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 18px rgba(236,72,153,.35)",marginTop:2}}>
            {signup ? "🐾 가입하고 시작하기" : "로그인"}
          </button>

          {/* 소셜 로그인 */}
          {!signup && (<>
            <div style={{display:"flex",alignItems:"center",gap:12,margin:"6px 0 2px"}}>
              <div style={{flex:1,height:1,background:"#e5e7eb"}}/>
              <span style={{fontSize:12,color:"#9ca3af",whiteSpace:"nowrap"}}>또는</span>
              <div style={{flex:1,height:1,background:"#e5e7eb"}}/>
            </div>
            <button onClick={()=>{
              const gEmail=prompt("Google 이메일을 입력해주세요:");
              if(gEmail&&gEmail.includes("@")){
                const gNick=gEmail.split("@")[0];
                setUser({email:gEmail,name:gNick});
                setLoggedIn(true);
                if(saveEmail)setSavedEmail(gEmail);
              }
            }}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",background:"white",border:"2px solid #e5e7eb",padding:"12px 0",borderRadius:14,fontSize:14,fontWeight:600,cursor:"pointer",color:"#374151",transition:"all .15s"}}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google로 시작하기
            </button>
          </>)}

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
            onClick={()=>{setFindPwOpen(false);clearInterval(findPwTimerRef.current);}}>
            <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:24,padding:"32px 26px",width:"100%",maxWidth:380,boxShadow:"0 20px 50px rgba(0,0,0,.15)"}}>

              {/* Step 0: 이메일 입력 */}
              {findPwStep===0 && (<>
                <div style={{textAlign:"center",marginBottom:20}}>
                  <div style={{width:56,height:56,background:"linear-gradient(135deg,#fce7f3,#ede9fe)",borderRadius:16,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🔑</div>
                  <h3 style={{margin:"0 0 4px",fontSize:20,fontWeight:800}}>비밀번호 찾기</h3>
                  <p style={{margin:0,fontSize:13,color:"#9ca3af"}}>가입했던 이메일을 입력해주세요</p>
                </div>
                <input value={findPwEmail} onChange={e=>setFindPwEmail(e.target.value)} placeholder="petple@example.com" type="email"
                  style={{width:"100%",padding:"13px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:12}}/>
                {findPwErr && <p style={{margin:"0 0 10px",fontSize:13,color:"#dc2626"}}>{findPwErr}</p>}
                <button onClick={()=>{
                  if(!findPwEmail.trim()||!findPwEmail.includes("@")) return setFindPwErr("올바른 이메일을 입력해주세요.");
                  setFindPwErr(""); setFindPwStep(1); setFindPwTimer(180);
                  clearInterval(findPwTimerRef.current);
                  findPwTimerRef.current = setInterval(()=>setFindPwTimer(t=>{if(t<=1){clearInterval(findPwTimerRef.current);return 0;} return t-1;}),1000);
                }} style={{width:"100%",background:G,color:"white",border:"none",padding:"13px 0",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer"}}>
                  인증번호 받기
                </button>
              </>)}

              {/* Step 1: 인증번호 입력 */}
              {findPwStep===1 && (<>
                <div style={{textAlign:"center",marginBottom:20}}>
                  <div style={{width:56,height:56,background:"linear-gradient(135deg,#fce7f3,#ede9fe)",borderRadius:16,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>📩</div>
                  <h3 style={{margin:"0 0 4px",fontSize:20,fontWeight:800}}>인증번호 입력</h3>
                  <p style={{margin:0,fontSize:13,color:"#9ca3af"}}>{findPwEmail}로 전송된 6자리 코드를 입력해주세요</p>
                </div>
                <div style={{position:"relative",marginBottom:12}}>
                  <input value={findPwCode} onChange={e=>setFindPwCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" maxLength={6}
                    style={{width:"100%",padding:"13px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:22,fontWeight:700,outline:"none",boxSizing:"border-box",textAlign:"center",letterSpacing:12}}/>
                  <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:13,fontWeight:700,color:findPwTimer>60?"#16a34a":findPwTimer>30?"#f59e0b":"#dc2626"}}>
                    {Math.floor(findPwTimer/60)}:{String(findPwTimer%60).padStart(2,'0')}
                  </span>
                </div>
                {findPwErr && <p style={{margin:"0 0 10px",fontSize:13,color:"#dc2626"}}>{findPwErr}</p>}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{
                    setFindPwTimer(180); setFindPwCode("");
                    clearInterval(findPwTimerRef.current);
                    findPwTimerRef.current = setInterval(()=>setFindPwTimer(t=>{if(t<=1){clearInterval(findPwTimerRef.current);return 0;} return t-1;}),1000);
                    setFindPwErr("인증번호를 재전송했어요.");
                  }} style={{flex:1,background:"#f3f4f6",color:"#6b7280",border:"none",padding:"13px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>
                    재전송
                  </button>
                  <button onClick={()=>{
                    if(findPwCode.length!==6) return setFindPwErr("6자리 인증번호를 입력해주세요.");
                    if(findPwTimer<=0) return setFindPwErr("인증 시간이 만료되었어요. 재전송해주세요.");
                    clearInterval(findPwTimerRef.current); setFindPwErr(""); setFindPwStep(2);
                  }} style={{flex:2,background:G,color:"white",border:"none",padding:"13px 0",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer"}}>
                    확인
                  </button>
                </div>
              </>)}

              {/* Step 2: 새 비밀번호 설정 */}
              {findPwStep===2 && (<>
                <div style={{textAlign:"center",marginBottom:20}}>
                  <div style={{width:56,height:56,background:"linear-gradient(135deg,#fce7f3,#ede9fe)",borderRadius:16,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🔐</div>
                  <h3 style={{margin:"0 0 4px",fontSize:20,fontWeight:800}}>새 비밀번호 설정</h3>
                  <p style={{margin:0,fontSize:13,color:"#9ca3af"}}>사용할 새 비밀번호를 입력해주세요</p>
                </div>
                <input value={findPwNewPw} onChange={e=>setFindPwNewPw(e.target.value)} placeholder="새 비밀번호 (6자 이상)" type="password"
                  style={{width:"100%",padding:"13px 14px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                  <span style={{fontSize:11,padding:"3px 8px",borderRadius:8,background:findPwNewPw.length>=6?"#dcfce7":"#fef2f2",color:findPwNewPw.length>=6?"#16a34a":"#dc2626",fontWeight:600}}>
                    {findPwNewPw.length>=6?"✓":"✕"} 6자 이상
                  </span>
                  <span style={{fontSize:11,padding:"3px 8px",borderRadius:8,background:/[A-Za-z]/.test(findPwNewPw)&&/\d/.test(findPwNewPw)?"#dcfce7":"#fef2f2",color:/[A-Za-z]/.test(findPwNewPw)&&/\d/.test(findPwNewPw)?"#16a34a":"#dc2626",fontWeight:600}}>
                    {/[A-Za-z]/.test(findPwNewPw)&&/\d/.test(findPwNewPw)?"✓":"✕"} 영문+숫자
                  </span>
                </div>
                {findPwErr && <p style={{margin:"0 0 10px",fontSize:13,color:"#dc2626"}}>{findPwErr}</p>}
                <button onClick={()=>{
                  if(findPwNewPw.length<6) return setFindPwErr("비밀번호는 6자 이상이어야 합니다.");
                  setFindPwErr(""); setFindPwStep(3);
                }} style={{width:"100%",background:G,color:"white",border:"none",padding:"13px 0",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer"}}>
                  비밀번호 변경
                </button>
              </>)}

              {/* Step 3: 완료 */}
              {findPwStep===3 && (<>
                <div style={{textAlign:"center",padding:"10px 0"}}>
                  <div style={{width:64,height:64,background:"linear-gradient(135deg,#dcfce7,#bbf7d0)",borderRadius:"50%",margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>✅</div>
                  <h3 style={{margin:"0 0 8px",fontSize:20,fontWeight:800}}>비밀번호 변경 완료!</h3>
                  <p style={{margin:"0 0 20px",fontSize:13,color:"#9ca3af"}}>새 비밀번호로 로그인해주세요</p>
                  <button onClick={()=>{setFindPwOpen(false);setPw("");}}
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
      {showAlarm && <div onClick={() => setShowAlarm(false)} style={{position:"fixed",inset:0,zIndex:19}} />}

      {/* 헤더 */}
      <div style={{background:"white",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #f3f4f6",position:"sticky",top:0,zIndex:20}}>
        {tab==="chat" ? (
          <>
            <button onClick={() => setTab("messages")} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,lineHeight:1,padding:4}}>←</button>
            <div onClick={()=>setViewUserProfile({name:chatPet?.name,img:chatPet?.img,location:chatPet?.location||"인천 연수구",bio:chatPet?.bio||"",pets:chatPet ? [{name:chatPet.name,type:"강아지",breed:chatPet.breed||chatPet.type||"",img:chatPet.img,gender:chatPet.gender,traits:chatPet.tags||[]}] : []})}
              style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
              <img src={chatPet?.img} alt="" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover"}}/>
              <div><p style={{margin:0,fontWeight:700,fontSize:15}}>{chatPet?.name}</p><p style={{margin:0,fontSize:11,color:"#10b981"}}>온라인</p></div>
            </div>
            <div style={{width:36}} />
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
                style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:"6px 10px",borderRadius:20,background:showPoints?"#fce7f3":"transparent"}}>
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
                      {key:"match",   icon:"🎉",label:"매칭 성공",pt:15,desc:"자동 적립",color:"#fce7f3",tcolor:"#be185d", action:"auto"},
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
                        {icon:"💎",label:"슈퍼좋아요",cost:30,desc:"매칭 확률 100%"},
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

                  {/* 프리미엄 기능 (잠금) */}
                  <div style={{background:"#f9fafb",border:"2px dashed #e5e7eb",borderRadius:16,padding:16,marginBottom:16,position:"relative"}}>
                    <div style={{position:"absolute",top:-8,right:12,background:"#f59e0b",color:"white",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:10}}>SOON</div>
                    <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14}}>🔓 프리미엄 기능 (출시 예정)</p>
                    <div style={{display:"flex",flexDirection:"column",gap:8,opacity:.6}}>
                      {[
                        {icon:"👀",label:"나를 좋아한 사람 보기",cost:200},
                        {icon:"🔥",label:"프로필 부스트 (3일간)",cost:300},
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

      {/* 알람 드롭다운 */}
      {showAlarm && (
        <div style={{position:"fixed",top:65,right:16,background:"white",borderRadius:20,boxShadow:"0 8px 32px rgba(0,0,0,.15)",padding:20,zIndex:30,width:300}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{margin:0,fontSize:15,fontWeight:800}}>알림</h3>
            <button onClick={() => setShowAlarm(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#9ca3af"}}>✕</button>
          </div>
          {alarms.map(a => (
            <div key={a.id} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid #f9fafb",background:a.unread?"#fdf2f8":"white",borderRadius:10,paddingLeft:a.unread?8:0,marginBottom:2}}>
              <span style={{fontSize:22,flexShrink:0}}>{a.icon}</span>
              <div style={{flex:1}}><p style={{margin:"0 0 2px",fontSize:13,fontWeight:a.unread?600:400,color:"#1f2937"}}>{a.text}</p><p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{a.time}</p></div>
              {a.unread && <span style={{width:8,height:8,background:"#ec4899",borderRadius:"50%",marginTop:4,flexShrink:0}} />}
            </div>
          ))}
        </div>
      )}

      {/* 홈 */}
      {tab==="home" && (
        <div style={{padding:"20px 16px"}}>
          <div style={{background:"white",borderRadius:24,boxShadow:"0 8px 32px rgba(0,0,0,.1)",overflow:"hidden",
            transform:anim==="L"?"translateX(-110%) rotate(-18deg)":anim==="R"?"translateX(110%) rotate(18deg)":anim==="U"?"translateY(-100%)":"none",
            opacity:anim?0:1,transition:anim?"all .32s ease":"none"}}>
            <div style={{position:"relative",height:370}}>
              <img src={pet.img} alt={pet.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 55%,rgba(0,0,0,.65))"}} />
              <div style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,.92)",backdropFilter:"blur(6px)",padding:"5px 11px",borderRadius:20,fontSize:13,fontWeight:700}}>⭐ {pet.score}</div>
              <div style={{position:"absolute",bottom:14,left:14,background:"rgba(0,0,0,.5)",color:"white",padding:"4px 10px",borderRadius:20,fontSize:12}}>📍 {pet.dist}</div>
            </div>
            <div style={{padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <h2 style={{margin:"0 0 3px",fontSize:24,fontWeight:800}}>{pet.name}</h2>
                  <p style={{margin:0,color:"#6b7280",fontSize:14}}>{pet.breed} · {pet.age}살 · {pet.gender}</p>
                </div>
                <span style={{background:"#ede9fe",color:"#7c3aed",padding:"5px 12px",borderRadius:20,fontSize:13,fontWeight:700}}>{pet.score}점</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                {pet.tags.map((t,i) => <span key={i} style={{background:"#fce7f3",color:"#be185d",padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>{t}</span>)}
              </div>
              <p style={{margin:"0 0 14px",fontSize:14,color:"#374151",lineHeight:1.6}}>{pet.bio}</p>
              <div style={{background:"#f9fafb",borderRadius:12,padding:12,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,background:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,flexShrink:0}}>{pet.owner[0]}</div>
                <div><p style={{margin:"0 0 1px",fontWeight:600,fontSize:14}}>{pet.owner}</p><p style={{margin:0,color:"#9ca3af",fontSize:12}}>{pet.location}</p></div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:20,marginTop:24}}>
            <button onClick={() => swipe("L")} style={{width:62,height:62,background:"white",border:"none",borderRadius:"50%",cursor:"pointer",fontSize:26,boxShadow:"0 4px 16px rgba(0,0,0,.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>❌</button>
            <button onClick={() => swipe("U")} style={{width:76,height:76,background:"linear-gradient(135deg,#fbbf24,#f59e0b)",border:"none",borderRadius:"50%",cursor:"pointer",fontSize:32,boxShadow:"0 6px 20px rgba(251,191,36,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>⭐</button>
            <button onClick={() => swipe("R")} style={{width:62,height:62,background:"white",border:"none",borderRadius:"50%",cursor:"pointer",fontSize:26,boxShadow:"0 4px 16px rgba(0,0,0,.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>🐾</button>
          </div>
          <p style={{textAlign:"center",fontSize:12,color:"#d1d5db",marginTop:10}}>❌ 패스 &nbsp;|&nbsp; ⭐ 수제간식 &nbsp;|&nbsp; 🐾 좋아요</p>
        </div>
      )}

      {/* 탐색 */}
      {tab==="explore" && (
        <div style={{padding:"20px 16px"}}>
          <h2 style={{margin:"0 0 16px",fontSize:22,fontWeight:800}}>근처 펫친 탐색</h2>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {["1km","3km","5km","10km"].map((d,i) => (
              <button key={d} style={{padding:"6px 16px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,background:i===1?G:"#f3f4f6",color:i===1?"white":"#6b7280"}}>{d}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {PETS.map(p => (
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
        </div>
      )}

      {/* 라운지 */}
      {tab==="community" && !selectedPost && (
        <div>
          {/* 카테고리 탭 */}
          <div style={{background:"white",borderBottom:"1px solid #f3f4f6",position:"sticky",top:57,zIndex:9}}>
            {!loungeExpanded ? (
              // 접힌 상태: 가로 스크롤 + 우측 펼치기 화살표
              <div style={{display:"flex",alignItems:"center"}}>
                <div style={{flex:1,display:"flex",overflowX:"auto",padding:"10px 0 10px 12px",gap:6,scrollbarWidth:"none"}}>
                  {LOUNGE_CATS.map(c=>(
                    <button key={c.key} onClick={()=>setLoungeCat(c.key)}
                      style={{flexShrink:0,padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",
                        fontWeight:700,fontSize:12,whiteSpace:"nowrap",
                        background:loungeCat===c.key?"linear-gradient(135deg,#ec4899,#a855f7)":"#f3f4f6",
                        color:loungeCat===c.key?"white":"#6b7280",
                        boxShadow:loungeCat===c.key?"0 2px 8px rgba(236,72,153,.3)":"none"}}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
                {/* 펼치기 화살표 버튼 */}
                <button onClick={()=>setLoungeExpanded(true)}
                  style={{flexShrink:0,width:36,height:36,margin:"0 8px",background:"linear-gradient(135deg,#ec4899,#a855f7)",border:"none",borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(236,72,153,.3)",color:"white",fontSize:14,fontWeight:800}}>
                  ›
                </button>
              </div>
            ) : (
              // 펼친 상태: 전체 그리드 + 접기 버튼
              <div style={{padding:"12px 12px 8px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#374151"}}>전체 카테고리</span>
                  <button onClick={()=>setLoungeExpanded(false)}
                    style={{background:"#f3f4f6",border:"none",borderRadius:20,cursor:"pointer",padding:"5px 12px",fontSize:12,fontWeight:700,color:"#6b7280",display:"flex",alignItems:"center",gap:4}}>
                    ‹ 접기
                  </button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,paddingBottom:4}}>
                  {LOUNGE_CATS.map(c=>(
                    <button key={c.key} onClick={()=>{setLoungeCat(c.key);setLoungeExpanded(false);}}
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
            )}
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
                  <p style={{color:"#9ca3af",fontSize:14}}>아직 글이 없어요</p>
                  <p style={{color:"#d1d5db",fontSize:12,marginTop:4}}>첫 번째 글을 작성해보세요!</p>
                </div>
              );

              return filtered.map(p => {
                const catInfo = LOUNGE_CATS.find(c=>c.key===p.cat)||{icon:"🐾",label:p.cat};
                const isLiked = p.likes.includes(user?.name);
                const openAuthorProfile = (e) => {
                  e.stopPropagation();
                  setViewUserProfile({name:p.by,img:null,location:"인천 연수구",bio:"",pets:[]});
                };
                return (
                  <div key={p.id} onClick={()=>setSelectedPost(p)}
                    style={{background:"white",borderRadius:18,padding:16,marginBottom:10,boxShadow:"0 2px 8px rgba(0,0,0,.05)",cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div onClick={openAuthorProfile} style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#fce7f3,#ede9fe)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,cursor:"pointer"}}>
                        {p.by?.[0]||"🐾"}
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
          setPosts(ps => ps.map(p => p.id===post.id
            ? {...p, likes: isLiked ? p.likes.filter(n=>n!==user?.name) : [...p.likes, user?.name]}
            : p));
          setSelectedPost(p => ({...p, likes: isLiked ? p.likes.filter(n=>n!==user?.name) : [...p.likes, user?.name]}));
          if (!isLiked && post.by !== user?.name) {
            setAlarms(a=>[{id:Date.now(),icon:"❤️",text:`${user?.name}님이 회원님의 글에 좋아요를 눌렀어요`,time:"방금 전",unread:true},...a]);
          }
        };

        const addComment = () => {
          if (!commentVal.trim()) return;
          const newC = {id:Date.now(),by:user?.name,text:commentVal.trim(),time:"방금 전",likes:[],replies:[]};
          setPosts(ps=>ps.map(p=>p.id===post.id ? {...p,comments:[...p.comments,newC]} : p));
          setSelectedPost(p=>({...p,comments:[...p.comments,newC]}));
          setCommentVal("");
          if (post.by !== user?.name) {
            setAlarms(a=>[{id:Date.now(),icon:"💬",text:`${user?.name}님이 댓글을 달았어요: "${commentVal.trim().slice(0,20)}..."`,time:"방금 전",unread:true},...a]);
          }
        };

        const addReply = (commentId) => {
          if (!replyVal.trim()) return;
          const newR = {id:Date.now(),by:user?.name,text:replyVal.trim(),time:"방금 전"};
          const updateComments = cs => cs.map(c => c.id===commentId ? {...c,replies:[...c.replies,newR]} : c);
          setPosts(ps=>ps.map(p=>p.id===post.id ? {...p,comments:updateComments(p.comments)} : p));
          setSelectedPost(p=>({...p,comments:updateComments(p.comments)}));
          const comment = post.comments.find(c=>c.id===commentId);
          setReplyTarget(null); setReplyVal("");
          if (comment && comment.by !== user?.name) {
            setAlarms(a=>[{id:Date.now(),icon:"↩️",text:`${user?.name}님이 대댓글을 달았어요`,time:"방금 전",unread:true},...a]);
          }
        };

        const likeComment = (commentId) => {
          const updateCs = cs => cs.map(c => c.id===commentId
            ? {...c, likes: c.likes.includes(user?.name) ? c.likes.filter(n=>n!==user?.name) : [...c.likes,user?.name]}
            : c);
          setPosts(ps=>ps.map(p=>p.id===post.id ? {...p,comments:updateCs(p.comments)} : p));
          setSelectedPost(p=>({...p,comments:updateCs(p.comments)}));
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
                <div onClick={()=>setViewUserProfile({name:post.by,img:null,location:"인천 연수구",bio:"",pets:[]})}
                  style={{width:42,height:42,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white",fontWeight:700,cursor:"pointer"}}>
                  {post.by?.[0]||"🐾"}
                </div>
                <div style={{cursor:"pointer"}} onClick={()=>setViewUserProfile({name:post.by,img:null,location:"인천 연수구",bio:"",pets:[]})}>
                  <p style={{margin:0,fontWeight:700,fontSize:14}}>{post.by}</p>
                  <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{post.ago}</p>
                </div>
              </div>
              <p style={{margin:"0 0 12px",fontSize:15,color:"#1f2937",lineHeight:1.7}}>{post.content}</p>
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
                      <div style={{width:34,height:34,borderRadius:"50%",background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,fontWeight:700}}>
                        {c.by?.[0]||"🐾"}
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
          <div style={{padding:"14px 20px",borderBottom:"1px solid #f3f4f6"}}>
            <h2 style={{margin:0,fontSize:20,fontWeight:800}}>멍냥톡 <span style={{fontSize:14,color:"#9ca3af",fontWeight:400}}>({matches.length})</span></h2>
          </div>
          {matches.length===0 ? (
            <div style={{textAlign:"center",padding:"70px 20px"}}>
              <p style={{fontSize:48,margin:"0 0 12px"}}>💬</p>
              <p style={{color:"#9ca3af",fontSize:15}}>아직 매칭된 펫친이 없어요</p>
              <p style={{color:"#d1d5db",fontSize:13,marginTop:4}}>카드를 넘겨 펫친을 만나보세요!</p>
              <button onClick={() => setTab("home")} style={{marginTop:20,background:G,color:"white",border:"none",padding:"11px 22px",borderRadius:20,fontWeight:700,cursor:"pointer",fontSize:14,boxShadow:"0 4px 14px rgba(236,72,153,.35)"}}>펫친 찾으러 가기 🐾</button>
            </div>
          ) : matches.map((m,i) => {
            const petData = PETS.find(p=>p.owner===m.name||p.name===m.name);
            const buildProfile = () => setViewUserProfile({name:m.name,img:m.img,location:petData?.location||"인천 연수구",bio:petData?.bio||"",pets:petData?[{name:petData.name,type:"강아지",breed:petData.breed,img:petData.img,gender:petData.gender,traits:petData.tags}]:[]});
            return (
            <div key={i} onClick={() => openChat(m)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:"1px solid #f9fafb",cursor:"pointer",background:"white"}}>
              <div onClick={e=>{e.stopPropagation();buildProfile();}} style={{position:"relative",cursor:"pointer"}}>
                <img src={m.img} alt={m.name} style={{width:52,height:52,borderRadius:"50%",objectFit:"cover"}} />
                <span style={{position:"absolute",bottom:1,right:1,width:12,height:12,background:"#10b981",borderRadius:"50%",border:"2px solid white"}} />
              </div>
              <div style={{flex:1}}>
                <p style={{margin:"0 0 2px",fontWeight:700,fontSize:15}}>{m.name}</p>
                <p style={{margin:0,color:"#9ca3af",fontSize:13}}>새로운 매칭 🎉 대화를 시작해보세요!</p>
              </div>
              <span style={{width:10,height:10,background:"#ec4899",borderRadius:"50%"}} />
            </div>
            );
          })}
        </div>
      )}

      {/* 채팅 */}
      {tab==="chat" && (
        <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 65px)"}}>
          <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
            {msgs.map(m => (
              <div key={m.id} style={{display:"flex",justifyContent:m.me?"flex-end":"flex-start",alignItems:"flex-end",gap:8}}>
                {!m.me && <img onClick={()=>{const pd=PETS.find(p=>p.owner===chatPet?.name||p.name===chatPet?.name);setViewUserProfile({name:chatPet?.name,img:chatPet?.img,location:pd?.location||"인천 연수구",bio:pd?.bio||"",pets:pd?[{name:pd.name,type:"강아지",breed:pd.breed,img:pd.img,gender:pd.gender,traits:pd.tags}]:[]});}} src={chatPet?.img} alt="" style={{width:30,height:30,borderRadius:"50%",objectFit:"cover",cursor:"pointer",flexShrink:0}} />}
                <div style={{maxWidth:"72%",padding:"10px 14px",borderRadius:m.me?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.me?G:"white",color:m.me?"white":"#1f2937",fontSize:14,boxShadow:"0 2px 8px rgba(0,0,0,.07)",lineHeight:1.5}}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:"12px 14px",background:"white",borderTop:"1px solid #f3f4f6",display:"flex",gap:10}}>
            <input value={msgVal} onChange={e => setMsgVal(e.target.value)} onKeyPress={e => e.key==="Enter"&&sendMsg()} placeholder="메시지를 입력하세요..."
              style={{flex:1,padding:"10px 16px",border:"2px solid #f3f4f6",borderRadius:24,fontSize:14,outline:"none"}} />
            <button onClick={sendMsg} disabled={!msgVal.trim()}
              style={{width:44,height:44,background:G,border:"none",borderRadius:"50%",cursor:"pointer",color:"white",fontSize:18,opacity:msgVal.trim()?1:.4,display:"flex",alignItems:"center",justifyContent:"center"}}>➤</button>
          </div>
        </div>
      )}

      {/* 프로필 */}
      {tab==="profile" && (
        <div style={{paddingBottom:20}}>
          {/* 상단 커버 + 프로필 사진 */}
          <div style={{position:"relative",marginBottom:60}}>
            <div style={{height:120,background:"linear-gradient(135deg,#fce7f3,#ede9fe)"}} />
            {/* 프로필 대표사진 */}
            <div style={{position:"absolute",bottom:-44,left:20,width:88,height:88,borderRadius:"50%",border:"4px solid white",overflow:"hidden",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,color:"white",fontWeight:800,boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>
              {profilePhotos[profileRepIdx]
                ? <img src={profilePhotos[profileRepIdx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                : user?.name?.[0]||"🐾"}
            </div>
            {/* 수정 버튼 */}
            <button onClick={() => { setEditBioVal(profileBio); setEditNickVal(user?.name||""); setIsEditProfile(true); }}
              style={{position:"absolute",bottom:-36,right:16,background:G,color:"white",border:"none",padding:"8px 18px",borderRadius:20,fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 2px 10px rgba(236,72,153,.3)"}}>
              ✏️ 프로필 수정
            </button>
          </div>

          {/* 이름 + 문구 */}
          <div style={{padding:"0 20px 16px",borderBottom:"1px solid #f3f4f6"}}>
            <h2 style={{margin:"0 0 2px",fontSize:20,fontWeight:800}}>{user?.name}</h2>
            <p style={{margin:"0 0 6px",fontSize:13,color:"#6b7280"}}>{user?.email}</p>
            {/* 위치 + GPS 재설정 */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:13,color:"#374151",display:"flex",alignItems:"center",gap:4}}>
                📍 {userLocation}
              </span>
              <button onClick={()=>{
                setLocationLoading(true);
                if(navigator.geolocation){
                  navigator.geolocation.getCurrentPosition(
                    pos=>{
                      const {latitude:lat,longitude:lng}=pos.coords;
                      // 실제 앱에서는 역지오코딩 API 사용. 데모에서는 좌표 기반 근사치 표시
                      const regions=[
                        {name:"인천 연수구",lat:37.41,lng:126.68},
                        {name:"인천 중구",lat:37.47,lng:126.62},
                        {name:"인천 남동구",lat:37.44,lng:126.73},
                        {name:"인천 부평구",lat:37.49,lng:126.72},
                        {name:"서울 강남구",lat:37.51,lng:127.06},
                      ];
                      let closest=regions[0],minDist=Infinity;
                      regions.forEach(r=>{
                        const d=Math.sqrt((r.lat-lat)**2+(r.lng-lng)**2);
                        if(d<minDist){minDist=d;closest=r;}
                      });
                      setUserLocation(closest.name+` (${lat.toFixed(3)},${lng.toFixed(3)})`);
                      setLocationLoading(false);
                    },
                    _=>{
                      // 권한 거부 등 실패 시 데모 텍스트로 처리
                      const demos=["인천 연수구","인천 송도","인천 중구","연수구 센트럴파크"];
                      setUserLocation(demos[Math.floor(Math.random()*demos.length)]);
                      setLocationLoading(false);
                    },
                    {timeout:5000,maximumAge:0}
                  );
                } else {
                  setUserLocation("위치 사용 불가");
                  setLocationLoading(false);
                }
              }} style={{display:"flex",alignItems:"center",gap:5,background:locationLoading?"#f3f4f6":"linear-gradient(135deg,#ec4899,#a855f7)",color:locationLoading?"#9ca3af":"white",border:"none",borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:locationLoading?"not-allowed":"pointer",boxShadow:locationLoading?"none":"0 2px 8px rgba(236,72,153,.25)",transition:"all .2s"}}>
                {locationLoading
                  ? <><span style={{display:"inline-block",animation:"spin 1s linear infinite",fontSize:13}}>⟳</span> 위치 확인 중...</>
                  : <>🎯 현재 위치로 수정</>}
              </button>
            </div>
            {profileBio
              ? <p style={{margin:0,fontSize:14,color:"#374151",lineHeight:1.6,background:"#f9fafb",borderRadius:12,padding:"10px 14px"}}>{profileBio}</p>
              : <button onClick={() => { setEditBioVal(""); setEditNickVal(user?.name||""); setIsEditProfile(true); }}
                  style={{background:"#f3f4f6",border:"1px dashed #d1d5db",borderRadius:12,padding:"10px 14px",fontSize:13,color:"#9ca3af",cursor:"pointer",width:"100%",textAlign:"left"}}>
                  + 프로필 문구를 추가해보세요
                </button>
            }
          </div>

          {/* 통계 */}
          <div style={{padding:"16px 20px",borderBottom:"1px solid #f3f4f6"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,textAlign:"center"}}>
              {[[matches.length,"매칭 성공","#ec4899"],[liked.length,"보낸 좋아요","#a855f7"],[idx%PETS.length,"본 프로필","#3b82f6"]].map(([n,label,color],i)=>(
                <div key={i} style={{background:"#f9fafb",borderRadius:14,padding:"12px 8px"}}>
                  <p style={{margin:"0 0 2px",fontSize:22,fontWeight:800,color}}>{n}</p>
                  <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 나의 반려동물 */}
          <div style={{padding:"16px 20px",borderBottom:"1px solid #f3f4f6"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:800}}>🐾 나의 반려동물</h3>
              <button onClick={() => { setPetForm({name:"",type:"강아지",breed:"",birth:"",gender:"남아",food:"",traits:[],photos:[null,null,null,null,null],repIdx:0}); setIsAddPet(true); }}
                style={{background:G,color:"white",border:"none",padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ 추가하기</button>
            </div>
            {myPets.length===0
              ? <div style={{background:"#f9fafb",borderRadius:16,padding:"28px 20px",textAlign:"center"}}>
                  <p style={{fontSize:36,margin:"0 0 8px"}}>🐶</p>
                  <p style={{margin:"0 0 4px",fontWeight:600,color:"#374151"}}>아직 등록된 반려동물이 없어요</p>
                  <p style={{margin:"0 0 14px",fontSize:13,color:"#9ca3af"}}>반려동물을 등록하고 친구를 사귀어보세요!</p>
                  <button onClick={() => { setPetForm({name:"",type:"강아지",breed:"",birth:"",gender:"남아",food:"",traits:[],photos:[null,null,null,null,null],repIdx:0}); setIsAddPet(true); }}
                    style={{background:G,color:"white",border:"none",padding:"10px 20px",borderRadius:20,fontWeight:700,fontSize:13,cursor:"pointer"}}>반려동물 등록하기</button>
                </div>
              : <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {myPets.map((pet,i) => (
                    <div key={i} style={{background:"white",borderRadius:18,padding:14,boxShadow:"0 2px 10px rgba(0,0,0,.06)",display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:64,height:64,borderRadius:16,overflow:"hidden",background:"#f3f4f6",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
                        {pet.photos[pet.repIdx]
                          ? <img src={pet.photos[pet.repIdx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                          : "🐾"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                          <h4 style={{margin:0,fontSize:15,fontWeight:800}}>{pet.name}</h4>
                          <span style={{fontSize:11,color:"#6b7280"}}>{pet.type} · {pet.breed}</span>
                        </div>
                        <p style={{margin:"0 0 6px",fontSize:12,color:"#9ca3af"}}>{pet.gender} · {pet.birth}</p>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          {pet.traits.slice(0,3).map((t,j)=><span key={j} style={{background:"#fce7f3",color:"#be185d",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:10}}>{t}</span>)}
                          {pet.traits.length>3 && <span style={{fontSize:10,color:"#9ca3af"}}>+{pet.traits.length-3}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* 펫플러스 + 로그아웃 */}
          <div style={{padding:"16px 20px"}}>
            <div style={{background:"linear-gradient(135deg,#fef9c3,#fef3c7)",borderRadius:20,padding:18,marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:28}}>👑</span>
              <div style={{flex:1}}>
                <h3 style={{margin:"0 0 2px",fontSize:15,fontWeight:700}}>펫플 플러스</h3>
                <p style={{margin:0,fontSize:12,color:"#92400e"}}>프리미엄 서비스 출시 예정!</p>
              </div>
              <span style={{background:"#92400e",color:"white",padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>Coming Soon</span>
            </div>
            <button onClick={logout} style={{width:"100%",background:"#f3f4f6",border:"none",padding:14,borderRadius:14,color:"#6b7280",fontWeight:600,fontSize:15,cursor:"pointer",marginBottom:16}}>로그아웃</button>

            {/* 설정 & 정보 */}
            <div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:16}}>
              {[
                {icon:"📢",label:"공지사항",action:()=>alert("📢 펫플 v1.0 정식 출시!\n\n안녕하세요, 펫플팀입니다.\n반려동물 친구 만들기 서비스 펫플이 정식 출시되었습니다.\n\n많은 이용 부탁드려요! 🐾")},
                {icon:"💡",label:"자주 묻는 질문",action:()=>alert("Q. 매칭은 어떻게 되나요?\nA. 홈에서 프로필을 좌우로 스와이프하면 됩니다.\n오른쪽은 좋아요, 왼쪽은 다음에!\n\nQ. 포인트는 어떻게 모으나요?\nA. 출석체크, 매칭, 스토리 업로드 등\n활동하면 자동으로 적립돼요.\n\nQ. 결제 기능은 언제 열리나요?\nA. 빠른 시일 내에 오픈 예정이에요!")},
                {icon:"📄",label:"이용약관",action:()=>alert("펫플 서비스 이용약관\n\n제1조 (목적)\n이 약관은 펫플(이하 '서비스')의 이용 조건을 규정합니다.\n\n제2조 (이용자 의무)\n이용자는 타인의 반려동물을 존중하며 건전한 커뮤니티 문화를 유지해야 합니다.\n\n제3조 (서비스 내용)\n반려동물 매칭, 라운지, 스토리, 모임 등의 서비스를 제공합니다.\n\n자세한 내용은 서비스 내 공지를 참고해주세요.")},
                {icon:"🔒",label:"개인정보 처리방침",action:()=>alert("개인정보 처리방침\n\n펫플은 이용자의 개인정보를 중요시하며,\n관련 법령을 준수합니다.\n\n수집 항목: 이메일, 닉네임, 위치 정보\n수집 목적: 서비스 제공 및 개선\n보유 기간: 회원 탈퇴 시까지\n\n자세한 내용은 서비스 내 공지를 참고해주세요.")},
                {icon:"💬",label:"고객센터 / 문의",action:()=>alert("📮 고객센터\n\n이메일: support@petple.app\n운영시간: 평일 10:00 ~ 18:00\n\n불편 사항이나 건의 사항을\n언제든 보내주세요! 🐾")},
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

            {/* 앱 정보 */}
            <div style={{textAlign:"center",padding:"16px 0 24px",borderTop:"1px solid #f3f4f6"}}>
              <p style={{margin:"0 0 4px",fontSize:20,fontWeight:800,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🐾 펫플</p>
              <p style={{margin:"0 0 2px",fontSize:11,color:"#9ca3af"}}>v1.0.0</p>
              <p style={{margin:"0 0 8px",fontSize:11,color:"#d1d5db"}}>© 2025 Petple. All rights reserved.</p>
              <p style={{margin:0,fontSize:9,color:"#e5e7eb",lineHeight:1.8}}>
                상호: 펫플 | 대표: 김영웅 | 사업자등록번호: 743-09-03086<br/>
                이메일: support@petple.app
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 스토리 */}
      {tab==="story" && (
        <div style={{paddingBottom:20}}>
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
              {/* 내가 올린 스토리들 */}
              {myStories.map((s,i)=>(
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
              {/* 다른 유저 스토리 (샘플) */}
              {PETS.map(p=>(
                <div key={p.id} onClick={()=>setViewStory({petName:p.name,img:p.img,petIcon:"🐾",content:p.bio,by:p.owner,time:"1시간 전"})}
                  style={{flexShrink:0,textAlign:"center",cursor:"pointer"}}>
                  <div style={{width:64,height:64,borderRadius:"50%",padding:2,boxSizing:"border-box",
                    background:"linear-gradient(135deg,#ec4899,#a855f7)",overflow:"hidden"}}>
                    <img src={p.img} alt={p.name} style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover",border:"2px solid white"}}/>
                  </div>
                  <p style={{margin:"4px 0 0",fontSize:11,color:"#374151",fontWeight:600,width:64,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 그리드 피드 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px"}}>
            {[...myStories.map(s=>({...s,isMine:true})),...PETS.map(p=>({petName:p.name,img:p.img,content:p.bio,by:p.owner,time:"최근",isMine:false,petIcon:"🐾"}))].map((s,i)=>(
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
                    const petData=PETS.find(p=>p.owner===s.by||p.name===s.petName);
                    setViewUserProfile({name:s.by||user?.name,img:s.img,location:petData?.location||"인천 연수구",bio:petData?.bio||"",pets:petData?[{name:petData.name,type:"강아지",breed:petData.breed,img:petData.img,gender:petData.gender,traits:petData.tags}]:[]});
                  }} style={{margin:0,fontSize:11,opacity:.8,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}>{s.by||user?.name}</p>
                </div>
                {s.isMine && <div style={{position:"absolute",top:8,right:8,background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:8}}>내 스토리</div>}
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
                setMyStories(ss=>[...ss,{petName:pet.name,petIcon:"🐾",img:storyImg,content:storyContent,by:user?.name,time:"방금 전",isMine:true}]);
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
      {viewStory && (
        <div onClick={()=>setViewStory(null)} style={{position:"fixed",inset:0,zIndex:70,background:"black",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <button onClick={()=>setViewStory(null)} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.2)",border:"none",color:"white",width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:18,zIndex:2}}>✕</button>
          {/* 상단 바 */}
          <div style={{position:"absolute",top:0,left:0,right:0,padding:"16px 20px",background:"linear-gradient(to bottom,rgba(0,0,0,.6),transparent)",zIndex:2}}>
            <div onClick={e=>{e.stopPropagation();setViewUserProfile({name:viewStory.by,img:viewStory.img,location:"인천 연수구",bio:"",pets:[]});}}
              style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",width:"fit-content"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"white",fontWeight:700}}>{viewStory.by?.[0]||"🐾"}</div>
              <div>
                <p style={{margin:0,fontWeight:700,fontSize:14,color:"white"}}>{viewStory.petName}</p>
                <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,.7)"}}>{viewStory.by} · {viewStory.time}</p>
              </div>
            </div>
          </div>
          {viewStory.img
            ? <img src={viewStory.img} alt="" style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}}/>
            : <div style={{width:200,height:200,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:80}}>{viewStory.petIcon||"🐾"}</div>}
          {viewStory.content && (
            <div style={{position:"absolute",bottom:40,left:0,right:0,padding:"0 24px",zIndex:2}}>
              <div style={{background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)",borderRadius:16,padding:"12px 16px"}}>
                <p style={{margin:0,fontSize:15,color:"white",lineHeight:1.6}}>{viewStory.content}</p>
              </div>
            </div>
          )}
        </div>
      )}
      {/* 모임 */}
      {tab==="meeting" && meetingView==="list" && (
        <div style={{paddingBottom:20}}>
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
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1,position:"relative"}}>
                <select value={meetSearch.region} onChange={e=>setMeetSearch(s=>({...s,region:e.target.value}))}
                  style={{width:"100%",padding:"8px 28px 8px 10px",border:"2px solid #e5e7eb",borderRadius:10,fontSize:12,outline:"none",appearance:"none",background:"white",color:meetSearch.region?"#1f2937":"#9ca3af",boxSizing:"border-box"}}>
                  <option value="">📍 지역 전체</option>
                  {["인천 연수구","인천 중구","인천 남동구","인천 부평구"].map(r=><option key={r} value={r}>{r}</option>)}
                </select>
                <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#9ca3af",fontSize:11}}>▾</span>
              </div>
              <div style={{flex:1,position:"relative"}}>
                <select value={meetSearch.animal} onChange={e=>setMeetSearch(s=>({...s,animal:e.target.value}))}
                  style={{width:"100%",padding:"8px 28px 8px 10px",border:"2px solid #e5e7eb",borderRadius:10,fontSize:12,outline:"none",appearance:"none",background:"white",color:meetSearch.animal?"#1f2937":"#9ca3af",boxSizing:"border-box"}}>
                  <option value="">🐾 동물 전체</option>
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
              if(meetSearch.region && m.region!==meetSearch.region) return false;
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
                  <label style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:4,display:"block"}}>지역</label>
                  <select value={newMeetForm.region} onChange={e=>setNewMeetForm(f=>({...f,region:e.target.value}))}
                    style={{width:"100%",padding:"10px 12px",border:"2px solid #e5e7eb",borderRadius:12,fontSize:13,outline:"none",background:"white"}}>
                    {["인천 연수구","인천 중구","인천 남동구","인천 부평구","인천 서구","인천 미추홀구"].map(r=><option key={r} value={r}>{r}</option>)}
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
                const nm={id:Date.now(),title:newMeetForm.title.trim(),region:newMeetForm.region,animal:newMeetForm.animal,
                  desc:newMeetForm.desc.trim(),max:newMeetForm.max,tags:[],
                  members:[{name:user?.name,role:"운영자",joined:new Date().toISOString().slice(0,7).replace("-",".")}],
                  greetings:[],board:[],photos:[],votes:[],chats:[],pending:[],myJoined:true};
                setMeetings(ms=>[nm,...ms]);
                setIsCreateMeeting(false);
                setNewMeetForm({title:"",region:"인천 연수구",animal:"강아지",desc:"",max:10});
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
          {key:"members",label:"멤버",icon:"👥"},
          {key:"greet",  label:"가입인사",icon:"👋"},
          {key:"board",  label:"게시판",icon:"📋"},
          {key:"photos", label:"사진첩",icon:"📸"},
          {key:"vote",   label:"투표",icon:"🗳️"},
          {key:"chat",   label:"채팅",icon:"💬"},
          {key:"manage", label:"가입관리",icon:"⚙️"},
        ];

        const updMeeting = fn => {
          setMeetings(ms=>ms.map(x=>x.id===m.id?fn(x):x));
          setSelectedMeeting(fn(m));
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
                  <button key={t.key} onClick={()=>setMeetingTab(t.key)}
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

              {/* 멤버 */}
              {meetingTab==="members" && (
                <div>
                  {m.members.map((mb,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"white",borderRadius:14,marginBottom:8,boxShadow:"0 2px 6px rgba(0,0,0,.04)"}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white",fontWeight:700,flexShrink:0,overflow:"hidden"}}>
                        {(mb.name===user?.name && profilePhotos[profileRepIdx]) ? <img src={profilePhotos[profileRepIdx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : MEMBER_AVATARS[mb.name] ? <img src={MEMBER_AVATARS[mb.name]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : mb.name[0]}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <p style={{margin:0,fontWeight:700,fontSize:14}}>{mb.name}</p>
                          {mb.role==="운영자" && <span style={{background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:8}}>운영자</span>}
                        </div>
                        <p style={{margin:0,fontSize:12,color:"#9ca3af"}}>가입 {mb.joined}</p>
                      </div>
                    </div>
                  ))}
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
                              setAlarms(a=>[{id:Date.now(),icon:"🏃",text:`${p.name}님이 모임에 가입했어요!`,time:"방금 전",unread:true},...a]);
                            }} style={{flex:1,background:G,color:"white",border:"none",padding:"9px 0",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer"}}>승인</button>
                            <button onClick={()=>updMeeting(x=>({...x,pending:x.pending.filter((_,j)=>j!==i)}))}
                              style={{flex:1,background:"#f3f4f6",color:"#6b7280",border:"none",padding:"9px 0",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer"}}>거절</button>
                          </div>
                        )}
                      </div>
                    ))
                  }
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

      {/* 관심 */}
      {tab==="interest" && (
        <div style={{padding:"16px"}}>
          <h2 style={{margin:"0 0 4px",fontSize:22,fontWeight:800}}>관심</h2>
          <p style={{margin:"0 0 16px",fontSize:13,color:"#9ca3af"}}>좋아요를 보낸 펫친이에요 💗</p>
          {liked.length===0 && matches.length===0 ? (
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <p style={{fontSize:48,margin:"0 0 12px"}}>💗</p>
              <p style={{color:"#9ca3af",fontSize:15}}>아직 관심 표시한 펫친이 없어요</p>
              <button onClick={() => setTab("home")} style={{marginTop:20,background:G,color:"white",border:"none",padding:"11px 22px",borderRadius:20,fontWeight:700,cursor:"pointer",fontSize:14}}>펫친 찾으러 가기 🐾</button>
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[...matches,...liked].map((p,i) => (
                <div key={i} style={{background:"white",borderRadius:18,overflow:"hidden",boxShadow:"0 4px 12px rgba(0,0,0,.06)",cursor:"pointer"}} onClick={() => { if(matches.includes(p)) { openChat(p); } }}>
                  <div style={{position:"relative",height:150}}>
                    <img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                    {matches.includes(p) && <div style={{position:"absolute",top:8,right:8,background:"linear-gradient(135deg,#ec4899,#a855f7)",color:"white",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20}}>매칭됨</div>}
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
        </div>
      )}

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
                  id: Date.now(), cat:postForm.cat, by:user?.name, ago:"방금 전", ts:Date.now(),
                  content:postForm.content.trim(), imgs:postForm.imgs,
                  likes:[], comments:[]
                };
                setPosts(ps=>[newPost,...ps]);
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
            reader.onload = ev => setProfilePhotos(arr => { const n=[...arr]; n[activeProfileSlot]=ev.target.result; return n; });
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
          <div onClick={() => setIsAddPet(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.45)",backdropFilter:"blur(2px)"}} />

          {/* 숨겨진 파일 인풋 */}
          <input ref={petFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => setPetForm(f => { const p=[...f.photos]; p[activePetSlot]=ev.target.result; return {...f,photos:p}; });
            reader.readAsDataURL(file);
            e.target.value = "";
          }} />

          <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderRadius:"24px 24px 0 0",height:"93vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,margin:"12px auto 0",flexShrink:0}} />
            <div style={{padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f3f4f6",flexShrink:0}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:800}}>반려동물 등록</h3>
              <button onClick={() => setIsAddPet(false)} style={{background:"#f3f4f6",border:"none",cursor:"pointer",width:32,height:32,borderRadius:"50%",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
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
                setMyPets(p=>[...p,{...petForm}]);
                setIsAddPet(false);
              }} disabled={!petForm.name.trim()}
                style={{width:"100%",background:petForm.name.trim()?G:"#e5e7eb",color:petForm.name.trim()?"white":"#9ca3af",border:"none",padding:14,borderRadius:14,fontWeight:700,fontSize:16,cursor:petForm.name.trim()?"pointer":"not-allowed",boxShadow:petForm.name.trim()?"0 4px 16px rgba(236,72,153,.3)":"none"}}>
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 탭바 */}
      {tab!=="chat" && (
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderTop:"1px solid #f3f4f6",display:"flex",zIndex:10}}>
          {[["home","🏠","홈"],["community","🧡","라운지"],["story","📸","스토리"],["meeting","🏃","모임"],["interest","💗","관심"],["messages","💬","대화"],["mypage","👤","마이"]].map(([id,icon,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",padding:"8px 0 5px",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
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
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,margin:"12px auto 0",flexShrink:0}}/>
            {/* 커버 + 프로필 사진 */}
            <div style={{position:"relative",marginBottom:50,flexShrink:0}}>
              <div style={{height:90,background:"linear-gradient(135deg,#fce7f3,#ede9fe)"}}/>
              <div style={{position:"absolute",bottom:-40,left:20,width:80,height:80,borderRadius:"50%",border:"4px solid white",overflow:"hidden",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,color:"white",fontWeight:800,boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>
                {viewUserProfile.img
                  ? <img src={viewUserProfile.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : viewUserProfile.name?.[0]||"🐾"}
              </div>
              <button onClick={()=>setViewUserProfile(null)} style={{position:"absolute",top:12,right:14,background:"rgba(255,255,255,.85)",border:"none",cursor:"pointer",width:30,height:30,borderRadius:"50%",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"0 20px 28px"}}>
              {/* 이름 + 위치 */}
              <div style={{marginBottom:14}}>
                <h3 style={{margin:"0 0 3px",fontSize:20,fontWeight:800}}>{viewUserProfile.name}</h3>
                {viewUserProfile.location && <p style={{margin:"0 0 6px",fontSize:13,color:"#6b7280"}}>📍 {viewUserProfile.location}</p>}
                {viewUserProfile.bio
                  ? <p style={{margin:0,fontSize:14,color:"#374151",lineHeight:1.6,background:"#f9fafb",borderRadius:12,padding:"10px 14px"}}>{viewUserProfile.bio}</p>
                  : <p style={{margin:0,fontSize:13,color:"#9ca3af",fontStyle:"italic"}}>아직 프로필 문구가 없어요</p>}
              </div>
              {/* 반려동물 */}
              {viewUserProfile.pets && viewUserProfile.pets.length>0 && (
                <div style={{marginBottom:14}}>
                  <h4 style={{margin:"0 0 10px",fontSize:14,fontWeight:800}}>🐾 반려동물</h4>
                  {viewUserProfile.pets.map((pet,i)=>(
                    <div key={i} style={{display:"flex",gap:10,alignItems:"center",background:"#f9fafb",borderRadius:14,padding:"10px 12px",marginBottom:8}}>
                      <div style={{width:46,height:46,borderRadius:12,background:"#e5e7eb",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                        {pet.img ? <img src={pet.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "🐾"}
                      </div>
                      <div>
                        <p style={{margin:"0 0 2px",fontWeight:700,fontSize:14}}>{pet.name}</p>
                        <p style={{margin:0,fontSize:12,color:"#6b7280"}}>{[pet.type,pet.breed,pet.gender].filter(Boolean).join(" · ")}</p>
                        {pet.traits?.length>0 && <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>{pet.traits.slice(0,4).map((t,j)=><span key={j} style={{background:"#fce7f3",color:"#be185d",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:10}}>{t}</span>)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* 빈 반려동물 */}
              {(!viewUserProfile.pets || viewUserProfile.pets.length===0) && (
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
              <button onClick={()=>{
                setDeleteAccModal(false);
                setLoggedIn(false);setUser(null);setPw("");setNick("");setEmail("");
                setMatches([]);setLiked([]);setIdx(0);setTab("home");setChatPet(null);
                setPoints(0);setPointLog([]);setMyPets([]);setMyStories([]);
                setSavedEmail("");setSavedPw("");setSavedNick("");setAutoLoginReady(false);
                alert("회원 탈퇴가 완료되었습니다.\n그동안 펫플을 이용해주셔서 감사합니다. 🐾");
              }}
                style={{flex:1,background:"#ef4444",color:"white",border:"none",padding:"12px 0",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>
                탈퇴하기
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
