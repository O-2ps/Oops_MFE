/**
 * 색상칩 속성 정밀 분석
 * 실행: node scripts/testOne.js A000000245109
 */
const puppeteer = require('puppeteer');

async function main() {
  const goodsNo = process.argv[2] || 'A000000245109';

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });

  await page.goto(
    `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${goodsNo}`,
    { waitUntil: 'networkidle2', timeout: 20000 }
  );

  const result = await page.evaluate(() => {
    const clean = (s) => s.replace(/^\[.*?\]\s*/, '').trim();
    const imgs = [...document.querySelectorAll('[class*="btn-colorchip"] img')];
    return imgs.map(img => clean(img.getAttribute('alt') || '')).filter(Boolean);
  });

  console.log(`\n[${goodsNo}] 색상 (${result.length}개):`);
  result.forEach(s => console.log(' ', s));

  await browser.close();
}

main().catch(console.error);
