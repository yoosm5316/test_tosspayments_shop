/* =========================================================
   FITROOM 상품 데이터 (예시)
   - 브랜드·상품명·가격은 모두 가상의 예시입니다.
   - cat: top(상의) / pants(바지) / shoes(신발)
   - sub: 카테고리 안의 세부 분류 (SUBS의 key와 맞춰야 필터에 잡힘)
   - shape: common.js의 productArt()가 그릴 일러스트 종류
       top   : tee / long / shirt / knit / hoodie
       pants : denim / slacks / wide / cargo / jogger / shorts
       shoes : sneaker / runner / boot / loafer / slide
   - price: 정가, sale: 할인율(%)
   ========================================================= */

const SUBS = {
  top: [
    { key: 'tee', label: '반소매 티셔츠' },
    { key: 'long', label: '긴소매 티셔츠' },
    { key: 'shirt', label: '셔츠' },
    { key: 'knit', label: '니트' },
    { key: 'hoodie', label: '후드' }
  ],
  pants: [
    { key: 'denim', label: '데님' },
    { key: 'slacks', label: '슬랙스' },
    { key: 'wide', label: '와이드' },
    { key: 'cargo', label: '카고' },
    { key: 'jogger', label: '조거' },
    { key: 'shorts', label: '숏팬츠' }
  ],
  shoes: [
    { key: 'sneaker', label: '스니커즈' },
    { key: 'runner', label: '러닝화' },
    { key: 'boot', label: '부츠' },
    { key: 'loafer', label: '로퍼' },
    { key: 'slide', label: '슬라이드' }
  ]
};

const SIZES = {
  top: ['S', 'M', 'L', 'XL'],
  pants: ['28', '30', '32', '34', '36'],
  shoes: ['240', '250', '260', '270', '280']
};

const PRODUCTS = [
  /* ---------- 상의 ---------- */
  { id: 't01', cat: 'top', sub: 'tee', shape: 'tee', brand: 'PLAIN MADE', name: '헤비웨이트 오버핏 반소매 티셔츠', price: 39000, sale: 30, color: '#f2f0ea', likes: 18420, rating: 4.9, reviews: 9821, tags: ['무료배송', '단독'] },
  { id: 't02', cat: 'top', sub: 'tee', shape: 'tee', brand: 'LOWFIELD', name: '피그먼트 로고 반소매 티셔츠', price: 42000, sale: 15, color: '#3b4a5c', likes: 7311, rating: 4.8, reviews: 2210, tags: ['무료배송'] },
  { id: 't03', cat: 'top', sub: 'long', shape: 'long', brand: 'NONCODE', name: '스트라이프 롱슬리브 티셔츠', price: 49000, sale: 20, color: '#1f1f1f', likes: 5402, rating: 4.7, reviews: 1388, tags: [] },
  { id: 't04', cat: 'top', sub: 'shirt', shape: 'shirt', brand: 'OAKLINE', name: '옥스포드 오버 셔츠', price: 69000, sale: 25, color: '#a9c1dc', likes: 12030, rating: 4.9, reviews: 4120, tags: ['무료배송', '단독'] },
  { id: 't05', cat: 'top', sub: 'shirt', shape: 'shirt', brand: 'SUNDAY PARK', name: '린넨 블렌드 하프 셔츠', price: 59000, sale: 10, color: '#e8dcc4', likes: 3311, rating: 4.6, reviews: 702, tags: [] },
  { id: 't06', cat: 'top', sub: 'knit', shape: 'knit', brand: 'GRAYFORM', name: '램스울 라운드넥 니트', price: 89000, sale: 35, color: '#7a6a58', likes: 9850, rating: 4.8, reviews: 3012, tags: ['무료배송'] },
  { id: 't07', cat: 'top', sub: 'knit', shape: 'knit', brand: 'HOMEROOM', name: '케이블 크루넥 스웨터', price: 79000, sale: 0, color: '#2f4a3a', likes: 2210, rating: 4.7, reviews: 498, tags: [] },
  { id: 't08', cat: 'top', sub: 'hoodie', shape: 'hoodie', brand: 'MIDNIGHT ROW', name: '테리 오버핏 후드 집업', price: 89000, sale: 40, color: '#8d8f93', likes: 21540, rating: 4.9, reviews: 11203, tags: ['무료배송', '단독'] },
  { id: 't09', cat: 'top', sub: 'hoodie', shape: 'hoodie', brand: 'ARCHIVE 9', name: '아치 로고 후드 티셔츠', price: 75000, sale: 20, color: '#14213d', likes: 6630, rating: 4.8, reviews: 1874, tags: ['무료배송'] },
  { id: 't10', cat: 'top', sub: 'long', shape: 'long', brand: 'PLAIN MADE', name: '베이직 크루넥 긴소매 티셔츠', price: 29000, sale: 10, color: '#ffffff', likes: 4410, rating: 4.7, reviews: 3320, tags: [] },

  /* ---------- 바지 ---------- */
  { id: 'p01', cat: 'pants', sub: 'denim', shape: 'denim', brand: 'LOWFIELD', name: '세미 와이드 데님 팬츠 [미드 블루]', price: 79000, sale: 30, color: '#5878a0', likes: 16840, rating: 4.9, reviews: 8810, tags: ['무료배송', '단독'] },
  { id: 'p02', cat: 'pants', sub: 'denim', shape: 'denim', brand: 'ARCHIVE 9', name: '스트레이트 데님 팬츠 [블랙]', price: 69000, sale: 15, color: '#26272b', likes: 5530, rating: 4.7, reviews: 1630, tags: [] },
  { id: 'p03', cat: 'pants', sub: 'slacks', shape: 'slacks', brand: 'OAKLINE', name: '원턱 와이드 슬랙스', price: 59000, sale: 25, color: '#3a3a3a', likes: 13220, rating: 4.8, reviews: 6012, tags: ['무료배송'] },
  { id: 'p04', cat: 'pants', sub: 'slacks', shape: 'slacks', brand: 'GRAYFORM', name: '세미 크롭 테이퍼드 슬랙스', price: 55000, sale: 0, color: '#9a8f80', likes: 2870, rating: 4.6, reviews: 521, tags: [] },
  { id: 'p05', cat: 'pants', sub: 'wide', shape: 'wide', brand: 'NONCODE', name: '투턱 벌룬 와이드 팬츠', price: 65000, sale: 20, color: '#c9bfae', likes: 4410, rating: 4.7, reviews: 980, tags: ['무료배송'] },
  { id: 'p06', cat: 'pants', sub: 'cargo', shape: 'cargo', brand: 'TRAIL UNIT', name: '나일론 파라슈트 카고 팬츠', price: 72000, sale: 35, color: '#4b5a3c', likes: 10980, rating: 4.8, reviews: 3770, tags: ['무료배송', '단독'] },
  { id: 'p07', cat: 'pants', sub: 'jogger', shape: 'jogger', brand: 'MIDNIGHT ROW', name: '테리 스웨트 조거 팬츠', price: 49000, sale: 30, color: '#6e7076', likes: 8120, rating: 4.8, reviews: 2950, tags: [] },
  { id: 'p08', cat: 'pants', sub: 'shorts', shape: 'shorts', brand: 'SUNDAY PARK', name: '코튼 버뮤다 쇼츠', price: 39000, sale: 10, color: '#d6c7a1', likes: 3120, rating: 4.6, reviews: 860, tags: [] },
  { id: 'p09', cat: 'pants', sub: 'cargo', shape: 'cargo', brand: 'HOMEROOM', name: '립스탑 와이드 카고 팬츠', price: 68000, sale: 15, color: '#1f1f1f', likes: 4980, rating: 4.7, reviews: 1205, tags: ['무료배송'] },
  { id: 'p10', cat: 'pants', sub: 'shorts', shape: 'shorts', brand: 'PLAIN MADE', name: '데일리 스웨트 쇼츠', price: 29000, sale: 0, color: '#2a3b55', likes: 2070, rating: 4.5, reviews: 410, tags: [] },

  /* ---------- 신발 ---------- */
  { id: 's01', cat: 'shoes', sub: 'sneaker', shape: 'sneaker', brand: 'STEPWAY', name: '로우탑 레더 스니커즈 [화이트]', price: 99000, sale: 20, color: '#f5f5f2', likes: 24310, rating: 4.9, reviews: 12880, tags: ['무료배송', '단독'] },
  { id: 's02', cat: 'shoes', sub: 'sneaker', shape: 'sneaker', brand: 'CREPE&SOLE', name: '캔버스 하이브리드 스니커즈', price: 69000, sale: 10, color: '#1f1f1f', likes: 6210, rating: 4.7, reviews: 1902, tags: ['무료배송'] },
  { id: 's03', cat: 'shoes', sub: 'runner', shape: 'runner', brand: 'TRAIL UNIT', name: '쿠셔닝 데일리 러닝화', price: 129000, sale: 25, color: '#c8ccd2', likes: 11040, rating: 4.8, reviews: 4410, tags: ['무료배송'] },
  { id: 's04', cat: 'shoes', sub: 'runner', shape: 'runner', brand: 'STEPWAY', name: '레트로 메시 러너', price: 109000, sale: 30, color: '#3d5a80', likes: 7730, rating: 4.7, reviews: 2380, tags: [] },
  { id: 's05', cat: 'shoes', sub: 'boot', shape: 'boot', brand: 'OAKLINE', name: '스웨이드 첼시 부츠', price: 159000, sale: 35, color: '#6b4f3a', likes: 9120, rating: 4.8, reviews: 2110, tags: ['무료배송', '단독'] },
  { id: 's06', cat: 'shoes', sub: 'boot', shape: 'boot', brand: 'GRAYFORM', name: '레더 워커 부츠', price: 179000, sale: 15, color: '#1b1b1b', likes: 4880, rating: 4.7, reviews: 990, tags: ['무료배송'] },
  { id: 's07', cat: 'shoes', sub: 'loafer', shape: 'loafer', brand: 'HOMEROOM', name: '페니 로퍼 [블랙]', price: 119000, sale: 20, color: '#141414', likes: 8030, rating: 4.8, reviews: 2770, tags: ['무료배송'] },
  { id: 's08', cat: 'shoes', sub: 'loafer', shape: 'loafer', brand: 'CREPE&SOLE', name: '스웨이드 태슬 로퍼', price: 129000, sale: 0, color: '#8a6a4a', likes: 2310, rating: 4.6, reviews: 430, tags: [] },
  { id: 's09', cat: 'shoes', sub: 'slide', shape: 'slide', brand: 'SUNDAY PARK', name: '쿠션 원스트랩 슬라이드', price: 39000, sale: 30, color: '#2b2b2b', likes: 12210, rating: 4.8, reviews: 6620, tags: ['무료배송'] },
  { id: 's10', cat: 'shoes', sub: 'slide', shape: 'slide', brand: 'PLAIN MADE', name: '버클 스트랩 샌들', price: 49000, sale: 10, color: '#a08060', likes: 3050, rating: 4.6, reviews: 712, tags: [] }
];
