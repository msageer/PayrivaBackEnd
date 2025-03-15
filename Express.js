const express = require('express');
const cors = require('cors');
const { TonClient } = require('@tonclient/core');
const { libNode } = require('@tonclient/lib-node');

// Register TON client
TonClient.useBinaryLibrary(libNode);

const app = express();
app.use(cors()); // Allow cross-origin requests from your GitHub Pages
app.use(express.json());

// Initialize TON client
const client = new TonClient({
  network: {
    server_address: 'https://net.ton.dev'
  }
});

// Endpoint to handle wallet connection
app.post('/api/connect-wallet', async (req, res) => {
  const { walletAddress } = req.body;
  
  try {
    // Validate the wallet address
    // Store user's wallet info in your database
    
    res.json({ success: true, address: walletAddress });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Endpoint to process deposits
app.post('/api/deposit', async (req, res) => {
  const { walletAddress, amount, currency } = req.body;
  
  try {
    // Process the deposit using TON SDK
    // Verify the transaction
    // Update user balance
    
    res.json({ 
      success: true, 
      message: `Deposited ${amount} ${currency}`,
      balance: updatedBalance 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
