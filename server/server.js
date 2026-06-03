require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
    origin: '*', // Allow all origins for local development simplicity
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' })); // Support larger payloads for complex drawing lines
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api', routes);

// Base server state route
app.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'BoardCraft Server API is running',
        timestamp: new Date().toISOString(),
        author: 'Павліченко Платон (Варіант 13)'
    });
});

// 404 Route handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: 'Internal server error occurred' });
});

// Autor timestamp print on startup
function printTimeStamp(name) {
    console.log('=============================================');
    console.log('Автор програми: ' + name);
    console.log('Час компіляції/запуску: ' + new Date().toString());
    console.log('=============================================');
}

app.listen(PORT, () => {
    printTimeStamp('Павліченко Платон Сергійович (1п-23)');
    console.log(`🚀 BoardCraft Server running on http://localhost:${PORT}`);
});
