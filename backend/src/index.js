// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const mahasiswaRoutes = require('./routes/mahasiswa.routes');
const perusahaanRoutes = require('./routes/perusahaan.routes');
const lowonganRoutes = require('./routes/lowongan.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/perusahaan', perusahaanRoutes);
app.use('/api/lowongan', lowonganRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes)

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
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
  `)
})
