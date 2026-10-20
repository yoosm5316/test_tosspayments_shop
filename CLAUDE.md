# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

토스페이먼츠 결제위젯을 연동한 패션 쇼핑몰 퍼블리싱입니다. 디자인은 무신사 레이아웃을 참고했습니다. 빌드 도구, 패키지, 테스트, 린터가 없는 **순수 정적 HTML/CSS/JS**이고, 서버 코드는 없습니다. 브랜드명 `FITROOM`과 상품·가격은 모두 가상 데이터입니다. 무신사 로고나 명칭은 쓰지 않습니다.

## 실행

`successUrl`/`failUrl`을 `location.origin` 기준으로 만들기 때문에 `file://`로 열면 결제가 동작하지 않습니다. 반드시 로컬 서버로 엽니다.

```bash
npx serve .
```

이 저장소는 상위 작업 폴더(`d_1/`) 안에 있습니다. 상위 폴더의 `.claude/launch.json`에 있는 `shop` 설정(8800번 포트, PowerShell `serve.ps1`)을 `preview_start`로 띄워도 됩니다.

## 구조

- **스크립트 로드 순서:** 모든 페이지가 `js/data.js` → `js/common.js` → 페이지별 스크립트 순서로 불러옵니다. 모듈이 아니라 전역 변수(`PRODUCTS`, `SUBS`, `SIZES`, `$`, `won` 등)를 공유하므로 이 순서를 바꾸면 안 됩니다.
  - 목록(`index.html` 상의, `pants.html`, `shoes.html`) → `list.js`
  - `checkout.html` → `checkout.js` (토스 SDK `https://js.tosspayments.com/v2/standard`를 `<head>`에서 먼저 불러옴)
  - `success.html` / `fail.html` → `result.js` (`<body data-result>`로 구분)
- **세 목록 페이지는 같은 마크업**이고 `<body data-cat="top|pants|shoes">`만 다릅니다. `pants.html`과 `shoes.html`은 `index.html`을 치환해서 만든 사본입니다. 헤더, 상세 모달, 장바구니 서랍 마크업을 고치면 세 파일을 모두 고쳐야 합니다.
- **상품 데이터:** `data.js`의 `PRODUCTS`에만 있습니다. 다음 값이 서로 맞아야 상품이 화면에 나옵니다.
  - `cat`: 목록 페이지
  - `sub`: `SUBS[cat]`의 `key` (필터 칩)
  - `shape`: `common.js`의 `productArt()`가 그리는 SVG 종류 (파일 상단 주석에 목록 있음)
  - 사이즈 옵션은 카테고리별 `SIZES`에서 가져옵니다.
- **상품 이미지:** 실제 사진이 아니라 `productArt(p)`가 `p.shape`와 `p.color`로 그리는 SVG입니다. 새 `shape`를 추가하면 `productArt()`에 그리는 코드도 함께 넣어야 합니다.
- **가격 계산:** 판매가는 `salePrice()`가 정가와 할인율로 계산하고, 100원 단위로 반올림합니다. 합계와 배송비(`FREE_SHIP` 50,000원 이상 무료, 아니면 `SHIP_FEE` 3,000원)는 `summarize()` 한 곳에서 계산하며 장바구니 서랍과 주문서가 같이 씁니다.

## 상태 저장과 결제 흐름

| 키 | 저장소 | 내용 |
|---|---|---|
| `fitroom-cart` | localStorage | 장바구니 `[{id, size, qty}]` |
| `fitroom-likes` | localStorage | 좋아요한 상품 id |
| `fitroom-order` | sessionStorage | 주문서로 넘기는 주문 `{items, fromCart}` |
| `fitroom-pending` | sessionStorage | 결제 요청 직전에 저장하는 `{orderId, amount, orderName, fromCart}` |

1. 상세 모달의 "바로 구매"나 장바구니 서랍의 "주문하기"가 `goCheckout()`을 호출합니다. 이 함수가 `fitroom-order`를 저장하고 `checkout.html`로 이동합니다.
2. `checkout.js`가 결제위젯을 띄웁니다. 순서는 `TossPayments(CLIENT_KEY)` → `widgets({ customerKey: TossPayments.ANONYMOUS })` → `setAmount` → `renderPaymentMethods('#payment-method')`·`renderAgreement('#agreement')`입니다. 배송지 검증을 통과하면 `fitroom-pending`을 저장하고 `requestPayment`를 호출합니다.
3. 결제가 끝나면 토스가 `success.html?paymentType&orderId&paymentKey&amount`로 보냅니다. `result.js`는 쿼리 값이 `fitroom-pending`과 같은지 비교합니다. 같으면 장바구니에서 온 주문일 때만 장바구니를 비우고, 세션 키를 지웁니다. 실패하면 토스가 `fail.html?code&message&orderId`로 보냅니다.

## 토스페이먼츠 주의점

- `checkout.js`의 `CLIENT_KEY`는 토스 문서에 공개된 결제위젯 테스트 키(`test_gck_docs_…`)라서 실제로 출금되지 않습니다. 결제위젯에는 `test_gck`/`live_gck` 키를 써야 합니다. 다른 결제 방식용 `test_ck` 키는 맞지 않습니다.
- 서버가 없어서 결제 **인증**까지만 진행됩니다. 결제를 확정하려면 서버에서 시크릿 키로 `POST /v1/payments/confirm`을 호출해야 합니다(`result.js` 상단 주석 참고). 시크릿 키를 프런트 코드에 넣지 마세요.
- `orderId`는 6~64자이고 영문·숫자·`-`·`_`만 쓸 수 있으며 결제마다 달라야 합니다. 지금은 `'FR' + Date.now() + 난수`로 만듭니다.
- 성공 페이지의 금액 비교는 sessionStorage 값과 비교하는 화면용 확인일 뿐입니다. 실제 위변조 검증은 서버에서 해야 합니다.

## 저장소

- 원격 저장소는 GitHub `yoosm5316/test_tosspayments_shop`이고 브랜치는 `main`입니다. 이 네트워크는 22번 포트가 막혀 있어 원격 주소를 `ssh://git@ssh.github.com:443/yoosm5316/test_tosspayments_shop.git`로 씁니다. 저장소 설정 `core.sshCommand`는 Windows OpenSSH를 가리킵니다.
- 이 저장소에는 `shop/` 안의 파일만 넣습니다. 상위 폴더의 다른 페이지(기아, 공군 등)는 외부에 공개하면 안 되므로 넣지 마세요.
- 셸은 Windows PowerShell 5.1이고 사용자 경로에 한글이 들어 있습니다. 파일을 쓸 때는 UTF-8 인코딩을 지정하세요.
