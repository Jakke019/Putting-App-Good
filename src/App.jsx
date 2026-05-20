import { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`;

const C = {
  black:"#0a0a0a", white:"#ffffff", red:"#dc2626", redDark:"#991b1b",
  redBg:"#fef2f2", gray100:"#f5f5f5", gray200:"#e5e5e5", gray300:"#d4d4d4",
  gray400:"#a3a3a3", gray600:"#525252", gray800:"#262626",
  winGreen:"#16a34a", winBg:"#f0fdf4", lossBg:"#fef2f2",
  amber:"#d97706", amberBg:"#fffbeb",
};

const BOOKS = [
  { name:"DraftKings", logo:"DK", bonus:"Bet $5 Get $200" },
  { name:"FanDuel",    logo:"FD", bonus:"No Sweat First Bet" },
  { name:"BetMGM",    logo:"MGM",bonus:"$1,500 Bonus Bet" },
];

const SPORTS   = ["NFL","NBA","MLB","NHL","Soccer","Tennis","MMA","Golf","NASCAR"];
const BET_TYPES = ["Moneyline","Spread","Over/Under","Parlay","Prop","Futures","Puck Line"];

// Badge tiers based on win rate + min picks
const BADGE_TIERS = [
  { label:"Sharp",   minRate:65, minPicks:20, color:C.red,      desc:"65%+ win rate, 20+ picks" },
  { label:"Solid",   minRate:55, minPicks:10, color:C.amber,    desc:"55%+ win rate, 10+ picks" },
  { label:"On Track",minRate:48, minPicks:5,  color:C.winGreen, desc:"48%+ win rate, 5+ picks" },
];

function getBadge(user) {
  const total = user.wins + user.losses;
  const pct   = total === 0 ? 0 : (user.wins / total) * 100;
  return BADGE_TIERS.find(t => pct >= t.minRate && total >= t.minPicks) || null;
}

function winRate(u) {
  const t = u.wins + u.losses;
  return t === 0 ? 0 : Math.round((u.wins / t) * 100);
}

const INITIAL_USERS = {
  you:    { id:"you",    name:"You",         handle:"@you",        avatar:"Y", wins:12, losses:5,  streak:3, friendStatus:"self" },
  mike:   { id:"mike",  name:"Mike Sharpe", handle:"@mikesharpe",avatar:"M", wins:41, losses:14, streak:8, friendStatus:"friend" },
  sarah:  { id:"sarah", name:"Sarah Bets",  handle:"@sarahbets",  avatar:"S", wins:27, losses:18, streak:2, friendStatus:"friend" },
  jordan: { id:"jordan",name:"Jordan L.",   handle:"@jlockwood",  avatar:"J", wins:9,  losses:9,  streak:0, friendStatus:"pending" },
  alex:   { id:"alex",  name:"Alex Rivera", handle:"@alexr",      avatar:"A", wins:19, losses:11, streak:5, friendStatus:"none" },
  casey:  { id:"casey", name:"Casey Moore", handle:"@caseymo",    avatar:"C", wins:6,  losses:14, streak:0, friendStatus:"none" },
};

const INITIAL_PICKS = [
  { id:1, userId:"mike",   sport:"NBA", betType:"Spread",     game:"Lakers vs Warriors", pick:"Lakers -3.5", odds:"-110", note:"LeBron off rest, Warriors missing Steph. Easy cover.", time:"2h ago", tails:34, fades:8,  result:null,  yourVote:null, comments:[
    { id:1, userId:"sarah",  text:"Tailing this all day. Line value is there.", time:"1h ago" },
    { id:2, userId:"jordan", text:"I dunno, Warriors at home are dangerous.",   time:"45m ago" },
  ]},
  { id:2, userId:"sarah",  sport:"NFL", betType:"Over/Under", game:"Chiefs vs Bills",    pick:"Over 51.5",   odds:"-115", note:"Both offenses cooking. Weather looks clean.", time:"4h ago", tails:18, fades:12, result:"win", yourVote:"tail", comments:[
    { id:1, userId:"mike", text:"Called it. Easy money.", time:"2h ago" },
  ]},
  { id:3, userId:"jordan", sport:"MLB", betType:"Moneyline",  game:"Yankees vs Red Sox", pick:"Yankees ML",  odds:"+105", note:"Cole on the mound. Value on the ML here.", time:"6h ago", tails:9, fades:21, result:null, yourVote:null, comments:[] },
  { id:4, userId:"mike",   sport:"NHL", betType:"Puck Line",  game:"Bruins vs Rangers",  pick:"Bruins -1.5", odds:"+130", note:"Bruins at home, 5-game win streak.", time:"8h ago", tails:27, fades:5, result:"loss", yourVote:null, comments:[] },
];

const INITIAL_NOTIFS = [
  { id:1, text:"Mike Sharpe posted a new NBA pick.",          time:"2h ago", read:false },
  { id:2, text:"Sarah Bets tailed your pick on Chiefs vs Bills.", time:"3h ago", read:false },
  { id:3, text:"Jordan L. sent you a friend request.",        time:"5h ago", read:true  },
];

// ── Avatar ────────────────────────────────────────────────
function Avatar({ user, size=40 }) {
  const bg = user.id==="you" ? C.black : user.id==="mike" ? C.red
    : user.id==="sarah" ? C.gray800 : user.id==="alex" ? C.redDark : C.gray600;
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      color:C.white, fontWeight:700, fontSize:size*0.38,
      fontFamily:"'Inter',sans-serif", flexShrink:0 }}>{user.avatar}</div>
  );
}

function WinPct({ pct }) {
  const color = pct>=58 ? C.winGreen : pct>=48 ? C.gray600 : C.red;
  return <span style={{ color, fontWeight:700, fontSize:12 }}>{pct}%</span>;
}

function BadgeChip({ badge }) {
  if (!badge) return null;
  return (
    <span style={{ background:badge.color, color:C.white, fontSize:9, fontWeight:800,
      padding:"2px 7px", borderRadius:3, letterSpacing:1, textTransform:"uppercase" }}>
      {badge.label}
    </span>
  );
}

function BookLink({ pick }) {
  const book = BOOKS[pick.id % BOOKS.length];
  return (
    <div style={{ marginTop:12, padding:"10px 14px", background:C.gray100,
      border:`1px solid ${C.gray200}`, borderRadius:8,
      display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:4, background:C.black,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:800, fontSize:9, color:C.white, letterSpacing:0.5 }}>{book.logo}</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:C.black }}>{book.name}</div>
          <div style={{ fontSize:11, color:C.gray600 }}>{book.bonus}</div>
        </div>
      </div>
      <button style={{ background:C.red, color:C.white, border:"none", borderRadius:5,
        padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Bet this</button>
    </div>
  );
}

// ── Comments ──────────────────────────────────────────────
function Comments({ pick, users, onAddComment }) {
  const [open, setOpen]   = useState(false);
  const [text, setText]   = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onAddComment(pick.id, text.trim());
    setText("");
  };

  return (
    <div style={{ marginTop:10 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background:"none", border:"none", cursor:"pointer",
        fontSize:12, color:C.gray600, fontWeight:600, padding:0,
        fontFamily:"'Inter',sans-serif",
      }}>
        {open ? "Hide" : "View"} comments ({pick.comments.length})
      </button>

      {open && (
        <div style={{ marginTop:8 }}>
          {pick.comments.length === 0 && (
            <div style={{ fontSize:12, color:C.gray400, marginBottom:8 }}>No comments yet. Be first.</div>
          )}
          {pick.comments.map(c => {
            const u = users[c.userId];
            return (
              <div key={c.id} style={{ display:"flex", gap:8, marginBottom:10, alignItems:"flex-start" }}>
                <Avatar user={u} size={28} />
                <div style={{ flex:1, background:C.gray100, borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:3 }}>
                    <span style={{ fontWeight:700, fontSize:12, color:C.black }}>{u.name}</span>
                    <span style={{ fontSize:10, color:C.gray400 }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize:12, color:C.gray800, lineHeight:1.5 }}>{c.text}</div>
                </div>
              </div>
            );
          })}
          {/* Add comment */}
          <div style={{ display:"flex", gap:8, marginTop:4 }}>
            <Avatar user={users.you} size={28} />
            <div style={{ flex:1, display:"flex", gap:6 }}>
              <input
                value={text} onChange={e => setText(e.target.value)}
                placeholder="Add a comment..."
                onKeyDown={e => e.key==="Enter" && submit()}
                style={{ flex:1, padding:"7px 10px", borderRadius:6,
                  border:`1.5px solid ${C.gray200}`, fontSize:12,
                  fontFamily:"'Inter',sans-serif", outline:"none", color:C.black }}
              />
              <button onClick={submit} style={{ background:C.black, color:C.white, border:"none",
                borderRadius:6, padding:"0 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pick Card ─────────────────────────────────────────────
function PickCard({ pick, users, onVote, onSetResult, onAddComment, isOwn }) {
  const user      = users[pick.userId];
  const total     = pick.tails + pick.fades;
  const tailPct   = total===0 ? 50 : Math.round((pick.tails/total)*100);
  const pct       = winRate(user);
  const badge     = getBadge(user);

  const borderColor = pick.result==="win" ? C.winGreen : pick.result==="loss" ? C.red : C.gray200;
  const cardBg      = pick.result==="win" ? C.winBg : pick.result==="loss" ? C.lossBg : C.white;

  return (
    <div style={{ border:`1.5px solid ${borderColor}`, borderRadius:12, padding:"18px",
      marginBottom:10, background:cardBg, boxShadow:"0 1px 6px rgba(0,0,0,0.06)",
      fontFamily:"'Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ display:"flex", gap:11, alignItems:"flex-start", marginBottom:14 }}>
        <Avatar user={user} size={42} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={{ fontWeight:700, fontSize:15, color:C.black }}>{user.name}</span>
            <BadgeChip badge={badge} />
            <span style={{ color:C.gray400, fontSize:13 }}>{user.handle}</span>
            <span style={{ color:C.gray200 }}>·</span>
            <span style={{ color:C.gray400, fontSize:12 }}>{pick.time}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
            <WinPct pct={pct} />
            <span style={{ color:C.gray400, fontSize:11 }}>win rate</span>
            <span style={{ color:C.gray200 }}>·</span>
            <span style={{ fontSize:11, color:C.gray400 }}>{user.wins}W {user.losses}L</span>
            {user.streak>=3 && <span style={{ fontSize:11, color:C.red, fontWeight:700 }}>{user.streak}-game streak</span>}
          </div>
        </div>
        {pick.result ? (
          <div style={{ fontWeight:800, fontSize:11, letterSpacing:1,
            color: pick.result==="win" ? C.winGreen : C.red, textTransform:"uppercase",
            background: pick.result==="win" ? "#dcfce7" : "#fee2e2",
            padding:"4px 10px", borderRadius:4 }}>
            {pick.result==="win" ? "WON" : "LOST"}
          </div>
        ) : isOwn && (
          <div style={{ display:"flex", gap:4" }}>
            <button onClick={() => onSetResult(pick.id,"win")} style={{
              background:C.winGreen, color:C.white, border:"none", borderRadius:4,
              padding:"4px 8px", fontSize:10, fontWeight:700, cursor:"pointer" }}>Won</button>
            <button onClick={() => onSetResult(pick.id,"loss")} style={{
              background:C.red, color:C.white, border:"none", borderRadius:4,
              padding:"4px 8px", fontSize:10, fontWeight:700, cursor:"pointer" }}>Lost</button>
          </div>
        )}
      </div>

      {/* Pick box */}
      <div style={{ background:C.black, borderRadius:8, padding:"14px 16px", marginBottom:12 }}>
        <div style={{ display:"flex", gap:6, marginBottom:8 }}>
          <span style={{ background:C.red, color:C.white, borderRadius:3, padding:"3px 10px", fontSize:10, fontWeight:700, letterSpacing:0.5 }}>{pick.sport}</span>
          <span style={{ background:"rgba(255,255,255,0.12)", color:C.gray200, borderRadius:3, padding:"3px 10px", fontSize:10, fontWeight:600 }}>{pick.betType}</span>
        </div>
        <div style={{ fontSize:11, color:C.gray400, marginBottom:6 }}>{pick.game}</div>
        <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
          <span style={{ fontWeight:800, fontSize:20, color:C.white, letterSpacing:-0.5 }}>{pick.pick}</span>
          <span style={{ fontSize:15, fontWeight:700, color: pick.odds.startsWith("+") ? "#4ade80" : C.white }}>{pick.odds}</span>
        </div>
        {pick.note && <div style={{ fontSize:12, color:C.gray400, marginTop:8, lineHeight:1.6, fontStyle:"italic" }}>{pick.note}</div>}
      </div>

      {/* Tail/Fade bar */}
      <div style={{ marginBottom:14 }}>
        <div style={{ height:4, borderRadius:2, background:C.gray200, overflow:"hidden", marginBottom:5 }}>
          <div style={{ height:"100%", width:`${tailPct}%`, background:C.red, borderRadius:2, transition:"width 0.4s ease" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.gray400, fontWeight:500 }}>
          <span>TAIL {pick.tails} · {tailPct}%</span>
          <span>{100-tailPct}% · {pick.fades} FADE</span>
        </div>
      </div>

      {/* Vote buttons */}
      {!isOwn && (
        pick.yourVote ? (
          <div style={{ textAlign:"center", fontSize:12, color:C.gray600, fontWeight:600,
            padding:"8px", background:C.gray100, borderRadius:6, letterSpacing:0.3 }}>
            You {pick.yourVote==="tail" ? "tailed" : "faded"} this pick
          </div>
        ) : (
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => onVote(pick.id,"tail")} style={{
              flex:1, padding:"10px 0", borderRadius:6, border:`1.5px solid ${C.black}`,
              background:C.black, color:C.white, fontWeight:700, fontSize:13,
              cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all 0.15s" }}
              onMouseOver={e=>{ e.currentTarget.style.background=C.red; e.currentTarget.style.borderColor=C.red; }}
              onMouseOut={e=>{ e.currentTarget.style.background=C.black; e.currentTarget.style.borderColor=C.black; }}
            >Tail it</button>
            <button onClick={() => onVote(pick.id,"fade")} style={{
              flex:1, padding:"10px 0", borderRadius:6, border:`1.5px solid ${C.gray200}`,
              background:C.white, color:C.gray600, fontWeight:700, fontSize:13,
              cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all 0.15s" }}
              onMouseOver={e=>{ e.currentTarget.style.background=C.gray100; }}
              onMouseOut={e=>{ e.currentTarget.style.background=C.white; }}
            >Fade</button>
          </div>
        )
      )}

      <BookLink pick={pick} />
      <Comments pick={pick} users={users} onAddComment={onAddComment} />

      <div style={{ marginTop:10, fontSize:10, color:C.gray400, textAlign:"center" }}>
        Gambling should be fun. Bet responsibly. 21+ only.
      </div>
    </div>
  );
}

// ── Post Pick Modal ───────────────────────────────────────
function PostPickModal({ onClose, onPost }) {
  const [sport,setSport]     = useState("");
  const [betType,setBetType] = useState("");
  const [game,setGame]       = useState("");
  const [pick,setPick]       = useState("");
  const [odds,setOdds]       = useState("");
  const [note,setNote]       = useState("");
  const canPost = sport && betType && game && pick && odds;

  const inp = { width:"100%", padding:"10px 12px", borderRadius:6,
    border:`1.5px solid ${C.gray200}`, fontSize:14, fontFamily:"'Inter',sans-serif",
    outline:"none", boxSizing:"border-box", marginBottom:10, color:C.black, background:C.white };
  const lbl = txt => <div style={{ fontSize:10, fontWeight:700, color:C.gray600, marginBottom:4,
    letterSpacing:1, textTransform:"uppercase" }}>{txt}</div>;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }}
      onClick={onClose}>
      <div style={{ background:C.white, borderRadius:14, padding:24, width:"100%", maxWidth:460,
        boxShadow:"0 24px 60px rgba(0,0,0,0.25)", fontFamily:"'Inter',sans-serif" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ fontWeight:800, fontSize:18, color:C.black }}>Post a Pick</span>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.gray400 }}>x</button>
        </div>
        {lbl("Sport")}
        <select value={sport} onChange={e=>setSport(e.target.value)} style={inp}>
          <option value="">Select sport...</option>
          {SPORTS.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        {lbl("Bet Type")}
        <select value={betType} onChange={e=>setBetType(e.target.value)} style={inp}>
          <option value="">Select type...</option>
          {BET_TYPES.map(b=><option key={b} value={b}>{b}</option>)}
        </select>
        {lbl("Matchup")}
        <input value={game} onChange={e=>setGame(e.target.value)} placeholder="e.g. Lakers vs Warriors" style={inp} />
        {lbl("Your Pick")}
        <input value={pick} onChange={e=>setPick(e.target.value)} placeholder="e.g. Lakers -3.5" style={inp} />
        {lbl("Odds")}
        <input value={odds} onChange={e=>setOdds(e.target.value)} placeholder="e.g. -110 or +130" style={inp} />
        {lbl("Note (optional)")}
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Why do you like this bet?"
          style={{ ...inp, height:72, resize:"none" }} />
        <div style={{ fontSize:11, color:C.gray400, marginBottom:14, lineHeight:1.6 }}>
          By posting you confirm this is for entertainment only. Bet amounts are never shown. 21+ only.
        </div>
        <button disabled={!canPost}
          onClick={() => { onPost({ sport,betType,game,pick,odds,note }); onClose(); }}
          style={{ width:"100%", padding:"13px 0", borderRadius:6,
            background: canPost ? C.red : C.gray200, color: canPost ? C.white : C.gray400,
            border:"none", fontWeight:700, fontSize:15, cursor: canPost ? "pointer" : "not-allowed",
            fontFamily:"'Inter',sans-serif" }}>Post Pick</button>
      </div>
    </div>
  );
}

// ── Responsible Gambling Modal ────────────────────────────
function RGModal({ onClose }) {
  const tips = [
    "Set a weekly budget and stick to it — only bet what you can afford to lose.",
    "Take a break if you have lost 3 bets in a row today.",
    "Never chase losses with bigger bets.",
    "Betting should be entertaining, not a way to make money.",
    "Tell a friend or family member about your limits.",
  ];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }}
      onClick={onClose}>
      <div style={{ background:C.white, borderRadius:14, padding:24, width:"100%", maxWidth:440,
        boxShadow:"0 24px 60px rgba(0,0,0,0.25)", fontFamily:"'Inter',sans-serif" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <span style={{ fontWeight:800, fontSize:18, color:C.black }}>Responsible Gambling</span>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.gray400 }}>x</button>
        </div>
        <div style={{ fontSize:12, color:C.gray600, marginBottom:16, lineHeight:1.6 }}>
          Putting is built for fun and community — not profit. Here are some guidelines to keep it that way.
        </div>
        {tips.map((t,i) => (
          <div key={i} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:C.black,
              color:C.white, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</div>
            <div style={{ fontSize:13, color:C.gray800, lineHeight:1.5 }}>{t}</div>
          </div>
        ))}
        <div style={{ background:C.redBg, border:`1px solid ${C.red}33`, borderRadius:8,
          padding:"12px 14px", marginTop:16 }}>
          <div style={{ fontWeight:700, fontSize:13, color:C.red, marginBottom:4 }}>Need help?</div>
          <div style={{ fontSize:12, color:C.gray600, lineHeight:1.6 }}>
            National Problem Gambling Helpline — free, confidential, 24/7.
          </div>
          <div style={{ fontWeight:800, fontSize:16, color:C.black, marginTop:6 }}>1-800-522-4700</div>
        </div>
        <button onClick={onClose} style={{ marginTop:16, width:"100%", padding:"11px", borderRadius:6,
          background:C.black, color:C.white, border:"none", fontWeight:700, fontSize:14,
          cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>Got it</button>
      </div>
    </div>
  );
}

// ── Friend Button ─────────────────────────────────────────
function FriendBtn({ status, onAction }) {
  if (status==="self") return null;
  if (status==="friend") return (
    <button onClick={() => onAction("remove")} style={{ background:C.white, color:C.gray600,
      border:`1.5px solid ${C.gray200}`, borderRadius:5, padding:"6px 14px",
      fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>Friends</button>
  );
  if (status==="pending") return (
    <button disabled style={{ background:C.gray100, color:C.gray400, border:`1.5px solid ${C.gray200}`,
      borderRadius:5, padding:"6px 14px", fontSize:12, fontWeight:600,
      cursor:"default", fontFamily:"'Inter',sans-serif" }}>Pending</button>
  );
  return (
    <button onClick={() => onAction("add")} style={{ background:C.red, color:C.white, border:"none",
      borderRadius:5, padding:"6px 14px", fontSize:12, fontWeight:700,
      cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>Add Friend</button>
  );
}

// ── Streak Warning Banner ─────────────────────────────────
function StreakWarning({ picks }) {
  const myPicks    = picks.filter(p => p.userId==="you" && p.result);
  const lastThree  = myPicks.slice(0,3);
  const allLosses  = lastThree.length===3 && lastThree.every(p => p.result==="loss");
  if (!allLosses) return null;
  return (
    <div style={{ background:C.amberBg, border:`1.5px solid ${C.amber}`, borderRadius:10,
      padding:"12px 16px", marginBottom:12, fontFamily:"'Inter',sans-serif" }}>
      <div style={{ fontWeight:700, fontSize:13, color:C.amber, marginBottom:3 }}>3-game losing streak</div>
      <div style={{ fontSize:12, color:C.gray600, lineHeight:1.5 }}>
        You have lost your last 3 picks. Consider taking a break before your next bet.
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────
export default function Putting() {
  const [picks,setPicks]     = useState(INITIAL_PICKS);
  const [users,setUsers]     = useState(INITIAL_USERS);
  const [notifs,setNotifs]   = useState(INITIAL_NOTIFS);
  const [view,setView]       = useState("feed");
  const [showPost,setShowPost]   = useState(false);
  const [showRG,setShowRG]       = useState(false);
  const [showNotifs,setShowNotifs] = useState(false);
  const [filter,setFilter]   = useState("all");
  const [friendsTab,setFriendsTab] = useState("friends");

  const unreadCount = notifs.filter(n => !n.read).length;

  const handleVote = (id, vote) => {
    setPicks(ps => ps.map(p => p.id===id ? {
      ...p, yourVote:vote,
      tails: vote==="tail" ? p.tails+1 : p.tails,
      fades: vote==="fade" ? p.fades+1 : p.fades,
    } : p));
  };

  const handleSetResult = (id, result) => {
    setPicks(ps => ps.map(p => {
      if (p.id !== id) return p;
      // update user record
      setUsers(us => ({
        ...us,
        you: {
          ...us.you,
          wins:   result==="win"  ? us.you.wins+1  : us.you.wins,
          losses: result==="loss" ? us.you.losses+1: us.you.losses,
          streak: result==="win"  ? us.you.streak+1 : 0,
        }
      }));
      return { ...p, result };
    }));
  };

  const handlePost = ({ sport,betType,game,pick,odds,note }) => {
    const newPick = { id:Date.now(), userId:"you", sport, betType, game, pick, odds, note,
      time:"just now", tails:0, fades:0, result:null, yourVote:null, comments:[] };
    setPicks(ps => [newPick, ...ps]);
    setNotifs(ns => [{ id:Date.now(), text:`You posted a new ${sport} pick.`, time:"just now", read:true }, ...ns]);
  };

  const handleAddComment = (pickId, text) => {
    setPicks(ps => ps.map(p => p.id!==pickId ? p : {
      ...p, comments:[...p.comments, { id:Date.now(), userId:"you", text, time:"just now" }]
    }));
  };

  const handleFriend = (userId, action) => {
    setUsers(us => ({ ...us, [userId]: { ...us[userId], friendStatus: action==="add" ? "pending" : "none" } }));
  };

  const markNotifsRead = () => setNotifs(ns => ns.map(n => ({ ...n, read:true })));

  const friendList = Object.values(users).filter(u => u.friendStatus==="friend");
  const pendingList= Object.values(users).filter(u => u.friendStatus==="pending" && u.id!=="you");
  const findList   = Object.values(users).filter(u => u.friendStatus==="none");
  const hotBettors = Object.values(users).filter(u => u.id!=="you").sort((a,b) => winRate(b)-winRate(a));

  const filteredPicks = filter==="friends"
    ? picks.filter(p => users[p.userId]?.friendStatus==="friend")
    : filter==="mine" ? picks.filter(p => p.userId==="you")
    : picks;

  const NAV = [
    {key:"feed",label:"Feed"},{key:"friends",label:"Friends"},
    {key:"leaderboard",label:"Top Bettors"},{key:"profile",label:"My Profile"},
  ];

  return (
    <>
      <style>{FONTS}</style>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; } body { background:${C.gray100}; font-family:'Inter',sans-serif; }`}</style>

      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:C.gray100 }}>

        {/* HEADER */}
        <div style={{ background:C.white, borderBottom:`1px solid ${C.gray200}`,
          padding:"14px 18px", position:"sticky", top:0, zIndex:50,
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontWeight:800, fontSize:22, color:C.black, letterSpacing:-0.5 }}>
              Putt<span style={{ color:C.red }}>ing</span>
            </div>
            <div style={{ fontSize:9, color:C.gray400, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase" }}>Proof is in the Putting.</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Notification bell */}
            <button onClick={() => { setShowNotifs(o=>!o); markNotifsRead(); }} style={{
              position:"relative", background:"none", border:"none", cursor:"pointer",
              width:36, height:36, borderRadius:"50%",
              display:"flex", alignItems:"center", justifyContent:"center",
              background: showNotifs ? C.gray100 : "none",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.black} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount>0 && (
                <div style={{ position:"absolute", top:4, right:4, width:16, height:16,
                  borderRadius:"50%", background:C.red, color:C.white,
                  fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {unreadCount}
                </div>
              )}
            </button>
            <button onClick={() => setShowPost(true)} style={{
              background:C.red, color:C.white, border:"none", borderRadius:5,
              padding:"9px 16px", fontWeight:700, fontSize:13,
              cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>+ Post</button>
          </div>
        </div>

        {/* NOTIFICATION PANEL */}
        {showNotifs && (
          <div style={{ background:C.white, borderBottom:`1px solid ${C.gray200}`, padding:"12px 16px" }}>
            <div style={{ fontWeight:700, fontSize:13, color:C.black, marginBottom:10 }}>Notifications</div>
            {notifs.map(n => (
              <div key={n.id} style={{ display:"flex", gap:10, alignItems:"flex-start",
                padding:"8px 0", borderBottom:`1px solid ${C.gray100}` }}>
                <div style={{ width:8, height:8, borderRadius:"50%", marginTop:5, flexShrink:0,
                  background: n.read ? C.gray200 : C.red }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:C.black, lineHeight:1.4 }}>{n.text}</div>
                  <div style={{ fontSize:10, color:C.gray400, marginTop:2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NAV */}
        <div style={{ display:"flex", background:C.white, borderBottom:`1px solid ${C.gray200}` }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setView(n.key)} style={{
              flex:1, padding:"11px 0", border:"none", background:"transparent",
              fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"'Inter',sans-serif",
              letterSpacing:0.3, color: view===n.key ? C.red : C.gray400,
              borderBottom: view===n.key ? `2px solid ${C.red}` : "2px solid transparent",
              transition:"all 0.15s" }}>{n.label}</button>
          ))}
        </div>

        {/* ═══ FEED ═══ */}
        {view==="feed" && (
          <div style={{ padding:"14px 12px 80px" }}>
            <StreakWarning picks={picks} />
            <div style={{ display:"flex", gap:6, marginBottom:14 }}>
              {[["all","All"],["friends","Friends"],["mine","Mine"]].map(([f,label]) => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding:"6px 14px", borderRadius:4,
                  border:`1.5px solid ${filter===f ? C.red : C.gray200}`,
                  background: filter===f ? C.red : C.white,
                  color: filter===f ? C.white : C.gray600,
                  fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>{label}</button>
              ))}
            </div>
            {filteredPicks.length===0 ? (
              <div style={{ textAlign:"center", padding:40, color:C.gray400 }}>No picks here yet.</div>
            ) : filteredPicks.map(pick => (
              <PickCard key={pick.id} pick={pick} users={users}
                onVote={handleVote} onSetResult={handleSetResult}
                onAddComment={handleAddComment} isOwn={pick.userId==="you"} />
            ))}
          </div>
        )}

        {/* ═══ FRIENDS ═══ */}
        {view==="friends" && (
          <div style={{ padding:"14px 12px 80px" }}>
            <div style={{ display:"flex", gap:0, marginBottom:16, background:C.white,
              borderRadius:6, border:`1px solid ${C.gray200}`, overflow:"hidden" }}>
              {[["friends",`Friends (${friendList.length})`],["requests",`Requests (${pendingList.length})`],["find","Find People"]].map(([t,label]) => (
                <button key={t} onClick={() => setFriendsTab(t)} style={{
                  flex:1, padding:"10px 4px", border:"none",
                  background: friendsTab===t ? C.black : C.white,
                  color: friendsTab===t ? C.white : C.gray400,
                  fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>{label}</button>
              ))}
            </div>

            {friendsTab==="friends" && (
              <>
                {friendList.length===0 && <div style={{ textAlign:"center", color:C.gray400, padding:40 }}>No friends yet.</div>}
                {friendList.map(user => (
                  <div key={user.id} style={{ background:C.white, border:`1px solid ${C.gray200}`,
                    borderRadius:10, padding:"14px 16px", marginBottom:8,
                    display:"flex", alignItems:"center", gap:12 }}>
                    <Avatar user={user} size={44} />
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontWeight:700, fontSize:14, color:C.black }}>{user.name}</span>
                        <BadgeChip badge={getBadge(user)} />
                      </div>
                      <div style={{ fontSize:12, color:C.gray400 }}>{user.handle} · <WinPct pct={winRate(user)} /> win rate · {user.wins}W {user.losses}L</div>
                      {user.streak>=3 && <div style={{ fontSize:11, color:C.red, fontWeight:700, marginTop:2 }}>{user.streak}-game streak</div>}
                    </div>
                    <FriendBtn status={user.friendStatus} onAction={a => handleFriend(user.id,a)} />
                  </div>
                ))}
              </>
            )}

            {friendsTab==="requests" && (
              <>
                {pendingList.length===0 && <div style={{ textAlign:"center", color:C.gray400, padding:40 }}>No pending requests.</div>}
                {pendingList.map(user => (
                  <div key={user.id} style={{ background:C.white, border:`1.5px solid ${C.red}33`,
                    borderRadius:10, padding:"14px 16px", marginBottom:8,
                    display:"flex", alignItems:"center", gap:12 }}>
                    <Avatar user={user} size={44} />
                    <div style={{ flex:1 }}>
                      <span style={{ fontWeight:700, fontSize:14, color:C.black }}>{user.name}</span>
                      <div style={{ fontSize:12, color:C.gray400 }}>{user.handle}</div>
                      <div style={{ fontSize:11, color:C.red, fontWeight:600, marginTop:2 }}>Request sent</div>
                    </div>
                    <button onClick={() => handleFriend(user.id,"remove")} style={{
                      background:C.white, color:C.gray600, border:`1px solid ${C.gray200}`,
                      borderRadius:5, padding:"6px 12px", fontSize:11, fontWeight:700,
                      cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>Cancel</button>
                  </div>
                ))}
              </>
            )}

            {friendsTab==="find" && (
              <>
                <div style={{ fontSize:11, color:C.gray400, fontWeight:700, letterSpacing:1, marginBottom:10 }}>SUGGESTED BETTORS</div>
                {findList.map(user => (
                  <div key={user.id} style={{ background:C.white, border:`1px solid ${C.gray200}`,
                    borderRadius:10, padding:"14px 16px", marginBottom:8,
                    display:"flex", alignItems:"center", gap:12 }}>
                    <Avatar user={user} size={44} />
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontWeight:700, fontSize:14, color:C.black }}>{user.name}</span>
                        <BadgeChip badge={getBadge(user)} />
                      </div>
                      <div style={{ fontSize:12, color:C.gray400 }}>{user.handle} · <WinPct pct={winRate(user)} /> win rate</div>
                    </div>
                    <FriendBtn status={user.friendStatus} onAction={a => handleFriend(user.id,a)} />
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ═══ LEADERBOARD ═══ */}
        {view==="leaderboard" && (
          <div style={{ padding:"14px 12px 80px" }}>
            <div style={{ background:C.black, borderRadius:10, padding:"20px", marginBottom:14 }}>
              <div style={{ fontWeight:800, fontSize:20, color:C.white }}>Top Bettors</div>
              <div style={{ fontSize:12, color:C.gray400, marginTop:4 }}>Ranked by win rate. Earn your badge.</div>
              {/* Badge legend */}
              <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
                {BADGE_TIERS.map(t => (
                  <div key={t.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ background:t.color, color:C.white, fontSize:8, fontWeight:800,
                      padding:"2px 6px", borderRadius:3, letterSpacing:1 }}>{t.label}</span>
                    <span style={{ fontSize:10, color:C.gray400 }}>{t.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {hotBettors.map((user,i) => (
              <div key={user.id} style={{ background:C.white, border:`1px solid ${C.gray200}`,
                borderRadius:10, padding:"14px 16px", marginBottom:8,
                display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontWeight:800, fontSize:16, color: i===0 ? C.red : C.gray400,
                  width:28, textAlign:"center" }}>#{i+1}</div>
                <Avatar user={user} size={42} />
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontWeight:700, fontSize:14, color:C.black }}>{user.name}</span>
                    <BadgeChip badge={getBadge(user)} />
                  </div>
                  <div style={{ fontSize:12, color:C.gray400 }}>
                    {user.wins}W · {user.losses}L · <WinPct pct={winRate(user)} /> win rate
                    {user.streak>=3 && <span style={{ color:C.red, marginLeft:6, fontWeight:700 }}>{user.streak} streak</span>}
                  </div>
                </div>
                <FriendBtn status={user.friendStatus} onAction={a => handleFriend(user.id,a)} />
              </div>
            ))}

            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:11, color:C.gray400, fontWeight:700, letterSpacing:1, marginBottom:10 }}>FEATURED SPORTSBOOKS · Sponsored</div>
              {BOOKS.map(book => (
                <div key={book.name} style={{ background:C.white, border:`1px solid ${C.gray200}`,
                  borderRadius:10, padding:"14px 16px", marginBottom:8,
                  display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:40, height:40, borderRadius:6, background:C.black,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontWeight:800, fontSize:10, color:C.white }}>{book.logo}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color:C.black }}>{book.name}</div>
                      <div style={{ fontSize:12, color:C.gray600 }}>{book.bonus}</div>
                    </div>
                  </div>
                  <button style={{ background:C.red, color:C.white, border:"none", borderRadius:5,
                    padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Join</button>
                </div>
              ))}
              <div style={{ fontSize:10, color:C.gray400, textAlign:"center", lineHeight:1.6, marginTop:8 }}>
                Putting earns a referral fee. 21+ only. Problem gambling? Call 1-800-GAMBLER.
              </div>
            </div>
          </div>
        )}

        {/* ═══ PROFILE ═══ */}
        {view==="profile" && (
          <div style={{ padding:"14px 12px 80px" }}>
            <div style={{ background:C.black, borderRadius:10, padding:"24px 20px", marginBottom:14, textAlign:"center" }}>
              <Avatar user={users.you} size={64} />
              <div style={{ fontWeight:800, fontSize:22, color:C.white, marginTop:12 }}>{users.you.name}</div>
              <div style={{ color:C.gray400, fontSize:13, marginTop:2 }}>{users.you.handle}</div>
              {getBadge(users.you) && (
                <div style={{ marginTop:8 }}><BadgeChip badge={getBadge(users.you)} /></div>
              )}
              <div style={{ display:"flex", justifyContent:"center", gap:28, marginTop:18 }}>
                {[["Wins",users.you.wins],["Losses",users.you.losses],["Win %",`${winRate(users.you)}%`],["Friends",friendList.length]].map(([l,v]) => (
                  <div key={l} style={{ textAlign:"center" }}>
                    <div style={{ fontWeight:800, fontSize:22, color: l==="Win %" && winRate(users.you)>=55 ? C.red : C.white }}>{v}</div>
                    <div style={{ fontSize:10, color:C.gray400, letterSpacing:0.5, textTransform:"uppercase", marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
              {users.you.streak>=3 && (
                <div style={{ marginTop:10, fontSize:12, color:C.red, fontWeight:700 }}>{users.you.streak}-game win streak</div>
              )}
            </div>

            <div style={{ fontWeight:700, fontSize:15, color:C.black, marginBottom:12 }}>My Picks</div>
            {picks.filter(p=>p.userId==="you").length===0 ? (
              <div style={{ textAlign:"center", padding:"36px 20px", background:C.white,
                borderRadius:10, border:`1.5px dashed ${C.gray200}`, color:C.gray400 }}>
                No picks posted yet.
                <br />
                <button onClick={() => { setView("feed"); setShowPost(true); }} style={{
                  marginTop:12, background:C.red, color:C.white, border:"none",
                  borderRadius:5, padding:"8px 20px", fontWeight:700, cursor:"pointer" }}>Post your first pick</button>
              </div>
            ) : picks.filter(p=>p.userId==="you").map(pick => (
              <PickCard key={pick.id} pick={pick} users={users}
                onVote={handleVote} onSetResult={handleSetResult}
                onAddComment={handleAddComment} isOwn={true} />
            ))}

            {/* Responsible gambling */}
            <div style={{ marginTop:20, padding:"16px", background:C.white,
              borderRadius:10, border:`1px solid ${C.gray200}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.black, letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Responsible Gambling</div>
              <div style={{ fontSize:12, color:C.gray600, lineHeight:1.7 }}>
                Putting is for entertainment only. We never display your bet amounts. If gambling is affecting your life, help is available 24/7.
              </div>
              <button onClick={() => setShowRG(true)} style={{ marginTop:12, width:"100%", padding:"10px",
                borderRadius:6, border:`1.5px solid ${C.gray200}`, background:C.white,
                color:C.gray600, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
                View Gambling Guidelines
              </button>
              <button style={{ marginTop:8, width:"100%", padding:"10px", borderRadius:6,
                border:`1.5px solid ${C.red}33`, background:C.redBg,
                color:C.red, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
                Call 1-800-522-4700 (24/7 Help)
              </button>
            </div>
          </div>
        )}

        {showPost && <PostPickModal onClose={() => setShowPost(false)} onPost={handlePost} />}
        {showRG   && <RGModal onClose={() => setShowRG(false)} />}
      </div>
    </>
  );
}
