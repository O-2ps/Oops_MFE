/**
 * 올리브영 상품 색상 스크래퍼 v3 — Next.js __NEXT_DATA__ 파싱
 * 실행: node scripts/scrapeShades.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/assets/products.json');
const OUTPUT_PATH   = path.join(__dirname, '../src/assets/productShades.json');

const COLOR_CATEGORIES = [
  '메이크업 > 립메이크업',
  '메이크업 > 아이메이크업',
  '메이크업 > 베이스메이크업',
];

function isValidShade(text) {
  if (!text || text.length < 2 || text.length > 30) return false;
  const noise = ['밝기에 따라', '색상차이', '선택', '장바구니', '바로구매', '리뷰', '교환', '반품'];
  if (noise.some(n => text.includes(n))) return false;
  return /[가-힣]{2,}/.test(text) || /\d{1,2}호/.test(text);
}

// JSON 트리를 재귀 탐색해서 색상명처럼 생긴 문자열 배열을 수집
function collectColorStrings(obj, results = new Set(), depth = 0) {
  if (depth > 10) return;
  if (typeof obj === 'string') {
    if (isValidShade(obj) && (/\d{1,2}호/.test(obj) || /^[가-힣a-zA-Z\s]{2,20}$/.test(obj))) {
      results.add(obj.trim());
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(item => collectColorStrings(item, results, depth + 1));
  } else if (obj && typeof obj === 'object') {
    // 색상 관련 키를 우선 탐색
    const priorityKeys = ['colorNm', 'colorName', 'optionNm', 'optionName', 'name', 'nm', 'label', 'value', 'title'];
    for (const key of priorityKeys) {
      if (obj[key]) collectColorStrings(obj[key], results, depth + 1);
    }
    for (const [key, val] of Object.entries(obj)) {
      if (!priorityKeys.includes(key)) collectColorStrings(val, results, depth + 1);
    }
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function scrapeShades(page, goodsNo) {
  const url = `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${goodsNo}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

    const shades = await page.evaluate(() => {
      // [포켓몬 에디션] 같은 앞 브래킷 제거
      const clean = (s) => s.replace(/^\[.*?\]\s*/, '').trim();

      // btn-colorchip 안의 img alt 속성 → 색상명
      const imgs = [...document.querySelectorAll('[class*="btn-colorchip"] img')];
      const results = [];
      imgs.forEach(img => {
        const v = clean(img.getAttribute('alt') || '');
        if (v && !results.includes(v)) results.push(v);
      });
      return results;
    });

    return shades.filter(isValidShade);
  } catch (err) {
    process.stdout.write(`[err] `);
    return [];
  }
}

async function main() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const targets  = products.filter(p => COLOR_CATEGORIES.includes(p.category));

  let result = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    const raw = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    for (const [k, v] of Object.entries(raw)) {
      const valid = (Array.isArray(v) ? v : []).filter(isValidShade);
      if (valid.length > 0) result[k] = valid;
    }
    console.log(`기존 유효 항목 ${Object.keys(result).length}개 유지\n`);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR'],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  );

  let done = 0;
  for (const product of targets) {
    done++;
    if (result[product.goodsNo]) continue;

    process.stdout.write(`[${done}/${targets.length}] ${product.name.slice(0, 32).padEnd(32)}... `);
    const shades = await scrapeShades(page, product.goodsNo);
    result[product.goodsNo] = shades;
    console.log(shades.length > 0 ? `✓ ${shades.slice(0, 3).join(' / ')}` : `- 없음`);

    if (done % 30 === 0) {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf8');
      console.log(`  → 중간 저장 (${done}/${targets.length})\n`);
    }
    await sleep(700);
  }

  await browser.close();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf8');
  const withShades = Object.values(result).filter(v => v.length > 0).length;
  console.log(`\n완료! ${done}개 처리 / 색상 있음: ${withShades}개`);
}

main().catch(err => { console.error(err); process.exit(1); });
