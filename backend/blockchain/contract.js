const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Load Contract ABI
const contractJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, './TitleGuard.json'), 'utf8')
);
const ABI = contractJson.abi;

async function registerDocumentOnChain(documentHash, parcelNumber) {
    try {
        console.log('--- Blockchain Write Initiation ---');
        console.log('Attempting blockchain write...');
        console.log('Contract address:', process.env.CONTRACT_ADDRESS);
        console.log('RPC URL:', process.env.ALCHEMY_RPC_URL);

        if (!process.env.ALCHEMY_RPC_URL || !process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
            throw new Error('Missing required blockchain environment variables.');
        }

        const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);

        // Ethers v6 uses '0x' prefixed hex strings for bytes32
        const hashBytes32 = documentHash.startsWith('0x') ? documentHash : `0x${documentHash}`;

        console.log('Sending transaction for parcel:', parcelNumber);

        // contract.registerDocument(parcelNumber, documentHash) 
        // Wait, let's verify the ABI's function signature from TitleGuard.json
        // Line 218: "name": "registerDocument", "inputs": [{"name": "parcelNumber","type": "string"},{"name": "documentHash","type": "bytes32"}]

        const tx = await contract.registerDocument(parcelNumber, hashBytes32);
        console.log('Transaction sent. Waiting for receipt...');

        const receipt = await tx.wait();
        console.log('Blockchain TX hash:', receipt.hash);

        return receipt.hash;
    } catch (error) {
        console.error('Blockchain write failed:', error.message);
        if (error.data) console.error('Error data:', error.data);
        return null;
    }
}

module.exports = { registerDocumentOnChain };
