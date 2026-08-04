const { GoogleSearch } = require('./googleSearch');
const { PriceExtractor } = require('./priceExtractor');

async function universalSearch(query, country, condition) {
  console.log('🔍 Пошук сайтів через Google...');
  
  // 1. Знаходимо сайти через Google
  const googleSearch = new GoogleSearch();
  const websites = await googleSearch.findWebsites(query, country, condition);
  
  if (websites.length === 0) {
    console.log('⚠️ Сайтів не знайдено');
    return [];
  }
  
  console.log(`✅ Знайдено ${websites.length} сайтів`);
  
  // 2. Парсимо ціни з кожного сайту
  const priceExtractor = new PriceExtractor();
  const allOffers = [];
  
  // Парсимо паралельно (максимум 5 одночасно)
  const batchSize = 5;
  for (let i = 0; i < websites.length; i += batchSize) {
    const batch = websites.slice(i, i + batchSize);
    const promises = batch.map(site => 
      priceExtractor.extractPricesFromSite(site.url, query, condition)
    );
    
    const results = await Promise.allSettled(promises);
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allOffers.push(...result.value);
      }
    });
    
    console.log(`📊 Оброблено ${Math.min(i + batchSize, websites.length)}/${websites.length} сайтів`);
  }
  
  console.log(`✅ Знайдено ${allOffers.length} пропозицій`);
  return allOffers;
}

module.exports = { universalSearch };
