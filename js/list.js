/* =========================================================
   상품 목록 페이지 (상의·바지·신발 공통)
   - <body data-cat="top|pants|shoes"> 값으로 카테고리를 고릅니다.
   - 세부 분류 칩, 정렬, 상품 카드, 상품 상세 모달을 그립니다.
   ========================================================= */

(function () {
  const cat = document.body.dataset.cat;
  const items = PRODUCTS.filter((p) => p.cat === cat);
  const state = { sub: 'all', sort: 'rec', query: '' };

  const grid = $('#grid');
  const chips = $('#chips');
  const countEl = $('#count');
  const sortEl = $('#sort');
  const searchEl = $('#search');

  /* ---------- 세부 분류 칩 ---------- */
  const subs = [{ key: 'all', label: '전체' }, ...SUBS[cat]];
  chips.innerHTML = subs
    .map((s) => {
      const n = s.key === 'all' ? items.length : items.filter((p) => p.sub === s.key).length;
      return `<button type="button" class="chip${s.key === 'all' ? ' is-active' : ''}" data-sub="${s.key}">${s.label} <span>${n}</span></button>`;
    })
    .join('');

  chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sub]');
    if (!b) return;
    state.sub = b.dataset.sub;
    $$('.chip', chips).forEach((c) => c.classList.toggle('is-active', c === b));
    render();
  });

  sortEl.addEventListener('change', () => {
    state.sort = sortEl.value;
    render();
  });

  if (searchEl) {
    searchEl.closest('form').addEventListener('submit', (e) => {
      e.preventDefault();
      state.query = searchEl.value.trim().toLowerCase();
      render();
    });
  }

  /* ---------- 목록 ---------- */
  const SORTERS = {
    rec: (a, b) => b.likes - a.likes,
    low: (a, b) => salePrice(a) - salePrice(b),
    high: (a, b) => salePrice(b) - salePrice(a),
    sale: (a, b) => b.sale - a.sale,
    review: (a, b) => b.reviews - a.reviews
  };

  function card(p, rank) {
    const liked = getLikes().includes(p.id);
    return `
    <li class="card">
      <button type="button" class="card__link" data-open="${p.id}" aria-label="${escapeHtml(p.name)} 상세 보기">
        <div class="card__thumb">
          ${productArt(p)}
          ${state.sort === 'rec' ? `<span class="card__rank">${rank}</span>` : ''}
        </div>
      </button>
      <button type="button" class="card__like${liked ? ' is-on' : ''}" data-like="${p.id}" aria-pressed="${liked}" aria-label="좋아요">
        <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.4-9.3C1.2 8.2 3.4 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.6 0 5.8 3.7 4.4 7.2C19.5 16.4 12 21 12 21z"/></svg>
      </button>
      <div class="card__body" data-open="${p.id}">
        <p class="card__brand">${escapeHtml(p.brand)}</p>
        <p class="card__name">${escapeHtml(p.name)}</p>
        <p class="card__price">
          ${p.sale ? `<em>${p.sale}%</em>` : ''}<strong>${num(salePrice(p))}원</strong>
        </p>
        <p class="card__meta">
          <span class="card__heart">♥ ${p.likes >= 10000 ? (p.likes / 10000).toFixed(1) + '만' : num(p.likes)}</span>
          <span>★ ${p.rating.toFixed(1)} (${num(p.reviews)})</span>
        </p>
        ${p.tags.length ? `<p class="card__tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</p>` : ''}
      </div>
    </li>`;
  }

  function render() {
    let list = items.filter((p) => state.sub === 'all' || p.sub === state.sub);
    if (state.query) {
      list = list.filter((p) => (p.brand + ' ' + p.name).toLowerCase().includes(state.query));
    }
    list = [...list].sort(SORTERS[state.sort]);
    countEl.textContent = num(list.length);
    grid.innerHTML = list.length
      ? list.map((p, i) => card(p, i + 1)).join('')
      : '<li class="grid__empty">조건에 맞는 상품이 없습니다.</li>';
  }

  grid.addEventListener('click', (e) => {
    const like = e.target.closest('[data-like]');
    if (like) {
      const on = toggleLike(like.dataset.like);
      like.classList.toggle('is-on', on);
      like.setAttribute('aria-pressed', on);
      toast(on ? '좋아요 목록에 추가했습니다.' : '좋아요를 취소했습니다.');
      return;
    }
    const open = e.target.closest('[data-open]');
    if (open) openModal(open.dataset.open);
  });

  /* ---------- 상품 상세 모달 ---------- */
  const modal = $('#modal');
  let current = null;
  let size = null;
  let qty = 1;

  function openModal(id) {
    current = findProduct(id);
    size = null;
    qty = 1;
    const p = current;
    $('#mThumb').innerHTML = productArt(p);
    $('#mBrand').textContent = p.brand;
    $('#mName').textContent = p.name;
    $('#mList').textContent = p.sale ? won(p.price) : '';
    $('#mSale').textContent = p.sale ? p.sale + '%' : '';
    $('#mPrice').textContent = won(salePrice(p));
    $('#mReview').textContent = `★ ${p.rating.toFixed(1)} · 후기 ${num(p.reviews)}개`;
    $('#mShip').textContent = salePrice(p) >= FREE_SHIP ? '무료배송' : `${num(SHIP_FEE)}원 (${num(FREE_SHIP)}원 이상 구매 시 무료)`;
    $('#mSizes').innerHTML = SIZES[p.cat]
      .map((s) => `<button type="button" class="size" data-size="${s}">${s}</button>`)
      .join('');
    updateModal();
    modal.hidden = false;
    document.body.classList.add('modal-open');
    $('.modal__close', modal).focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  }

  function updateModal() {
    $('#mQty').textContent = qty;
    $('#mTotal').textContent = won(salePrice(current) * qty);
    $$('.size', modal).forEach((b) => b.classList.toggle('is-active', b.dataset.size === size));
  }

  function needSize() {
    if (size) return false;
    toast('사이즈를 선택해 주세요.');
    $('#mSizes').classList.remove('shake');
    void $('#mSizes').offsetWidth;
    $('#mSizes').classList.add('shake');
    return true;
  }

  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close-modal]')) return closeModal();
    const s = e.target.closest('[data-size]');
    if (s) {
      size = s.dataset.size;
      return updateModal();
    }
    const d = e.target.closest('[data-mqty]');
    if (d) {
      qty = Math.max(1, Math.min(99, qty + +d.dataset.mqty));
      updateModal();
    }
  });

  $('#mCart').addEventListener('click', () => {
    if (needSize()) return;
    addToCart(current.id, size, qty);
    closeModal();
    toast('장바구니에 담았습니다.');
  });

  $('#mBuy').addEventListener('click', () => {
    if (needSize()) return;
    goCheckout([{ id: current.id, size, qty }], false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  render();
})();
