const { ethers } = require('ethers');
require('dotenv').config();

async function checkBalance() {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
    const balance = await provider.getBalance(new ethers.Wallet(process.env.PRIVATE_KEY).address);
    console.log('Wallet Address:', new ethers.Wallet(process.env.PRIVATE_KEY).address);
    console.log('Balance:', ethers.formatEther(balance), 'MATIC');
    process.exit(0);
}

checkBalance();
