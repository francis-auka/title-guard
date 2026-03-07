const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const contractJson = JSON.parse(fs.readFileSync(path.join(__dirname, './blockchain/TitleGuard.json'), 'utf8'));
const ABI = contractJson.abi;

async function checkHash() {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, provider);

    const hash = '0x78b21936c53e87843854ffa2583858fdf'; // Wait, let's get the exact hash from the DB
    // I'll run a script to fetch the hash and query the contract
}
