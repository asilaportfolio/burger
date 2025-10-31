import express from 'express';
import { engine } from 'express-handlebars';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import session from 'express-session';
import cors from 'cors';
import Product from './models/Product.js';
import Admin from './models/Admin.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5015;

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: false,
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    inc: function (value) { return Number(value) + 1; },
    eq: function (a, b) { return a === b; }
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Auth middleware
const requireAuth = (req, res, next) => {
  console.log('Session adminId:', req.session.adminId); // Debug
  if (req.session.adminId) {
    next();
  } else {
    // API so'rovlari uchun JSON javob
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Boshqa so'rovlarda login sahifasiga yo'naltirish
    res.redirect('/admin-login');
  }
};

// Get all products for main page
app.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const categories = [
      { name: 'lavash', displayName: 'Lavash', products: [] },
      { name: 'burger', displayName: 'Burger', products: [] },
      { name: 'pizza', displayName: 'Pizza', products: [] },
      { name: 'hotdog', displayName: 'Hotdog', products: [] },
      { name: 'sandwich', displayName: 'Sandwich', products: [] },
      { name: 'chips', displayName: 'Chips', products: [] },
      { name: 'sous', displayName: 'Sous', products: [] },
      { name: 'mix', displayName: 'Mix', products: [] },
      { name: 'cake', displayName: 'Cake', products: [] },
      { name: 'drinks', displayName: 'Drinks', products: [] }
    ];

    products.forEach(product => {
      const category = categories.find(cat => cat.name === product.category);
      if (category) {
        category.products.push(product);
      }
    });

    // Check if user is admin
    const isAdmin = !!req.session.adminId;

    res.render('index', { categories, products, isAdmin });
  } catch (error) {
    console.error(error);
    res.send('Error loading products');
  }
});

// New route for handlebars version
app.get('/new', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const categories = [
      { name: 'lavash', displayName: 'Lavash', products: [] },
      { name: 'burger', displayName: 'Burger', products: [] },
      { name: 'pizza', displayName: 'Pizza', products: [] },
      { name: 'hotdog', displayName: 'Hotdog', products: [] },
      { name: 'sandwich', displayName: 'Sandwich', products: [] },
      { name: 'chips', displayName: 'Chips', products: [] },
      { name: 'sous', displayName: 'Sous', products: [] },
      { name: 'mix', displayName: 'Mix', products: [] },
      { name: 'cake', displayName: 'Cake', products: [] },
      { name: 'drinks', displayName: 'Drinks', products: [] }
    ];

    products.forEach(product => {
      const category = categories.find(cat => cat.name === product.category);
      if (category) {
        category.products.push(product);
      }
    });

    // Check if user is admin
    const isAdmin = !!req.session.adminId;

    res.render('index', { categories, products, isAdmin });
  } catch (error) {
    console.error(error);
    res.send('Error loading products');
  }
});

// Admin login page
app.get('/admin-login', (req, res) => {
  res.render('admin-login');
});

// Admin login POST - Secure authentication
app.post('/admin-login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.render('admin-login', { error: 'Login va Parol kiriting!' });
    }

    // Find admin by login and password
    const admin = await Admin.findOne({ login: login, password: password });
    
    if (!admin) {
      return res.render('admin-login', { error: 'Noto\'g\'ri login yoki parol!' });
    }

    // Set session
    req.session.adminId = admin._id;
    req.session.adminUsername = admin.login;

    res.redirect('/admin-panel');
  } catch (error) {
    console.error(error);
    res.render('admin-login', { error: 'Xatolik yuz berdi' });
  }
});

// Admin panel
app.get('/admin-panel', requireAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const totalProducts = await Product.countDocuments();

    // Debug: Log product data
    console.log('Products data being sent to template:', products.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      image: p.image
    })));

    const metrics = {
      totalProducts,
      recentProducts: products.slice(0, 10)
    };

    // Set isAdmin to true for admin panel
    const isAdmin = true;

    res.render('admin-panel', { 
      metrics, 
      products,
      isAdmin,
      adminName: req.session.adminUsername 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Admin logout
app.get('/admin-logout', (req, res) => {
  req.session.adminId = null;
  req.session.adminUsername = null;
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/');
  });
});

// Add product
app.post('/admin/products', requireAuth, async (req, res) => {
  try {
    const { name, price, image, category } = req.body;

    // Validate input data
    if (!name || !price || !image || !category) {
      return res.status(400).json({ success: false, error: 'Barcha maydonlarni to\'ldiring!' });
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ success: false, error: 'Narx maydoniga to\'g\'ri raqam kiriting!' });
    }

    const product = new Product({
      name,
      price: priceNum,
      image,
      category
    });

    await product.save();
    res.status(201).json({ success: true, message: 'Mahsulot muvaffaqiyatli qo\'shildi', product });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      // Handle Mongoose validation errors
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, error: 'Validatsiya xatosi: ' + errors.join(', ') });
    }
    // Har doim JSON qaytarish
    res.status(500).json({ success: false, error: 'Mahsulot qo\'shishda xatolik yuz berdi: ' + error.message });
  }
});

// Delete product
app.delete('/admin/products/:id', requireAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' });
    }
    res.json({ success: true, message: 'Mahsulot muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Mahsulot o\'chirishda xatolik yuz berdi: ' + error.message });
  }
});

// Edit product
app.put('/admin/products/:id', requireAuth, async (req, res) => {
  try {
    const { name, price, image, category } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price: parseFloat(price),
        image,
        category
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' });
    }

    res.json({ success: true, message: 'Mahsulot muvaffaqiyatli yangilandi', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Mahsulot yangilashda xatolik yuz berdi: ' + error.message });
  }
});

// Get product details
app.get('/admin/products/:id', requireAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Mahsulotni olishda xatolik yuz berdi: ' + error.message });
  }
});

// API route to clear session (for clean state on page load)
app.post('/api/clear-session', (req, res) => {
  // Clear admin session data
  req.session.adminId = null;
  req.session.adminUsername = null;
  res.json({ success: true });
});

// API route to get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// API route to check if user is admin
app.get('/api/check-admin', (req, res) => {
  if (req.session.adminId) {
    res.json({ isAdmin: true });
  } else {
    res.json({ isAdmin: false });
  }
});

// API route to get single product (public access for detail view)
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Product not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});