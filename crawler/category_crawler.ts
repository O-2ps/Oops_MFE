import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";

// ── 카테고리 정의 ────────────────────────────────────────────────────────────

export const CATEGORIES = {
  skinToner:      { id: "100000100010013", name: "스킨케어 > 스킨/토너" },
  serum:          { id: "100000100010014", name: "스킨케어 > 에센스/세럼/앰플" },
  cream:          { id: "100000100010015", name: "스킨케어 > 크림" },
  lotion:         { id: "100000100010016", name: "스킨케어 > 로션" },
  skinCareSet:    { id: "100000100010017", name: "스킨케어 > 스킨케어세트" },
  baseMakeup:     { id: "100000100020001", name: "메이크업 > 베이스메이크업" },
  lipMakeup:      { id: "100000100020006", name: "메이크업 > 립메이크업" },
  eyeMakeup:      { id: "100000100020007", name: "메이크업 > 아이메이크업" },
  beautyTool:     { id: "100000100060001", name: "뷰티소품 > 메이크업 툴" },
  shower:         { id: "100000100030005", name: "바디케어 > 샤워/입욕" },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

// ── 상품 타입 ────────────────────────────────────────────────────────────────

export interface Product {
  goodsNo: string;
  name: string;
  brand: string;
  price: string;       // 최적가(할인가) 또는 정가
  orgPrice: string;    // 정가 (할인 없으면 price와 동일)
  imageUrl: string;
  category: string;
  categoryId: string;
}

// ── 크롤러 설정 ──────────────────────────────────────────────────────────────

interface CrawlerOptions {
  /** 카테고리 키 목록 (기본: 전체) */
  categories?: CategoryKey[];
  /** 카테고리당 최대 페이지 수 (기본: 5, 24개/페이지 → 120개) */
  maxPages?: number;
  /** 페이지 간 딜레이 ms (기본: 1500) */
  delay?: number;
  /** 저장 경로 (기본: ./products.json) */
  outputPath?: string;
}

// ── puppeteer 브라우저 공유 ──────────────────────────────────────────────────

async function createBrowser() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const puppeteer = require("puppeteer");
  return puppeteer.launch({ headless: true });
}

// ── 카테고리 목록 페이지 스크래핑 ───────────────────────────────────────────

async function scrapeCategoryPage(
  browser: any,
  categoryId: string,
  categoryName: string,
  pageIdx: number
): Promise<Product[]> {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    const url = `https://www.oliveyoung.co.kr/store/display/getMCategoryList.do?dispCatNo=${categoryId}&pageIdx=${pageIdx}&rowsPerPage=24`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // 상품 목록이 로드될 때까지 대기
    await page.waitForSelector("ul.cate_prd_list > li", { timeout: 10000 }).catch(() => {});

    const html = await page.content();
    const $ = cheerio.load(html);

    const products: Product[] = [];

    $("ul.cate_prd_list > li").each((_, li) => {
      const el = $(li);

      // goodsNo
      const thumbLink = el.find("a[data-ref-goodsno]").first();
      const goodsNo = thumbLink.attr("data-ref-goodsno") ?? "";
      if (!goodsNo) return;

      // 상품명 (data-attr: "카테고리상세^순서^상품명^번호")
      const dataAttr = thumbLink.attr("data-attr") ?? "";
      const nameFromAttr = dataAttr.split("^")[2] ?? "";
      const nameFromSpan = el.find(".tx_name").first().text().trim();
      const name = nameFromAttr || nameFromSpan;
      if (!name) return;

      // 브랜드
      const brand = el.find(".tx_brand").first().text().trim();

      // 가격 (숫자만, 단위 포함 형태 정규화)
      const orgRaw = el.find(".tx_org span").first().text().trim() ||
                     el.find(".tx_org").first().text().trim();
      const curRaw = el.find(".tx_cur strong").first().text().trim() ||
                     el.find(".tx_cur").first().text().trim();

      // "18,900원 ~" → "18,900원" 정규화
      const normalizePrice = (raw: string) => raw.replace(/[~\s]+$/, "").trim();

      const salePrice = normalizePrice(curRaw);
      const orgPrice  = orgRaw ? `${normalizePrice(orgRaw)}원` : salePrice;
      const price     = salePrice || orgPrice;

      // 이미지
      const imgSrc = el.find("a.prd_thumb img").first().attr("src") ?? "";
      const imageUrl = imgSrc.startsWith("//") ? `https:${imgSrc}` : imgSrc;

      products.push({
        goodsNo,
        name,
        brand,
        price,
        orgPrice,
        imageUrl,
        category: categoryName,
        categoryId,
      });
    });

    return products;
  } finally {
    await page.close();
  }
}

// ── 메인 크롤러 ──────────────────────────────────────────────────────────────

export async function crawlCategories(opts: CrawlerOptions = {}): Promise<Product[]> {
  const {
    categories = Object.keys(CATEGORIES) as CategoryKey[],
    maxPages = 5,
    delay = 1500,
    outputPath = path.join(__dirname, "products.json"),
  } = opts;

  // 기존 데이터 로드 (이어받기용)
  let existing: Product[] = [];
  if (fs.existsSync(outputPath)) {
    existing = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
    console.log(`기존 데이터 ${existing.length}개 로드`);
  }
  const seen = new Set(existing.map((p) => p.goodsNo));
  const allProducts: Product[] = [...existing];

  const browser = await createBrowser();
  let newCount = 0;

  try {
    for (const key of categories) {
      const cat = CATEGORIES[key];
      console.log(`\n📂 [${cat.name}] 크롤링 시작`);

      for (let pageIdx = 1; pageIdx <= maxPages; pageIdx++) {
        console.log(`  페이지 ${pageIdx}/${maxPages} 요청 중...`);

        let items: Product[] = [];
        try {
          items = await scrapeCategoryPage(browser, cat.id, cat.name, pageIdx);
        } catch (err) {
          console.warn(`  ⚠ 오류 (${pageIdx}페이지):`, (err as Error).message);
          break;
        }

        if (items.length === 0) {
          console.log(`  페이지 ${pageIdx}: 상품 없음 → 종료`);
          break;
        }

        let added = 0;
        for (const item of items) {
          if (!seen.has(item.goodsNo)) {
            seen.add(item.goodsNo);
            allProducts.push(item);
            added++;
            newCount++;
          }
        }

        console.log(`  ${items.length}개 수집, ${added}개 신규 추가 (누계 ${allProducts.length}개)`);

        // 중간 저장
        fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2), "utf-8");

        // 딜레이
        if (pageIdx < maxPages && added > 0) {
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\n✅ 완료: 신규 ${newCount}개 추가, 총 ${allProducts.length}개`);
  console.log(`📄 저장 경로: ${outputPath}`);
  return allProducts;
}

// ── CLI 실행 ─────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // 옵션 파싱: --categories=skinToner,serum  --pages=3
  const catArg = args.find((a) => a.startsWith("--categories="))?.split("=")[1];
  const pagesArg = args.find((a) => a.startsWith("--pages="))?.split("=")[1];
  const outArg = args.find((a) => a.startsWith("--out="))?.split("=")[1];

  const categories = catArg
    ? (catArg.split(",") as CategoryKey[])
    : undefined;

  const maxPages = pagesArg ? parseInt(pagesArg, 10) : 5;

  const outputPath = outArg
    ? path.resolve(outArg)
    : path.join(__dirname, "products.json");

  console.log("올리브영 카테고리 크롤러");
  console.log("카테고리:", categories ?? "전체");
  console.log("페이지:", maxPages, "/ 카테고리당 최대", maxPages * 24, "개");
  console.log();

  await crawlCategories({ categories, maxPages, outputPath });
}

main().catch((err) => {
  console.error("오류:", err.message);
  process.exit(1);
});
