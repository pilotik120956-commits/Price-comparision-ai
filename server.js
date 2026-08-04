const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ ВАЖЛИВО: правильний шлях до статичних файлів
app.use(express.static(path.join(__dirname, 'public')));

// API ендпоінт
app.post('/api/search', (req, res) => {
  const { query } = req.body;
  
  // Демо-дані
  const mockData = [
    { title: `${query} - Розетка`, price: 28999, store: '🛒 Rozetka' },
    { title: `${query} - Comfy`, price: 27500, store: '🛍️ Comfy' },
    { title: `${query} - Citrus`, price: 26800, store: '📦 Citrus' },
    { title: `${query} - Алло`, price: 27250, store: '📱 Allo' },
  ];
  
  // Сортуємо за ціною
  mockData.sort((a, b) => a.price - b.price);
  
  res.json({
    offers: mockData,
    total: mockData.length,
    lowestPrice: mockData[0]?.price || null
  });
});

// ✅ ВАЖЛИВО: обробка всіх маршрутів
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
