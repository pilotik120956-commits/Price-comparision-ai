const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const countrySelect = document.getElementById('country');
const conditionSelect = document.getElementById('condition');
const resultsDiv = document.getElementById('results');

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performSearch();
});

async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  
  // Показуємо завантаження
  resultsDiv.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>🔍 Шукаємо сайти та аналізуємо ціни...</p>
    </div>
  `;
  
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        country: countrySelect.value,
        condition: conditionSelect.value
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      resultsDiv.innerHTML = `<div class="no-results"><span>⚠️</span><p>${data.error}</p></div>`;
      return;
    }
    
    if (data.offers.length === 0) {
      resultsDiv.innerHTML = `
        <div class="no-results">
          <span>🔍</span>
          <p>${data.message || 'Нічого не знайдено. Спробуйте інший запит.'}</p>
        </div>
      `;
      return;
    }
    
    // Відображаємо результати
    let html = `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <span style="font-weight:600; color:#1a2b44;">
          🛒 Знайдено ${data.total} пропозицій на ${data.sitesFound?.length || 0} сайтах
        </span>
        <span style="background:#e6f5e9; padding:6px 18px; border-radius:30px; font-size:0.9rem;">
          🏆 Найнижча: ${data.lowestPrice} ₴
        </span>
      </div>
    `;
    
    data.offers.forEach((offer, index) => {
      const isLowest = index === 0;
      const tagsHtml = offer.tags?.map(t => 
        `<span class="badge ${t === 'найнижча' ? 'badge-lowest' : t === 'вживане' ? 'badge-used' : 'badge-avg'}">${t}</span>`
      ).join('') || '';
      
      html += `
        <div class="result-item ${isLowest ? 'lowest' : ''}">
          <div>
            <div class="store">${offer.store}</div>
            <div style="font-size:0.9rem; color:#4a6a8a; margin-top:4px;">
              ${offer.title.length > 60 ? offer.title.substring(0,60)+'...' : offer.title}
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
              ${tagsHtml}
              <span style="font-size:0.7rem; color:#6a8aaa;">🤖 AI: ${offer.aiScore}%</span>
              <span style="font-size:0.7rem; color:#6a8aaa;">📊 ${offer.deviation}% від середньої</span>
            </div>
            <div class="recommendation">${offer.recommendation}</div>
          </div>
          <div style="text-align:right;">
            <div class="price">${offer.price} <small>${offer.currency}</small></div>
            <div style="font-size:0.7rem; color:#6a8aaa;">${offer.storeType}</div>
          </div>
        </div>
      `;
    });
    
    resultsDiv.innerHTML = html;
    
  } catch (error) {
    resultsDiv.innerHTML = `
      <div class="no-results">
        <span>❌</span>
        <p>Помилка: ${error.message}</p>
      </div>
    `;
  }
}

// Автоматичний пошук при завантаженні
window.addEventListener('load', performSearch);
