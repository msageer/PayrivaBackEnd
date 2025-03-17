const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());

// Replace these with your actual credentials
const USER_ID = process.env.NELLOBYTE_USER_ID;
const API_KEY = process.env.NELLOBYTE_API_KEY;

// Endpoint to fetch data packages
app.get('/api/packages', async (req, res) => {
    const { provider } = req.query;

    if (!provider) {
        return res.status(400).json({ error: 'Provider is required' });
    }

    try {
        const response = await axios.get('https://www.nellobytesystems.com/APIserviceavailableV1.asp', {
            params: {
                CK10103106: USER_ID,
                '7OJDT136H5J79ZT825U6ESO1S6HAT6V930019XW40W3CZ6RLPP80W65M82V07KYZ': API_KEY
            }
        });

        const data = response.data.MOBILE_NETWORK.find(network => network.ID === provider)?.PRODUCT || [];
        res.json(data);
    } catch (error) {
        console.error('Error fetching packages:', error.message);
        res.status(500).json({ error: 'Failed to fetch packages' });
    }
});

// Endpoint to purchase data bundle
app.post('/api/buy-data', async (req, res) => {
    const { mobileNetwork, dataPlan, mobileNumber, paymentMethod } = req.body;

    if (!mobileNetwork || !dataPlan || !mobileNumber || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const response = await axios.get('https://www.nellobytesystems.com/APIDatabundleV1.asp', {
            params: {
                CK10103106: USER_ID,
                '7OJDT136H5J79ZT825U6ESO1S6HAT6V930019XW40W3CZ6RLPP80W65M82V07KYZ': API_KEY,
                MobileNetwork: mobileNetwork,
                DataPlan: dataPlan,
                MobileNumber: mobileNumber,
                RequestID: Date.now().toString(),
                CallBackURL: 'https://yourdomain.com/callback'
            }
        });

        const apiResponse = response.data;

        if (apiResponse === 'ORDER_RECEIVED') {
            return res.status(200).json({ status: 'success', message: 'Order received successfully' });
        } else {
            return res.status(400).json({ status: 'error', message: apiResponse });
        }
    } catch (error) {
        console.error('Error calling NelloByteSystems API:', error.message);
        return res.status(500).json({ status: 'error', message: 'Failed to process request' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
