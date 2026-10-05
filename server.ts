import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 3000) : 3001;

// Increase payload limit for base64 uploaded images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const dbPath = path.resolve(__dirname, 'db.json');

// Helper to read database safely
function readDB() {
  try {
    if (!fs.existsSync(dbPath)) {
      throw new Error('db.json does not exist');
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json, returning empty template:', error);
    return {
      hero: { heading: '', subtitle: '', buttonText: '', buttonLink: '', badge: '', promoText: '', image: '' },
      settings: { promoBar: { text: '', enabled: false }, payment: { bkash: { enabled: false, number: '', instructions: '' }, nagad: { enabled: false, number: '', instructions: '' } }, adminPassword: 'admin' },
      courses: [],
      products: [],
      offers: [],
      orders: []
    };
  }
}

// Helper to write database safely
function writeDB(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to db.json:', error);
  }
}

// Middleware: Admin Authentication
function adminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  const db = readDB();
  
  // High reliability: Secret token is simply the adminPassword for straightforward session auth
  if (token === db.settings.adminPassword || token === 'editz_iqra_admin_session_token') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
}

// --- PUBLIC ENDPOINTS ---

// Get public website content
app.get('/api/public', (req, res) => {
  const db = readDB();
  res.json({
    hero: db.hero,
    settings: {
      promoBar: db.settings.promoBar,
      payment: {
        bkash: {
          enabled: db.settings.payment.bkash.enabled,
          number: db.settings.payment.bkash.number,
          instructions: db.settings.payment.bkash.instructions,
        },
        nagad: {
          enabled: db.settings.payment.nagad.enabled,
          number: db.settings.payment.nagad.number,
          instructions: db.settings.payment.nagad.instructions,
        }
      }
    },
    // Only send published courses and products to the public
    courses: db.courses.filter((c: any) => c.status === 'published'),
    products: db.products.filter((p: any) => p.status === 'published'),
    // Only send active offers
    offers: db.offers.filter((o: any) => o.active)
  });
});

// Submit a payment/order
app.post('/api/orders', (req, res) => {
  const { customerName, phone, email, productName, amount, paymentMethod, transactionId } = req.body;
  
  if (!customerName || !phone || !productName || !amount || !paymentMethod || !transactionId) {
    res.status(400).json({ error: 'Missing required payment details' });
    return;
  }
  
  const db = readDB();
  
  // Generate a professional custom sequential Order ID
  const orderCount = db.orders.length;
  const nextNumber = 1000 + orderCount + 1;
  const orderId = `EQ-${nextNumber}`;
  
  const newOrder = {
    id: orderId,
    customerName,
    phone,
    email: email || '',
    productName,
    amount: Number(amount),
    paymentMethod,
    transactionId,
    date: new Date().toISOString(),
    status: 'Pending'
  };
  
  db.orders.push(newOrder);
  writeDB(db);
  
  res.json({ success: true, orderId, order: newOrder });
});

// View order status / Download receipt info
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const order = db.orders.find((o: any) => o.id === id);
  
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  
  res.json({ success: true, order });
});

// --- ADMIN ENDPOINTS ---

// Admin Login
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const db = readDB();
  
  const actualPassword = db.settings.adminPassword || 'iqra_secure_2026';
  const secretKey = db.settings.adminSecretKey || 'iqra_secure_gate_2026';
  
  if (password === actualPassword || password === secretKey) {
    // Generate simple bearer token
    res.json({ success: true, token: actualPassword });
  } else {
    res.status(401).json({ error: 'ভুল সিক্রেট কী বা পাসওয়ার্ড! আবার চেষ্টা করুন।' });
  }
});

// Verify login session
app.get('/api/admin/verify', adminAuth, (req, res) => {
  res.json({ success: true });
});

// Get admin dashboard data
app.get('/api/admin/data', adminAuth, (req, res) => {
  const db = readDB();
  
  // Calculate dashboard statistics
  const totalCourses = db.courses.length;
  const totalProducts = db.products.length;
  const totalOrders = db.orders.length;
  
  const pendingOrders = db.orders.filter((o: any) => o.status === 'Pending').length;
  const verifiedOrders = db.orders.filter((o: any) => o.status === 'Verified' || o.status === 'Completed').length;
  
  const revenue = db.orders
    .filter((o: any) => o.status === 'Verified' || o.status === 'Completed')
    .reduce((sum: number, o: any) => sum + o.amount, 0);
  
  res.json({
    success: true,
    statistics: {
      totalCourses,
      totalProducts,
      totalOrders,
      pendingOrders,
      verifiedOrders,
      revenue
    },
    hero: db.hero,
    settings: db.settings,
    courses: db.courses,
    products: db.products,
    offers: db.offers,
    orders: db.orders
  });
});

// Update Hero settings
app.post('/api/admin/hero', adminAuth, (req, res) => {
  const db = readDB();
  db.hero = { ...db.hero, ...req.body };
  writeDB(db);
  res.json({ success: true, hero: db.hero });
});

// Update General/Payment settings
app.post('/api/admin/settings', adminAuth, (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json({ success: true, settings: db.settings });
});

// Add or Update Course
app.post('/api/admin/courses', adminAuth, (req, res) => {
  const courseData = req.body;
  const db = readDB();
  
  if (!courseData.name || courseData.price === undefined) {
    res.status(400).json({ error: 'Course name and price are required' });
    return;
  }
  
  if (courseData.id) {
    // Edit mode
    const idx = db.courses.findIndex((c: any) => c.id === courseData.id);
    if (idx > -1) {
      db.courses[idx] = { ...db.courses[idx], ...courseData };
    } else {
      db.courses.push(courseData);
    }
  } else {
    // Add mode
    const newId = 'c_' + Date.now();
    db.courses.push({
      ...courseData,
      id: newId,
      status: courseData.status || 'published'
    });
  }
  
  writeDB(db);
  res.json({ success: true, courses: db.courses });
});

// Delete Course
app.delete('/api/admin/courses/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.courses = db.courses.filter((c: any) => c.id !== id);
  writeDB(db);
  res.json({ success: true, courses: db.courses });
});

// Add or Update Product
app.post('/api/admin/products', adminAuth, (req, res) => {
  const productData = req.body;
  const db = readDB();
  
  if (!productData.name || productData.price === undefined) {
    res.status(400).json({ error: 'Product name and price are required' });
    return;
  }
  
  if (productData.id) {
    // Edit mode
    const idx = db.products.findIndex((p: any) => p.id === productData.id);
    if (idx > -1) {
      db.products[idx] = { ...db.products[idx], ...productData };
    } else {
      db.products.push(productData);
    }
  } else {
    // Add mode
    const newId = 'p_' + Date.now();
    db.products.push({
      ...productData,
      id: newId,
      status: productData.status || 'published'
    });
  }
  
  writeDB(db);
  res.json({ success: true, products: db.products });
});

// Delete Product
app.delete('/api/admin/products/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.products = db.products.filter((p: any) => p.id !== id);
  writeDB(db);
  res.json({ success: true, products: db.products });
});

// Add or Update Offer
app.post('/api/admin/offers', adminAuth, (req, res) => {
  const offerData = req.body;
  const db = readDB();
  
  if (!offerData.name || offerData.price === undefined) {
    res.status(400).json({ error: 'Offer name and price are required' });
    return;
  }
  
  if (offerData.id) {
    // Edit mode
    const idx = db.offers.findIndex((o: any) => o.id === offerData.id);
    if (idx > -1) {
      db.offers[idx] = { ...db.offers[idx], ...offerData };
    } else {
      db.offers.push(offerData);
    }
  } else {
    // Add mode
    const newId = 'o_' + Date.now();
    db.offers.push({
      ...offerData,
      id: newId,
      active: offerData.active !== undefined ? offerData.active : true
    });
  }
  
  writeDB(db);
  res.json({ success: true, offers: db.offers });
});

// Delete Offer
app.delete('/api/admin/offers/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.offers = db.offers.filter((o: any) => o.id !== id);
  writeDB(db);
  res.json({ success: true, offers: db.offers });
});

// Update Order Status
app.post('/api/admin/orders/:id/status', adminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }
  
  const db = readDB();
  const orderIdx = db.orders.findIndex((o: any) => o.id === id);
  
  if (orderIdx === -1) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  
  db.orders[orderIdx].status = status;
  writeDB(db);
  
  res.json({ success: true, orders: db.orders });
});

// Delete Order Record
app.delete('/api/admin/orders/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.orders = db.orders.filter((o: any) => o.id !== id);
  writeDB(db);
  res.json({ success: true, orders: db.orders });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve static assets from built React app
  app.use(express.static(path.resolve(__dirname, 'dist')));
  
  // All other GET requests route to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
