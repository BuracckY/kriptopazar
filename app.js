require('dotenv').config(); // .env dosyasını yüklemek için EN BAŞTA olmalı
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const flash = require('connect-flash'); // Flash mesajları için

// Rota dosyalarını import et
const adminRoutes = require('./routes/adminRoutes');
const mainRoutes = require('./routes/mainRoutes');

const app = express();

// --- MongoDB Bağlantısı ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB bağlantısı başarılı.'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 } // 1 saat
}));
app.use(flash());

// --- Static ve View Ayarları ---
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// --- Routes ---
app.use('/', mainRoutes);
app.use('/admin', adminRoutes);

// --- 404 Handler ---
app.use((req, res) => {
    res.status(404).render('404');
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error('Global Hata Yakalama:', err);
    res.status(500).render('500', { error: err });
});

// --- Sunucu Başlat ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
