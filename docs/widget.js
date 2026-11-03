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

// ───────────── Mövzular ─────────────
const INK = "#171C26";
const PASTELS = ["#F7DFB6", "#B8EACD", "#AFD7F4", "#F9C8D0", "#DBC6F1", "#FAEDA8"]; // sand, mint, sky, rose, lilac, lemon

const THEMES = {
  // Kalkhan: krem fon, qara çərçivəli pastel kart (rəng kateqoriyaya görə seçilir)
  kalkhan: { kind: "nb", bg: "#FAF5E5", ink: INK, sub: "#4A5160" },
  // Məhkəmə zalı: maqon və qızıl
  court: { bg: ["#1A0C05", "#4A2C0A"], text: "#F5F0E8", sub: "#CDB98C", accent: "#E6C668", line: "#C9A84C", lineAlpha: 0.5 },
  ink: { bg: ["#14213D", "#2340C8"], text: "#FFFFFF", sub: "#C3CCF2", accent: "#FFD27A", line: "#FFFFFF", lineAlpha: 0.22 },
  night: { bg: ["#0F172A", "#3B2F8F"], text: "#FFFFFF", sub: "#C7D2FE", accent: "#A78BFA", line: "#FFFFFF", lineAlpha: 0.2 },
  ocean: { bg: ["#0B3954", "#0891B2"], text: "#FFFFFF", sub: "#CFFAFE", accent: "#FDE68A", line: "#FFFFFF", lineAlpha: 0.22 },
  sunset: { bg: ["#7C2D12", "#DB2777"], text: "#FFFFFF", sub: "#FFE4E6", accent: "#FCD34D", line: "#FFFFFF", lineAlpha: 0.22 },
  forest: { bg: ["#052E16", "#15803D"], text: "#FFFFFF", sub: "#DCFCE7", accent: "#FDE68A", line: "#FFFFFF", lineAlpha: 0.22 },
  light: { bg: ["#F8FAFC", "#DDE5FF"], text: "#14213D", sub: "#51607A", accent: "#2340C8", line: "#14213D", lineAlpha: 0.18 },
};

const FALLBACK = [
  { id: "f1", text: "Qanunu bilməmək məsuliyyətdən azad etmir.", category: "Ümumi hüquq", source: "Ümumi hüquq prinsipi", active: true },
  { id: "f2", text: "Təqsirsizlik prezumpsiyası: şəxs məhkəmənin qanuni qüvvəyə minmiş hökmü olmadan təqsirli sayıla bilməz.", category: "Cinayət hüququ", source: "Ümumi hüquq prinsipi", active: true },
  { id: "f3", text: "Hamı qanun və məhkəmə qarşısında bərabərdir.", category: "Konstitusiya hüququ", source: "Bərabərlik prinsipi", active: true },
];

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
function pickFact(facts, version, filterKey) {
  const byId = {};
  facts.forEach((f) => (byId[f.id] = f));
  const state = readJSON("huquq-state.json") || {};
  const s = state[filterKey] || {};
  let queue = s.v === version && Array.isArray(s.queue) ? s.queue.filter((id) => byId[id]) : [];
  if (!queue.length) {
    queue = shuffle(facts.map((f) => f.id));
    if (queue.length > 1 && queue[0] === s.last) queue.push(queue.shift());
  }
  const id = queue.shift();
  state[filterKey] = { v: version, queue: queue, last: id };
  writeJSON("huquq-state.json", state);
  return byId[id];
}

async function getCurrent() {
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
  const fact = pickFact(pool, data.version, param.category ? norm(param.category) : "*");
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
  if (family !== "small") {
    const ic = head.addText("⚖️");
    ic.font = Font.systemFont(family === "large" ? 18 : 14);
  }

  card.addSpacer(family === "small" ? 6 : family === "large" ? 12 : 8);
  const t = card.addText(f.text);
  t.font = factFont(size, bold);
  t.textColor = col(T.ink);
  t.lineLimit = family === "large" ? 11 : family === "small" ? 7 : 5;
  t.minimumScaleFactor = 0.6;
  card.addSpacer();

  if (f.source && (family !== "small" || f.text.length <= 80)) {
    label(card, "§ " + f.source, family === "small" ? 8.5 : family === "large" ? 11 : 9.5, "bold", T.sub, { lines: family === "large" ? 2 : 1, scale: 0.7 });
  }
  if (family === "large") {
    card.addSpacer(8);
    const rule = card.addStack();
    rule.size = new Size(0, 2);
    rule.backgroundColor = col(T.ink);
    card.addSpacer(8);
    const row = card.addStack();
    label(row, upper(cur.title), 9, "heavy", T.ink);
    row.addSpacer();
    if (cur.footer) label(row, cur.footer, 8.5, "medium", T.sub, { scale: 0.6 });
  }
}

// ───────────── Ana ekran: gradient mövzular ─────────────
function gradHeader(parent, cur, size, T) {
  const row = parent.addStack();
  row.centerAlignContent();
  const ic = row.addText("⚖️");
  ic.font = Font.systemFont(size + 1);
  row.addSpacer(5);
  label(row, cur.fact.category || cur.title, size, "semibold", T.accent);
  row.addSpacer();
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
    gradHeader(w, cur, 10.5, T);
    w.addSpacer(7);
    const t = w.addText(f.text);
    t.font = factFont(size, false);
    t.textColor = col(T.text);
    t.lineLimit = 9;
    t.minimumScaleFactor = 0.55;
    w.addSpacer();
    if (f.source) label(w, f.source, 8.5, "medium", T.sub, { scale: 0.7 });
  } else if (family === "large") {
    w.setPadding(18, 18, 14, 18);
    gradHeader(w, cur, 12, T);
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
    label(row, cur.title, 10, "semibold", T.accent);
    row.addSpacer();
    if (cur.footer) label(row, cur.footer, 9, "regular", T.sub, { scale: 0.6 });
  } else {
    w.setPadding(14, 16, 12, 16);
    gradHeader(w, cur, 11, T);
    w.addSpacer(8);
    const body = withBar(w, T);
    const t = body.addText(f.text);
    t.font = factFont(size, false);
    t.textColor = col(T.text);
    t.lineLimit = 7;
    t.minimumScaleFactor = 0.6;
    body.addSpacer();
    w.addSpacer();
    if (f.source) label(w, f.source, 9.5, "medium", T.sub, { scale: 0.7 });
  }
}

function buildHome(family, cur) {
  const w = new ListWidget();
  w.refreshAfterDate = new Date(Date.now() + REFRESH_MINUTES * 60 * 1000);
  w.url = readUrl();
  const fam = family === "extraLarge" ? "large" : family;
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

// Widget-ə toxunanda skript tətbiqdə "oxu rejimi"ndə açılır
function readUrl() {
  const u = URLScheme.forRunningScript();
  return u + (u.indexOf("?") === -1 ? "?" : "&") + "mode=read";
}

// ───────────── Tətbiq daxilində oxu rejimi ─────────────
async function readerMode() {
  let more = true;
  while (more) {
    const cur = await getCurrent();
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
  const cur = await getCurrent();
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
    else if (i === 3) await readerMode();
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
  if (mode === "read") await readerMode();
  else await appMenu();
}
Script.complete();
