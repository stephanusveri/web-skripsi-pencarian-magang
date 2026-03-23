// index.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const mahasiswaRoutes = require('./routes/mahasiswa.routes');
const perusahaanRoutes = require('./routes/perusahaan.routes');
const lowonganRoutes = require('./routes/lowongan.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
// app.use(cors({
//     origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
//     credentials: true
// }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // public
app.use(express.static(path.join(process.cwd(), 'public'))) //public
app.use(express.urlencoded({ extended: true }));

// SERVE STATIC FILES
const frontendDir = path.join(__dirname, '../../frontend');
const uploadDir = path.join(__dirname, '../uploads');
const cvDir = path.join(uploadDir, 'cv');

app.use(express.static(frontendDir));
// Static files middleware
app.use('/uploads', express.static(uploadDir, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
        }
    }
}));

// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/perusahaan', perusahaanRoutes);
app.use('/api/lowongan', lowonganRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);

app.get('/', (req, res) => { res.sendfile(path.join(process.cwd(), 'public', 'login.html')) })


// app.get('/', (req, res) => {
//     res.sendFile(path.join(frontendDir, 'login.html'));
// });

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// ERROR HANDLING
app.use((err, req, res, next) => {
    console.error('ERROR:', err);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    console.log('404 - Route not found:', req.url);
    res.status(404).json({
        message: 'Route not found',
        url: req.url,
        method: req.method
    });
});

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║   🚀 Server Running Successfully!   ║
╠══════════════════════════════════════╣
║  Port: ${PORT}                        ║
║  Environment: ${process.env.NODE_ENV || 'development'}           ║
║  API URL: http://localhost:${PORT}    ║
╚══════════════════════════════════════╝
    `);
}); 8