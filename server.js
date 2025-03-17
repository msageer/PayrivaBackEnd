const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock database (replace with a real database in production)
let users = {};
let transactions = [];
let adminCredentials = { username: 'admin', password: 'password123' }; // Replace with secure credentials
let services = {
    dataBundles: {
        mtn: [
            { name: "500MB - 30 Days", price: 300, value: "500MB" },
            { name: "1GB - 30 Days", price: 500, value: "1GB" },
            { name: "3GB - 30 Days", price: 1200, value: "3GB" }
        ],
        airtel: [],
        glo: [],
        "9mobile": []
    },
    tvPackages: {
        dstv: [],
        gotv: [],
        startimes: []
    }
};

// Admin login endpoint
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username === adminCredentials.username && password === adminCredentials.password) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Fetch all services
app.get('/admin/services', (req, res) => {
    res.json(services);
});

// Update service packages
app.post('/admin/services/update', (req, res) => {
    const { serviceType, provider, packages } = req.body;

    if (!serviceType || !provider || !Array.isArray(packages)) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    if (!services[serviceType]) {
        return res.status(400).json({ error: 'Invalid service type' });
    }

    services[serviceType][provider] = packages;
    res.json({ success: true, message: 'Service packages updated successfully' });
});

// Fetch all transactions (for monitoring)
app.get('/admin/transactions', (req, res) => {
    res.json(transactions);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
