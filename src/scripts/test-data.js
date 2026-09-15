import { getAStockData, getUSStockData, getTopSectors, getTimestamp } from '../data/stock.js';

async function main() {
  console.log('测试股市数据获取...\n');

  const [aStock, usStock, sectors] = await Promise.all([
    getAStockData(),
    getUSStockData(),
    getTopSectors(5),
  ]);

  console.log('===== A股 =====');
  console.table(aStock);
  console.log('\n===== 美股 =====');
  console.table(usStock);
  console.log('\n===== 热门板块TOP5 =====');
  console.table(sectors);
  console.log(`\n数据时间: ${getTimestamp()}`);
}

main().catch(err => {
  console.error('测试失败:', err);
  process.exit(1);
});
