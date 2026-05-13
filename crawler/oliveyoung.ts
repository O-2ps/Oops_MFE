import axios from "axios";
import * as cheerio from "cheerio";

export interface OliveYoungProduct {
  name: string;
  brand: string;
  price: string;
  originalPrice: string | null;
  discountRate: string | null;
  imageUrl: string;
  goodsNo: string;
}

async function scrapeWithCheerio(url: string): Promise<OliveYoungProduct | null> {
  const { data: html } = await axios.get<string>(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Referer: "https://www.oliveyoung.co.kr/",
      "Accept-Language": "ko-KR,ko;q=0.9",
    },
    timeout: 10000,
  });
  const $ = cheerio.load(html);
  const ogTitle = $('meta[property="og:title"]').attr("content") ?? "";
  const ogImage = $('meta[property="og:image"]').attr("content") ?? "";
  const name = ogTitle.replace(/\s*\|\s*올리브영\s*$/, "").trim();
  if (!name || name === "올리브영 온라인몰") return null;
  const goodsNo = new URL(url).searchParams.get("goodsNo") ?? "";
  const salePriceText = $('[class*="GoodsDetailInfo_price__"]').first().text().trim();
  const originalPriceText = $('[class*="GoodsDetailInfo_price-before__"]').first().text().trim() || null;
  const rates = $('[class*="GoodsDetailInfo_rate__"]').map((_, el) => $(el).text().trim()).get().filter(t => t.includes("%") && t.length > 1);
  const discountRateText = rates[0] ?? null;
  const brand = $('[class*="btn-brand"]').first().text().trim();
  const price = salePriceText || originalPriceText || "";
  return { name, brand, price, originalPrice: salePriceText ? originalPriceText : null, discountRate: discountRateText, imageUrl: ogImage.startsWith("//") ? `https:${ogImage}` : ogImage, goodsNo };
}

async function scrapeWithPuppeteer(url: string): Promise<OliveYoungProduct | null> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForSelector('[class*="GoodsDetailInfo_title__"]', { timeout: 10000 }).catch(() => {});
    const html = await page.content();
    const $ = cheerio.load(html);
    const goodsNo = new URL(url).searchParams.get("goodsNo") ?? "";
    const ogTitle = $('meta[property="og:title"]').attr("content") ?? "";
    const ogImage = $('meta[property="og:image"]').attr("content") ?? "";
    const name = ogTitle.replace(/\s*\|\s*올리브영\s*$/, "").trim();
    const salePriceText = $('[class*="GoodsDetailInfo_price__"]').first().text().trim();
    const originalPriceText = $('[class*="GoodsDetailInfo_price-before__"]').first().text().trim() || null;
    const rates = $('[class*="GoodsDetailInfo_rate__"]').map((_, el) => $(el).text().trim()).get().filter(t => t.includes("%") && t.length > 1);
    const discountRateText = rates[0] ?? null;
    const brand = $('[class*="btn-brand"]').first().text().trim();
    const price = salePriceText || originalPriceText || "";
    return { name, brand, price, originalPrice: salePriceText ? originalPriceText : null, discountRate: discountRateText, imageUrl: ogImage.startsWith("//") ? `https:${ogImage}` : ogImage, goodsNo };
  } finally {
    await browser.close();
  }
}

export async function scrapeOliveYoung(url: string): Promise<OliveYoungProduct> {
  try {
    const result = await scrapeWithCheerio(url);
    if (result?.name) return result;
  } catch {
    // fall through to puppeteer
  }
  const result = await scrapeWithPuppeteer(url);
  if (!result?.name) throw new Error("상품 정보를 가져오지 못했습니다.");
  return result;
}

async function main() {
  const url = process.argv[2] || "https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000253106";
  const product = await scrapeOliveYoung(url);
  console.log("상품명  :", product.name);
  console.log("브랜드  :", product.brand || "(없음)");
  console.log("가격    :", product.price);
  console.log("정가    :", product.originalPrice ?? "(할인 없음)");
  console.log("할인율  :", product.discountRate ?? "(없음)");
  console.log("이미지  :", product.imageUrl);
  console.log("상품번호:", product.goodsNo);
}

main().catch(err => { console.error(err.message); process.exit(1); });
