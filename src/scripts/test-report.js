require('dotenv/config');
const { generateAStockReport, generateUSStockReport } = require('../report/generator');

async function main() {
  console.log('测试A股报告生成...\n');
  try {
    const report = await generateAStockReport();
    console.log('========================================');
    console.log(report);
    console.log('========================================\n');
  } catch (err) {
    console.error('A股报告生成失败:', err.message);
  }

  console.log('测试美股报告生成...\n');
  try {
    const report = await generateUSStockReport();
    console.log('========================================');
    console.log(report);
    console.log('========================================');
  } catch (err) {
    console.error('美股报告生成失败:', err.message);
  }
}

main();
