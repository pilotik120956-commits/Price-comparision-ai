const express = require('express');
const cors = require('cors');
const path = require('path');
const { universalSearch } = require('./scrapers/universalScraper');
const { analyzePrices } = require('./ai/priceAnalyzer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Головний пошук
app.post('/api/search', async (req, res) => {
  try {
    const { query, country, condition } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Введіть назву товару' });
    }

    console.log(`🔍 Пошук: "${query}", Країна: ${country}, Стан: ${condition}`);

    // Універсальний пошук по всіх сайтах
    const results = await universalSearch(query, country, condition);
    
    if (results.length === 0) {
      return res.json({ 
        offers: [], 
        message: 'Не знайдено пропозицій. Спробуйте інший запит.' 
      });
    }

    // ШІ-аналіз (локальний)
    const analyzed = analyzePrices(results, query);
    
    res.json({
      offers: analyzed,
      total: analyzed.length,
      lowestPrice: analyzed.length > 0 ? analyzed[0].price : null,
      sitesFound: [...new Set(analyzed.map(o => o.store))]
    });

  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Сталася помилка при пошуку' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер на http://localhost:${PORT}`);
  console.log(`🤖 ШІ-аналізатор активний (локальний режим)`);
});
