import { useState } from "react";

// ─── Design Tokens ───
const T = {
  bg: "#0D0D0F", card: "#1A1A1F", surface: "#141418",
  border: "#2A2A30", accent: "#00E5A0", accentDim: "rgba(0,229,160,0.15)",
  accentGlow: "rgba(0,229,160,0.3)", wrong: "#FF4D6A", wrongDim: "rgba(255,77,106,0.15)",
  warn: "#FFB800", warnDim: "rgba(255,184,0,0.15)", text: "#F0F0F0",
  textSec: "#8E8E99", textDim: "#5A5A66", purple: "#A855F7", purpleDim: "rgba(168,85,247,0.15)",
  blue: "#3B82F6", blueDim: "rgba(59,130,246,0.15)", gold: "#FFD700",
  goldDim: "rgba(255,215,0,0.12)", orange: "#FF8C42", orangeDim: "rgba(255,140,66,0.15)",
  radius: 16, radiusSm: 10,
};

// ─── Level Config (V5: ear unlocked at 35% as "basic") ───
const LEVELS = [
  { id:"notes", emoji:"🎵", label:"음 위치", labelEn:"Note Position", color:T.accent, desc:"프렛보드의 음 이름 외우기", unlocked:true, progress:62 },
  { id:"intervals", emoji:"📏", label:"인터벌", labelEn:"Intervals", color:T.purple, desc:"프렛보드 위에서 음정 거리 찾기", unlocked:true, progress:28 },
  { id:"scales", emoji:"🎼", label:"스케일 패턴", labelEn:"Scale Patterns", color:T.blue, desc:"프렛보드에서 스케일 음 짚기", unlocked:true, progress:10 },
  { id:"ear", emoji:"👂", label:"귀 훈련", labelEn:"Ear Training", color:T.orange, desc:"소리를 듣고 음 맞추기", unlocked:true, progress:4, basic:true },
];

// ─── Icons ───
const I = {
  home: (c=T.textSec) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  flash: (c=T.textSec) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  map: (c=T.textSec) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  gear: (c=T.textSec) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  fire: (c=T.accent) => <svg width="16" height="16" viewBox="0 0 24 24" fill={c} stroke="none"><path d="M12 23c-4.97 0-8-3.03-8-7 0-2.66 1.34-5.36 4-8 0 3 2 5 4 5s3-1 3-3c1.33 1.33 3 4.33 3 6 0 4.97-2.03 8-6 8z"/></svg>,
  check: (c=T.accent) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x: (c=T.wrong) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  back: (c=T.textSec) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  sound: (c=T.accent) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>,
  mute: (c=T.wrong) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>,
  user: (c=T.textSec) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  arrowR: (c=T.textSec) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  lock: (c=T.textDim) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
};

// ─── Mini Fretboard Component (V5.2: auto-compact, tap feedback, onboarding) ───
function MiniFretboard({ startFret=0, endFret=4, highlights=[], onTap, tappable=false, stringCount=6, compact=false, showOnboarding=false }) {
  const [pressedCell, setPressedCell] = useState(null);
  const fretCount = endFret - startFret + 1;

  // 🔴 Fix #1: Auto-compact when fretboard is too wide for container
  // Available width inside quiz card ≈ 299px, string column ≈ 28px → grid ≈ 271px
  const autoCompact = compact || fretCount > 6;
  const cellH = autoCompact ? 22 : 28;
  const cellW = autoCompact ? Math.min(28, Math.floor(260 / fretCount)) : 36;
  const dotSize = autoCompact ? 18 : 24;
  const strings = ["E","B","G","D","A","E"];
  const dotFrets = [3,5,7,9,12,15];
  const doubleDotFrets = [12];

  const handleCellClick = (s, fret) => {
    if (!tappable || !onTap) return;
    // 🟡 Fix #6: Tap visual feedback — flash the cell
    setPressedCell(`${s}-${fret}`);
    setTimeout(() => setPressedCell(null), 200);
    onTap(s, fret);
  };

  return (
    <div style={{ background:T.surface, borderRadius:12, padding:autoCompact?"8px 6px":"12px 10px", width:"100%", border:`1px solid ${T.border}`, position:"relative" }}>
      {/* 🟡 Fix #5: Onboarding overlay for first-time fretboard tap */}
      {showOnboarding && (
        <div style={{
          position:"absolute", top:0, left:0, right:0, bottom:0,
          background:"rgba(0,0,0,0.7)", borderRadius:12, zIndex:20,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          padding:16, textAlign:"center",
        }}>
          <div style={{ fontSize:28, marginBottom:8 }}>👆</div>
          <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:4 }}>프렛보드를 직접 탭하세요!</div>
          <div style={{ fontSize:11, color:T.textSec, lineHeight:1.5 }}>
            ○ 표시된 위치를 눌러 답을 선택해요
          </div>
          <div style={{ fontSize:10, color:T.textDim, marginTop:8 }}>탭하여 시작</div>
        </div>
      )}

      {/* Fret numbers header */}
      <div style={{ display:"flex", marginLeft:autoCompact?22:28, marginBottom:4 }}>
        {Array.from({length:fretCount},(_,i)=>startFret+i).map(f=>(
          <div key={f} style={{ width:cellW, textAlign:"center", fontSize:autoCompact?8:9, color:dotFrets.includes(f)?T.textSec:T.textDim, fontWeight:dotFrets.includes(f)?700:400 }}>{f===0?"0":f}</div>
        ))}
      </div>

      {/* Fretboard body */}
      <div style={{ display:"flex" }}>
        {/* String name column */}
        <div style={{ display:"flex", flexDirection:"column" }}>
          {Array.from({length:stringCount},(_,s)=>(
            <div key={s} style={{ height:cellH, display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:autoCompact?3:5 }}>
              <span style={{ fontSize:autoCompact?8:10, color:T.textSec, fontWeight:600, width:autoCompact?16:20, textAlign:"right" }}>{strings[s]}</span>
            </div>
          ))}
        </div>

        {/* Fret grid */}
        <div style={{ position:"relative", flex:1, border:`1px solid ${T.textDim}40`, borderRadius:4, overflow:"hidden" }}>
          {/* Nut (thick line at fret 0) */}
          {startFret === 0 && (
            <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:T.textSec, zIndex:5, borderRadius:"2px 0 0 2px" }}/>
          )}

          {Array.from({length:stringCount},(_,s)=>(
            <div key={s} style={{ display:"flex", alignItems:"center", height:cellH, position:"relative" }}>
              {/* String line */}
              <div style={{ position:"absolute", left:0, right:0, top:"50%", height:s>=4?2:s>=2?1.5:1, background:"#666", transform:"translateY(-50%)", zIndex:1 }}/>

              {Array.from({length:fretCount},(_,fi)=>{
                const fret = startFret+fi;
                const hl = highlights.find(h=>h.s===s&&h.f===fret);
                const isPressed = pressedCell === `${s}-${fret}`;

                return (
                  <div key={fi} style={{
                    width:cellW, height:cellH,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    position:"relative", zIndex:2,
                    borderRight:`1px solid ${T.textDim}35`,
                    borderBottom:s<stringCount-1?`1px solid ${T.bg}20`:"none",
                    background: isPressed ? "rgba(255,255,255,0.12)" : tappable && !hl ? "rgba(255,255,255,0.02)" : "transparent",
                    cursor:tappable?"pointer":"default",
                    transition:"background 0.15s",
                  }}
                  onClick={()=>handleCellClick(s,fret)}>

                    {/* Fret dot inlay markers */}
                    {s===2 && dotFrets.includes(fret) && !doubleDotFrets.includes(fret) && !hl && (
                      <div style={{ position:"absolute", width:4, height:4, borderRadius:2, background:`${T.textDim}50` }}/>
                    )}

                    {/* Highlight dot */}
                    {hl ? (
                      <div style={{
                        width:dotSize, height:dotSize, borderRadius:dotSize/2,
                        background:hl.color||T.accent,
                        border:hl.border||"none",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:autoCompact?8:11, fontWeight:700, color:hl.textColor||T.bg,
                        opacity:hl.opacity||1,
                        boxShadow: hl.color && hl.color !== "transparent" ? `0 0 8px ${hl.color}40` : "none",
                        zIndex:3,
                        transform: isPressed ? "scale(0.9)" : "scale(1)",
                        transition:"transform 0.1s",
                      }}>
                        {hl.label||""}
                      </div>
                    ) : tappable ? (
                      /* Tappable empty cell indicator */
                      <div style={{
                        width:dotSize-4, height:dotSize-4, borderRadius:(dotSize-4)/2,
                        border:`1.5px solid ${T.textDim}60`,
                        background: isPressed ? `${T.textDim}40` : `${T.textDim}10`,
                        zIndex:3,
                        transition:"background 0.1s",
                      }}/>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tap instruction hint for tappable mode */}
      {tappable && (
        <div style={{ textAlign:"center", marginTop:6, fontSize:9, color:T.textDim, letterSpacing:0.3 }}>
          ○ = 탭 가능한 위치
        </div>
      )}
    </div>
  );
}

// ─── Phone Frame ───
function PhoneFrame({ children, label }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
      {label && <div style={{ fontSize:11, color:T.textDim, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600 }}>{label}</div>}
      <div style={{ width:375, height:812, background:T.bg, borderRadius:44, overflow:"hidden", border:`2px solid ${T.border}`, position:"relative", boxShadow:`0 0 60px rgba(0,229,160,0.06), 0 20px 60px rgba(0,0,0,0.5)` }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:150, height:28, background:T.bg, borderRadius:"0 0 20px 20px", zIndex:50 }}/>
        <div style={{ height:50, display:"flex", alignItems:"flex-end", justifyContent:"space-between", padding:"0 28px 4px", fontSize:12, fontWeight:600, color:T.text, zIndex:40, position:"relative" }}>
          <span>9:41</span><span style={{ display:"flex", gap:4, alignItems:"center" }}><span style={{ fontSize:10 }}>5G</span><span style={{ fontSize:10 }}>100%</span></span>
        </div>
        <div style={{ height:762, overflow:"hidden", position:"relative" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Tab Bar ───
function TabBar({ active, onNav }) {
  const tabs = [
    { id:"home", icon:I.home, label:"홈" },
    { id:"practice", icon:I.flash, label:"연습" },
    { id:"mastery", icon:I.map, label:"마스터리" },
    { id:"settings", icon:I.gear, label:"설정" },
  ];
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:82, background:`linear-gradient(180deg, transparent, ${T.bg} 20%)`, display:"flex", justifyContent:"space-around", alignItems:"flex-start", paddingTop:10, zIndex:30 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onNav(t.id)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"6px 16px" }}>
          {t.icon(active === t.id ? T.accent : T.textDim)}
          <span style={{ fontSize:10, color:active === t.id ? T.accent : T.textDim, fontWeight:active === t.id ? 600 : 400 }}>{t.label}</span>
          {active === t.id && <div style={{ width:4, height:4, borderRadius:2, background:T.accent, marginTop:-2 }}/>}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// Screen 1: Home — 🟡 Fix #8: Simplified CTA card
// ═══════════════════════════════════════════
function HomeScreen({ onNav }) {
  const [showMixDetail, setShowMixDetail] = useState(false);
  return (
    <div style={{ height:"100%", padding:"8px 20px 90px", overflowY:"auto" }}>
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:14, color:T.textSec }}>좋은 아침이에요 👋</div>
          <div style={{ fontSize:20, fontWeight:700, color:T.text }}>기타 사고력 키우기</div>
        </div>
        <button onClick={() => onNav && onNav("settings")} style={{ width:38, height:38, borderRadius:19, background:T.card, border:`1px solid ${T.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {I.user(T.accent)}
        </button>
      </div>

      {/* ═══ MAIN CTA — 🟡 simplified: CTA first, details after ═══ */}
      <div style={{
        background:`linear-gradient(150deg, ${T.accentDim}, ${T.purpleDim})`,
        borderRadius:20, padding:"20px", marginBottom:10,
        border:`1px solid ${T.accent}30`, position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:50, background:`${T.accent}08`, filter:"blur(30px)" }}/>

        {/* Streak + key info */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
          {I.fire()}<span style={{ fontSize:13, fontWeight:600, color:T.accent }}>6일 연속</span>
          <span style={{ marginLeft:"auto", fontSize:12, color:T.textSec }}>23장 · 약 8분</span>
        </div>

        {/* Big title */}
        <div style={{ fontSize:22, fontWeight:800, color:T.text, marginBottom:12 }}>오늘의 복습 믹스</div>

        {/* Warning — compact */}
        <div style={{ padding:"6px 10px", background:"rgba(255,77,106,0.08)", borderRadius:8, border:`1px solid ${T.wrong}20`, display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
          <span style={{ fontSize:11, color:T.wrong }}>⚠️ 3개 노트가 <strong>24시간 후</strong> 사라져요</span>
        </div>

        {/* CTA — immediately visible */}
        <button style={{ width:"100%", height:50, borderRadius:25, border:"none", background:T.accent, color:T.bg, fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 16px ${T.accentGlow}` }}>
          복습 시작 →
        </button>
      </div>

      {/* Level composition + SM-2 detail — BELOW CTA (collapsible) */}
      <button onClick={()=>setShowMixDetail(!showMixDetail)} style={{
        width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:12,
        padding:"10px 14px", cursor:"pointer", marginBottom:14, textAlign:"left",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[{label:"음위치 ×12",c:T.accent},{label:"인터벌 ×6",c:T.purple},{label:"스케일 ×3",c:T.blue},{label:"귀 ×2",c:T.orange}].map((t,i) => (
              <span key={i} style={{ fontSize:9, color:t.c, background:`${t.c}15`, padding:"2px 6px", borderRadius:6 }}>{t.label}</span>
            ))}
          </div>
          <span style={{ fontSize:10, color:T.textDim }}>{showMixDetail?"▾":"▸"}</span>
        </div>
        {showMixDetail && (
          <div style={{ marginTop:8, fontSize:11, color:T.textSec, lineHeight:1.6 }}>
            <strong style={{ color:T.text }}>SM-2 간격반복 기반 자동 배분</strong><br/>
            복습 시기가 된 카드가 많은 레벨 → 더 많은 카드 배정.<br/>
            바래지는 카드 우선 → 마스터 유지가 핵심 목표.
          </div>
        )}
      </button>

      {/* Quick stats */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {[{v:"62%",l:"Lv.1 음",c:T.accent},{v:"28%",l:"Lv.2 인터벌",c:T.purple},{v:"10%",l:"Lv.3 스케일",c:T.blue},{v:"4%",l:"Lv.4 귀",c:T.orange}].map((s,i)=>(
          <div key={i} style={{ flex:1, background:T.card, borderRadius:T.radiusSm, padding:"10px 4px", textAlign:"center", border:`1px solid ${s.c}15` }}>
            <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:8, color:T.textSec, marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Shortcut to practice */}
      <button onClick={()=>onNav&&onNav("practice")} style={{ width:"100%", height:46, borderRadius:23, border:`1px solid ${T.border}`, background:T.card, color:T.textSec, fontSize:13, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
        특정 레벨만 연습하기 {I.arrowR(T.textDim)}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// Screen 2: Practice — 🟡 Fix #9: Collapsed session options
// ═══════════════════════════════════════════
function PracticeScreen({ onNav }) {
  const [expandedLevel, setExpandedLevel] = useState(null);

  return (
    <div style={{ height:"100%", padding:"8px 20px 90px", overflowY:"auto" }}>
      <div style={{ fontSize:20, fontWeight:700, color:T.text, marginBottom:4 }}>연습하기</div>
      <div style={{ fontSize:12, color:T.textSec, marginBottom:16 }}>레벨을 선택하고 연습을 시작하세요</div>

      {/* Level cards — 🟡 session options hidden until expanded */}
      {LEVELS.map((lv) => (
        <div key={lv.id} style={{ background:T.card, borderRadius:T.radius, padding:"14px 16px", marginBottom:10, border:`1px solid ${lv.color}25`, cursor:"pointer" }}
             onClick={() => setExpandedLevel(expandedLevel === lv.id ? null : lv.id)}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:20, background:`${lv.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, border:`2px solid ${lv.color}40`, position:"relative" }}>
              {lv.emoji}
              <svg style={{ position:"absolute", top:-2, left:-2 }} width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="19" fill="none" stroke={`${lv.color}20`} strokeWidth="2.5"/>
                <circle cx="22" cy="22" r="19" fill="none" stroke={lv.color} strokeWidth="2.5"
                  strokeDasharray={2*Math.PI*19} strokeDashoffset={2*Math.PI*19*(1-lv.progress/100)}
                  strokeLinecap="round" transform="rotate(-90 22 22)"/>
              </svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:15, fontWeight:700, color:T.text }}>{lv.label}</span>
                {lv.basic && <span style={{ fontSize:9, background:T.orangeDim, color:T.orange, padding:"2px 6px", borderRadius:6 }}>기초 모드</span>}
              </div>
              <div style={{ fontSize:11, color:T.textSec }}>{lv.desc}</div>
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:lv.color }}>{lv.progress}%</div>
          </div>

          {/* Expanded: example + session options */}
          {expandedLevel === lv.id && (
            <div style={{ marginTop:12 }}>
              <div style={{ background:T.surface, borderRadius:10, padding:"10px 12px", marginBottom:10 }}>
                <div style={{ fontSize:10, color:T.textDim, marginBottom:4 }}>예시 문제</div>
                <div style={{ fontSize:12, color:T.text, fontWeight:500 }}>
                  {lv.id === "notes" && "\"5번줄 7프렛의 음은?\" → 4지선다"}
                  {lv.id === "intervals" && "\"A에서 완전5도\" → 프렛보드에서 탭"}
                  {lv.id === "scales" && "\"Am 펜타토닉 1포지션\" → 프렛보드에서 음 짚기"}
                  {lv.id === "ear" && `\"이 소리는?\" → ${lv.basic?"개방현 5음 중 선택":"전체 음 선택"}`}
                </div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {[{label:"퀵 3분",cards:10},{label:"포커스 10분",cards:25},{label:"딥 20분",cards:50}].map((s,si) => (
                  <button key={si} onClick={(e)=>{e.stopPropagation();onNav&&onNav(`quiz-${lv.id}`);}} style={{ flex:1, background:T.bg, borderRadius:8, padding:"10px 6px", textAlign:"center", border:`1px solid ${T.border}`, cursor:"pointer" }}>
                    <div style={{ fontSize:12, fontWeight:600, color:lv.color }}>{s.label}</div>
                    <div style={{ fontSize:9, color:T.textDim }}>{s.cards}장</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Mix mode */}
      <button style={{ width:"100%", height:52, borderRadius:26, border:`1px solid ${T.accent}`, background:"transparent", color:T.accent, fontSize:14, fontWeight:600, cursor:"pointer", marginTop:6 }}>
        🎲 전체 레벨 믹스 연습
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// Screen 3: Quiz — Note Position (Level 1) — 🔴 Fix #4: onBack works
// ═══════════════════════════════════════════
function QuizNoteScreen({ onBack }) {
  const [state, setState] = useState("question");
  const [progress, setProgress] = useState(7);
  const total = 25;
  const handleAnswer = (idx) => { if (state==="question") setState(idx===1?"correct":"wrong"); };
  const nextCard = () => { setProgress(Math.min(progress+1,total)); setState("question"); };

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", padding:"0 20px 90px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0 8px" }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", padding:0 }}>
          {I.back()}<span style={{ fontSize:13, color:T.textSec }}>음 위치</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:11, background:T.accentDim, color:T.accent, padding:"2px 8px", borderRadius:8, fontWeight:600 }}>Lv.1</span>
          <span style={{ fontSize:12, color:T.accent, fontWeight:600 }}>{progress}/{total}</span>
        </div>
      </div>
      <div style={{ height:4, background:T.surface, borderRadius:2, marginBottom:16, overflow:"hidden" }}>
        <div style={{ width:`${(progress/total)*100}%`, height:"100%", background:T.accent, borderRadius:2, transition:"width 0.3s" }}/>
      </div>

      {/* Card */}
      <div style={{ flex:1, maxHeight:300, background:T.card, borderRadius:24, padding:"18px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:state==="correct"?`2px solid ${T.accent}`:state==="wrong"?`2px solid ${T.wrong}`:`1px solid ${T.border}` }}>
        <div style={{ fontSize:12, color:T.textSec, letterSpacing:1, marginBottom:8 }}>5번줄 · 7프렛</div>
        <MiniFretboard startFret={5} endFret={9} highlights={[
          { s:4, f:7, color:state==="correct"?T.accent:state==="wrong"?T.wrong:T.accent, label:state!=="question"?"E":"?", textColor:T.bg }
        ]} />
        <div style={{ marginTop:10 }}>
          {/* 🟡 Fix #7: Sound text indicator for wireframe clarity */}
          {state==="correct" && <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:10, color:T.accentGlow, background:T.accentDim, padding:"2px 6px", borderRadius:4 }}>🔊 소리 재생</span><span style={{ color:T.accent, fontWeight:700, fontSize:18 }}>정답!</span></div>}
          {state==="wrong" && <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:10, color:T.wrong, background:T.wrongDim, padding:"2px 6px", borderRadius:4 }}>🔇 오답음</span><span style={{ color:T.wrong, fontWeight:700, fontSize:18 }}>정답은 E</span></div>}
          {state==="question" && <div style={{ fontSize:20, fontWeight:800, color:T.text }}>이 음은?</div>}
        </div>
      </div>

      <div style={{ marginTop:14 }}>
        {state==="question" ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {["A","E","D","B"].map((n,i) => (
              <button key={i} onClick={()=>handleAnswer(i)} style={{ height:54, borderRadius:16, border:`1px solid ${T.border}`, background:T.card, fontSize:20, fontWeight:700, color:T.text, cursor:"pointer" }}>{n}</button>
            ))}
          </div>
        ) : (
          <button onClick={nextCard} style={{ width:"100%", height:52, borderRadius:26, border:"none", background:state==="correct"?T.accent:T.card, color:state==="correct"?T.bg:T.text, fontSize:15, fontWeight:600, cursor:"pointer" }}>다음 →</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Screen 4: Quiz — Interval (Level 2) — 🔴 Fix #3: confirm before submit
// ═══════════════════════════════════════════
function QuizIntervalScreen({ onBack }) {
  const [state, setState] = useState("question");
  const [tapped, setTapped] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const correctS = 4, correctF = 7;

  // 🔴 Fix #3: Tap selects, confirm button judges
  const handleTap = (s, f) => {
    if (state !== "question") return;
    if (showOnboarding) { setShowOnboarding(false); return; }
    // Toggle selection: tap again to deselect
    if (tapped && tapped.s === s && tapped.f === f) {
      setTapped(null);
    } else {
      setTapped({s,f});
    }
  };

  const confirmAnswer = () => {
    if (!tapped) return;
    if (tapped.s === correctS && tapped.f === correctF) setState("correct");
    else setState("wrong");
  };

  const buildHighlights = () => {
    const hl = [
      { s:4, f:0, color:T.accent, label:"A", textColor:T.bg }
    ];
    // Show user's current selection (before confirming)
    if (state === "question" && tapped) {
      hl.push({ s:tapped.s, f:tapped.f, color:T.purple, label:"?", textColor:"#fff", border:`2px solid ${T.purple}` });
    }
    if (state === "correct") {
      hl.push({ s:correctS, f:correctF, color:T.accent, label:"E", textColor:T.bg });
    }
    if (state === "wrong") {
      if (tapped) hl.push({ s:tapped.s, f:tapped.f, color:T.wrong, label:"✕", textColor:"#fff" });
      hl.push({ s:correctS, f:correctF, color:T.accent, label:"E", textColor:T.bg, border:`2px solid ${T.accent}` });
    }
    return hl;
  };

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", padding:"0 20px 90px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0 8px" }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", padding:0 }}>
          {I.back()}<span style={{ fontSize:13, color:T.textSec }}>인터벌</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:11, background:T.purpleDim, color:T.purple, padding:"2px 8px", borderRadius:8, fontWeight:600 }}>Lv.2</span>
          <span style={{ fontSize:12, color:T.purple, fontWeight:600 }}>4/25</span>
        </div>
      </div>
      <div style={{ height:4, background:T.surface, borderRadius:2, marginBottom:12, overflow:"hidden" }}>
        <div style={{ width:"16%", height:"100%", background:T.purple, borderRadius:2 }}/>
      </div>

      {/* Question */}
      <div style={{ background:T.card, borderRadius:24, padding:"14px 16px", border:state==="correct"?`2px solid ${T.accent}`:state==="wrong"?`2px solid ${T.wrong}`:`1px solid ${T.border}`, flex:1, maxHeight:420, display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:11, color:T.purple, fontWeight:600, background:T.purpleDim, padding:"4px 12px", borderRadius:10, alignSelf:"center", marginBottom:8 }}>📏 인터벌 퀴즈</div>

        <div style={{ textAlign:"center", marginBottom:8 }}>
          <div style={{ fontSize:18, fontWeight:800, color:T.text }}>A에서 <span style={{ color:T.purple }}>완전5도 ↑</span></div>
          <div style={{ fontSize:12, color:T.textSec, marginTop:2 }}>프렛보드에서 해당 음의 위치를 탭하세요</div>
        </div>

        {/* Fretboard — tappable, 🟡 Fix #5: onboarding on first open */}
        <MiniFretboard startFret={0} endFret={9} highlights={buildHighlights()} tappable={state==="question"} onTap={handleTap} showOnboarding={showOnboarding && state==="question"} />

        {/* Pattern rule — shown after answer */}
        {state !== "question" && (
          <div style={{ marginTop:8, background:`${T.purple}10`, borderRadius:10, padding:"10px 12px", border:`1px solid ${T.purple}20` }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.purple, marginBottom:2 }}>💡 패턴 규칙</div>
            <div style={{ fontSize:11, color:T.textSec, lineHeight:1.5 }}>
              같은 줄에서 <strong style={{ color:T.text }}>7프렛 위</strong> = 항상 완전5도!<br/>
              이 모양을 기억하면 어떤 음에서든 5도를 찾을 수 있어요.
            </div>
          </div>
        )}

        <div style={{ marginTop:"auto", paddingTop:8, textAlign:"center" }}>
          {state==="correct" && <span style={{ color:T.accent, fontWeight:700, fontSize:16 }}>🔊 정답! A → E (완전5도)</span>}
          {state==="wrong" && <span style={{ color:T.wrong, fontWeight:700, fontSize:14 }}>정답은 5번줄 7프렛 (E)예요</span>}
        </div>
      </div>

      {/* 🔴 Fix #3: Confirm button instead of instant judgment */}
      <div style={{ marginTop:12 }}>
        {state === "question" ? (
          <button onClick={confirmAnswer} disabled={!tapped} style={{
            width:"100%", height:52, borderRadius:26, border:"none",
            background:tapped?T.purple:`${T.purple}30`,
            color:tapped?"#fff":T.textDim,
            fontSize:15, fontWeight:700, cursor:tapped?"pointer":"default",
          }}>
            {tapped ? "이 위치로 확인 →" : "프렛보드에서 위치를 선택하세요"}
          </button>
        ) : (
          <button onClick={()=>{setState("question");setTapped(null);}} style={{ width:"100%", height:52, borderRadius:26, border:"none", background:state==="correct"?T.accent:T.card, color:state==="correct"?T.bg:T.text, fontSize:15, fontWeight:600, cursor:"pointer" }}>다음 →</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Screen 5: Quiz — Scale Pattern (Level 3) — 🔴 Fix #2: partial scoring
// ═══════════════════════════════════════════
function QuizScaleScreen({ onBack }) {
  const [selected, setSelected] = useState([]);
  const [state, setState] = useState("question");
  const [score, setScore] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const scalePositions = [
    {s:0,f:0},{s:0,f:3},{s:1,f:0},{s:1,f:2},
    {s:2,f:0},{s:2,f:2},{s:3,f:0},{s:3,f:2},
    {s:4,f:0},{s:4,f:2},{s:5,f:0},{s:5,f:3},
  ];
  const isScalePos = (s,f) => scalePositions.some(p=>p.s===s&&p.f===f);
  const isSelected = (s,f) => selected.some(p=>p.s===s&&p.f===f);

  const handleTap = (s, f) => {
    if (state !== "question") return;
    if (showOnboarding) { setShowOnboarding(false); return; }
    if (isSelected(s,f)) setSelected(prev=>prev.filter(p=>!(p.s===s&&p.f===f)));
    else setSelected(prev=>[...prev,{s,f}]);
  };

  // 🔴 Fix #2: Partial scoring — 80%+ correct positions with no wrong = "correct"
  const checkAnswer = () => {
    const correctSelections = selected.filter(p => isScalePos(p.s,p.f)).length;
    const wrongSelections = selected.filter(p => !isScalePos(p.s,p.f)).length;
    const missedPositions = scalePositions.filter(p => !isSelected(p.s,p.f)).length;
    const totalScale = scalePositions.length;
    const accuracy = Math.round((correctSelections / totalScale) * 100);

    setScore({ correct:correctSelections, wrong:wrongSelections, missed:missedPositions, total:totalScale, accuracy });

    // 80%+ correct AND no wrong selections = pass
    if (accuracy >= 80 && wrongSelections === 0) setState("correct");
    else setState("wrong");
  };

  const buildHighlights = () => {
    const hl = [];
    for(let s=0;s<6;s++) for(let f=0;f<=4;f++) {
      const sel = isSelected(s,f);
      const isScale = isScalePos(s,f);

      if (state === "question") {
        if (sel) hl.push({ s, f, color:T.blue, label:"●", textColor:"#fff" });
      } else {
        if (isScale && sel) hl.push({ s, f, color:T.accent, label:"✓", textColor:T.bg });
        else if (isScale && !sel) hl.push({ s, f, color:`${T.accent}40`, label:"○", textColor:T.accent, border:`2px dashed ${T.accent}` });
        else if (!isScale && sel) hl.push({ s, f, color:T.wrong, label:"✕", textColor:"#fff" });
      }
    }
    return hl;
  };

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", padding:"0 20px 90px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0 8px" }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", padding:0 }}>
          {I.back()}<span style={{ fontSize:13, color:T.textSec }}>스케일 패턴</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:11, background:T.blueDim, color:T.blue, padding:"2px 8px", borderRadius:8, fontWeight:600 }}>Lv.3</span>
          <span style={{ fontSize:12, color:T.blue, fontWeight:600 }}>2/15</span>
        </div>
      </div>
      <div style={{ height:4, background:T.surface, borderRadius:2, marginBottom:12, overflow:"hidden" }}>
        <div style={{ width:"13%", height:"100%", background:T.blue, borderRadius:2 }}/>
      </div>

      <div style={{ background:T.card, borderRadius:24, padding:"14px 16px", border:`1px solid ${T.border}`, flex:1, maxHeight:440, display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:11, color:T.blue, fontWeight:600, background:T.blueDim, padding:"4px 12px", borderRadius:10, alignSelf:"center", marginBottom:8 }}>🎼 스케일 퀴즈</div>

        <div style={{ textAlign:"center", marginBottom:8 }}>
          <div style={{ fontSize:18, fontWeight:800, color:T.text }}>Am 펜타토닉 <span style={{ color:T.blue }}>1포지션</span></div>
          <div style={{ fontSize:12, color:T.textSec, marginTop:2 }}>스케일에 속하는 음을 모두 탭하세요</div>
        </div>

        <MiniFretboard startFret={0} endFret={4} highlights={buildHighlights()} tappable={state==="question"} onTap={handleTap} showOnboarding={showOnboarding && state==="question"} />

        {state !== "question" && (
          <div style={{ marginTop:8, background:`${T.blue}10`, borderRadius:10, padding:"10px 12px", border:`1px solid ${T.blue}20` }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.blue, marginBottom:2 }}>💡 패턴 팁</div>
            <div style={{ fontSize:11, color:T.textSec, lineHeight:1.5 }}>
              Am 펜타토닉 1포지션은 <strong style={{ color:T.text }}>0~3프렛</strong> 안에서<br/>
              <strong style={{ color:T.text }}>A, C, D, E, G</strong> 5개 음이 반복되는 "박스" 모양이에요.
            </div>
          </div>
        )}

        {/* 🔴 Fix #2: Partial score display */}
        <div style={{ marginTop:"auto", paddingTop:8, textAlign:"center" }}>
          {state==="correct" && score && <span style={{ color:T.accent, fontWeight:700, fontSize:15 }}>정답! {score.correct}/{score.total}개 맞음 ({score.accuracy}%)</span>}
          {state==="wrong" && score && (
            <div>
              <span style={{ color:T.wrong, fontWeight:700, fontSize:14 }}>
                {score.correct}/{score.total}개 맞음
                {score.wrong > 0 && ` · ${score.wrong}개 오답`}
                {score.missed > 0 && ` · ${score.missed}개 누락`}
              </span>
              <div style={{ fontSize:10, color:T.textDim, marginTop:2 }}>점선 원(○) = 놓친 음 · 80% 이상이면 통과</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop:12 }}>
        {state==="question" ? (
          <button onClick={checkAnswer} disabled={selected.length===0} style={{ width:"100%", height:52, borderRadius:26, border:"none", background:selected.length>0?T.blue:`${T.blue}40`, color:selected.length>0?"#fff":T.textDim, fontSize:15, fontWeight:700, cursor:selected.length>0?"pointer":"default" }}>
            확인 ({selected.length}개 선택)
          </button>
        ) : (
          <button onClick={()=>{setState("question");setSelected([]);setScore(null);setShowOnboarding(false);}} style={{ width:"100%", height:52, borderRadius:26, border:"none", background:state==="correct"?T.accent:T.card, color:state==="correct"?T.bg:T.text, fontSize:15, fontWeight:600, cursor:"pointer" }}>다음 →</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Screen 6: Quiz — Ear Training (Level 4) — 🔴 Fix #4: onBack
// ═══════════════════════════════════════════
function QuizEarScreen({ onBack }) {
  const [state, setState] = useState("question");
  const [playing, setPlaying] = useState(false);
  const handleAnswer = (idx) => { if(state==="question") setState(idx===0?"correct":"wrong"); };

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", padding:"0 20px 90px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0 8px" }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", padding:0 }}>
          {I.back()}<span style={{ fontSize:13, color:T.textSec }}>귀 훈련</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:11, background:T.orangeDim, color:T.orange, padding:"2px 8px", borderRadius:8, fontWeight:600 }}>Lv.4</span>
          <span style={{ fontSize:9, background:T.orangeDim, color:T.orange, padding:"2px 6px", borderRadius:6 }}>기초 모드</span>
          <span style={{ fontSize:12, color:T.orange, fontWeight:600 }}>1/20</span>
        </div>
      </div>
      <div style={{ height:4, background:T.surface, borderRadius:2, marginBottom:16, overflow:"hidden" }}>
        <div style={{ width:"5%", height:"100%", background:T.orange, borderRadius:2 }}/>
      </div>

      <div style={{ flex:1, maxHeight:340, background:T.card, borderRadius:24, padding:"24px 20px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:`1px solid ${T.border}` }}>
        <div style={{ fontSize:11, color:T.orange, fontWeight:600, background:T.orangeDim, padding:"4px 12px", borderRadius:10, marginBottom:6 }}>👂 귀 훈련 · 기초</div>
        <div style={{ fontSize:10, color:T.textDim, marginBottom:16 }}>개방현 5음 (E, A, D, G, B) 중 하나</div>

        <button onClick={() => setPlaying(!playing)} style={{
          width:80, height:80, borderRadius:40,
          background: playing ? T.orangeDim : `linear-gradient(135deg, ${T.orange}, #FF6B2B)`,
          border:"none", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow: playing ? "none" : `0 4px 20px rgba(255,140,66,0.4)`,
          marginBottom:14,
        }}>
          {playing ? (
            <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:28 }}>
              {[12,20,28,20,12,24,16].map((h,i) => (
                <div key={i} style={{ width:4, height:h, borderRadius:2, background:T.orange }}/>
              ))}
            </div>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
        </button>
        <div style={{ fontSize:14, color:T.text, fontWeight:600, marginBottom:4 }}>
          {playing ? "듣고 있어요..." : "탭하여 소리 듣기"}
        </div>

        {state!=="question" && (
          <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:10, color:state==="correct"?T.accent:T.wrong, background:state==="correct"?T.accentDim:T.wrongDim, padding:"2px 6px", borderRadius:4 }}>
              {state==="correct"?"🔊 정답음":"🔇 오답음"}
            </span>
            <span style={{ fontSize:18, fontWeight:700, color:state==="correct"?T.accent:T.wrong }}>
              {state==="correct" ? "정답! E음" : "정답은 E예요"}
            </span>
          </div>
        )}

        <div style={{ marginTop:"auto", paddingTop:8, textAlign:"center" }}>
          <div style={{ fontSize:9, color:T.textDim }}>Lv.1 음 위치 80% 달성 시 → 전체 음 모드 해금</div>
        </div>
      </div>

      <div style={{ marginTop:14 }}>
        {state==="question" ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {["E","A","D","G"].map((n,i) => (
              <button key={i} onClick={()=>handleAnswer(i)} style={{ height:54, borderRadius:16, border:`1px solid ${T.border}`, background:T.card, fontSize:20, fontWeight:700, color:T.text, cursor:"pointer" }}>{n}</button>
            ))}
          </div>
        ) : (
          <button onClick={()=>{ setState("question"); setPlaying(false); }} style={{ width:"100%", height:52, borderRadius:26, border:"none", background:state==="correct"?T.accent:T.card, color:state==="correct"?T.bg:T.text, fontSize:15, fontWeight:600, cursor:"pointer" }}>다음 →</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Mastery Map — V5: includes Ear Training tab
// ═══════════════════════════════════════════
function MasteryScreen() {
  const [activeLevel, setActiveLevel] = useState("notes");
  const stringNames = ["E","B","G","D","A","E2"];

  const masteryData = {};
  stringNames.forEach((s,si) => {
    for(let f=0;f<=12;f++) {
      const key=`${si}-${f}`;
      if(f<=3) masteryData[key]=si<4?1:0.7;
      else if(f<=5) masteryData[key]=si<3?0.7:si<5?0.4:0.15;
      else if(f<=7) masteryData[key]=si<2?0.4:0.15;
      else if(f<=9) masteryData[key]=si<1?0.15:0;
      else masteryData[key]=0;
    }
  });

  const getMasteryColor = (l) => l>=1?T.accent:l>=0.7?`${T.accent}B0`:l>=0.4?T.warn:l>0?`${T.accent}30`:T.surface;
  const totalNotes=Object.keys(masteryData).length;
  const mastered=Object.values(masteryData).filter(v=>v>=0.7).length;
  const fading=Object.values(masteryData).filter(v=>v>=0.4&&v<0.7).length;

  return (
    <div style={{ height:"100%", padding:"8px 20px 90px", overflowY:"auto" }}>
      <div style={{ fontSize:20, fontWeight:700, color:T.text, marginBottom:12 }}>마스터리</div>

      <div style={{ display:"flex", gap:2, marginBottom:14, background:T.surface, borderRadius:12, padding:3 }}>
        {LEVELS.map(lv => (
          <button key={lv.id} onClick={()=>setActiveLevel(lv.id)} style={{
            flex:1, padding:"8px 2px", borderRadius:10, border:"none",
            background:activeLevel===lv.id?T.card:"transparent",
            color:activeLevel===lv.id?lv.color:T.textDim,
            fontSize:10, fontWeight:600, cursor:"pointer",
          }}>{lv.emoji} {lv.label.slice(0,3)}</button>
        ))}
      </div>

      {activeLevel === "notes" && (
        <>
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            {[{v:Math.round(mastered/totalNotes*100)+"%",l:"전체",c:T.accent},{v:mastered,l:"숙련",c:T.text},{v:fading,l:"⚠ 바래짐",c:T.warn}].map((s,i)=>(
              <div key={i} style={{ flex:1, background:T.card, borderRadius:T.radiusSm, padding:"10px 8px", textAlign:"center", border:`1px solid ${i===2?T.warn+"30":T.border}` }}>
                <div style={{ fontSize:20, fontWeight:800, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:10, color:T.textSec }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ background:T.card, borderRadius:T.radius, padding:"12px 10px", marginBottom:14 }}>
            <div style={{ display:"flex", marginBottom:4, paddingLeft:18 }}>
              {["E","B","G","D","A","E"].map((s,i)=><div key={i} style={{ flex:1, textAlign:"center", fontSize:9, fontWeight:600, color:T.textSec }}>{s}</div>)}
            </div>
            <div style={{ height:2, background:"#999", borderRadius:1, marginLeft:18, marginBottom:2 }}/>
            {Array.from({length:13},(_,fret)=>(
              <div key={fret} style={{ display:"flex", alignItems:"center", marginBottom:1 }}>
                <div style={{ width:18, textAlign:"right", fontSize:8, color:T.textDim, paddingRight:3 }}>{fret}</div>
                <div style={{ flex:1, display:"flex", gap:2 }}>
                  {stringNames.map((_,si)=>{
                    const key=`${si}-${fret}`, level=masteryData[key]||0, isFading=level>=0.4&&level<0.7;
                    return <div key={si} style={{ flex:1, height:22, borderRadius:3, background:getMasteryColor(level), border:isFading?`1px solid ${T.warn}50`:`1px solid ${T.bg}30`, display:"flex", alignItems:"center", justifyContent:"center", opacity:level===0?0.35:1 }}>
                      {isFading&&<span style={{ fontSize:7 }}>⏳</span>}
                      {level>=1&&<span style={{ fontSize:7 }}>✓</span>}
                    </div>;
                  })}
                </div>
              </div>
            ))}
            <div style={{ display:"flex", gap:6, marginTop:8, paddingLeft:18 }}>
              {[{c:T.accent,l:"마스터"},{c:T.warn,l:"바래짐"},{c:`${T.accent}30`,l:"학습중"},{c:T.surface,l:"미학습"}].map((l,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:2 }}><div style={{ width:7, height:7, borderRadius:2, background:l.c }}/><span style={{ fontSize:8, color:T.textSec }}>{l.l}</span></div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeLevel === "intervals" && (
        <div style={{ background:T.card, borderRadius:T.radius, padding:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.text, marginBottom:12 }}>인터벌 마스터리</div>
          {["단2도","장2도","단3도","장3도","완전4도","증4도","완전5도","단6도","장6도","단7도","장7도","옥타브"].map((iv,i) => {
            const pct = i<3?85:i<6?60:i<8?35:i<10?15:0;
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:11, color:T.textSec, width:50 }}>{iv}</span>
                <div style={{ flex:1, height:6, background:T.surface, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:pct>70?T.accent:pct>40?T.purple:pct>0?`${T.purple}60`:T.surface, borderRadius:3 }}/>
                </div>
                <span style={{ fontSize:10, color:T.textDim, width:28, textAlign:"right" }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      {activeLevel === "scales" && (
        <div style={{ background:T.card, borderRadius:T.radius, padding:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.text, marginBottom:12 }}>스케일 마스터리</div>
          {[{name:"Am 펜타토닉",pct:45},{name:"C 메이저",pct:30},{name:"G 메이저",pct:15},{name:"Em 펜타토닉",pct:5},{name:"A 메이저",pct:0},{name:"블루스 스케일",pct:0}].map((sc,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<5?`1px solid ${T.border}`:"none" }}>
              <span style={{ fontSize:13, color:T.text, flex:1 }}>{sc.name}</span>
              <div style={{ width:80, height:6, background:T.surface, borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:`${sc.pct}%`, height:"100%", background:sc.pct>30?T.blue:sc.pct>0?`${T.blue}60`:T.surface, borderRadius:3 }}/>
              </div>
              <span style={{ fontSize:10, color:T.textDim, width:28, textAlign:"right" }}>{sc.pct}%</span>
            </div>
          ))}
        </div>
      )}

      {activeLevel === "ear" && (
        <div style={{ background:T.card, borderRadius:T.radius, padding:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.text }}>귀 훈련 마스터리</div>
            <span style={{ fontSize:9, background:T.orangeDim, color:T.orange, padding:"2px 8px", borderRadius:6 }}>기초 모드</span>
          </div>
          <div style={{ fontSize:11, color:T.textSec, marginBottom:10 }}>개방현 음 인식 정확도</div>
          {[{note:"E (6번줄)", pct:60},{note:"A (5번줄)", pct:45},{note:"D (4번줄)", pct:30},{note:"G (3번줄)", pct:20},{note:"B (2번줄)", pct:10}].map((n,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:12, color:T.text, width:70 }}>{n.note}</span>
              <div style={{ flex:1, height:8, background:T.surface, borderRadius:4, overflow:"hidden" }}>
                <div style={{ width:`${n.pct}%`, height:"100%", background:n.pct>50?T.accent:n.pct>20?T.orange:`${T.orange}60`, borderRadius:4 }}/>
              </div>
              <span style={{ fontSize:11, color:T.textDim, width:32, textAlign:"right" }}>{n.pct}%</span>
            </div>
          ))}
          <div style={{ marginTop:14, background:T.surface, borderRadius:10, padding:"10px 12px", border:`1px solid ${T.border}` }}>
            <div style={{ fontSize:11, color:T.orange, fontWeight:600, marginBottom:4 }}>🔓 전체 모드 해금 조건</div>
            <div style={{ fontSize:11, color:T.textSec }}>Lv.1 음 위치 80% 달성 시, 프렛보드 전체 음을 소리로 맞추는 고급 모드가 열려요.</div>
            <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ flex:1, height:4, background:T.surface, borderRadius:2, overflow:"hidden", border:`1px solid ${T.border}` }}>
                <div style={{ width:"62%", height:"100%", background:T.accent, borderRadius:2 }}/>
              </div>
              <span style={{ fontSize:10, color:T.accent, fontWeight:600 }}>62/80%</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:10, marginTop:14 }}>
        <button style={{ flex:1, height:46, borderRadius:23, border:`1px solid ${T.warn}40`, background:T.warnDim, color:T.warn, fontSize:12, fontWeight:600, cursor:"pointer" }}>⏳ 바래지는 것 복습</button>
        <button style={{ flex:1, height:46, borderRadius:23, border:"none", background:T.accent, color:T.bg, fontSize:12, fontWeight:700, cursor:"pointer" }}>새로 정복하기</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Settings (compact)
// ═══════════════════════════════════════════
function SettingsScreen() {
  return (
    <div style={{ height:"100%", padding:"8px 20px 90px", overflowY:"auto" }}>
      <div style={{ fontSize:20, fontWeight:700, color:T.text, marginBottom:16 }}>설정</div>
      <div style={{ background:T.card, borderRadius:T.radius, padding:"16px", marginBottom:16, display:"flex", alignItems:"center", gap:14, border:`1px solid ${T.border}` }}>
        <div style={{ width:50, height:50, borderRadius:25, background:T.accentDim, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${T.accent}40`, fontSize:22 }}>🎸</div>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Monica</div>
          <div style={{ fontSize:11, color:T.textSec }}>6일 연속 · 1,220 XP</div>
        </div>
      </div>
      {[{title:"학습", items:["기본 세션 길이 → 포커스","일일 목표 → 20장","사운드 → 켜짐"]}, {title:"알림", items:["복습 알림 → 08:30","바래짐 경고 → 켜짐"]}, {title:"계정", items:["프로필 수정","데이터 내보내기","앱 정보"]}].map((sec,si)=>(
        <div key={si} style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:T.textDim, fontWeight:600, letterSpacing:0.5, marginBottom:6 }}>{sec.title}</div>
          <div style={{ background:T.card, borderRadius:T.radius, overflow:"hidden", border:`1px solid ${T.border}` }}>
            {sec.items.map((item,ii)=>(
              <div key={ii} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", borderBottom:ii<sec.items.length-1?`1px solid ${T.border}`:"none" }}>
                <span style={{ fontSize:13, color:T.text }}>{item.split("→")[0]}</span>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  {item.includes("→")&&<span style={{ fontSize:12, color:T.textSec }}>{item.split("→")[1]}</span>}
                  {I.arrowR(T.textDim)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// Main App — 🔴 Fix #4: quiz screens receive onBack
// ═══════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("overview");
  const [activeScreen, setActiveScreen] = useState("home");

  const goBack = () => setActiveScreen("practice");

  if (view === "overview") {
    return (
      <div style={{ minHeight:"100vh", background:"#08080A", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding:"40px 20px", color:T.text }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:11, letterSpacing:3, color:T.accent, fontWeight:600, marginBottom:6 }}>FRETFLOW V5.2</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:T.text, margin:"0 0 6px" }}>기타 음악 사고력 앱</h1>
          <p style={{ fontSize:13, color:T.textSec, maxWidth:560, margin:"0 auto 16px", lineHeight:1.6 }}>
            V5.2: 프렛보드 오버플로 수정 · 인터벌 확인 버튼 추가 ·<br/>
            스케일 부분 점수 · 탭 피드백 + 온보딩 · 홈 CTA 간소화
          </p>
          <button onClick={() => setView("interactive")} style={{ padding:"12px 32px", borderRadius:24, border:"none", background:T.accent, color:T.bg, fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:`0 0 20px ${T.accentGlow}` }}>
            인터랙티브 모드 →
          </button>
        </div>

        {/* V5.2 Change log */}
        <div style={{ maxWidth:700, margin:"0 auto 40px", background:T.card, borderRadius:14, padding:"16px 20px", border:`1px solid ${T.accent}25` }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.accent, marginBottom:10 }}>V5.1 → V5.2 변경사항</div>
          <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"6px 12px", fontSize:11, color:T.textSec, lineHeight:1.6 }}>
            <span style={{ color:T.wrong }}>🔴 Fix</span><span>인터벌 프렛보드 가로 오버플로 → 프렛 수 많으면 자동 compact</span>
            <span style={{ color:T.wrong }}>🔴 Fix</span><span>스케일 12/12 필수 → 80% 이상 + 오답 0개면 통과 (부분 점수)</span>
            <span style={{ color:T.wrong }}>🔴 Fix</span><span>인터벌 원탭 즉시 판정 → 선택 후 "확인" 버튼으로 변경</span>
            <span style={{ color:T.wrong }}>🔴 Fix</span><span>퀴즈 뒤로가기 버튼 onClick 없음 → 모든 퀴즈에 onBack 연결</span>
            <span style={{ color:T.warn }}>🟡 Improve</span><span>홈 CTA 카드 간소화 → 레벨 칩/SM-2 설명은 CTA 아래 접이식으로</span>
            <span style={{ color:T.warn }}>🟡 Improve</span><span>연습 카드 세션 옵션 → 카드 탭해야 펼쳐지는 아코디언 방식</span>
            <span style={{ color:T.warn }}>🟡 Improve</span><span>프렛보드 탭 온보딩 오버레이 추가 (첫 진입 시 안내)</span>
            <span style={{ color:T.warn }}>🟡 Improve</span><span>탭 시각 피드백 (셀 하이라이트 + 도트 scale 애니메이션)</span>
            <span style={{ color:T.warn }}>🟡 Improve</span><span>사운드 피드백 → 와이어프레임에서 "🔊 소리 재생" 텍스트 표시</span>
            <span style={{ color:T.accent }}>🟢 Clean</span><span>미사용 isFirstFret 변수 제거</span>
          </div>
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:40 }}>
          <PhoneFrame label="① 홈 — CTA 우선 배치"><HomeScreen onNav={()=>{}}/><TabBar active="home" onNav={()=>{}}/></PhoneFrame>
          <PhoneFrame label="② 연습 — 아코디언 카드"><PracticeScreen onNav={()=>{}}/><TabBar active="practice" onNav={()=>{}}/></PhoneFrame>
          <PhoneFrame label="③ Lv.1 음 위치"><QuizNoteScreen onBack={()=>{}}/></PhoneFrame>
          <PhoneFrame label="④ Lv.2 인터벌 (확인 버튼)"><QuizIntervalScreen onBack={()=>{}}/></PhoneFrame>
          <PhoneFrame label="⑤ Lv.3 스케일 (부분 점수)"><QuizScaleScreen onBack={()=>{}}/></PhoneFrame>
          <PhoneFrame label="⑥ Lv.4 귀 훈련"><QuizEarScreen onBack={()=>{}}/></PhoneFrame>
          <PhoneFrame label="⑦ 마스터리 (4레벨 탭)"><MasteryScreen /><TabBar active="mastery" onNav={()=>{}}/></PhoneFrame>
          <PhoneFrame label="⑧ 설정"><SettingsScreen /><TabBar active="settings" onNav={()=>{}}/></PhoneFrame>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch(activeScreen) {
      case "home": return <HomeScreen onNav={setActiveScreen}/>;
      case "practice": return <PracticeScreen onNav={setActiveScreen}/>;
      case "quiz-notes": return <QuizNoteScreen onBack={goBack}/>;
      case "quiz-intervals": return <QuizIntervalScreen onBack={goBack}/>;
      case "quiz-scales": return <QuizScaleScreen onBack={goBack}/>;
      case "quiz-ear": return <QuizEarScreen onBack={goBack}/>;
      case "mastery": return <MasteryScreen/>;
      case "settings": return <SettingsScreen/>;
      default: return <HomeScreen onNav={setActiveScreen}/>;
    }
  };

  const isQuiz = activeScreen.startsWith("quiz-");

  return (
    <div style={{ minHeight:"100vh", background:"#08080A", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40 }}>
      <div style={{ marginBottom:20, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => setView("overview")} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"8px 14px", color:T.textSec, fontSize:12, cursor:"pointer" }}>← 전체</button>
        {[
          { id:"home", label:"홈" }, { id:"practice", label:"연습" },
          { id:"quiz-notes", label:"Lv.1 음", c:T.accent }, { id:"quiz-intervals", label:"Lv.2 인터벌", c:T.purple },
          { id:"quiz-scales", label:"Lv.3 스케일", c:T.blue }, { id:"quiz-ear", label:"Lv.4 귀", c:T.orange },
          { id:"mastery", label:"마스터리" }, { id:"settings", label:"설정" },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveScreen(s.id)} style={{
            background:activeScreen===s.id ? `${s.c||T.accent}20` : T.card,
            border:`1px solid ${activeScreen===s.id ? s.c||T.accent : T.border}`,
            borderRadius:10, padding:"8px 12px",
            color:activeScreen===s.id ? s.c||T.accent : T.textSec,
            fontSize:11, fontWeight:500, cursor:"pointer",
          }}>{s.label}</button>
        ))}
      </div>
      <PhoneFrame>
        {renderScreen()}
        {!isQuiz && <TabBar active={activeScreen} onNav={setActiveScreen}/>}
      </PhoneFrame>
    </div>
  );
}
