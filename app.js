/* Eissa · Energy and States of Matter — app logic */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const main=$('#main');

/* ---------------- state ---------------- */
const KEY='eissa-energy-v1';
let P=load();
function load(){try{return Object.assign({xp:0,streak:0,last:'',seen:{},badges:[]},JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return{xp:0,streak:0,last:'',seen:{},badges:[]}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}}
function today(){return new Date().toISOString().slice(0,10)}
function rec(id,ok){
  const r=P.seen[id]||(P.seen[id]={r:0,w:0,st:'n'});
  if(ok){r.r++;P.xp+=10;r.st=r.r>=2&&r.w<=r.r?'m':'l'}else{r.w++;r.st=r.w>=2?'n':'l'}
  const t=today();
  if(P.last!==t){P.streak=(P.last===yester())?P.streak+1:1;P.last=t}
  BADGES.forEach(b=>{const done=Object.keys(P.seen).filter(k=>P.seen[k].st==='m');
    if(!P.badges.includes(b.id)&&b.need(done)){P.badges.push(b.id);toast('🏅 '+b.en+' · '+b.ar)}});
  save();hud();
}
function yester(){const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)}
function hud(){$('#xpVal').textContent=P.xp;$('#streakVal').textContent=P.streak}

/* ---------------- ui helpers ---------------- */
let toastT;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2200)}
function bi(en,ar,cls){return `<div class="${cls||''}"><span class="en">${en}</span><span class="ar">${ar}</span></div>`}
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}

function confetti(){
  const c=$('#confetti'),x=c.getContext('2d');c.style.display='block';
  c.width=innerWidth;c.height=innerHeight;
  const cols=['#39d9ff','#8b7bff','#3ee08f','#ffb648','#ff7ad9'];
  const ps=Array.from({length:90},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.4,
    s:5+Math.random()*7,v:2.5+Math.random()*4,a:Math.random()*6,c:cols[Math.random()*cols.length|0]}));
  let n=0;
  (function f(){n++;x.clearRect(0,0,c.width,c.height);
    ps.forEach(p=>{p.y+=p.v;p.x+=Math.sin((p.y+p.a)/28)*1.6;p.a+=.1;
      x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore()});
    if(n<110)requestAnimationFrame(f);else{x.clearRect(0,0,c.width,c.height);c.style.display='none'}})();
}

/* ---------------- particle simulations ---------------- */
let SIMS=[],raf=null;
function clearSims(){SIMS=[];if(raf)cancelAnimationFrame(raf);raf=null}
function pbox(state,label,extra){
  return `<div class="pbox" data-sim="${state}" ${extra||''}><span class="lbl">${label||''}</span></div>`;
}
function initSims(root){
  $$('.pbox[data-sim]',(root||document)).forEach(el=>{
    const W=el.clientWidth,H=el.clientHeight||190;
    if(!W){setTimeout(()=>initSims(root),120);return}   // not laid out yet (iOS)
    const wide=W>250;
    const state=el.dataset.sim, n=state==='gas'?9:state==='liquid'?(wide?26:18):(wide?28:20);
    el.querySelectorAll('.pt').forEach(p=>p.remove());
    const ps=[];
    for(let i=0;i<n;i++){
      const d=document.createElement('div');
      d.className='pt'+(state==='gas'?' o':state==='liquid'?' v':'');
      el.appendChild(d);
      let x,y;
      if(state==='solid'){const cols=wide?7:5,gap=Math.min(26,(W-30)/cols);
        x=14+(i%cols)*gap;y=H-26-Math.floor(i/cols)*gap}
      else if(state==='liquid'){x=12+Math.random()*(W-34);y=H*.42+Math.random()*(H*.52)}
      else{x=10+Math.random()*(W-30);y=10+Math.random()*(H-30)}
      ps.push({d,x,y,hx:x,hy:y,vx:(Math.random()-.5),vy:(Math.random()-.5)});
    }
    SIMS.push({el,state,ps,W,H,speed:1});
  });
  if(SIMS.length&&!raf)loop();
}
function loop(){
  SIMS.forEach(s=>{
    const k=s.speed;
    s.ps.forEach(p=>{
      if(s.state==='solid'){
        p.x=p.hx+(Math.random()-.5)*3.2*k;p.y=p.hy+(Math.random()-.5)*3.2*k;
      }else{
        const sp=s.state==='gas'?2.5*k:0.8*k;
        p.x+=p.vx*sp;p.y+=p.vy*sp;
        if(Math.random()<.03){p.vx+=(Math.random()-.5)*.5;p.vy+=(Math.random()-.5)*.5;
          const m=Math.hypot(p.vx,p.vy)||1;p.vx/=m;p.vy/=m}
        const top=s.state==='liquid'?s.H*.4:6;
        if(p.x<6){p.x=6;p.vx*=-1}if(p.x>s.W-20){p.x=s.W-20;p.vx*=-1}
        if(p.y<top){p.y=top;p.vy*=-1}if(p.y>s.H-20){p.y=s.H-20;p.vy*=-1}
      }
      p.d.style.transform=`translate(${p.x}px,${p.y}px)`;
    });
  });
  raf=requestAnimationFrame(loop);
}

/* ---------------- visuals ---------------- */
function atom(sym){return `<div class="atom ${sym}">${sym}</div>`}
function molecule(list){return `<div class="molstage">${list.map(atom).join('<span class="bond" style="width:22px"></span>')}</div>`}
function beaker(hot){
  return `<div class="beaker">${hot?'<div class="steam">☁️</div>':''}
    ${Array.from({length:7},(_,i)=>`<div class="bub" style="left:${12+i*22}px;width:${7+i%3*4}px;height:${7+i%3*4}px;animation-duration:${1.6+i*.24}s;animation-delay:${i*.2}s"></div>`).join('')}
    <div class="flame">🔥</div></div>`;
}
function vessel(state,w,h){
  return `<div class="vessel" style="width:${w}px;height:${h}px">${pbox(state,'')}</div>`;
}
function visual(key){
  switch(key){
    case 'boil': return `<div class="center sp">${beaker(true)}</div>`;
    case 'liquid': return pbox('liquid','💧 Liquid · سائل');
    case 'heatGas': case 'rigidBox': return pbox('gas','☁️ Gas · غاز');
    case 'threeStates': return `<div class="grid g3">${pbox('solid','🧊 Solid · صلب')}${pbox('liquid','💧 Liquid · سائل')}${pbox('gas','☁️ Gas · غاز')}</div>`;
    case 'containers': return `<div class="grid g3">${pbox('solid','🧊 keeps its shape')}${pbox('liquid','💧 takes container shape')}${pbox('gas','☁️ fills everything')}</div>`;
    case 'matterSort': return `<div class="row center" style="justify-content:center;font-size:40px">📕 💧 💨 🪨 <span style="opacity:.35">💡</span></div>
      ${bi('Book, water, air and rock are matter. Light is not.','الكتاب والماء والهواء والصخرة مادة. الضوء ليس مادة.','mini center')}`;
    case 'attract': return `<div class="grid g3">${pbox('solid','🧲 strongest')}${pbox('liquid','🧲 moderate')}${pbox('gas','🧲 weakest')}</div>`;
    case 'potential': return `<div class="grid g2">${pbox('solid','🔋 low potential')}${pbox('gas','🔋 high potential')}</div>`;
    case 'condense': return `<div class="grid g2">${pbox('gas','☁️ Gas — fast, far')}${pbox('liquid','💧 Liquid — slow, close')}</div>
      <div class="center sp" style="font-size:22px">☁️ → ❄️ → 💧 <b>Condensation · التكاثف</b></div>`;
    case 'poolGlass': return `<div class="grid g2">
      <div class="center"><div style="font-size:44px">🥛</div>${pbox('liquid','25°C · few particles')}</div>
      <div class="center"><div style="font-size:44px">🏊</div>${pbox('liquid','25°C · MANY particles')}</div></div>`;
    case 'mug': return `<div class="center" style="font-size:46px">☕ <span style="font-size:28px">→→→</span> 👐</div>
      ${bi('Thermal energy flows from the hot mug into your cooler hands. 🔥 → ❄️','الطاقة الحرارية تنتقل من الكوب الساخن إلى يديك الأبرد. 🔥 ← ❄️','mini center')}`;
    case 'twoGlasses': return `<div class="grid g2"><div class="center"><b>20°C ❄️</b>${pbox('liquid','slower')}</div><div class="center"><b>80°C 🔥</b>${pbox('gas','faster')}</div></div>`;
    case 'twoCans': return `<div class="grid g2"><div class="center"><b>🥫 30°C</b>${pbox('liquid','')}</div><div class="center"><b>🥫 20°C</b>${pbox('solid','')}</div></div>`;
    case 'iceMelt': return `<div class="grid g2"><div class="center"><b>🧊 Ice 0°C</b>${pbox('solid','ordered · less potential')}</div><div class="center"><b>💧 Melted 0°C</b>${pbox('liquid','free · more potential')}</div></div>`;
    case 'speedSim': return `<div>${pbox('gas','🏃 kinetic energy')}<input type="range" min="0" max="100" value="50" id="spd">
      ${bi('Drag: slow = low kinetic energy, fast = high kinetic energy.','حرّك الشريط: بطيء = طاقة حركية قليلة، سريع = طاقة حركية عالية.','mini')}</div>`;
    case 'thermoSim': return thermoSim();
    case 'scales': return `<div class="grid g3">
      <div class="stat"><b>°C</b><span>Celsius · سيليزيوس</span></div>
      <div class="stat"><b>°F</b><span>Fahrenheit · فهرنهايت</span></div>
      <div class="stat"><b>K</b><span>Kelvin · كلفن</span></div></div>
      ${bi('Absolute zero = 0 K — all particle motion stops.','الصفر المطلق = ٠ كلفن — تتوقف كل حركة للجزيئات.','mini center')}`;
    case 'atomSpin': return `<div class="molstage">${atom('C')}${atom('O')}${atom('H')}${atom('N')}${atom('Na')}</div>`;
    case 'models': case 'particleModels': return `<div class="grid g4">
      <div class="stat"><div class="molstage" style="min-height:60px">${atom('He')}</div><span>Helium · element</span></div>
      <div class="stat"><div class="molstage" style="min-height:60px">${atom('C')}</div><span>Carbon · element</span></div>
      <div class="stat"><div class="molstage" style="min-height:60px">${atom('O')}${atom('O')}</div><span>Oxygen O₂ · element</span></div>
      <div class="stat"><div class="molstage" style="min-height:60px">${atom('H')}${atom('O')}${atom('H')}</div><span>Water H₂O · compound</span></div></div>`;
    case 'ecSort': return `<div class="grid g2">
      <div class="stat"><div class="molstage" style="min-height:60px">${atom('O')}${atom('O')}</div><span>ELEMENT · عنصر (one type)</span></div>
      <div class="stat"><div class="molstage" style="min-height:60px">${atom('Na')}${atom('Cl')}</div><span>COMPOUND · مركب (different types)</span></div></div>`;
    case 'ratio': return `<div class="center"><div class="molstage">${atom('H')}${atom('H')}${atom('O')}</div>
      <div class="formula sp">H<sub>2</sub>O</div>${bi('2 hydrogen : 1 oxygen — a fixed ratio.','٢ هيدروجين : ١ أكسجين — نسبة ثابتة.','mini')}</div>`;
    case 'symbols': return `<div class="grid g4">${[['H','Hydrogen','هيدروجين'],['O','Oxygen','أكسجين'],['C','Carbon','كربون'],['N','Nitrogen','نيتروجين'],['Na','Sodium','صوديوم'],['Cl','Chlorine','كلور']].map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]} · ${s[2]}</span></div>`).join('')}</div>`;
    case 'subscripts': return `<div class="center"><div class="formula">CO<sub>2</sub></div>
      <div class="molstage">${atom('C')}${atom('O')}${atom('O')}</div>
      ${bi('C has no subscript → 1 carbon. O₂ → 2 oxygen.','الـ C بدون رقم → ذرة كربون واحدة. O₂ → ذرتا أكسجين.','mini')}</div>`;
    case 'ch4': return `<div class="center"><div class="formula">CH<sub>4</sub></div>
      <div class="molstage">${atom('C')}${atom('H')}${atom('H')}${atom('H')}${atom('H')}</div>
      ${bi('1 carbon + 4 hydrogen = 5 atoms.','١ كربون + ٤ هيدروجين = ٥ ذرات.','mini')}</div>`;
    case 'nahco3': return `<div class="center"><div class="formula">NaHCO<sub>3</sub></div>
      <div class="molstage">${atom('Na')}${atom('H')}${atom('C')}${atom('O')}${atom('O')}${atom('O')}</div>
      ${bi('Na 1 + H 1 + C 1 + O 3 = 6 atoms · 4 elements','١ Na + ١ H + ١ C + ٣ O = ٦ ذرات · ٤ عناصر','mini')}</div>`;
    case 'h2onacl': return `<div class="grid g2">
      <div class="stat"><div class="molstage" style="min-height:60px">${atom('H')}${atom('O')}${atom('H')}</div><span>H₂O · compound</span></div>
      <div class="stat"><div class="molstage" style="min-height:60px">${atom('Na')}${atom('Cl')}</div><span>NaCl · compound</span></div></div>`;
    default: return '';
  }
}
function thermoSim(){
  return `<div class="grid g2"><div class="center">
      <div class="thermo"><div class="fill" id="tfill" style="height:50%"></div><div class="bulb"></div></div>
      <div class="sp"><b id="tval" style="font-size:22px">25°C</b></div>
      <input type="range" min="0" max="100" value="50" id="tslide"></div>
    <div>${pbox('liquid','🌡️ particles')}
      ${bi('Temperature ↑ = particle motion ↑ = average kinetic energy ↑','الحرارة ↑ = حركة الجزيئات ↑ = متوسط الطاقة الحركية ↑','mini')}</div></div>`;
}
function wireSliders(root){
  const sp=$('#spd',root);
  if(sp)sp.oninput=()=>{SIMS.forEach(s=>s.speed=.2+sp.value/40)};
  const ts=$('#tslide',root);
  if(ts)ts.oninput=()=>{const v=+ts.value;$('#tfill',root).style.height=v+'%';
    $('#tval',root).textContent=Math.round(-20+v*1.2)+'°C';SIMS.forEach(s=>s.speed=.2+v/40)};
}

/* ---------------- question card ---------------- */
function qcard(q,opts){
  opts=opts||{};
  const noExp=opts.noExp;
  return `<div class="card qcard" data-qid="${q.id}">
    <span class="tag">${q.sec}-${q.id.split('-')[1]} · ${secName(q.sec)}</span>
    <h2 class="en">${esc(q.qEn)}</h2><h2 class="ar">${esc(q.qAr)}</h2>
    ${noExp?'':`
      <div class="arbox"><b>وش يقصد السؤال؟</b><br>${q.meanAr||''}</div>
      ${q.ideaAr?`<div class="arbox"><b>الفكرة ببساطة</b><br>${q.ideaAr}</div>`:''}
      ${q.ideaEn?`<div class="enbox"><b>The idea, simply</b><br>${q.ideaEn}</div>`:''}`}
    <div class="vis">${visual(q.visual)}</div>
    <div class="inter">${interaction(q)}</div>
    <div class="after hidden"></div>
  </div>`;
}
function secName(s){return {A:'Multiple choice',B:'Comparison',C:'Define',D:'Answer',E:'Word bank',F:'Compound model',G:'True / False',H:'Draw particles'}[s]||''}

function interaction(q){
  if(q.type==='tf')
    return `<div class="tfrow"><button class="tfbtn t" data-tf="1">✅ TRUE<br><small>صح</small></button>
      <button class="tfbtn f" data-tf="0">❌ FALSE<br><small>خطأ</small></button></div>`;
  if(q.type==='fill')
    return `<div><div class="row">${WORDBANK.map(w=>`<button class="pill" data-word="${w}">${w}</button>`).join('')}</div>
      <div class="sp"><input class="tin" id="fin" placeholder="اكتب أو اختر كلمة… / type or tap a word"></div>
      <button class="btn sp" data-check="fill">تحقق · Check</button></div>`;
  if(q.type==='build')
    return `<div><div class="molstage" id="bstage"></div>
      <div class="row sp">${['H','O'].map(a=>`<button class="pill" data-add="${a}">+ ${a}</button>`).join('')}
      <button class="pill" data-clr="1">↺</button></div>
      <div class="sp"><input class="tin" id="fin" placeholder="Formula e.g. H2O2"></div>
      <button class="btn sp" data-check="build">تحقق · Check</button></div>`;
  if(q.type==='draw')
    return `<div><p class="mini"><span class="en">Tap the box that shows the correct arrangement.</span><span class="ar">اضغط على المربع اللي فيه الترتيب الصحيح.</span></p>
      <div class="grid g3">${shuffle(['solid','liquid','gas']).map(s=>
        `<div data-draw="${s}" style="cursor:pointer">${pbox(s,'؟')}</div>`).join('')}</div></div>`;
  const o=q.opts||[];
  return `<div class="opts">${o.map((x,i)=>`<button class="opt" data-i="${i}">
      <span class="k">${'ABCD'[i]}</span><span><span class="en">${esc(x.en)}</span><span class="ar">${esc(x.ar)}</span></span></button>`).join('')}</div>`;
}

function answerBlock(q,ok){
  const ansTxt=q.type==='tf'?(q.ans?'TRUE · صح':'FALSE · خطأ')
    :q.type==='fill'?(q.answer+' · '+(q.answerAr||''))
    :q.type==='build'?(q.answerEn||'')
    :q.type==='draw'?({solid:'Solid · صلب',liquid:'Liquid · سائل',gas:'Gas · غاز'}[q.state])
    :(q.opts?`${'ABCD'[q.ans]}) ${q.opts[q.ans].en}<br><span class="ar">${q.opts[q.ans].ar}</span>`:'');
  let w='';
  if(q.wrong){w=`<div class="wrongbox"><b>ليش الباقي غلط؟ · Why the others are wrong</b>
    ${Object.keys(q.wrong).map(k=>`<div>${'ABCD'[k]}) ${q.wrong[k]}</div>`).join('')}</div>`}
  return `<div class="reveal">
    <div class="why"><b>${ok?'🎉 صح يا عيسى! · Correct!':'💡 الجواب الصحيح · Correct answer'}</b><br>${ansTxt}</div>
    <div class="why"><b>ليش هذا الجواب صح؟</b><br>${q.whyAr||''}</div>
    <div class="enbox"><b>Why?</b><br>${q.whyEn||''}</div>
    ${w}
    ${q.trickAr?`<div class="trick"><b>🧠 خدعة الحفظ · Memory trick</b><br><span class="ar">${q.trickAr}</span><span class="en">${q.trickEn||''}</span></div>`:''}
    ${q.chall?`<div class="card" style="margin:12px 0 0"><span class="tag o">⚡ تحدي صغير · Mini challenge</span>
      <div class="en"><b>${esc(q.chall.qEn)}</b></div><div class="ar"><b>${esc(q.chall.qAr)}</b></div>
      <div class="opts">${q.chall.opts.map((o,i)=>`<button class="opt" data-ci="${i}"><span class="k">${'ABC'[i]}</span>
        <span><span class="en">${esc(o.en)}</span><span class="ar">${esc(o.ar)}</span></span></button>`).join('')}</div></div>`:''}
    <div class="pager"><button class="btn next">التالي · Next →</button></div></div>`;
}

function wireCard(card,q,onDone,noExp){
  const after=$('.after',card);
  let answered=false;
  const finish=ok=>{
    if(answered)return;answered=true;
    rec(q.id,ok);
    if(ok)confetti();
    if(noExp){setTimeout(()=>onDone&&onDone(ok),450);return}
    after.classList.remove('hidden');
    after.innerHTML=answerBlock(q,ok);
    $$('[data-ci]',after).forEach(b=>b.onclick=()=>{
      const good=+b.dataset.ci===q.chall.ans;
      $$('[data-ci]',after).forEach(x=>x.disabled=true);
      b.classList.add(good?'right':'wrong');
      if(good){toast('⚡ ممتاز! Nice!');confetti()}else{
        const r=$$('[data-ci]',after)[q.chall.ans];if(r)r.classList.add('right')}
    });
    const nx=$('.next',after);if(nx)nx.onclick=()=>onDone&&onDone(ok);
    after.scrollIntoView({behavior:'smooth',block:'nearest'});
  };
  $$('.opt[data-i]',card).forEach(b=>b.onclick=()=>{
    if(answered)return;
    const i=+b.dataset.i, ok=i===q.ans;
    $$('.opt[data-i]',card).forEach(x=>x.disabled=true);
    b.classList.add(ok?'right':'wrong');
    if(!ok)$$('.opt[data-i]',card)[q.ans].classList.add('right');
    finish(ok);
  });
  $$('[data-tf]',card).forEach(b=>b.onclick=()=>{
    if(answered)return;
    const ok=(b.dataset.tf==='1')===!!q.ans;
    $$('[data-tf]',card).forEach(x=>x.disabled=true);
    b.classList.add(ok?'right':'wrong');finish(ok);
  });
  $$('[data-word]',card).forEach(b=>b.onclick=()=>{const f=$('#fin',card);if(f)f.value=b.dataset.word});
  const stage=$('#bstage',card);let built=[];
  $$('[data-add]',card).forEach(b=>b.onclick=()=>{built.push(b.dataset.add);stage.innerHTML=built.map(atom).join('')});
  const clr=$('[data-clr]',card);if(clr)clr.onclick=()=>{built=[];stage.innerHTML=''};
  const chk=$('[data-check]',card);
  if(chk)chk.onclick=()=>{
    const v=($('#fin',card).value||'').trim().toLowerCase().replace(/\s|₂|₃|₄/g,m=>({'₂':'2','₃':'3','₄':'4'}[m]||''));
    const target=(q.type==='fill'?q.answer:'h2o2').toLowerCase();
    finish(v===target||(q.type==='build'&&v==='h₂o₂'));
  };
  $$('[data-draw]',card).forEach(b=>b.onclick=()=>{
    if(answered)return;
    const ok=b.dataset.draw===q.state;
    b.querySelector('.pbox').style.borderColor=ok?'var(--gr)':'var(--rd)';
    finish(ok);
  });
  initSims(card);wireSliders(card);
}

/* ---------------- pages ---------------- */
const PAGES={};

PAGES.home=()=>{
  const done=Object.keys(P.seen).length,pct=Math.round(done/QB.length*100);
  main.innerHTML=`
  <div class="card"><div class="hero">
    <div>
      <span class="tag">🔥💧 Phenomenon · الظاهرة</span>
      <h1><span class="en">Why is the liquid boiling?</span><span class="ar">ليش السائل قاعد يغلي؟</span></h1>
      <p class="lead"><span class="en">Hi Eissa! Let's learn Energy and States of Matter — by playing, not by reading.</span>
      <span class="ar">هلا عيسى! بنتعلم الطاقة وحالات المادة باللعب مو بالقراءة 👋</span></p>
      <div class="row sp"><button class="btn" data-go="learn">📖 ابدأ الدرس · Start</button>
      <button class="ghost" data-go="practice">🎮 تدرب · Practice</button>
      <button class="ghost" data-go="lab">🧪 المختبر · Lab</button></div>
    </div>
    <div class="center">${beaker(true)}</div>
  </div></div>
  <div class="grid g3">
    <div class="card" style="cursor:pointer" data-go="learn"><h3>📖 تعلم · LEARN</h3><p class="mini">كل الدرس بالشرح والرسوم المتحركة.</p></div>
    <div class="card" style="cursor:pointer" data-go="practice"><h3>🎮 تدرب · PRACTICE</h3><p class="mini">كل أسئلة بنك الأسئلة مع الشرح.</p></div>
    <div class="card" style="cursor:pointer" data-go="challenge"><h3>🏆 اختبر نفسك · CHALLENGE</h3><p class="mini">اختبار بدون شرح، وبعدها راجع أخطائك.</p></div>
  </div>
  <div class="card"><h3>📊 ${done} / ${QB.length}</h3><div class="bar"><i style="width:${pct}%"></i></div>
    <p class="mini sp">${pct}% من بنك الأسئلة · of the Question Bank</p></div>`;
};

PAGES.learn=()=>{
  const items=[];
  LESSON.forEach(l=>{items.push({k:'l',d:l});
    if(l.id==='L6')items.push({k:'t',d:THINK[0]},{k:'t',d:THINK[1]});
    if(l.id==='L8')items.push({k:'t',d:THINK[2]});
    if(l.id==='L11')items.push({k:'t',d:THINK[3]});
  });
  items.push({k:'end'});
  let i=0;
  const draw=()=>{
    clearSims();
    const it=items[i];
    let html='';
    if(it.k==='l'){const l=it.d;
      html=`<div class="card"><span class="tag">${l.icon} <span class="en">${l.tagEn}</span><span class="ar">${l.tagAr}</span></span>
        <h1><span class="en">${l.tEn}</span><span class="ar">${l.tAr}</span></h1>
        <div class="arbox">${l.arBody}</div><div class="enbox">${l.enBody}</div>
        ${l.noteAr?`<div class="trick ar">${l.noteAr}</div>`:''}
        ${visual(l.visual)}
        ${l.trickAr?`<div class="trick"><b>🧠</b> <span class="ar">${l.trickAr}</span><span class="en">${l.trickEn}</span></div>`:''}
        ${l.essentialAr?`<div class="why"><span class="ar">${l.essentialAr}</span><span class="en">${l.essentialEn}</span></div>`:''}
        ${l.quick?`<div class="card" style="margin:14px 0 0"><span class="tag g">✅ Quick Check</span>
          ${l.quick.map(q=>`<details style="margin:8px 0"><summary style="cursor:pointer;font-weight:800">
            <span class="en">${esc(q.qEn)}</span><span class="ar">${esc(q.qAr)}</span></summary>
            <div class="why"><span class="ar">${q.aAr}</span><span class="en">${q.aEn}</span></div></details>`).join('')}</div>`:''}
        ${l.predict?`<div class="card" style="margin:14px 0 0"><span class="tag o">🤔 توقّع · Predict</span>
          <div class="ar"><b>${l.predict.qAr}</b></div><div class="en"><b>${l.predict.qEn}</b></div>
          <div class="opts">${l.predict.opts.map((o,n)=>`<button class="opt" data-pi="${n}"><span class="k">${'ABC'[n]}</span>
            <span><span class="en">${esc(o.en)}</span><span class="ar">${esc(o.ar)}</span></span></button>`).join('')}</div>
          <div class="pred hidden why"></div></div>`:''}
        </div>`;
    } else if(it.k==='t'){const t=it.d;
      html=`<div class="card"><span class="tag v">🧠 Three-Dimensional Thinking</span>
        <h2><span class="en">${esc(t.qEn)}</span><span class="ar">${esc(t.qAr)}</span></h2>
        ${visual(t.visual)}
        <div class="opts">${t.opts.map((o,n)=>`<button class="opt" data-ti="${n}"><span class="k">${'ABC'[n]}</span>
          <span><span class="en">${esc(o.en)}</span><span class="ar">${esc(o.ar)}</span></span></button>`).join('')}</div>
        <div class="tans hidden"></div></div>`;
    } else {
      html=`<div class="card center"><span class="tag o">🔥💧 نرجع للسؤال الأول</span>
        <h1><span class="en">Now Eissa — why is the liquid boiling?</span><span class="ar">الحين يا عيسى… ليش السائل يغلي؟</span></h1>
        ${beaker(true)}
        <div class="arbox sp">نضيف حرارة 🔥 ← الطاقة الحرارية تزيد ← الجزيئات تتحرك أسرع ← تتغلب على التجاذب وتتباعد ← السائل يتحول إلى غاز (بخار) ☁️</div>
        <div class="enbox">Heat is added 🔥 → thermal energy increases → particles move faster → they overcome attraction and spread apart → the liquid changes into gas ☁️</div>
        <h2 class="sp">🎉 ممتاز يا عيسى!</h2><p class="mini">Energy and States of Matter — COMPLETED</p>
        <div class="row sp" style="justify-content:center"><button class="btn" data-go="practice">🎮 تدرب الآن · Practice</button></div></div>`;
    }
    main.innerHTML=html+`<div class="pager">
      <button class="ghost" id="prev">← السابق</button>
      <div class="steps">${items.map((_,n)=>`<b class="${n===i?'on':n<i?'done':''}" data-s="${n}"></b>`).join('')}</div>
      <button class="btn" id="next">التالي →</button></div>`;
    initSims(main);wireSliders(main);
    $('#prev').onclick=()=>{if(i>0){i--;draw()}};
    $('#next').onclick=()=>{if(i<items.length-1){i++;draw();scrollTo(0,0)}};
    $$('.steps b').forEach(b=>b.onclick=()=>{i=+b.dataset.s;draw()});
    $$('[data-pi]').forEach(b=>b.onclick=()=>{
      const l=it.d,ok=+b.dataset.pi===l.predict.ans;
      $$('[data-pi]').forEach(x=>x.disabled=true);
      b.classList.add(ok?'right':'wrong');
      if(!ok)$$('[data-pi]')[l.predict.ans].classList.add('right');
      const p=$('.pred');p.classList.remove('hidden');
      p.innerHTML=`<span class="ar">${l.predict.afterAr}</span><span class="en">${l.predict.afterEn}</span>`;
      if(ok)confetti();
    });
    $$('[data-ti]').forEach(b=>b.onclick=()=>{
      const t=it.d,ok=+b.dataset.ti===t.ans;
      $$('[data-ti]').forEach(x=>x.disabled=true);
      b.classList.add(ok?'right':'wrong');
      if(!ok)$$('[data-ti]')[t.ans].classList.add('right');
      const a=$('.tans');a.classList.remove('hidden');
      a.innerHTML=`<div class="why"><b>ليش؟</b><br>${t.whyAr}</div><div class="enbox">${t.whyEn}</div>`;
      if(ok)confetti();
    });
  };
  draw();
};

PAGES.lab=()=>{
  main.innerHTML=`<div class="card">
    <span class="tag">🧪 مختبر المادة · States of Matter Lab</span>
    <h1><span class="en">Make the invisible visible</span><span class="ar">شوف الجزيئات بعينك</span></h1>
    <div class="row"><button class="pill" data-st="solid">🧊 Solid · صلب</button>
      <button class="pill" data-st="liquid">💧 Liquid · سائل</button>
      <button class="pill" data-st="gas">☁️ Gas · غاز</button></div>
    <div class="sp" id="labbox" style="height:270px">${pbox('solid','🧊 Solid · صلب')}</div>
    <div class="sp"><b>🌡️ <span id="labt">25°C</span></b><input type="range" min="0" max="100" value="50" id="labslide"></div>
    <div class="grid g4 sp" id="labinfo"></div>
  </div>`;
  const box=$('#labbox');let st='solid';
  const info=()=>{
    const d={solid:['Vibrate in place · تهتز في مكانها','Strongest · الأقوى','Definite · ثابت','Definite · ثابت'],
      liquid:['Slide past each other · تنزلق','Moderate · متوسط','Container shape · شكل الإناء','Definite · ثابت'],
      gas:['Fast + random · سريعة وعشوائية','Weakest · الأضعف','No shape · لا شكل','No volume · لا حجم']}[st];
    $('#labinfo').innerHTML=['Movement · الحركة','Attraction · التجاذب','Shape · الشكل','Volume · الحجم']
      .map((t,n)=>`<div class="stat"><span>${t}</span><div style="font-size:13px;font-weight:800;margin-top:6px">${d[n]}</div></div>`).join('');
  };
  const setSt=s=>{st=s;clearSims();box.innerHTML=pbox(s,{solid:'🧊 Solid · صلب',liquid:'💧 Liquid · سائل',gas:'☁️ Gas · غاز'}[s]);
    $('.pbox',box).style.height='270px';initSims(box);
    SIMS.forEach(x=>x.speed=.2+ $('#labslide').value/40);
    $$('[data-st]').forEach(b=>b.classList.toggle('sel',b.dataset.st===s));info()};
  $$('[data-st]').forEach(b=>b.onclick=()=>setSt(b.dataset.st));
  $('#labslide').oninput=e=>{const v=+e.target.value;$('#labt').textContent=Math.round(-20+v*1.2)+'°C';
    SIMS.forEach(s=>s.speed=.2+v/40)};
  setSt('solid');
};

const MOLS=[{f:'CH4',d:'CH₄',a:['C','H','H','H','H'],n:'Methane · ميثان'},
  {f:'H2O',d:'H₂O',a:['H','O','H'],n:'Water · ماء'},
  {f:'NaCl',d:'NaCl',a:['Na','Cl'],n:'Salt · ملح'},
  {f:'H2O2',d:'H₂O₂',a:['H','O','O','H'],n:'Hydrogen peroxide'},
  {f:'NaHCO3',d:'NaHCO₃',a:['Na','H','C','O','O','O'],n:'Baking soda · بيكربونات'}];

PAGES.atoms=()=>{
  main.innerHTML=`<div class="card"><span class="tag">⚛️ الذرات والمركبات</span>
    <h1><span class="en">Atoms, elements & compounds</span><span class="ar">الذرات والعناصر والمركبات</span></h1>
    ${visual('models')}
    <div class="arbox">العنصر = نوع ذرة واحد فقط. المركب = نوعان مختلفان أو أكثر مرتبطان كيميائياً.</div>
    <div class="enbox">Element = one type of atom. Compound = two or more different elements bonded.</div></div>
  <div class="card"><span class="tag v">⚛️ Molecule Builder · ابنِ الجزيء</span>
    <h2><span class="en">Build the molecule, then count the atoms</span><span class="ar">ابنِ الجزيء ثم عدّ الذرات</span></h2>
    <div class="row" id="mpick">${MOLS.map((m,i)=>`<button class="pill" data-m="${i}">${m.d}</button>`).join('')}</div>
    <div class="sp" id="mtarget"></div>
    <div class="molstage sp" id="mstage"></div>
    <div class="row sp" id="mbtns">${['H','O','C','N','Na','Cl'].map(a=>`<button class="pill" data-a="${a}">+ ${a}</button>`).join('')}
      <button class="pill" data-clear="1">↺</button></div>
    <div class="sp" id="mres"></div></div>
  <div class="card"><span class="tag g">🔤 Element symbols</span>${visual('symbols')}</div>
  <div class="card"><span class="tag o">💧 Element ratio</span>${visual('ratio')}</div>
  <div class="card"><span class="tag">🧮 Subscripts</span>${visual('subscripts')}${visual('nahco3')}
    <div class="trick"><b>القاعدة الذهبية:</b> إذا ما فيه رقم صغير تحت العنصر، نحسبه واحد ☝️<br>
    <span class="en"><b>Golden rule:</b> if there is no little number, count ONE.</span></div></div>`;
  let cur=0,built=[];
  const render=()=>{
    const m=MOLS[cur];
    $('#mtarget').innerHTML=`<b>Target: <span class="formula" style="font-size:24px">${m.d}</span></b> <span class="mini">${m.n}</span>`;
    $('#mstage').innerHTML=built.map(atom).join('');
    $$('[data-m]').forEach(b=>b.classList.toggle('sel',+b.dataset.m===cur));
    const need=MOLS[cur].a.slice().sort().join(),got=built.slice().sort().join();
    if(built.length&&need===got){$('#mres').innerHTML=`<div class="why"><b>🎉 صح! ${m.d}</b><br>
      عدد الذرات = ${m.a.length} · atoms = ${m.a.length}</div>`;rec('MOL-'+m.f,true);confetti()}
    else if(built.length>=m.a.length){$('#mres').innerHTML=`<div class="wrongbox">جرّب مرة ثانية · Try again — target ${m.d}</div>`}
    else $('#mres').innerHTML='';
  };
  $$('[data-m]').forEach(b=>b.onclick=()=>{cur=+b.dataset.m;built=[];render()});
  $$('[data-a]').forEach(b=>b.onclick=()=>{built.push(b.dataset.a);render()});
  $('[data-clear]').onclick=()=>{built=[];render()};
  render();
};

function runQueue(list,opts){
  opts=opts||{};let i=0;const wrong=[];
  const step=()=>{
    clearSims();
    if(i>=list.length){
      const score=list.length-wrong.length;
      main.innerHTML=`<div class="card center"><h1>${score}/${list.length}</h1>
        <div class="bar"><i style="width:${Math.round(score/list.length*100)}%"></i></div>
        <p class="lead sp">${score===list.length?'🎉 ممتاز يا عيسى! Perfect!':'💪 أحسنت! راجع أخطاءك تحت.'}</p>
        ${wrong.length?`<button class="btn warm" id="rev">راجع أخطائي · Review my mistakes (${wrong.length})</button>`:''}
        <div class="row sp" style="justify-content:center"><button class="ghost" data-go="progress">📊 تقدمي</button>
        <button class="ghost" data-go="home">🏠 الرئيسية</button></div></div>`;
      if(wrong.length)$('#rev').onclick=()=>runQueue(wrong.slice(),{});
      if(score===list.length)confetti();
      return;
    }
    const q=list[i];
    main.innerHTML=`<div class="card" style="padding:12px 18px"><div class="row" style="justify-content:space-between">
      <b>${i+1} / ${list.length}</b><span class="mini">${opts.title||''}</span></div>
      <div class="bar sp"><i style="width:${i/list.length*100}%"></i></div></div>`+qcard(q,opts);
    const card=$('.qcard');
    wireCard(card,q,ok=>{if(!ok)wrong.push(q);i++;step();scrollTo(0,0)},opts.noExp);
    if(opts.noExp){/* auto-advance handled in wireCard */}
  };
  step();
}

PAGES.practice=()=>{
  const secs=['A','B','C','D','E','F','G','H'];
  main.innerHTML=`<div class="card"><span class="tag">🎮 تدرب · Practice</span>
    <h1><span class="en">The whole Question Bank</span><span class="ar">بنك الأسئلة كامل</span></h1>
    <p class="mini">${QB.length} أسئلة · every question is explained step by step.</p>
    <div class="row sp"><button class="btn" data-sec="ALL">▶️ كل الأسئلة · All</button>
    ${secs.map(s=>`<button class="pill" data-sec="${s}">${s} · ${secName(s)}</button>`).join('')}</div></div>
  <div class="card"><h3>📋 الحالة · Status</h3>
    ${QB.map(q=>{const r=P.seen[q.id];const c=!r?'':r.st==='m'?'m':r.st==='l'?'l':'n';
      return `<div class="qrow"><span class="id">${q.id}</span>${c?`<span class="dot ${c}"></span>`:'<span class="dot" style="background:#3a4468"></span>'}
        <span class="en" style="flex:1">${esc(q.qEn.slice(0,70))}…</span><span class="ar" style="flex:1">${esc(q.qAr.slice(0,60))}…</span></div>`}).join('')}
  </div>`;
  $$('[data-sec]').forEach(b=>b.onclick=()=>{
    const s=b.dataset.sec;
    runQueue(s==='ALL'?QB.slice():QB.filter(q=>q.sec===s),{title:'تدرب · Practice'});
  });
};

PAGES.memory=()=>{
  const need=QB.filter(q=>{const r=P.seen[q.id];return !r||r.st!=='m'});
  const prio=need.slice().sort((a,b)=>((P.seen[b.id]||{w:0}).w)-((P.seen[a.id]||{w:0}).w));
  main.innerHTML=`<div class="card"><span class="tag v">🧠 وضع الحفظ · Memory Mode</span>
    <h1><span class="en">Repeat what you got wrong</span><span class="ar">كرّر اللي أخطأت فيه</span></h1>
    <p class="mini">اللي تغلط فيه مرة يرجع لك بسرعة، واللي تغلط فيه مرتين يجي أول شي.</p>
    <div class="grid g3 sp">
      <div class="stat"><b>${QB.filter(q=>(P.seen[q.id]||{}).st==='m').length}</b><span>🟢 متقن · Mastered</span></div>
      <div class="stat"><b>${QB.filter(q=>(P.seen[q.id]||{}).st==='l').length}</b><span>🟡 يتعلم · Learning</span></div>
      <div class="stat"><b>${QB.filter(q=>!P.seen[q.id]||P.seen[q.id].st==='n').length}</b><span>🔴 يحتاج مراجعة</span></div></div>
    <button class="btn sp" id="start" ${prio.length?'':'disabled'}>${prio.length?'▶️ ابدأ المراجعة · Start ('+Math.min(10,prio.length)+')':'🎉 كل شي متقن!'}</button>
  </div>`;
  const s=$('#start');if(prio.length)s.onclick=()=>runQueue(prio.slice(0,10),{title:'🧠 وضع الحفظ'});
};

PAGES.challenge=()=>{
  main.innerHTML=`<div class="card center"><span class="tag o">🏆 اختبر نفسك · Challenge</span>
    <h1><span class="en">Final mixed challenge</span><span class="ar">التحدي النهائي</span></h1>
    <p class="lead"><span class="ar">١٢ سؤال من كل الدرس — بدون شرح. بعد ما تخلص، راجع أخطاءك.</span>
    <span class="en">12 questions from the whole unit — no explanations. Review your mistakes at the end.</span></p>
    <button class="btn warm sp" id="go">🚀 يلا نبدأ</button></div>`;
  $('#go').onclick=()=>runQueue(shuffle(QB).slice(0,12),{title:'🏆 Challenge',noExp:true});
};

PAGES.progress=()=>{
  const done=Object.keys(P.seen).filter(k=>k.indexOf('MOL-')!==0);
  const right=done.reduce((a,k)=>a+P.seen[k].r,0),wrongN=done.reduce((a,k)=>a+P.seen[k].w,0);
  const mast=QB.filter(q=>(P.seen[q.id]||{}).st==='m').length;
  main.innerHTML=`<div class="card"><span class="tag">📊 تقدم عيسى · Eissa's Progress</span>
    <h1><span class="en">Your progress</span><span class="ar">تقدمك</span></h1>
    <div class="grid g4 sp">
      <div class="stat"><b>${done.length}</b><span>أسئلة حُلّت · Attempted</span></div>
      <div class="stat"><b>${right}</b><span>إجابات صحيحة · Correct</span></div>
      <div class="stat"><b>${wrongN}</b><span>أخطاء · Incorrect</span></div>
      <div class="stat"><b>${Math.round(mast/QB.length*100)}%</b><span>إتقان · Mastered</span></div>
      <div class="stat"><b>${P.xp}</b><span>⭐ XP</span></div>
      <div class="stat"><b>${P.streak}</b><span>🔥 Streak</span></div></div>
    <div class="sp"><div class="bar"><i style="width:${Math.round(mast/QB.length*100)}%"></i></div></div></div>
  <div class="card"><h3>🏅 الأوسمة · Badges</h3><div class="grid g4 sp">
    ${BADGES.map(b=>`<div class="badge ${P.badges.includes(b.id)?'on':''}"><div class="ic">${b.ic}</div>
      <b>${b.en}</b><span class="mini">${b.ar}</span></div>`).join('')}</div></div>
  <div class="card"><h3>📋 كل الأسئلة</h3>
    ${QB.map(q=>{const r=P.seen[q.id];const c=!r?'':r.st==='m'?'m':r.st==='l'?'l':'n';
      return `<div class="qrow"><span class="id">${q.id}</span>
        <span class="dot ${c||''}" ${c?'':'style="background:#3a4468"'}></span>
        <span style="flex:1"><span class="en">${esc(q.qEn.slice(0,60))}…</span><span class="ar">${esc(q.qAr.slice(0,50))}…</span></span>
        <span class="mini">${r?`✅${r.r} ❌${r.w}`:'—'}</span></div>`}).join('')}
    <p class="mini sp">🟢 متقن · 🟡 يتعلم · 🔴 يحتاج مراجعة</p></div>`;
};

/* ---------------- routing ---------------- */
function go(p){
  clearSims();
  (PAGES[p]||PAGES.home)();
  $$('.sidenav a').forEach(a=>a.classList.toggle('on',a.dataset.page===p));
  $('#sidenav').classList.remove('open');$('#scrim').classList.remove('open');
  location.hash=p;scrollTo(0,0);
  initSims(main);wireSliders(main);
}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');
  if(g){go(g.dataset.go);return}
  const n=e.target.closest('.sidenav a');
  if(n){go(n.dataset.page)}
});
/* save battery: stop the particle loop when the tab/app is backgrounded (iOS) */
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=null}
  else if(SIMS.length&&!raf)loop();
});
$('#burger').onclick=()=>{$('#sidenav').classList.toggle('open');$('#scrim').classList.toggle('open')};
$('#scrim').onclick=()=>{$('#sidenav').classList.remove('open');$('#scrim').classList.remove('open')};
$('#resetBtn').onclick=()=>{if(confirm('مسح كل التقدم؟ / Reset all progress?')){P={xp:0,streak:0,last:'',seen:{},badges:[]};save();hud();go('progress')}};

/* language */
function setLang(l){
  document.body.className='lang-'+l;
  document.documentElement.dir=(l==='ar')?'rtl':'ltr';
  document.documentElement.lang=(l==='ar')?'ar':'en';
  $$('#langsel button').forEach(b=>b.classList.toggle('on',b.dataset.lang===l));
  try{localStorage.setItem(KEY+'-lang',l)}catch(e){}
}
$$('#langsel button').forEach(b=>b.onclick=()=>setLang(b.dataset.lang));

setLang((()=>{try{return localStorage.getItem(KEY+'-lang')||'both'}catch(e){return 'both'}})());
hud();
go((location.hash||'#home').slice(1));
/* Re-layout only on a real width change (orientation / rotate).
   iOS Safari fires resize when the URL bar collapses while scrolling —
   re-rendering there would throw away the question Eissa is answering. */
let lastW=innerWidth;
addEventListener('resize',()=>{
  if(Math.abs(innerWidth-lastW)<40)return;
  lastW=innerWidth;
  clearTimeout(window._rz);
  window._rz=setTimeout(()=>{
    clearSims();initSims(main);wireSliders(main);
  },250);
});
addEventListener('orientationchange',()=>{setTimeout(()=>{clearSims();initSims(main)},400)});
})();
