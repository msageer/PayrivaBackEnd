const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

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
        airtel: [
            { name: "500MB - 30 Days", price: 300, value: "500MB" },
            { name: "1GB - 30 Days", price: 500, value: "1GB" },
            { name: "3GB - 30 Days", price: 1200, value: "3GB" }
        ],
        glo: [
            { name: "500MB - 30 Days", price: 300, value: "500MB" },
            { name: "1GB - 30 Days", price: 500, value: "1GB" },
            { name: "3GB - 30 Days", price: 1200, value: "3GB" }
        ],
        "9mobile": [
            { name: "500MB - 30 Days", price: 300, value: "500MB" },
            { name: "1GB - 30 Days", price: 500, value: "1GB" },
            { name: "3GB - 30 Days", price: 1200, value: "3GB" }
        ]
    },
    tvPackages: {
        dstv: [
            { name: "Access", price: 2000, value: "access" },
            { name: "Family", price: 4000, value: "family" },
            { name: "Compact", price: 7900, value: "compact" },
            { name: "Premium", price: 18400, value: "premium" }
        ],
        gotv: [
            { name: "GOtv Lite", price: 900, value: "lite" },
            { name: "GOtv Value", price: 1800, value: "value" },
            { name: "GOtv Plus", price: 3300, value: "plus" },
            { name: "GOtv Max", price: 4150, value: "max" }
        ],
        startimes: [
            { name: "Nova", price: 900, value: "nova" },
            { name: "Basic", price: 1700, value: "basic" },
            { name: "Smart", price: 2200, value: "smart" },
            { name: "Classic", price: 2500, value: "classic" }
        ]
    }
};

// Fetch real-time exchange rates from CoinGecko
async function fetchExchangeRates() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'tether,the-open-network,notcoin', // Cryptocurrencies to fetch
                vs_currencies: 'ngn' // Convert to NGN
            }
        });

        return {
            USDT: response.data.tether.ngn,
            TON: response.data['the-open-network'].ngn,
            NOTcoin: response.data.notcoin.ngn
        };
    } catch (error) {
        console.error('Error fetching exchange rates:', error.message);
        throw new Error('Failed to fetch exchange rates');
    }
}

// Helper function to convert NGN to crypto
function convertNGNToCrypto(amountNGN, exchangeRate) {
    if (!amountNGN || isNaN(amountNGN)) return 0;
    return (amountNGN / exchangeRate).toFixed(6);
}

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

// Fetch service packages for frontend
app.get('/api/services', async (req, res) => {
    const { type, provider } = req.query;

    if (!type || !provider) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const service = services[type];
    if (!service) {
        return res.status(400).json({ error: 'Invalid service type' });
    }

    const packages = service[provider] || [];
    res.json({ packages });
});

// Connect wallet
app.post('/wallet/connect', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing user ID' });
    }

    // Simulate wallet connection
    users[userId] = users[userId] || {};
    users[userId].wallet = {
        address: `0x${Math.random().toString(16).substring(2, 14)}`,
        connected: true,
        balances: {
            USDT: parseFloat((Math.random() * 100).toFixed(2)),
            TON: parseFloat((Math.random() * 5).toFixed(2)),
            NOTcoin: parseFloat((Math.random() * 10000).toFixed(2))
        }
    };

    res.json({
        success: true,
        message: 'Wallet connected successfully',
        wallet: users[userId].wallet
    });
});

// Deposit funds
app.post('/wallet/deposit', (req, res) => {
    const { userId, currency, amount } = req.body;

    if (!userId || !currency || !amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid deposit details' });
    }

    const user = users[userId];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Add to wallet balance
    user.wallet.balances[currency] = (user.wallet.balances[currency] || 0) + parseFloat(amount);

    // Record transaction
    const transaction = {
        id: Date.now().toString(),
        type: 'Deposit',
        amount: `+${amount} ${currency}`,
        date: new Date().toISOString(),
        status: 'Completed'
    };

    transactions.push(transaction);

    res.json({
        success: true,
        message: 'Deposit successful',
        updatedBalance: user.wallet.balances,
        transaction
    });
});

// Process payment
app.post('/purchase', async (req, res) => {
    const { userId, serviceType, details } = req.body;

    if (!userId || !serviceType || !details) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = users[userId];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { amountNGN, paymentMethod } = details;

    // Fetch exchange rates
    const exchangeRates = await fetchExchangeRates();
    const rate = exchangeRates[paymentMethod];

    if (!rate) {
        return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Convert NGN to crypto
    const cryptoAmount = convertNGNToCrypto(amountNGN, rate);

    // Check wallet balance
    if (user.wallet.balances[paymentMethod] < parseFloat(cryptoAmount)) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct from wallet balance
    user.wallet.balances[paymentMethod] -= parseFloat(cryptoAmount);

    // Record transaction
    const transaction = {
        id: Date.now().toString(),
        type: serviceType,
        amount: `-${cryptoAmount} ${paymentMethod}`,
        date: new Date().toISOString(),
        status: 'Completed',
        details
    };

    transactions.push(transaction);

    res.json({
        success: true,
        message: 'Purchase successful',
        transaction,
        updatedBalance: user.wallet.balances
    });
});

// Fetch transaction history
app.get('/transactions/:userId', (req, res) => {
    const { userId } = req.params;

    const userTransactions = transactions.filter(tx => tx.userId === userId);
    res.json(userTransactions);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
