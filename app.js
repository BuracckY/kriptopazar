require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');

const adminRoutes = require('./routes/adminRoutes');
const mainRoutes = require('./routes/mainRoutes');

const app = express();

// --- Mongoose bağlan
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// --- View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// --- Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Session (secure: sadece production)
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        maxAge: 10800000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTP'de false
        sameSite: 'lax'
    }
}));

app.use(flash());

// --- Routerlar
app.use('/admin', adminRoutes);
app.use('/', mainRoutes);

// --- 404
app.use((req, res) => { res.status(404).send('Sayfa bulunamadı'); });

// --- Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu çalışıyor: ${PORT}`));
