// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: balance-scale;

// ═══════════════════════════════════════════════════════════
//  ⚖️  Hüquq faktı — mərkəzdən idarə olunan iPhone widget-i
//  Kalkhan üslubu: krem fon, qalın qara çərçivə, pastel kart.
//  Bu faylı dəyişmək lazım deyil. Faktlar admin paneldən gəlir.
//
//  Widget "Edit Widget → Parameter" sahəsini qəbul edir:
//    Əmək hüququ                       → yalnız bu kateqoriya
//    kateqoriya=Əmək hüququ;movzu=court → kateqoriya və mövzu
//  Mövzular: kalkhan, court, ink, night, ocean, sunset, forest, light
// ═══════════════════════════════════════════════════════════

// Data ünvanları: əvvəl birincisi, alınmasa növbətisi yoxlanılır.
// Quraşdırma səhifəsi bunu avtomatik doldurur.
const BASES = ["__BASE__"];
const USE_SERIF = true; // fakt mətni üçün Georgia (söndürmək üçün false)
const REFRESH_MINUTES = 5; // iOS bunu tövsiyə kimi qəbul edir, dəqiq vaxt zəmanət deyil
const HOLD_SECONDS = 90; // "Növbəti" basandan sonra widget həmin faktı bu qədər saxlayır

// ───────────── Mövzular ─────────────
const INK = "#171C26";
const PASTELS = ["#F7DFB6", "#B8EACD", "#AFD7F4", "#F9C8D0", "#DBC6F1", "#FAEDA8"]; // sand, mint, sky, rose, lilac, lemon

const THEMES = {
  // Kalkhan: krem fon, qara çərçivəli pastel kart (rəng kateqoriyaya görə seçilir)
  kalkhan: { kind: "nb", bg: "#FAF5E5", ink: INK, sub: "#4A5160", logo: "dark" },
  // Məhkəmə zalı: maqon və qızıl
  court: { bg: ["#1A0C05", "#4A2C0A"], text: "#F5F0E8", sub: "#CDB98C", accent: "#E6C668", line: "#C9A84C", lineAlpha: 0.5 },
  ink: { bg: ["#14213D", "#2340C8"], text: "#FFFFFF", sub: "#C3CCF2", accent: "#FFD27A", line: "#FFFFFF", lineAlpha: 0.22 },
  night: { bg: ["#0F172A", "#3B2F8F"], text: "#FFFFFF", sub: "#C7D2FE", accent: "#A78BFA", line: "#FFFFFF", lineAlpha: 0.2 },
  ocean: { bg: ["#0B3954", "#0891B2"], text: "#FFFFFF", sub: "#CFFAFE", accent: "#FDE68A", line: "#FFFFFF", lineAlpha: 0.22 },
  sunset: { bg: ["#7C2D12", "#DB2777"], text: "#FFFFFF", sub: "#FFE4E6", accent: "#FCD34D", line: "#FFFFFF", lineAlpha: 0.22 },
  forest: { bg: ["#052E16", "#15803D"], text: "#FFFFFF", sub: "#DCFCE7", accent: "#FDE68A", line: "#FFFFFF", lineAlpha: 0.22 },
  light: { bg: ["#F8FAFC", "#DDE5FF"], text: "#14213D", sub: "#51607A", accent: "#2340C8", line: "#14213D", lineAlpha: 0.18, logo: "dark" },
};

const FALLBACK = [
  { id: "f1", text: "Qanunu bilməmək məsuliyyətdən azad etmir.", category: "Ümumi hüquq", source: "Ümumi hüquq prinsipi", active: true },
  { id: "f2", text: "Təqsirsizlik prezumpsiyası: şəxs məhkəmənin qanuni qüvvəyə minmiş hökmü olmadan təqsirli sayıla bilməz.", category: "Cinayət hüququ", source: "Ümumi hüquq prinsipi", active: true },
  { id: "f3", text: "Hamı qanun və məhkəmə qarşısında bərabərdir.", category: "Konstitusiya hüququ", source: "Bərabərlik prinsipi", active: true },
];

// ───────────── Loqo (KalkHan) ─────────────
// Kiçik PNG-lər skriptin içindədir, internet lazım deyil.
// dark = açıq fon üçün (qara yazı), light = tünd fon üçün (krem yazı).
const LOGO = {
  lockup: {
    dark: { d: "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", w: 315, h: 72 },
    light: { d: "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", w: 315, h: 72 },
  },
  mark: {
    dark: { d: "iVBORw0KGgoAAAANSUhEUgAAADMAAABABAMAAABFOVJ2AAAAJFBMVEX/kk//9e8AAAD/y6r/uY7//fz/hjv/q1z/omb/q3f/fzv/eHjo3DYCAAAADHRSTlP9/QD9/gr+B5pRAwKp1HMdAAAC6UlEQVR42r2VXWjUWBTHf/dmmqYulFwrvig6m6UOCDoD4seL0ELxA0XLguzjhl0YfPEDVCgVZCgoVCgWoaII+iqIIj4IPlkQwYJiFmV9ECRlUYaFmmD9SDtOrg/JTNN0fPXAJdzzz/+cc0/OP1c4JLb9QG1nqWfGO3/bSxyxSKD4j9vGqaNgTUx0HbqTuAwF8O7Sla17TgPfHpzQj46YdUDjOE5x1Om/Ci6AizXllM44jlMUDu+u17ZWaoVykkI8Y3zGO/LGiymOOv0jgKFSA6wpp3SyKO6f3FmqAUZvWmoAMD7jHaJ/JHUNqb6hIbVmINlZU0UmUwRT2a6r1ra21FgyZSerZTIBhVIKkSyVQiJ9ZN6mPJ2w+HkmGPQ6AuVp0W5QzuScUPxmd0DmfI2yXcyqC2aVqmtWAbMKrrJR5g+KsCWLgKqAUCjbUMCg/cNuhAB/dYRsgBgU8LciG1D0uUkuG/NGjha/BxuJGGjaxjJE85xBkCH/9LJ+OasSK49Q6iLoXBsfARuRvCjqMF9jwEYPidmphZiQdGOlLYIEr9AB8pNGNTt84AJIBFTy0ABNkBcquui7OcjT7EAkwxmAsAOl53sDEDYyJpCtCMvCEQNyGIDpLJRshiXlIPg9X8bh4HOIEfkRfPwKwop6WOyOwOiO6k07LHSJvg2+XsZpMrvtbQG5JYx9wvxwvGWuIg0J5Vwq/RHJPaO55r/Ih2wu0JHe9ItcONix882LSLm7M9REOF0LfjrJrUYBlBqxpDE2uZJ0+SwIB0u/zrN6fo2IJUTjK0gLI4BwwPri51ibI4glEI3lxboPwFDAk9XHpzNHPl9/BWgJ0Ji4leFYz/dmpHdqNHOAiw/v0Q6Ifvo4bAec3VWnHRCiMWuphlQc6RVAV+PPyUDp+d5PTiPVX0vLjWs3AVy97k17hFt3CsOzd5SeP3y35UgvDoB/Pxyb4dzDtqT0EovK63r3qkpboHHmv/Fy/8D/1zLS/Q5tKvZxzjql9gAAAABJRU5ErkJggg==", w: 51, h: 64 },
    light: { d: "iVBORw0KGgoAAAANSUhEUgAAADMAAABABAMAAABFOVJ2AAAAJFBMVEX/kk//9e8AAAD/y6r/uY7//fz/hjv/q1z/omb/q3f/fzv/eHjo3DYCAAAADHRSTlP9/QD9/gr+B5pRAwKp1HMdAAAC6UlEQVR42r2VXWjUWBTHf/dmmqYulFwrvig6m6UOCDoD4seL0ELxA0XLguzjhl0YfPEDVCgVZCgoVCgWoaII+iqIIj4IPlkQwYJiFmV9ECRlUYaFmmD9SDtOrg/JTNN0fPXAJdzzz/+cc0/OP1c4JLb9QG1nqWfGO3/bSxyxSKD4j9vGqaNgTUx0HbqTuAwF8O7Sla17TgPfHpzQj46YdUDjOE5x1Om/Ci6AizXllM44jlMUDu+u17ZWaoVykkI8Y3zGO/LGiymOOv0jgKFSA6wpp3SyKO6f3FmqAUZvWmoAMD7jHaJ/JHUNqb6hIbVmINlZU0UmUwRT2a6r1ra21FgyZSerZTIBhVIKkSyVQiJ9ZN6mPJ2w+HkmGPQ6AuVp0W5QzuScUPxmd0DmfI2yXcyqC2aVqmtWAbMKrrJR5g+KsCWLgKqAUCjbUMCg/cNuhAB/dYRsgBgU8LciG1D0uUkuG/NGjha/BxuJGGjaxjJE85xBkCH/9LJ+OasSK49Q6iLoXBsfARuRvCjqMF9jwEYPidmphZiQdGOlLYIEr9AB8pNGNTt84AJIBFTy0ABNkBcquui7OcjT7EAkwxmAsAOl53sDEDYyJpCtCMvCEQNyGIDpLJRshiXlIPg9X8bh4HOIEfkRfPwKwop6WOyOwOiO6k07LHSJvg2+XsZpMrvtbQG5JYx9wvxwvGWuIg0J5Vwq/RHJPaO55r/Ih2wu0JHe9ItcONix882LSLm7M9REOF0LfjrJrUYBlBqxpDE2uZJ0+SwIB0u/zrN6fo2IJUTjK0gLI4BwwPri51ibI4glEI3lxboPwFDAk9XHpzNHPl9/BWgJ0Ji4leFYz/dmpHdqNHOAiw/v0Q6Ifvo4bAec3VWnHRCiMWuphlQc6RVAV+PPyUDp+d5PTiPVX0vLjWs3AVy97k17hFt3CsOzd5SeP3y35UgvDoB/Pxyb4dzDtqT0EovK63r3qkpboHHmv/Fy/8D/1zLS/Q5tKvZxzjql9gAAAABJRU5ErkJggg==", w: 51, h: 64 },
  },
};

function addLogo(parent, kind, T, height) {
  const a = LOGO[kind][T.logo || "light"];
  try {
    const img = parent.addImage(Image.fromData(Data.fromBase64String(a.d)));
    img.imageSize = new Size(Math.round((height * a.w) / a.h), height);
    return img;
  } catch (e) {
    return null;
  }
}

// ───────────── Yaddaş (telefonda, offline üçün) ─────────────
const fm = FileManager.local();
const dir = fm.documentsDirectory();

function readJSON(name) {
  const p = fm.joinPath(dir, name);
  if (!fm.fileExists(p)) return null;
  try {
    return JSON.parse(fm.readString(p));
  } catch (e) {
    return null;
  }
}
function writeJSON(name, obj) {
  try {
    fm.writeString(fm.joinPath(dir, name), JSON.stringify(obj));
  } catch (e) {}
}

// ───────────── Məlumat ─────────────
async function getJSON(path) {
  let lastErr = new Error("Data ünvanı yoxdur");
  for (let i = 0; i < BASES.length; i++) {
    try {
      const r = new Request(BASES[i] + path + "?t=" + Date.now());
      r.timeoutInterval = 8;
      return await r.loadJSON();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

// Əvvəl kiçik meta.json yoxlanır; versiya dəyişibsə facts.json yenidən yüklənir.
async function loadData() {
  let cache = readJSON("huquq-cache.json");
  let meta = null;
  try {
    meta = await getJSON("meta.json");
  } catch (e) {}

  if (meta && (!cache || cache.version !== meta.version)) {
    try {
      const data = await getJSON("facts.json");
      cache = { version: meta.version, facts: data.facts || [], settings: meta.settings || {}, fetchedAt: Date.now() };
      writeJSON("huquq-cache.json", cache);
    } catch (e) {}
  } else if (meta && cache) {
    cache.settings = meta.settings || {};
    writeJSON("huquq-cache.json", cache);
  }
  return {
    version: cache ? cache.version : "fallback",
    facts: cache && cache.facts && cache.facts.length ? cache.facts : FALLBACK,
    settings: (meta && meta.settings) || (cache && cache.settings) || {},
    online: !!meta,
  };
}

function norm(s) {
  try {
    return String(s || "").toLocaleLowerCase("az").trim();
  } catch (e) {
    return String(s || "").toLowerCase().trim();
  }
}

function upper(s) {
  try {
    return String(s || "").toLocaleUpperCase("az");
  } catch (e) {
    return String(s || "").toUpperCase();
  }
}

// Kateqoriya adından pastel rəng (quraşdırma səhifəsi və admin ilə eyni qayda)
function pastelFor(category) {
  const t = String(category || "").trim();
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
  return PASTELS[h % PASTELS.length];
}

function parseParam(raw) {
  const out = {};
  if (!raw) return out;
  const s = String(raw).trim();
  if (!s) return out;
  if (s.indexOf("=") === -1) {
    out.category = s;
    return out;
  }
  s.split(";").forEach((pair) => {
    const i = pair.indexOf("=");
    if (i < 1) return;
    const k = norm(pair.slice(0, i));
    const v = pair.slice(i + 1).trim();
    if (k === "kateqoriya" || k === "category") out.category = v;
    if (k === "movzu" || k === "mövzu" || k === "theme") out.theme = v;
  });
  return out;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

// Qarışdırılmış növbə: bütün faktlar təkrarsız göstərilir, sonra yenidən qarışdırılır.
// mode:
//   "render" — widget yenilənir: yeni fakt götürülür (istifadəçi yeni dəyişibsə həmin fakt saxlanılır)
//   "peek"   — hazırda widget-də görünən fakt (dəyişmir)
//   "next"   — istifadəçi "Növbəti" basdı: dərhal yeni fakt, widget onu bir müddət saxlayır
function pickFact(facts, version, filterKey, mode) {
  const byId = {};
  facts.forEach((f) => (byId[f.id] = f));
  const state = readJSON("huquq-state.json") || {};
  const s = state[filterKey] || {};
  const same = s.v === version;
  const hasLast = same && s.last && byId[s.last];

  if (mode !== "next" && hasLast) {
    if (mode === "peek") {
      // fakt oxunur: geri qayıdanda widget eyni faktı göstərsin
      state[filterKey] = Object.assign({}, s, { holdUntil: Date.now() + HOLD_SECONDS * 1000 });
      writeJSON("huquq-state.json", state);
      return byId[s.last];
    }
    if (s.holdUntil && Date.now() < s.holdUntil) return byId[s.last];
  }

  let queue = same && Array.isArray(s.queue) ? s.queue.filter((id) => byId[id]) : [];
  if (!queue.length) {
    queue = shuffle(facts.map((f) => f.id));
    if (queue.length > 1 && queue[0] === s.last) queue.push(queue.shift());
  }
  const id = queue.shift();
  // istifadəçi dəyişəndə widget-in bir neçə dəfə yenilənməsi faktı dəyişməsin deyə 90 saniyə saxlanılır
  const holdUntil = mode === "render" ? 0 : Date.now() + HOLD_SECONDS * 1000;
  state[filterKey] = { v: version, queue: queue, last: id, holdUntil: holdUntil };
  writeJSON("huquq-state.json", state);
  return byId[id];
}

async function getCurrent(mode) {
  const param = parseParam(args.widgetParameter);
  const data = await loadData();
  const settings = data.settings || {};
  let pool = data.facts.filter((f) => f.active !== false);
  if (param.category) {
    const c = norm(param.category);
    const filtered = pool.filter((f) => norm(f.category).indexOf(c) !== -1);
    if (filtered.length) pool = filtered;
  }
  if (!pool.length) pool = FALLBACK;
  const fact = pickFact(pool, data.version, param.category ? norm(param.category) : "*", mode || "render");
  const themeName = param.theme || settings.theme || "kalkhan";
  return {
    fact: fact,
    title: settings.title || "Hüquq faktı",
    footer: settings.footer === undefined ? "Ümumi məlumat xarakterlidir, hüquqi məsləhət deyil." : settings.footer,
    theme: THEMES[themeName] || THEMES.kalkhan,
  };
}

// ───────────── Kömək funksiyaları ─────────────
function col(hex, alpha) {
  return alpha === undefined ? new Color(hex) : new Color(hex, alpha);
}

function factFont(size, bold) {
  if (!USE_SERIF) return bold ? Font.boldSystemFont(size) : Font.mediumSystemFont(size);
  return new Font(bold ? "Georgia-Bold" : "Georgia", size);
}

function label(parent, str, size, weight, color, opts) {
  const o = opts || {};
  const t = parent.addText(String(str));
  const fonts = {
    regular: (s) => Font.systemFont(s),
    medium: (s) => Font.mediumSystemFont(s),
    semibold: (s) => Font.semiboldSystemFont(s),
    bold: (s) => Font.boldSystemFont(s),
    heavy: (s) => Font.heavySystemFont(s),
  };
  t.font = fonts[weight || "regular"](size);
  t.textColor = col(color);
  t.lineLimit = o.lines || 1;
  t.minimumScaleFactor = o.scale || 0.8;
  return t;
}

// Mətn uzunluğuna görə şrift ölçüsü: [maksimum simvol, ölçü]
const SIZES = {
  grad: {
    small: [[60, 15], [100, 13], [150, 11.5], [9999, 10.5]],
    medium: [[90, 17], [150, 15], [230, 13.5], [9999, 12]],
    large: [[110, 25], [190, 21], [290, 18], [9999, 15.5]],
  },
  nb: {
    small: [[45, 14], [80, 12.5], [120, 11], [9999, 10]],
    medium: [[70, 17], [110, 15], [160, 13.5], [220, 12], [9999, 11]],
    large: [[90, 24], [150, 21], [230, 18], [320, 16], [9999, 14]],
  },
};
function bodySize(kind, family, len) {
  const table = SIZES[kind][family];
  for (let i = 0; i < table.length; i++) if (len <= table[i][0]) return table[i][1];
  return 11;
}

// ───────────── Ana ekran: Kalkhan (neubrutalizm) ─────────────
// Qara "kölgə" konteyneri + içində pastel kart: sağ və aşağıda qalın qara zolaq sərt kölgə effekti verir.
function nbFrame(w, T, cur, family) {
  const k = {
    small: { pad: 9, sh: 4, bw: 2.5, ip: 9, r: 16 },
    medium: { pad: 11, sh: 5, bw: 3, ip: 13, r: 18 },
    large: { pad: 13, sh: 6, bw: 3.5, ip: 16, r: 20 },
  }[family];
  w.backgroundColor = col(T.bg);
  w.setPadding(k.pad, k.pad, k.pad, k.pad);
  const shadow = w.addStack();
  shadow.layoutVertically();
  shadow.backgroundColor = col(T.ink);
  shadow.cornerRadius = k.r;
  shadow.setPadding(0, 0, k.sh, k.sh);
  const card = shadow.addStack();
  card.layoutVertically();
  card.backgroundColor = col(pastelFor(cur.fact.category));
  card.cornerRadius = k.r - 2;
  card.borderWidth = k.bw;
  card.borderColor = col(T.ink);
  card.setPadding(k.ip - 2, k.ip, k.ip - 2, k.ip);
  return card;
}

function chip(parent, text, size, T) {
  const c = parent.addStack();
  c.backgroundColor = col("#FFFFFF");
  c.cornerRadius = 6;
  c.borderWidth = 2;
  c.borderColor = col(T.ink);
  c.setPadding(2, 6, 2, 6);
  label(c, upper(text), size, "heavy", T.ink, { scale: 0.6 });
  return c;
}

function buildNb(w, family, cur) {
  const T = cur.theme;
  const f = cur.fact;
  const card = nbFrame(w, T, cur, family);
  const size = bodySize("nb", family, f.text.length);
  const bold = f.text.length <= (family === "large" ? 110 : 90);

  // başlıq: kateqoriya çipi
  const head = card.addStack();
  head.centerAlignContent();
  chip(head, f.category || cur.title, family === "small" ? 8.5 : 9.5, T);
  head.addSpacer();
  if (family === "small") {
    // kiçik widget-də ayrıca düymə işləmir: bütün widget "Növbəti" düyməsidir
    const hint = head.addText("↻");
    hint.font = Font.heavySystemFont(15);
    hint.textColor = col(T.ink);
  } else {
    nextButton(head, "nb", T);
  }

  card.addSpacer(family === "small" ? 6 : family === "large" ? 12 : 8);
  const t = card.addText(f.text);
  t.font = factFont(size, bold);
  t.textColor = col(T.ink);
  t.lineLimit = family === "large" ? 11 : family === "small" ? 7 : 5;
  t.minimumScaleFactor = 0.6;
  card.addSpacer();

  if (family === "large") {
    if (f.source) label(card, "§ " + f.source, 11, "bold", T.sub, { lines: 2, scale: 0.7 });
    card.addSpacer(8);
    const rule = card.addStack();
    rule.size = new Size(0, 2);
    rule.backgroundColor = col(T.ink);
    card.addSpacer(8);
    const row = card.addStack();
    row.centerAlignContent();
    addLogo(row, "lockup", T, 20);
    row.addSpacer();
    if (cur.footer) label(row, cur.footer, 8.5, "medium", T.sub, { scale: 0.6 });
  } else {
    const foot = card.addStack();
    foot.centerAlignContent();
    if (f.source && (family !== "small" || f.text.length <= 80)) {
      label(foot, "§ " + f.source, family === "small" ? 8.5 : 9.5, "bold", T.sub, { scale: 0.7 });
    }
    foot.addSpacer();
    if (family === "small") addLogo(foot, "mark", T, 15);
    else addLogo(foot, "lockup", T, 16);
  }
}

// "↻ Növbəti" düyməsi: toxunanda skript açılır, yeni fakt göstərilir və widget onu saxlayır.
// (iOS Scriptable widget-lərində düymənin tətbiqi açmadan işləməsinə icazə vermir.)
function nextButton(parent, kind, T) {
  const b = parent.addStack();
  b.centerAlignContent();
  b.cornerRadius = 7;
  b.setPadding(3, 8, 3, 8);
  b.url = nextUrl();
  if (kind === "nb") {
    b.backgroundColor = col(T.ink);
    label(b, "↻ NÖVBƏTİ", 9.5, "heavy", T.bg, { scale: 0.7 });
  } else {
    b.backgroundColor = col("#FFFFFF", 0.2);
    label(b, "↻ Növbəti", 10, "semibold", T.accent, { scale: 0.7 });
  }
  return b;
}

// ───────────── Ana ekran: gradient mövzular ─────────────
function gradHeader(parent, cur, size, T, family) {
  const row = parent.addStack();
  row.centerAlignContent();
  const ic = row.addText("⚖️");
  ic.font = Font.systemFont(size + 1);
  row.addSpacer(5);
  label(row, cur.fact.category || cur.title, size, "semibold", T.accent);
  row.addSpacer();
  if (family === "small") {
    const hint = row.addText("↻");
    hint.font = Font.heavySystemFont(14);
    hint.textColor = col(T.accent);
  } else {
    nextButton(row, "grad", T);
  }
}

function withBar(parent, T) {
  const row = parent.addStack();
  row.layoutHorizontally();
  const bar = row.addStack();
  bar.size = new Size(3, 0);
  bar.backgroundColor = col(T.accent);
  bar.cornerRadius = 1.5;
  bar.addSpacer();
  row.addSpacer(10);
  const body = row.addStack();
  body.layoutVertically();
  return body;
}

function buildGrad(w, family, cur) {
  const T = cur.theme;
  const f = cur.fact;
  const g = new LinearGradient();
  g.colors = T.bg.map((c) => col(c));
  g.locations = [0, 1];
  g.startPoint = new Point(0, 0);
  g.endPoint = new Point(1, 1);
  w.backgroundGradient = g;
  const size = bodySize("grad", family, f.text.length);

  if (family === "small") {
    w.setPadding(13, 13, 11, 13);
    gradHeader(w, cur, 10.5, T, "small");
    w.addSpacer(7);
    const t = w.addText(f.text);
    t.font = factFont(size, false);
    t.textColor = col(T.text);
    t.lineLimit = 9;
    t.minimumScaleFactor = 0.55;
    w.addSpacer();
    const foot = w.addStack();
    foot.centerAlignContent();
    if (f.source) label(foot, f.source, 8.5, "medium", T.sub, { scale: 0.7 });
    foot.addSpacer();
    addLogo(foot, "mark", T, 15);
  } else if (family === "large") {
    w.setPadding(18, 18, 14, 18);
    gradHeader(w, cur, 12, T, "large");
    w.addSpacer(12);
    const body = withBar(w, T);
    const t = body.addText(f.text);
    t.font = factFont(size, false);
    t.textColor = col(T.text);
    t.lineLimit = 12;
    t.minimumScaleFactor = 0.6;
    body.addSpacer();
    w.addSpacer();
    if (f.source) {
      label(w, f.source, 11, "semibold", T.sub, { lines: 2, scale: 0.8 });
      w.addSpacer(8);
    }
    const rule = w.addStack();
    rule.size = new Size(0, 1);
    rule.backgroundColor = col(T.line, T.lineAlpha);
    w.addSpacer(8);
    const row = w.addStack();
    row.centerAlignContent();
    addLogo(row, "lockup", T, 20);
    row.addSpacer();
    if (cur.footer) label(row, cur.footer, 9, "regular", T.sub, { scale: 0.6 });
  } else {
    w.setPadding(14, 16, 12, 16);
    gradHeader(w, cur, 11, T, "medium");
    w.addSpacer(8);
    const body = withBar(w, T);
    const t = body.addText(f.text);
    t.font = factFont(size, false);
    t.textColor = col(T.text);
    t.lineLimit = 7;
    t.minimumScaleFactor = 0.6;
    body.addSpacer();
    w.addSpacer();
    const foot = w.addStack();
    foot.centerAlignContent();
    if (f.source) label(foot, f.source, 9.5, "medium", T.sub, { scale: 0.7 });
    foot.addSpacer();
    addLogo(foot, "lockup", T, 16);
  }
}

function buildHome(family, cur) {
  const w = new ListWidget();
  w.refreshAfterDate = new Date(Date.now() + REFRESH_MINUTES * 60 * 1000);
  const fam = family === "extraLarge" ? "large" : family;
  // kiçik widget-də yalnız bir toxunuş hədəfi olur: bütün widget "Növbəti" düyməsidir
  w.url = fam === "small" ? nextUrl() : readUrl();
  if (cur.theme.kind === "nb") buildNb(w, fam, cur);
  else buildGrad(w, fam, cur);
  return w;
}

// ───────────── Kilid ekranı ─────────────
function buildLock(family, cur) {
  const f = cur.fact;
  const w = new ListWidget();
  w.refreshAfterDate = new Date(Date.now() + REFRESH_MINUTES * 60 * 1000);
  w.url = readUrl();

  if (family === "accessoryInline") {
    w.addText("⚖️ " + f.text);
  } else if (family === "accessoryCircular") {
    w.addAccessoryWidgetBackground = true;
    const s = w.addStack();
    s.layoutVertically();
    s.centerAlignContent();
    const i = s.addText("⚖️");
    i.font = Font.systemFont(24);
    i.centerAlignText();
  } else {
    w.addAccessoryWidgetBackground = true;
    const h = w.addText("⚖️ " + (f.category || cur.title));
    h.font = Font.boldSystemFont(11);
    h.lineLimit = 1;
    const t = w.addText(f.text);
    t.font = Font.systemFont(11);
    t.lineLimit = 3;
    t.minimumScaleFactor = 0.7;
  }
  return w;
}

// ───────────── Xəta widget-i ─────────────
function buildMessage(title, text) {
  const w = new ListWidget();
  w.backgroundColor = col("#FAF5E5");
  w.setPadding(14, 14, 14, 14);
  label(w, upper(title), 11, "heavy", INK);
  w.addSpacer(6);
  label(w, text, 11, "medium", "#4A5160", { lines: 6 });
  return w;
}

// Widget-ə toxunanda skript tətbiqdə açılır: mode=read (görünən faktı oxu), mode=next (yeni fakt)
function runUrl(mode) {
  const u = URLScheme.forRunningScript();
  return u + (u.indexOf("?") === -1 ? "?" : "&") + "mode=" + mode;
}
function readUrl() {
  return runUrl("read");
}
function nextUrl() {
  return runUrl("next");
}

// ───────────── Tətbiq daxilində oxu rejimi ─────────────
async function readerMode(firstMode) {
  let more = true;
  let mode = firstMode || "peek";
  while (more) {
    const cur = await getCurrent(mode);
    mode = "next";
    const a = new Alert();
    a.title = "⚖️ " + (cur.fact.category || cur.title);
    a.message = cur.fact.text + (cur.fact.source ? "\n\n" + cur.fact.source : "") + (cur.footer ? "\n\n" + cur.footer : "");
    a.addAction("Növbəti fakt");
    a.addAction("Kopyala");
    a.addCancelAction("Bağla");
    const i = await a.presentAlert();
    if (i === 1) Pasteboard.copyString(cur.fact.text + (cur.fact.source ? " — " + cur.fact.source : ""));
    more = i === 0 || i === 1;
  }
}

// ───────────── Tətbiq daxilində menyu (skripti Scriptable-də işə salanda) ─────────────
async function previewWidget(size) {
  const cur = await getCurrent("peek");
  const w = buildHome(size, cur);
  if (size === "small") await w.presentSmall();
  else if (size === "large") await w.presentLarge();
  else await w.presentMedium();
}

async function howTo() {
  const a = new Alert();
  a.title = "Widget-i ana ekrana qoyun";
  a.message =
    "Skripti Scriptable-də işə salmaq widget yaratmır. Widget ana ekrana ayrıca əlavə olunur:\n\n" +
    "1. Ana ekranda boş yerə uzun basın.\n" +
    "2. Sol üstdəki + işarəsinə basın.\n" +
    "3. Axtarışa “Scriptable” yazın və seçin.\n" +
    "4. Ölçünü seçin (orta ölçü Fitness widget-i kimidir) və “Add Widget” basın.\n" +
    "5. Ekrandakı boş widget-ə toxunun. Script sahəsində “" + Script.name() + "” seçin.\n\n" +
    "Kilid ekranı üçün: kilid ekranına uzun basın, Customize, sonra widget sahəsinə toxunub Scriptable seçin.";
  a.addCancelAction("Aydındır");
  await a.presentAlert();
}

async function appMenu() {
  let open = true;
  while (open) {
    const a = new Alert();
    a.title = "⚖️ Hüquq faktı";
    a.message = "Bu, tətbiqin içindəki menyudur. Widget-i ana ekrana əlavə etmək üçün “Ana ekrana necə qoymalı” seçin.";
    a.addAction("Widget ön baxışı: orta");
    a.addAction("Widget ön baxışı: böyük");
    a.addAction("Widget ön baxışı: kiçik");
    a.addAction("Fakt oxu");
    a.addAction("Ana ekrana necə qoymalı");
    a.addCancelAction("Bağla");
    const i = await a.presentSheet();
    if (i === 0) await previewWidget("medium");
    else if (i === 1) await previewWidget("large");
    else if (i === 2) await previewWidget("small");
    else if (i === 3) await readerMode("peek");
    else if (i === 4) await howTo();
    else open = false;
  }
}

// ───────────── İşə salma ─────────────
if (BASES[0].indexOf("__") === 0) {
  const w = buildMessage("Skript natamamdır", "Bu skripti quraşdırma səhifəsindəki 'Kodu kopyala' düyməsi ilə götürün.");
  if (config.runsInWidget) Script.setWidget(w);
  else await w.presentMedium();
} else if (config.runsInWidget) {
  const family = config.widgetFamily || "medium";
  let widget;
  try {
    const cur = await getCurrent();
    widget = family.indexOf("accessory") === 0 ? buildLock(family, cur) : buildHome(family, cur);
  } catch (e) {
    widget = buildMessage("Fakt yüklənmədi", String(e && e.message ? e.message : e));
  }
  Script.setWidget(widget);
} else {
  const mode = args.queryParameters && args.queryParameters.mode;
  if (mode === "next") await readerMode("next");
  else if (mode === "read") await readerMode("peek");
  else await appMenu();
}
Script.complete();
