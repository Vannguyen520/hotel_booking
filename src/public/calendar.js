const code = window.__HOTEL__.code;

let today = new Date();

anchor = new Date(today.getFullYear(), today.getMonth(), 1);

let checkIn = null,
  checkOut = null;
let hoverTo = null;
let rooms = 1;

const $cals = document.getElementById("calendars");
const $prev = document.getElementById("prev");
const $next = document.getElementById("next");
const $nights = document.getElementById("nights");
const $ci = document.getElementById("ci");
const $co = document.getElementById("co");
const $total = document.getElementById("total");


$prev.onclick = () => {
  anchor.setMonth(anchor.getMonth() - 1);
  load();
};
$next.onclick = () => {
  anchor.setMonth(anchor.getMonth() + 1);
  load();
};

// API lấy dữ liệu
async function load() {
  const y = anchor.getFullYear();
  const m = anchor.getMonth() + 1;
const res = await fetch(
  `/booking/api/hotels/${code}/calendar?year=${y}&month=${m}&rooms=${rooms}`
);

  const data = await res.json();
  render(data.months);
}
function fmt(d) {
  return d
    ? `${d.getDate()} tháng ${d.getMonth() + 1} ${d.getFullYear()}`
    : "--";
}
function toKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseKey(k) {
  const [Y, M, D] = k.split("-").map(Number);
  return new Date(Y, M - 1, D);
}

function render(months) {
  $cals.innerHTML = "";
  months.forEach((m) =>
    $cals.appendChild(renderMonth(m.year, m.month, m.days))
  );
  updateTop();
}

function renderMonth(year, month, days) {
  const cal = el("div", "calendar");
  cal.appendChild(el("div", "cal-head", `Tháng ${month} ${year}`));

  const wk = el("div", "week");
  ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach((t) =>
    wk.appendChild(el("div", null, t))
  );
  cal.appendChild(wk);

  const grid = el("div", "grid");
  const first = new Date(year, month - 1, 1);
  let start = first.getDay();

  if (start === 0) start = 7;
  start = start - 1;

  for (let i = 0; i < start; i++) {
    grid.appendChild(el("div", "cell empty", ""));
  }

  for (const d of days) {
    const k = d.date;
    const dt = parseKey(k);

    const cell = el("div", "cell");
    cell.dataset.key = k;
    cell.appendChild(el("div", "d", String(dt.getDate())));
    if (d.price != null)
      cell.appendChild(el("div", "p", d.price.toLocaleString("vi-VN") + " ₫"));

    if (!d.available) cell.classList.add("disabled");

    cell.addEventListener("mouseenter", () => {
      if (checkIn && !checkOut && d.available) {
        hoverTo = dt;
        paint();
      }
    });
    cell.addEventListener("mouseleave", () => {
      if (checkIn && !checkOut) {
        hoverTo = null;
        paint();
      }
    });


// checkin checkout
    cell.addEventListener("click", () => {
      if (!checkIn || (checkIn && checkOut)) {
        if (!d.available) return; 
        checkIn = dt;
        checkOut = null;
        hoverTo = null;
        paint();
      }
      else if (!checkOut) {
        if (dt <= checkIn) {
          if (!d.available) return;
          checkIn = dt;
          hoverTo = null;
          paint();
        } else {
          checkOut = dt;
          hoverTo = null;
          paint();
        }
      }
    });

    grid.appendChild(cell);
  }
  cal.appendChild(grid);
  return cal;
}

function paint() {
  document.querySelectorAll(".cell").forEach((c) => {
    c.classList.remove("start", "end", "inrange", "preview");
  });

  if (checkIn) {
    const ciK = toKey(checkIn);
    const ciEl = document.querySelector(`.cell[data-key="${ciK}"]`);
    if (ciEl) ciEl.classList.add("start");
  }
  if (checkIn && hoverTo && !checkOut) {
    if (hoverTo > checkIn) {
      forEachDate(checkIn, hoverTo, (k) => {
        const elx = document.querySelector(`.cell[data-key="${k}"]`);
        if (elx) elx.classList.add("preview");
      });
    }
  }
  if (checkIn && checkOut) {
    const coK = toKey(checkOut);
    const coEl = document.querySelector(`.cell[data-key="${coK}"]`);
    if (coEl) coEl.classList.add("end");

    forEachDate(checkIn, checkOut, (k) => {
      const elx = document.querySelector(`.cell[data-key="${k}"]`);
      if (elx && k !== toKey(checkIn) && k !== toKey(checkOut))
        elx.classList.add("inrange");
    });
  }
  updateTop();
}

function updateTop() {
  $ci.textContent = fmt(checkIn);
  $co.textContent = fmt(checkOut);
  let nights = 0;
  let sum = 0;

  if (checkIn && checkOut) {
    nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    forEachDate(checkIn, addDays(checkOut, -1), (k) => {
      const cell = document.querySelector(`.cell[data-key="${k}"]`);
      if (cell) {
        const priceEl = cell.querySelector(".p");
        if (priceEl) {
          const val = Number(priceEl.textContent.replace(/[^\d]/g, ""));
          sum += val;
        }
      }
    });
  }
  $nights.textContent = `${nights} Đêm`;
  $total.textContent =
    nights > 0 ? `Tổng: ${sum.toLocaleString("vi-VN")} ₫` : "";
}

function el(tag, cls, text) {
  const x = document.createElement(tag);
  if (cls) x.className = cls;
  if (text != null) x.textContent = text;
  return x;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function forEachDate(a, b, cb) {
  let cur = new Date(a);
  const end = new Date(b);
  while (cur <= end) {
    cb(toKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
}
document.getElementById("search").addEventListener("click", () => {
  if (!checkIn || !checkOut) {
    alert("Vui lòng chọn ngày nhận và trả phòng trước");
    return;
  }

  const ci = toKey(checkIn);
  const co = toKey(checkOut);

  const rooms = 1;

  window.location.href = `/booking/check?checkin=${ci}&checkout=${co}&rooms=${rooms}`;

});

load();
