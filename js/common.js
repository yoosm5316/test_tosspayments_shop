/* =========================================================
   FITROOM 공통 스크립트
   - 가격 계산, 상품 일러스트(SVG), 장바구니·좋아요 저장, 장바구니 서랍
   - data.js 다음, 각 페이지 스크립트 전에 불러옵니다.
   ========================================================= */

const KEY_CART = 'fitroom-cart';
const KEY_LIKES = 'fitroom-likes';
const KEY_ORDER = 'fitroom-order'; // 결제 페이지로 넘기는 주문 (sessionStorage)
const FREE_SHIP = 50000;
const SHIP_FEE = 3000;

/* ---------- 유틸 ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const won = (n) => n.toLocaleString('ko-KR') + '원';
const num = (n) => n.toLocaleString('ko-KR');
const salePrice = (p) => Math.round((p.price * (100 - p.sale)) / 100 / 100) * 100;
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function load(storage, key, fallback) {
  try {
    const v = storage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* 저장소를 쓸 수 없는 환경이면 무시 */
  }
}

/* ---------- 상품 일러스트 ---------- */
// 실제 사진 대신 쓰는 단색 일러스트. viewBox 200×240.
const SHAPE_PATHS = {
  tee: 'M60 48 L86 38 Q100 52 114 38 L140 48 L174 80 L152 102 L140 90 L140 206 L60 206 L60 90 L48 102 L26 80 Z',
  long: 'M60 48 L86 38 Q100 52 114 38 L140 48 L162 70 L176 168 L154 172 L140 100 L140 206 L60 206 L60 100 L46 172 L24 168 L38 70 Z',
  denim: 'M64 30 L136 30 L144 214 L108 214 L100 96 L92 214 L56 214 Z',
  slacks: 'M66 30 L134 30 L138 214 L106 214 L100 96 L94 214 L62 214 Z',
  wide: 'M64 30 L136 30 L156 214 L106 214 L100 100 L94 214 L44 214 Z',
  cargo: 'M64 30 L136 30 L146 214 L108 214 L100 96 L92 214 L54 214 Z',
  jogger: 'M64 30 L136 30 L132 200 L106 200 L100 96 L94 200 L68 200 Z',
  shorts: 'M62 66 L138 66 L148 166 L106 166 L100 116 L94 166 L52 166 Z',
  sneaker: 'M28 150 Q28 126 48 120 L92 104 Q104 84 124 86 L134 88 Q144 114 170 128 Q180 134 180 148 L180 156 L28 156 Z',
  runner: 'M26 146 Q26 124 46 118 L94 100 Q106 82 126 84 L138 88 Q150 112 172 124 Q182 130 182 144 L182 150 L26 150 Z',
  boot: 'M52 66 L112 66 L114 118 Q150 124 172 138 Q180 144 180 154 L180 158 L52 158 Z',
  loafer: 'M26 150 Q30 128 58 124 L120 116 Q160 120 178 140 Q182 148 178 154 L26 154 Z'
};

function productArt(p) {
  const c = p.color;
  const line = 'rgba(0,0,0,.18)';
  const detail = 'rgba(0,0,0,.22)';
  const s = p.shape;
  let body = '';

  if (['tee', 'long', 'shirt', 'knit', 'hoodie'].includes(s)) {
    const base = s === 'tee' ? SHAPE_PATHS.tee : SHAPE_PATHS.long;
    body += `<path d="${base}" fill="${c}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>`;
    body += `<path d="M86 38 Q100 52 114 38" fill="none" stroke="${detail}" stroke-width="3"/>`;
    if (s === 'shirt') {
      body += `<path d="M86 38 L100 62 L114 38 L118 54 L100 66 L82 54 Z" fill="${c}" stroke="${detail}" stroke-width="2"/>`;
      body += `<line x1="100" y1="66" x2="100" y2="204" stroke="${detail}" stroke-width="2"/>`;
      for (let y = 82; y < 200; y += 24) body += `<circle cx="100" cy="${y}" r="2.4" fill="${detail}"/>`;
      body += `<rect x="112" y="84" width="18" height="16" fill="none" stroke="${detail}" stroke-width="2"/>`;
    }
    if (s === 'knit') {
      for (let y = 190; y < 206; y += 5) body += `<line x1="60" y1="${y}" x2="140" y2="${y}" stroke="${detail}" stroke-width="1.5"/>`;
      body += `<line x1="27" y1="160" x2="46" y2="163" stroke="${detail}" stroke-width="4"/><line x1="154" y1="163" x2="173" y2="160" stroke="${detail}" stroke-width="4"/>`;
    }
    if (s === 'hoodie') {
      body += `<path d="M78 46 Q76 14 100 12 Q124 14 122 46 Q112 56 100 56 Q88 56 78 46 Z" fill="${c}" stroke="${line}" stroke-width="2"/>`;
      body += `<path d="M86 46 Q100 58 114 46" fill="none" stroke="${detail}" stroke-width="3"/>`;
      body += `<line x1="94" y1="56" x2="92" y2="86" stroke="${detail}" stroke-width="2"/><line x1="106" y1="56" x2="108" y2="86" stroke="${detail}" stroke-width="2"/>`;
      body += `<path d="M74 150 L126 150 L132 186 L68 186 Z" fill="none" stroke="${detail}" stroke-width="2"/>`;
    }
  } else if (['denim', 'slacks', 'wide', 'cargo', 'jogger', 'shorts'].includes(s)) {
    const top = s === 'shorts' ? 66 : 30;
    body += `<path d="${SHAPE_PATHS[s]}" fill="${c}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>`;
    body += `<rect x="${s === 'shorts' ? 62 : 64}" y="${top}" width="${s === 'shorts' ? 76 : 72}" height="12" fill="${c}" stroke="${detail}" stroke-width="2"/>`;
    body += `<line x1="100" y1="${top + 12}" x2="100" y2="${top + 50}" stroke="${detail}" stroke-width="2"/>`;
    if (s === 'denim') body += `<path d="M70 ${top + 14} Q80 ${top + 34} 92 ${top + 30} M130 ${top + 14} Q120 ${top + 34} 108 ${top + 30}" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2" stroke-dasharray="4 3"/>`;
    if (s === 'slacks') body += `<line x1="80" y1="${top + 20}" x2="76" y2="212" stroke="${detail}" stroke-width="1.5"/><line x1="120" y1="${top + 20}" x2="124" y2="212" stroke="${detail}" stroke-width="1.5"/>`;
    if (s === 'cargo') body += `<rect x="58" y="120" width="26" height="30" rx="2" fill="none" stroke="${detail}" stroke-width="2"/><rect x="116" y="120" width="26" height="30" rx="2" fill="none" stroke="${detail}" stroke-width="2"/>`;
    if (s === 'jogger') body += `<rect x="68" y="188" width="26" height="12" fill="none" stroke="${detail}" stroke-width="2"/><rect x="106" y="188" width="26" height="12" fill="none" stroke="${detail}" stroke-width="2"/>`;
  } else {
    // 신발 (옆모습)
    if (s === 'slide') {
      body += `<path d="M26 150 Q26 140 40 138 L170 138 Q182 140 182 150 L182 160 L26 160 Z" fill="#e9e6df" stroke="${line}" stroke-width="2"/>`;
      body += `<path d="M64 140 Q70 100 110 98 Q140 100 146 140 Z" fill="${c}" stroke="${line}" stroke-width="2"/>`;
    } else {
      body += `<path d="${SHAPE_PATHS[s]}" fill="${c}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>`;
      const soleTop = s === 'runner' ? 148 : s === 'loafer' ? 152 : 154;
      const soleH = s === 'runner' ? 20 : s === 'boot' ? 14 : 12;
      const soleColor = s === 'loafer' || s === 'boot' ? '#2a2420' : '#f2f2ee';
      const soleX = s === 'boot' ? 48 : 24;
      body += `<rect x="${soleX}" y="${soleTop}" width="${184 - soleX}" height="${soleH}" rx="5" fill="${soleColor}" stroke="${line}" stroke-width="2"/>`;
      if (s === 'sneaker' || s === 'runner') {
        for (let i = 0; i < 4; i++) body += `<line x1="${100 + i * 9}" y1="${98 + i * 5}" x2="${112 + i * 9}" y2="${106 + i * 5}" stroke="${detail}" stroke-width="2.5"/>`;
      }
      if (s === 'runner') body += `<path d="M60 136 Q110 112 160 132" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="5"/>`;
      if (s === 'boot') body += `<rect x="58" y="74" width="14" height="40" rx="3" fill="${detail}"/>`;
      if (s === 'loafer') body += `<path d="M96 122 L140 120" stroke="${detail}" stroke-width="5"/>`;
    }
  }
  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(p.name)}">${body}</svg>`;
}

/* ---------- 장바구니 ---------- */
// 항목: { id, size, qty }
const getCart = () => load(localStorage, KEY_CART, []);
const setCart = (cart) => {
  save(localStorage, KEY_CART, cart);
  updateCartCount();
};

function addToCart(id, size, qty) {
  const cart = getCart();
  const hit = cart.find((it) => it.id === id && it.size === size);
  if (hit) hit.qty = Math.min(hit.qty + qty, 99);
  else cart.push({ id, size, qty });
  setCart(cart);
}

function cartLines(items) {
  // 저장된 항목 → 화면·결제용 상세 정보
  return items
    .map((it) => {
      const p = findProduct(it.id);
      if (!p) return null;
      return { ...it, product: p, unit: salePrice(p), total: salePrice(p) * it.qty };
    })
    .filter(Boolean);
}

function summarize(lines) {
  const list = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const goods = lines.reduce((s, l) => s + l.total, 0);
  const ship = goods === 0 || goods >= FREE_SHIP ? 0 : SHIP_FEE;
  return { list, discount: list - goods, goods, ship, pay: goods + ship };
}

function updateCartCount() {
  const count = getCart().reduce((s, it) => s + it.qty, 0);
  $$('[data-cart-count]').forEach((el) => {
    el.textContent = count;
    el.hidden = count === 0;
  });
}

/* ---------- 결제 페이지로 이동 ---------- */
function goCheckout(items, fromCart) {
  save(sessionStorage, KEY_ORDER, { items, fromCart });
  location.href = 'checkout.html';
}

/* ---------- 좋아요 ---------- */
const getLikes = () => load(localStorage, KEY_LIKES, []);
function toggleLike(id) {
  const likes = getLikes();
  const i = likes.indexOf(id);
  if (i > -1) likes.splice(i, 1);
  else likes.push(id);
  save(localStorage, KEY_LIKES, likes);
  return i === -1;
}

/* ---------- 토스트 ---------- */
let toastTimer;
function toast(msg) {
  let el = $('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2000);
}

/* ---------- 장바구니 서랍 ---------- */
function renderDrawer() {
  const box = $('#drawerBody');
  if (!box) return;
  const lines = cartLines(getCart());
  const sum = summarize(lines);

  if (!lines.length) {
    box.innerHTML = '<p class="drawer__empty">장바구니에 담긴 상품이 없습니다.</p>';
  } else {
    box.innerHTML = lines
      .map(
        (l, i) => `
      <div class="cart-item">
        <div class="cart-item__thumb">${productArt(l.product)}</div>
        <div class="cart-item__info">
          <p class="cart-item__brand">${escapeHtml(l.product.brand)}</p>
          <p class="cart-item__name">${escapeHtml(l.product.name)}</p>
          <p class="cart-item__opt">옵션: ${escapeHtml(l.size)}</p>
          <div class="cart-item__row">
            <div class="qty">
              <button type="button" data-qty="${i}" data-d="-1" aria-label="수량 줄이기">−</button>
              <span>${l.qty}</span>
              <button type="button" data-qty="${i}" data-d="1" aria-label="수량 늘리기">+</button>
            </div>
            <strong>${won(l.total)}</strong>
          </div>
        </div>
        <button type="button" class="cart-item__del" data-del="${i}" aria-label="삭제">✕</button>
      </div>`
      )
      .join('');
  }

  $('#drawerGoods').textContent = won(sum.goods);
  $('#drawerShip').textContent = sum.ship ? won(sum.ship) : '무료';
  $('#drawerPay').textContent = won(sum.pay);
  $('#drawerOrder').disabled = !lines.length;
}

function openDrawer() {
  renderDrawer();
  document.body.classList.add('drawer-open');
  $('#drawer').setAttribute('aria-hidden', 'false');
}
function closeDrawer() {
  document.body.classList.remove('drawer-open');
  $('#drawer').setAttribute('aria-hidden', 'true');
}

function initDrawer() {
  const drawer = $('#drawer');
  if (!drawer) return;
  $$('[data-open-cart]').forEach((b) => b.addEventListener('click', openDrawer));
  $$('[data-close-cart]').forEach((b) => b.addEventListener('click', closeDrawer));

  $('#drawerBody').addEventListener('click', (e) => {
    const cart = getCart();
    const q = e.target.closest('[data-qty]');
    const d = e.target.closest('[data-del]');
    if (q) {
      const it = cart[+q.dataset.qty];
      it.qty = Math.max(1, Math.min(99, it.qty + +q.dataset.d));
    } else if (d) {
      cart.splice(+d.dataset.del, 1);
    } else return;
    setCart(cart);
    renderDrawer();
  });

  $('#drawerOrder').addEventListener('click', () => {
    const cart = getCart();
    if (cart.length) goCheckout(cart, true);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) closeDrawer();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initDrawer();
});
