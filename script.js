const $ = (id) => document.getElementById(id);
const BASE = "https://mahn1.github.io";
const GH = "https://github.com/mahn1";
const RAW = "https://raw.githubusercontent.com/mahn1";

// Мобильное меню
$("burger").addEventListener("click", () => {
  const open = $("nav").classList.toggle("is-open");
  $("burger").setAttribute("aria-expanded", open);
});
$("nav").addEventListener("click", (e) => { if (e.target.tagName === "A") $("nav").classList.remove("is-open"); });

// Терминал в первом экране
const SCRIPT = [
  ["c", "whoami"],
  ["o", "mahni — Python-разработчик"],
  ["c", "cat services.txt"],
  ["o", "• парсинг сайтов и API → Excel\n• автоматизация отчётов\n• PostgreSQL и FastAPI\n• лендинги на чистом коде"],
  ["c", "python vacancy_parser.py -q \"python\""],
  ["o", "Страница 5/5: собрано 404 вакансии"],
  ["h", "Готово → report.xlsx за 20 секунд"],
  ["c", "echo $STATUS"],
  ["h", "открыт для заказов ✓"],
];
const term = $("term");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
let html = "";
function typeLine(i) {
  if (i >= SCRIPT.length) { term.innerHTML = html + '<span class="p">$ </span><span class="cursor"></span>'; return; }
  const [kind, text] = SCRIPT[i];
  if (kind !== "c") {
    html += `<span class="${kind}">${esc(text)}</span>\n`;
    term.innerHTML = html + '<span class="cursor"></span>';
    return setTimeout(() => typeLine(i + 1), 380);
  }
  let n = 0;
  (function typeChar() {
    n++;
    term.innerHTML = html + `<span class="p">$ </span><span class="c">${esc(text.slice(0, n))}</span><span class="cursor"></span>`;
    if (n < text.length) return setTimeout(typeChar, 35 + Math.random() * 45);
    html += `<span class="p">$ </span><span class="c">${esc(text)}</span>\n`;
    setTimeout(() => typeLine(i + 1), 300);
  })();
}
if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
  html = SCRIPT.map(([k, t]) => (k === "c" ? `<span class="p">$ </span><span class="c">${esc(t)}</span>` : `<span class="${k}">${esc(t)}</span>`)).join("\n") + "\n";
  typeLine(SCRIPT.length);
} else {
  typeLine(0);
}

// Проекты
const PROJECTS = [
  { kind: "python", repo: "vacancy-parser", title: "Парсер вакансий → Excel", shot: "docs/summary.png", tags: ["Python", "requests", "openpyxl"],
    text: "Собирает вакансии через открытый API, чистит данные и строит отчёт со сводкой по зарплатам, работодателям и навыкам." },
  { kind: "web", repo: "marketplace-landing", title: "Маркетплейс «Полка»", tags: ["JS", "корзина", "фильтры"],
    text: "Каталог с поиском, фильтрами и сортировкой, избранное, корзина со счётчиками, баннер-карусель." },
  { kind: "web", repo: "courses-landing", title: "Школа WEBSTART", tags: ["JS", "квиз", "анимация"],
    text: "Печатающийся редактор кода с живым превью, программа на вкладках, квиз подбора курса, таймер до старта." },
  { kind: "web", repo: "smartphone-store-landing", title: "Магазин смартфонов", tags: ["JS", "SVG", "калькулятор"],
    text: "Каталог с корзиной, калькулятор рассрочки и оценка телефона по trade-in." },
  { kind: "web", repo: "car-tint-landing", title: "Тонировочный центр", tags: ["JS", "SVG", "калькулятор"],
    text: "Интерактивная машина с затемнением стёкол и калькулятор стоимости по кузову и зонам." },
  { kind: "web", repo: "video-editing-landing", title: "Студия видеомонтажа", tags: ["CSS-анимация", "тарифы"],
    text: "Анимированная монтажная шкала, портфолио с фильтром и тарифы на вкладках." },
];

function renderProjects(filter) {
  $("projects-grid").innerHTML = PROJECTS.filter((p) => filter === "all" || p.kind === filter).map((p, i) => {
    const site = p.kind === "web" ? `${BASE}/${p.repo}/` : null;
    return `
    <article class="proj" style="animation-delay:${i * 50}ms">
      <a class="proj__shot" href="${site || `${GH}/${p.repo}`}" target="_blank" rel="noopener" aria-label="${p.title}"
         style="background-image:url('${RAW}/${p.repo}/main/${p.shot || "docs/preview.png"}')"></a>
      <div class="proj__body">
        <div class="proj__tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>
        <h3>${p.title}</h3>
        <p>${p.text}</p>
        <div class="proj__links">
          ${site ? `<a href="${site}" target="_blank" rel="noopener">Открыть сайт ↗</a>` : ""}
          <a href="${GH}/${p.repo}" target="_blank" rel="noopener">Код на GitHub ↗</a>
        </div>
      </div>
    </article>`;
  }).join("");
}
$("chips").addEventListener("click", (e) => {
  const b = e.target.closest("[data-f]");
  if (!b) return;
  $("chips").querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === b));
  renderProjects(b.dataset.f);
});
renderProjects("all");

// Форма: собирает письмо в почтовом клиенте или текст для Telegram
const form = $("form");
const note = $("form-note");
function message() {
  const d = new FormData(form);
  return `Здравствуйте! Задача: ${d.get("type")}.\n\n${d.get("task").trim()}\n\nСвязь: ${d.get("contact").trim()}`;
}
function valid() {
  let ok = true;
  form.querySelectorAll("[required]").forEach((f) => {
    const bad = !f.value.trim();
    f.classList.toggle("is-invalid", bad);
    if (bad) ok = false;
  });
  return ok;
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!valid()) return;
  const subject = encodeURIComponent(`Заказ: ${new FormData(form).get("type")}`);
  location.href = `mailto:gerasimog67@gmail.com?subject=${subject}&body=${encodeURIComponent(message())}`;
  note.textContent = "Открываю почтовый клиент с готовым письмом…";
  note.classList.add("is-ok");
});
$("copy").addEventListener("click", async () => {
  if (!valid()) return;
  try {
    await navigator.clipboard.writeText(message());
    note.textContent = "Текст скопирован — вставьте его в чат с @mahnli";
    note.classList.add("is-ok");
    window.open("https://t.me/mahnli", "_blank", "noopener");
  } catch {
    note.textContent = "Не получилось скопировать — напишите напрямую @mahnli";
  }
});
form.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));

$("year").textContent = new Date().getFullYear();
