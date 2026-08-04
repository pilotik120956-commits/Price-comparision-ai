function analyzePrices(offers, query) {
  // 1. Фільтруємо дублікати
  const uniqueOffers = [];
  const seen = new Set();
  
  offers.forEach(offer => {
    const key = `${offer.title}-${offer.price}-${offer.store}`;
    if (!seen.has(key) && offer.price > 0) {
      seen.add(key);
      uniqueOffers.push(offer);
    }
  });
  
  // 2. Сортуємо за ціною
  const sorted = uniqueOffers.sort((a, b) => a.price - b.price);
  
  // 3. Додаємо ШІ-оцінку
  const analyzed = sorted.map((offer, index) => {
    // Локальний ШІ-аналіз на основі статистики
    const avgPrice = sorted.reduce((sum, o) => sum + o.price, 0) / sorted.length;
    const deviation = ((offer.price - avgPrice) / avgPrice * 100);
    
    let recommendation = '';
    let confidence = 0;
    
    if (offer.price === sorted[0].price) {
      recommendation = '🏆 Найнижча ціна! Рекомендуємо!';
      confidence = 95;
    } else if (deviation < -10) {
      recommendation = '✅ Дуже хороша ціна';
      confidence = 85;
    } else if (deviation < 10) {
      recommendation = '👍 Середня ринкова ціна';
      confidence = 70;
    } else {
      recommendation = '⚠️ Ціна вище середньої';
      confidence = 60;
    }
    
    // Додаємо теги
    const tags = [];
    if (offer.price === sorted[0].price) tags.push('найнижча');
    if (offer.price < avgPrice * 0.9) tags.push('знижка');
    if (offer.title.toLowerCase().includes('б/в') || offer.title.toLowerCase().includes('бу')) tags.push('вживане');
    if (offer.title.toLowerCase().includes('новий') || offer.title.toLowerCase().includes('new')) tags.push('нове');
    
    // Шукаємо магазин у назві
    const storeKeywords = ['rozetka', 'allo', 'comfy', 'citrus', 'prom', 'hotline', 'telemart', 'foxtrot', 'epicentr'];
    const foundStore = storeKeywords.find(keyword => 
      offer.store.toLowerCase().includes(keyword) || 
      offer.title.toLowerCase().includes(keyword)
    );
    
    return {
      ...offer,
      avgPrice: Math.round(avgPrice),
      deviation: Math.round(deviation * 10) / 10,
      recommendation,
      confidence,
      tags: tags.length > 0 ? tags : ['стандарт'],
      storeType: foundStore ? '🏪 Магазин' : '🌐 Сайт',
      aiScore: Math.round((100 - Math.abs(deviation)) * 0.7 + 30)
    };
  });
  
  return analyzed;
}

module.exports = { analyzePrices };
