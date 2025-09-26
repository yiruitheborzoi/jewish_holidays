// script.js — Hebrew calendar (modal consent + language + robust geolocation)
// - Nav toggle
// - Modal on first visit: ask for location (for TZ & precise sunset) + language
// - Countdown and timeline use Jewish calendar (holidays begin at sundown)
// - Multi-day holidays are clustered into a single occurrence (e.g., Hanukkah)
// - If no precise sunset, mark times as approximate

// ================= 0) Responsive nav toggle =================
(function initNavToggle(){
  const btn = document.querySelector('.nav-toggle');
  const header = document.querySelector('.header');
  const menu = document.querySelector('.nav-menu');
  if (!btn || (!header && !menu)) return;
  btn.addEventListener('click', () => {
    if (header) header.classList.toggle('nav-open');
    if (menu) menu.classList.toggle('open');
  });
})();

// ================= 1) Constants / prefs =================
const COUNTDOWN_EL_ID = 'countdown-display';
const TIMELINE_CONTAINER_ID = 'timeline-container';
const LS_KEY = 'jh_prefs_v2'; // {consent:'granted'|'denied', lang:'auto'|'en'|'he'|'…'}

const HOLIDAY_CANON = [
  'Rosh Hashanah','Yom Kippur','Sukkot','Shemini Atzeret','Simchat Torah',
  'Hanukkah','Tu BiShvat','Purim','Passover','Shavuot',"Tisha B'Av",
];

const DESCRIPTIONS = {
  'Rosh Hashanah': 'Jewish New Year — reflection, prayer, new beginnings.',
  'Yom Kippur': 'Day of Atonement — fasting, prayer, forgiveness.',
  'Sukkot': 'Harvest festival recalling the desert journey.',
  'Shemini Atzeret': 'Eighth day of assembly; prayers for rain.',
  'Simchat Torah': 'Rejoicing of the Torah — finish & restart the cycle.',
  'Hanukkah': 'Festival of Lights — Temple rededication and oil miracle.',
  'Tu BiShvat': 'New Year for Trees — nature & ecological awareness.',
  'Purim': 'Book of Esther — costumes, megillah, mishloach manot.',
  'Passover': 'Festival of freedom — Exodus, seder, matzah.',
  'Shavuot': 'Festival of Weeks — giving of the Torah.',
  "Tisha B'Av": 'Mourning the destruction of the Temples and other tragedies.',
};

// ————— Preferences helpers
function loadPrefs(){
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function savePrefs(p){ localStorage.setItem(LS_KEY, JSON.stringify(p || {})); }

// ————— Language helpers
function detectLang(){
  // 浏览器首选，如 zh-CN，en-US，he-IL 等
  const navLang = (navigator.language || 'en').toLowerCase();
  return navLang;
}
function normalizeHebcalLang(uiLang){
  // Hebcal 至少支持 'en' 与 'he'；其余统一用 'en'
  if (uiLang.startsWith('he')) return 'he';
  return 'en';
}
function fmtDateTime(dt, tz, uiLang){
  return new Intl.DateTimeFormat(uiLang, { dateStyle:'full', timeStyle:'short', timeZone:tz }).format(dt);
}
function fmtDate(dt, tz, uiLang){
  return new Intl.DateTimeFormat(uiLang, { dateStyle:'full', timeZone:tz }).format(dt);
}

// ================= 2) Normalize holiday titles =================
function normalizeHolidayTitle(title){
  let t = String(title || '').trim();
  t = t.replace(/^Erev\s+/i,'')
       .replace(/\s*\(.*?\)\s*/g,' ')
       .replace(/\s+/g,' ')
       .trim();
  t = t.replace(/Rosh\s*Hashana/i,'Rosh Hashanah')
       .replace(/Chanukah|Hanukah/i,'Hanukkah')
       .replace(/Pesach/i,'Passover')
       .replace(/Shavuos/i,'Shavuot')
       .replace(/Tish'?a?\s*B'?Av/i,"Tisha B'Av");
  t = t.replace(/\bI{1,3}\b$/,'').trim();
  if (/^Hanukkah/i.test(t)) t = 'Hanukkah';
  if (/^Shushan Purim/i.test(t)) t = 'Purim';
  return t;
}
const isSupportedHoliday = n => HOLIDAY_CANON.includes(n);

// ================= 3) Location =================
function tzOnlyLocation(){
  const tzid = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return { tzid, lat:null, lon:null, il:false };
}
function inIsrael(lat, lon){
  return lat != null && lon != null && (lat >= 29 && lat <= 33.5 && lon >= 34 && lon <= 36.5);
}
async function requestGeolocation(){
  const tzid = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  // Permission preflight if available
  try {
    if (navigator.permissions && navigator.permissions.query){
      const st = await navigator.permissions.query({ name:'geolocation' });
      if (st.state === 'denied') return { error:'denied' }; // 不再弹
      // 'granted' 也继续走获取
    }
  } catch {}
  try {
    const pos = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('unsupported'));
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true, timeout: 8000, maximumAge: 300000,
      });
    });
    const lat = pos.coords.latitude, lon = pos.coords.longitude;
    return { tzid, lat, lon, il: inIsrael(lat, lon) };
  } catch (e){
    // 常见原因：非 HTTPS、用户拒绝、iframe 被限制、超时
    if (location.protocol !== 'https:' && location.hostname !== 'localhost'){
      return { error:'insecure' };
    }
    if (e && typeof e.code === 'number'){
      if (e.code === 1) return { error:'denied' };       // PERMISSION_DENIED
      if (e.code === 2) return { error:'unavailable' };  // POSITION_UNAVAILABLE
      if (e.code === 3) return { error:'timeout' };      // TIMEOUT
    }
    return { error:'unknown' };
  }
}

// ================= 4) Hebcal API =================
function hebcalUrl(year, {lat, lon, tzid, il}, hebcalLang){
  const usp = new URLSearchParams({
    v:'1', cfg:'json', maj:'on', min:'on', mod:'on',
    year:String(year), c:'on', b:'18', lg: hebcalLang || 'en'
  });
  if (lat != null && lon != null){
    usp.set('geo','pos'); usp.set('latitude', String(lat));
    usp.set('longitude', String(lon)); usp.set('tzid', tzid);
  } else {
    usp.set('geo','tz'); usp.set('tzid', tzid);
  }
  if (il) usp.set('i','on'); // Israel rules
  return `https://www.hebcal.com/hebcal/?${usp.toString()}`;
}
async function fetchHebcalForYears(loc, years, hebcalLang){
  const jobs = years.map(y => fetch(hebcalUrl(y, loc, hebcalLang))
    .then(r => r.ok ? r.json() : {items:[]})
    .catch(() => ({items:[]})));
  const results = await Promise.all(jobs);
  return results.flatMap(r => Array.isArray(r.items) ? r.items : [])
    .map(it => ({
      title: it.title,
      date: it.date ? new Date(it.date) : null,
      category: it.category,
      hebrew: it.hebrew || '',
      subcat: it.subcat || '',
    }))
    .filter(it => it.date instanceof Date && !isNaN(it.date));
}

// ================= 5) Build model (cluster + sundown starts) =================
function buildHolidayModel(items){
  const now = new Date();
  const candles = items.filter(i => i.category === 'candles');
  const holidaysRaw = items.filter(i => i.category === 'holiday');

  const normalized = holidaysRaw.map(it => ({
    name: normalizeHolidayTitle(it.title),
    date: it.date,
    hebrew: it.hebrew || '',
    isErev: /^Erev\s+/i.test(it.title),
  })).filter(it => isSupportedHoliday(it.name))
    .sort((a,b) => a.date - b.date);

  const daysByName = new Map();
  const erevByName = new Map();
  for (const it of normalized){
    if (it.isErev){
      if (!erevByName.has(it.name)) erevByName.set(it.name, []);
      erevByName.get(it.name).push(it.date);
    } else {
      if (!daysByName.has(it.name)) daysByName.set(it.name, []);
      daysByName.get(it.name).push({ date: it.date, hebrew: it.hebrew });
    }
  }

  // cluster contiguous (<=3d gap) into one occurrence
  const occurrences = [];
  for (const [name, arr] of daysByName){
    arr.sort((a,b)=>a.date-b.date);
    let cluster = null;
    for (const d of arr){
      if (!cluster){
        cluster = { name, days:[d], hebrewLabel:d.hebrew };
        occurrences.push(cluster);
        continue;
      }
      const prev = cluster.days[cluster.days.length-1];
      const gapDays = (d.date - prev.date) / (1000*60*60*24);
      if (gapDays > 3){
        cluster = { name, days:[d], hebrewLabel:d.hebrew };
        occurrences.push(cluster);
      } else {
        cluster.days.push(d);
      }
    }
  }

  // compute sundown start
  const results = [];
  for (const occ of occurrences){
    occ.days.sort((a,b)=>a.date-b.date);
    const firstDay = occ.days[0].date;

    let candleMatch = null;
    for (const c of candles){
      const diffMs = firstDay - c.date;
      if (diffMs >= 0 && diffMs <= 1000*60*60*60){ // 60h window
        if (!candleMatch || c.date > candleMatch.date) candleMatch = c;
      }
    }

    let start, approx = false;
    if (candleMatch){
      start = candleMatch.date;
    } else {
      const erevs = (erevByName.get(occ.name) || []).slice().sort((a,b)=>a-b);
      let chosen = null;
      for (const e of erevs){
        const diffMs = firstDay - e;
        if (diffMs >= 0 && diffMs <= 1000*60*60*60){ chosen = e; }
      }
      if (chosen){
        start = new Date(chosen); start.setHours(18,0,0,0); approx = true;
      } else {
        start = new Date(firstDay); start.setDate(start.getDate()-1); start.setHours(18,0,0,0); approx = true;
      }
    }

    results.push({
      name: occ.name,
      start,
      firstDay,
      days: occ.days,
      hebrewLabel: occ.hebrewLabel,
      approxStart: approx,
    });
  }

  results.sort((a,b)=>a.start-b.start);
  const next = results.find(h => h.start > now) || null;
  return { next, all: results };
}

// ================= 6) Rendering =================
function startCountdown(nextHoliday, tz, uiLang){
  const el = document.getElementById(COUNTDOWN_EL_ID);
  if (!el) return;
  if (!nextHoliday){ el.textContent = (uiLang.startsWith('zh')?'暂无即将到来的节日':'No upcoming holiday found.'); return; }

  const target = nextHoliday.start;
  const approx = nextHoliday.approxStart;
  const pad = n => String(n).padStart(2,'0');

  function tick(){
    const now = new Date();
    const diff = Math.max(0, target - now);
    const sec = Math.floor(diff/1000) % 60;
    const min = Math.floor(diff/(1000*60)) % 60;
    const hr  = Math.floor(diff/(1000*60*60)) % 24;
    const day = Math.floor(diff/(1000*60*60*24));
    const note = approx ? (uiLang.startsWith('zh')?'（近似值—开启定位以获取精确日落）':' (approximate — enable location for precise sunset)') : '';
    el.innerHTML =
      `${uiLang.startsWith('zh')?'下一个节日':'Next up'}: <strong>${nextHoliday.name}</strong><br>`+
      `${uiLang.startsWith('zh')?'开始时间':'Begins at'} <strong>${fmtDateTime(target, tz, uiLang)}</strong>${note}<br>`+
      `${uiLang.startsWith('zh')?'倒计时':'Countdown'}: <strong>${day}d ${pad(hr)}:${pad(min)}:${pad(sec)}</strong>`;
  }
  tick();
  setInterval(tick, 1000);
}

function renderTimeline(holidays, tz, uiLang){
  const box = document.getElementById(TIMELINE_CONTAINER_ID);
  if (!box) return;
  box.innerHTML = '';

  const now = new Date();
  const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth()+14);

  const upcoming = holidays
    .filter(h => h.firstDay < cutoff)
    .sort((a,b)=>a.firstDay - b.firstDay);

  for (const h of upcoming){
    const wrapper = document.createElement('details');
    wrapper.className = 'timeline-item';

    const summary = document.createElement('summary');
    const lastDay = h.days.length ? h.days[h.days.length-1].date : h.firstDay;
    const duration = Math.max(1, Math.round((lastDay - h.firstDay)/(1000*60*60*24)) + 1);
    summary.innerHTML =
      `<span class="timeline-dot" aria-hidden="true"></span>`+
      `<span class="timeline-title">${h.name}</span>`+
      `<span class="timeline-date">${fmtDate(h.firstDay, tz, uiLang)} (${duration} day${duration>1?'s':''})</span>`;
    wrapper.appendChild(summary);

    const body = document.createElement('div');
    body.className = 'timeline-body';

    const p1 = document.createElement('p');
    const approxNote = h.approxStart ? (uiLang.startsWith('zh')?' <em>（近似值—开启定位以获取精确日落）</em>':' <em>(approximate — enable location for precise sunset)</em>') : '';
    p1.innerHTML = `<strong>${uiLang.startsWith('zh')?'开始时间':'Begins'}:</strong> ${fmtDateTime(h.start, tz, uiLang)}${approxNote}`;
    body.appendChild(p1);

    if (h.days && h.days.length){
      const p2 = document.createElement('p');
      p2.innerHTML = `<strong>${uiLang.startsWith('zh')?'范围':'Range'}:</strong> ${fmtDate(h.firstDay, tz, uiLang)} – ${fmtDate(lastDay, tz, uiLang)}`;
      body.appendChild(p2);

      const detailsDays = document.createElement('details');
      const sum = document.createElement('summary');
      sum.textContent = uiLang.startsWith('zh') ? '显示逐日' : 'Show individual days';
      detailsDays.appendChild(sum);
      const ul = document.createElement('ul');
      ul.className = 'timeline-days';
      for (const d of h.days){
        const li = document.createElement('li');
        li.innerHTML = `${fmtDate(d.date, tz, uiLang)} <em>${d.hebrew || ''}</em>`;
        ul.appendChild(li);
      }
      detailsDays.appendChild(ul);
      body.appendChild(detailsDays);
    }

    if (DESCRIPTIONS[h.name]){
      const desc = document.createElement('p');
      desc.textContent = DESCRIPTIONS[h.name];
      body.appendChild(desc);
    }

    wrapper.appendChild(body);
    box.appendChild(wrapper);
  }
}

// ================= 7) Modal (consent + language) =================
function injectModalStyles(){
  if (document.getElementById('jh-modal-style')) return;
  const css = `
  .jh-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:9999}
  .jh-modal{background:#fff;max-width:560px;width:92%;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.2);padding:20px}
  .jh-h{font-size:1.25rem;margin:0 0 .25rem 0;font-weight:700}
  .jh-sub{margin:.25rem 0 1rem 0;color:#555}
  .jh-row{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem}
  .jh-btn{appearance:none;border:0;border-radius:12px;padding:.6rem .9rem;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .jh-btn.primary{background:#0d6efd;color:#fff}
  .jh-btn.secondary{background:#eef1f4;color:#0d1b2a}
  .jh-small{font-size:.9rem;color:#666;margin-top:.5rem}
  .jh-select{padding:.45rem .6rem;border-radius:10px;border:1px solid #d0d7de}
  .jh-check{display:flex;align-items:center;gap:.4rem;margin-top:.5rem;color:#555}
  `;
  const style = document.createElement('style');
  style.id = 'jh-modal-style';
  style.textContent = css;
  document.head.appendChild(style);
}
function showConsentModal({onChoose}){
  injectModalStyles();
  const backdrop = document.createElement('div');
  backdrop.className = 'jh-backdrop';
  const modal = document.createElement('div');
  modal.className = 'jh-modal';

  const uiLangAuto = detectLang();
  const t = (uiLangAuto.startsWith('zh') ? {
    title: '提升时间精度',
    sub: '我们只会用你的位置来计算时区与本地日落（烛光）时间。',
    use: '使用我的位置（用于时区 & 精确日落）',
    skip: '仅用时区（略低精度）',
    remember: '记住我的选择',
    lang: '站点语言',
  } : {
    title: 'Improve time accuracy',
    sub: 'We only use your location to compute your time zone and precise local sunset.',
    use: 'Use my location (for time zone & precise sunset)',
    skip: 'Use time zone only (lower precision)',
    remember: 'Remember my choice',
    lang: 'Site language',
  });

  modal.innerHTML = `
    <div class="jh-h">${t.title}</div>
    <div class="jh-sub">${t.sub}</div>
    <label class="jh-small">${t.lang}:
      <select class="jh-select" id="jh-lang">
        <option value="auto">Auto (${uiLangAuto})</option>
        <option value="en">English</option>
        <option value="he">עברית</option>
        <option value="zh-CN">简体中文</option>
        <option value="zh-TW">繁體中文</option>
      </select>
    </label>
    <label class="jh-check"><input type="checkbox" id="jh-remember"/> ${t.remember}</label>
    <div class="jh-row">
      <button class="jh-btn primary" id="jh-yes">${t.use}</button>
      <button class="jh-btn secondary" id="jh-no">${t.skip}</button>
    </div>
  `;
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  const cleanup = () => backdrop.remove();
  document.getElementById('jh-yes').onclick = () => {
    const langSel = document.getElementById('jh-lang').value;
    const remember = document.getElementById('jh-remember').checked;
    onChoose({ consent:'granted', lang: langSel, remember });
    cleanup();
  };
  document.getElementById('jh-no').onclick = () => {
    const langSel = document.getElementById('jh-lang').value;
    const remember = document.getElementById('jh-remember').checked;
    onChoose({ consent:'denied', lang: langSel, remember });
    cleanup();
  };
}

// ================= 8) Render pipeline =================
async function renderAll(loc, uiLang, hebcalLang){
  const year = new Date().getFullYear();
  const items = await fetchHebcalForYears(loc, [year, year+1], hebcalLang);
  const { next, all } = buildHolidayModel(items);

  if (document.getElementById(COUNTDOWN_EL_ID)) startCountdown(next, loc.tzid, uiLang);
  if (document.getElementById(TIMELINE_CONTAINER_ID)) renderTimeline(all, loc.tzid, uiLang);

  return { hasApprox: all.some(h => h.approxStart) };
}

async function initJewishCalendar(){
  const hasWidgets = document.getElementById(COUNTDOWN_EL_ID) || document.getElementById(TIMELINE_CONTAINER_ID);
  if (!hasWidgets) return;

  const cEl = document.getElementById(COUNTDOWN_EL_ID);
  if (cEl) cEl.textContent = detectLang().startsWith('zh') ? '正在加载…' : 'Loading next holiday…';

  // 1) Load prefs
  const prefs = loadPrefs();
  let uiLang = (prefs.lang && prefs.lang !== 'auto') ? prefs.lang : detectLang();
  let hebcalLang = normalizeHebcalLang(uiLang);

  // 2) If browser already granted geolocation, use it silently for best UX
  let loc = tzOnlyLocation();
  try {
    if (navigator.permissions && navigator.permissions.query){
      const st = await navigator.permissions.query({ name:'geolocation' });
      if (st.state === 'granted'){
        const got = await requestGeolocation();
        if (!got.error) loc = got;
      }
    }
  } catch {}

  // 3) If no prior consent remembered, show modal at entry
  if (!prefs.consent){
    showConsentModal({
      onChoose: async ({consent, lang, remember}) => {
        if (lang && lang !== 'auto'){ uiLang = lang; hebcalLang = normalizeHebcalLang(uiLang); }
        if (remember) savePrefs({ consent, lang: (lang||'auto') });

        if (consent === 'granted'){
          const got = await requestGeolocation();
          if (!got || got.error){
            // fallback with reason
            await renderAll(loc, uiLang, hebcalLang); // tz-only
            const el = document.getElementById(COUNTDOWN_EL_ID);
            if (el){
              const msg = (uiLang.startsWith('zh')?'定位不可用：':'Location unavailable: ') + (got?got.error:'unknown');
              const hint = (uiLang.startsWith('zh')?
                '（请确保网站通过 HTTPS 访问、未在浏览器里禁用定位、或不在受限的内嵌环境中）'
                : ' (Make sure the site is served over HTTPS, location is allowed, and not inside a restricted iframe).');
              const p = document.createElement('div'); p.style.color='#b00'; p.style.marginTop='4px';
              p.textContent = msg + hint; el.insertAdjacentElement('afterend', p);
            }
          } else {
            await renderAll(got, uiLang, hebcalLang);
          }
        } else {
          // denied -> tz-only
          await renderAll(loc, uiLang, hebcalLang);
        }
      }
    });
  } else {
    // have remembered prefs
    if (prefs.lang && prefs.lang !== 'auto'){ uiLang = prefs.lang; hebcalLang = normalizeHebcalLang(uiLang); }
    if (prefs.consent === 'granted'){
      const got = await requestGeolocation();
      loc = (!got || got.error) ? loc : got;
    }
    await renderAll(loc, uiLang, hebcalLang);
  }
}

// Kick off after DOM is ready
if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initJewishCalendar);
} else {
  initJewishCalendar();
}
