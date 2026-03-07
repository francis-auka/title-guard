const { ethers } = require('ethers');
require('dotenv').config();

async function checkBalance() {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const balance = await provider.getBalance(wallet.address);
    console.log('Wallet Address:', wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'MATIC');
    process.exit(0);
}

checkBalance();
