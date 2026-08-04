const puppeteer = require('puppeteer');

class GoogleSearch {
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

  async findWebsites(query, country, condition) {
    await this.init();
    const page = await this.browser.newPage();
    
    // Формуємо пошуковий запит
    let searchQuery = query;
    if (condition === 'used') {
      searchQuery += ' б/в бу';
    } else {
      searchQuery += ' купити';
    }
    
    // Додаємо країну
    const countryDomains = {
      'ua': 'site:.ua',
      'pl': 'site:.pl',
      'de': 'site:.de',
      'us': 'site:.com',
      'all': ''
    };
    
    if (countryDomains[country]) {
      searchQuery += ` ${countryDomains[country]}`;
    }
    
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=10`;
    
    try {
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Отримуємо посилання на сайти
      const websites = await page.evaluate(() => {
        const links = document.querySelectorAll('a');
        const results = [];
        const seen = new Set();
        
        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('/url?q=')) {
            const url = decodeURIComponent(href.replace('/url?q=', '').split('&')[0]);
            if (url.startsWith('http') && !seen.has(url)) {
              seen.add(url);
              // Витягуємо назву домену
              try {
                const domain = new URL(url).hostname.replace('www.', '');
                results.push({
                  url: url,
                  domain: domain,
                  title: link.textContent?.trim() || domain
                });
              } catch (e) {
                // Пропускаємо невалідні URL
              }
            }
          }
        });
        
        return results.slice(0, 15); // Беремо перші 15 сайтів
      });
      
      await this.close();
      return websites;
      
    } catch (error) {
      console.error('Помилка пошуку Google:', error);
      await this.close();
      return [];
    }
  }
}

module.exports = { GoogleSearch };
