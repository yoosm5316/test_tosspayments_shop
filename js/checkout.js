/* =========================================================
   주문서 + 토스페이먼츠 결제위젯(SDK v2) 연동
   - 아래 CLIENT_KEY는 토스페이먼츠 문서에 공개된 "문서용 테스트 키"입니다.
     실제 결제를 받으려면 개발자센터 > API 키에서 발급받은 결제위젯 클라이언트 키
     (test_gck_ / live_gck_로 시작)로 바꾸세요.
   - 결제 요청이 성공하면 successUrl로 이동하지만, 이 단계는 "인증"까지입니다.
     최종 승인은 서버에서 시크릿 키로 결제 승인 API(POST /v1/payments/confirm)를
     호출해야 완료됩니다. (퍼블리싱 범위 밖 — success.js 주석 참고)
   ========================================================= */

const CLIENT_KEY = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

(async function () {
  const order = load(sessionStorage, KEY_ORDER, null);
  const lines = order ? cartLines(order.items) : [];

  if (!lines.length) {
    $('#checkout').innerHTML = `
      <div class="empty-order">
        <p>주문할 상품이 없습니다.</p>
        <a class="btn btn--black" href="index.html">쇼핑 계속하기</a>
      </div>`;
    return;
  }

  const sum = summarize(lines);

  /* ---------- 주문 상품 ---------- */
  $('#orderItems').innerHTML = lines
    .map(
      (l) => `
    <li class="order-item">
      <div class="order-item__thumb">${productArt(l.product)}</div>
      <div class="order-item__info">
        <p class="order-item__brand">${escapeHtml(l.product.brand)}</p>
        <p class="order-item__name">${escapeHtml(l.product.name)}</p>
        <p class="order-item__opt">옵션: ${escapeHtml(l.size)} / 수량 ${l.qty}개</p>
      </div>
      <div class="order-item__price">
        ${l.product.sale ? `<del>${won(l.product.price * l.qty)}</del>` : ''}
        <strong>${won(l.total)}</strong>
      </div>
    </li>`
    )
    .join('');
  $('#orderCount').textContent = lines.reduce((s, l) => s + l.qty, 0);

  /* ---------- 결제 금액 ---------- */
  $('#sumList').textContent = won(sum.list);
  $('#sumDiscount').textContent = sum.discount ? '-' + won(sum.discount) : '0원';
  $('#sumShip').textContent = sum.ship ? won(sum.ship) : '무료';
  $('#sumPay').textContent = won(sum.pay);
  $('#payBtn').textContent = `${won(sum.pay)} 결제하기`;

  /* ---------- 토스페이먼츠 결제위젯 ---------- */
  const payBtn = $('#payBtn');
  let widgets;
  try {
    const tossPayments = TossPayments(CLIENT_KEY);
    // 비회원 결제. 회원제라면 구매자별 고유 ID(UUID 등)를 customerKey로 넘기세요.
    widgets = tossPayments.widgets({ customerKey: TossPayments.ANONYMOUS });
    await widgets.setAmount({ currency: 'KRW', value: sum.pay });
    await Promise.all([
      widgets.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
      widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' })
    ]);
    payBtn.disabled = false;
  } catch (err) {
    console.error(err);
    $('#payment-method').innerHTML = `<p class="pay-error">결제 모듈을 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 새로고침해 주세요.<br><small>${escapeHtml(err.message || err)}</small></p>`;
    return;
  }

  /* ---------- 배송지 검증 ---------- */
  const form = $('#shipForm');
  function validate() {
    let ok = true;
    $$('[required]', form).forEach((input) => {
      const bad = !input.value.trim() || (input.pattern && !new RegExp('^(?:' + input.pattern + ')$').test(input.value.trim()));
      input.closest('.field').classList.toggle('is-error', bad);
      if (bad && ok) {
        input.focus();
        ok = false;
      }
    });
    return ok;
  }
  form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-error'));

  /* ---------- 결제 요청 ---------- */
  payBtn.addEventListener('click', async () => {
    if (!validate()) {
      toast('배송 정보를 확인해 주세요.');
      return;
    }
    const first = lines[0].product.name;
    const rest = lines.length - 1;
    // orderId: 6~64자, 영문·숫자·-_ 만 허용, 결제마다 고유해야 함
    const orderId = 'FR' + Date.now() + Math.random().toString(36).slice(2, 8);
    const orderName = rest ? `${first} 외 ${rest}건` : first;

    // 결제 성공 페이지에서 금액 위변조를 확인할 수 있도록 요청 정보 보관
    // (실서비스에서는 반드시 서버에 저장하고 서버에서 비교해야 합니다)
    save(sessionStorage, 'fitroom-pending', {
      orderId,
      amount: sum.pay,
      orderName,
      fromCart: order.fromCart
    });

    const name = $('#shipName').value.trim();
    const email = $('#shipEmail').value.trim();
    try {
      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: location.origin + location.pathname.replace(/checkout\.html$/, 'success.html'),
        failUrl: location.origin + location.pathname.replace(/checkout\.html$/, 'fail.html'),
        customerName: name,
        ...(email ? { customerEmail: email } : {})
      });
    } catch (err) {
      // 결제창을 닫는 등 리다이렉트 없이 끝난 경우
      toast(err.message || '결제가 취소되었습니다.');
    }
  });
})();
