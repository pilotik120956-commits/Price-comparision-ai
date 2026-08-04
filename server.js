const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Тестовий ендпоінт
app.get('/api/test', (req, res) => {
  res.json({ status: 'OK', message: 'Сервер працює!' });
});

// Основний пошук (без зовнішніх запитів)
app.post('/api/search', (req, res) => {
  const { query } = req.body;
  
  // Тимчасові дані для тесту
  const mockData = [
    { title: `${query} - Магазин 1`, price: 10000, store: '🛒 Rozetka' },
    { title: `${query} - Магазин 2`, price: 9500, store: '🛍️ Comfy' },
    { title: `${query} - Магазин 3`, price: 10200, store: '📦 Citrus' },
  ];
  
  res.json({
    offers: mockData,
    total: mockData.length,
    lowestPrice: 9500
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});
