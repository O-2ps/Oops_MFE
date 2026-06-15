/**
 * 올리브영 상품 페이지 구조 분석 스크립트
 * 실행: node scripts/inspectProduct.js <goodsNo>
 * 예시: node scripts/inspectProduct.js A000000190238
 */

const puppeteer = require('puppeteer');

const goodsNo = process.argv[2];
if (!goodsNo) {
  console.error('사용법: node scripts/inspectProduct.js <goodsNo>');
  process.exit(1);
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false, // 실제 브라우저 열어서 육안 확인 가능
    args: ['--no-sandbox', '--lang=ko-KR'],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });

  const url = `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${goodsNo}`;
  console.log(`\n접속: ${url}\n`);

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // 5초 추가 대기 (JS 렌더링)
  await new Promise(r => setTimeout(r, 5000));

  const result = await page.evaluate(() => {
    const info = {};

    // 1. data-name 속성을 가진 모든 요소
    info.dataName = [...document.querySelectorAll('[data-name]')].map(el => ({
      tag: el.tagName,
      class: el.className,
      dataName: el.getAttribute('data-name'),
    })).slice(0, 20);

    // 2. option 관련 클래스명 탐색
    const optionEls = [...document.querySelectorAll('[class]')].filter(el =>
      /option|color|shade|swatch|choice/i.test(el.className)
    );
    info.optionClasses = [...new Set(optionEls.map(el => el.className))].slice(0, 30);

    // 3. select > option 텍스트
    info.selectOptions = [...document.querySelectorAll('select option')].map(el => el.textContent?.trim()).filter(Boolean).slice(0, 20);

    // 4. "호" 패턴 텍스트 (1호, 2호 등)
    const bodyText = document.body.innerText;
    const hoPattern = /\d{1,2}호\s*[가-힣a-zA-Z][^\n]{0,20}/g;
    const hoMatches = [];
    let m;
    while ((m = hoPattern.exec(bodyText)) !== null) {
      hoMatches.push(m[0].trim());
      if (hoMatches.length >= 20) break;
    }
    info.hoMatches = hoMatches;

    // 5. 페이지에서 li 요소들 중 짧은 한국어 텍스트
    info.liTexts = [...document.querySelectorAll('li')].map(el => el.textContent?.trim() ?? '').filter(t => t.length > 0 && t.length < 30 && /[가-힣]/.test(t)).slice(0, 30);

    return info;
  });

  console.log('=== data-name 속성 요소 ===');
  console.log(JSON.stringify(result.dataName, null, 2));

  console.log('\n=== option/color/swatch 관련 클래스명 ===');
  result.optionClasses.forEach(c => console.log(' ', c));

  console.log('\n=== select > option 텍스트 ===');
  result.selectOptions.forEach(t => console.log(' ', t));

  console.log('\n=== "N호" 패턴 텍스트 ===');
  result.hoMatches.forEach(t => console.log(' ', t));

  console.log('\n=== li 짧은 한국어 텍스트 ===');
  result.liTexts.forEach(t => console.log(' ', t));

  console.log('\n브라우저를 닫으면 종료됩니다...');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
