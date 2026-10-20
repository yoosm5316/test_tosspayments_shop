/* =========================================================
   결제 결과 페이지 (success.html / fail.html 공통)
   - success: 토스페이먼츠가 ?paymentType&orderId&paymentKey&amount 를 붙여 리다이렉트
   - fail   : ?code&message&orderId 를 붙여 리다이렉트

   [서버 연동 시 할 일 — 퍼블리싱 범위 밖]
   successUrl에 도착한 것은 "결제 인증"까지입니다. 10분 안에 서버에서
     POST https://api.tosspayments.com/v1/payments/confirm
     Authorization: Basic base64(시크릿키 + ':')
     body: { paymentKey, orderId, amount }
   를 호출해야 결제가 최종 승인됩니다. 승인 전에 서버에 저장해 둔 주문 금액과
   쿼리의 amount가 같은지 반드시 비교하세요. 시크릿 키는 절대 프런트에 두지 마세요.
   ========================================================= */

(function () {
  const q = new URLSearchParams(location.search);
  const page = document.body.dataset.result;
  const pending = load(sessionStorage, 'fitroom-pending', null);

  if (page === 'success') {
    const orderId = q.get('orderId');
    const amount = Number(q.get('amount'));
    const paymentKey = q.get('paymentKey') || '';

    // 프런트 단 간이 확인 (실서비스는 서버에서 비교)
    const matched = pending && pending.orderId === orderId && pending.amount === amount;

    $('#rOrderId').textContent = orderId || '-';
    $('#rOrderName').textContent = pending ? pending.orderName : '-';
    $('#rAmount').textContent = amount ? won(amount) : '-';
    $('#rType').textContent = { NORMAL: '일반결제', BRANDPAY: '브랜드페이', KEYIN: '키인 결제' }[q.get('paymentType')] || q.get('paymentType') || '-';
    $('#rKey').textContent = paymentKey ? paymentKey.slice(0, 12) + '…' : '-';

    if (!matched) {
      $('#rStatus').textContent = pending
        ? '주문 정보와 결제 금액이 일치하지 않습니다.'
        : '이미 확인된 주문이거나 주문 정보를 찾을 수 없습니다.';
      document.body.classList.add('is-mismatch');
      return;
    }

    // 장바구니에서 주문했다면 장바구니 비우기
    if (pending.fromCart) setCart([]);
    try {
      sessionStorage.removeItem(KEY_ORDER);
      sessionStorage.removeItem('fitroom-pending');
    } catch (e) {}
  } else {
    $('#rCode').textContent = q.get('code') || '-';
    $('#rMessage').textContent = q.get('message') || '결제가 완료되지 않았습니다.';
    $('#rOrderId').textContent = q.get('orderId') || '-';
  }
})();
