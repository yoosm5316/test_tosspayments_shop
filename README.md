# FITROOM — 토스페이먼츠 연동 쇼핑몰 퍼블리싱

패션 플랫폼 레이아웃을 참고한 정적 쇼핑몰 예시입니다(HTML·CSS·JS, 빌드 도구 없음). 브랜드·상품·가격은 모두 가상 데이터입니다.

## 페이지

| 파일 | 내용 |
|---|---|
| `index.html` | 상의 목록 |
| `pants.html` | 바지 목록 |
| `shoes.html` | 신발 목록 |
| `checkout.html` | 주문서 + 토스페이먼츠 결제위젯(SDK v2) |
| `success.html` / `fail.html` | 결제 결과 |

상품 데이터는 `js/data.js`, 공통 로직(가격·장바구니·상품 일러스트)은 `js/common.js`에 있습니다.

## 실행

결제 후 돌아오는 주소(`successUrl`/`failUrl`)를 `location.origin` 기준으로 만들기 때문에 `file://`이 아닌 로컬 서버로 열어야 합니다.

```bash
npx serve .
```

## 결제

- `js/checkout.js`의 `CLIENT_KEY`는 토스페이먼츠 문서에 공개된 테스트 키라서 실제로 출금되지 않습니다.
- 이 저장소는 프런트만 있어 결제 **인증**까지만 진행됩니다. 결제를 확정하려면 서버에서 시크릿 키로 `POST /v1/payments/confirm`을 호출해야 합니다(`js/result.js` 상단 주석 참고). 시크릿 키는 프런트에 두지 마세요.
