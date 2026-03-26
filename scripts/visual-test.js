/**
 * 视觉走查自动化测试脚本 (Visual Regression Test)
 * 依赖库: puppeteer, pixelmatch, pngjs
 * 运行方式: node scripts/visual-test.js
 * 注意：由于小程序环境特殊，此脚本需配合微信开发者工具的自动化API(miniprogram-automator)使用。
 * 此处提供通用 Node.js 像素级对比核心逻辑。
 */

const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const path = require('path');

const BASE_DIR = path.join(__dirname, '../tests/snapshots/base');
const CURRENT_DIR = path.join(__dirname, '../tests/snapshots/current');
const DIFF_DIR = path.join(__dirname, '../tests/snapshots/diff');

// 阈值：差异超过 1% 即报错
const THRESHOLD_PERCENT = 0.01;

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function runVisualTest(pageName) {
  ensureDirSync(DIFF_DIR);

  const img1Path = path.join(BASE_DIR, `${pageName}.png`);
  const img2Path = path.join(CURRENT_DIR, `${pageName}.png`);
  
  if (!fs.existsSync(img1Path) || !fs.existsSync(img2Path)) {
    console.error(`[Error] 缺少基准图或当前截图: ${pageName}`);
    return;
  }

  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));
  const { width, height } = img1;

  const diff = new PNG({ width, height });

  // 像素级对比
  const numDiffPixels = pixelmatch(
    img1.data, 
    img2.data, 
    diff.data, 
    width, 
    height, 
    { threshold: 0.1 } // 敏感度
  );

  const totalPixels = width * height;
  const diffPercent = numDiffPixels / totalPixels;

  const diffPath = path.join(DIFF_DIR, `${pageName}-diff.png`);
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  console.log(`[Result] ${pageName}: 差异像素 ${numDiffPixels} (${(diffPercent * 100).toFixed(2)}%)`);

  if (diffPercent > THRESHOLD_PERCENT) {
    console.error(`❌ [Fail] ${pageName} 页面样式偏离超过 1%！请检查走查清单。`);
    process.exit(1);
  } else {
    console.log(`✅ [Pass] ${pageName} 页面样式一致性校验通过。`);
  }
}

// 模拟测试流程
const pagesToTest = ['account', 'report', 'ai'];
console.log('🚀 开始执行页面级一致性检查...\n');
// pagesToTest.forEach(page => runVisualTest(page));
console.log('请确保已通过 miniprogram-automator 抓取当前截图至 current 目录，并准备好 base 目录基准图。');
