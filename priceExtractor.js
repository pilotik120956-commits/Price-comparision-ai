const puppeteer = require('puppeteer');

class PriceExtractor {
  constructor() {
    this.browser = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async extractPricesFromSite(url, query, condition) {
    await this.init();
    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // Переходимо на сайт
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 15000 
      });
      
      // Шукаємо ціни на сторінці
      const products = await page.evaluate((searchQuery) => {
        const results = [];
        const seen = new Set();
        
        // Шукаємо всі елементи з цінами
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
          const text = el.textContent?.trim() || '';
          const priceMatch = text.match(/(\d+[\s.,]*\d*)\s*(грн|₴|uah|€|eur|\$|usd)/i);
          
          if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(/[\s,]/g, ''));
            const currency = priceMatch[2].toLowerCase();
            
            // Шукаємо назву товару поруч
            let title = '';
            const parent = el.closest('div, li, article, section');
            if (parent) {
              const headings = parent.querySelectorAll('h1, h2, h3, h4, a, span, div');
              headings.forEach(h => {
                const hText = h.textContent?.trim() || '';
                if (hText.length > 5 && hText.length < 100) {
                  const words = searchQuery.split(' ');
                  const match = words.some(word => 
                    hText.toLowerCase().includes(word.toLowerCase())
                  );
                  if (match) {
                    title = hText;
                  }
                }
              });
            }
            
            // Унікальність
            const key = `${title}-${price}`;
            if (!seen.has(key) && price > 0 && price < 1000000 && title) {
              seen.add(key);
              results.push({
                title: title || 'Товар',
                price: price,
                currency: currency === 'грн' || currency === '₴' || currency === 'uah' ? 'UAH' : 
                         currency === '€' || currency === 'eur' ? 'EUR' :
                         currency === '$' || currency === 'usd' ? 'USD' : currency,
                link: window.location.href
              });
            }
          }
        });
        
        // Якщо нічого не знайдено - пробуємо альтернативний метод
        if (results.length === 0) {
          // Шукаємо ціни в атрибутах
          document.querySelectorAll('[data-price], [data-product-price], [itemprice]').forEach(el => {
            const price = parseFloat(el.getAttribute('data-price') || 
                                    el.getAttribute('data-product-price') || 
                                    el.getAttribute('itemprice'));
            if (price > 0 && price < 1000000) {
              const title = el.getAttribute('data-name') || 
                           el.getAttribute('data-product-name') || 
                           'Товар';
              results.push({
                title: title,
                price: price,
                currency: 'UAH',
                link: window.location.href
              });
            }
          });
        }
        
        return results.slice(0, 3); // Максимум 3 товари з сайту
      }, query);
      
      // Додаємо інформацію про сайт
      const domain = new URL(url).hostname.replace('www.', '');
      const formattedResults = products.map(p => ({
        ...p,
        store: `🏪 ${domain}`,
        siteUrl: url,
        condition: condition || 'new',
        source: 'web'
      }));
      
      await this.close();
      return formattedResults;
      
    } catch (error) {
      console.error(`Помилка на ${url}:`, error.message);
      await this.close();
      return [];
    }
  }
}

module.exports = { PriceExtractor };
