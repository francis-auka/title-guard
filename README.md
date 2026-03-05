# 🛡️ Title Guard

**Blockchain-Based Property Document Authentication & Fraud Detection Platform**

Title Guard is a full-stack SaaS application built specifically for the Kenyan property market. It leverages the immutability of the Polygon blockchain and cryptographic SHA-256 hashing to ensure that property title deeds cannot be forged or tampered with.

---

## 🚀 Key Features

- **On-Chain Registration**: Generate a unique cryptographic fingerprint (SHA-256 hash) of your title deed and store it permanently on the Polygon Amoy Testnet.
- **Tamper Detection**: Instantly detect if a document has been modified, even by a single pixel or character.
- **Verification IDs**: Every registered document receives a unique UUID for quick lookup without needing to re-upload the file.
- **Duplicate Prevention**: Built-in logic to prevent multiple registrations of the same land parcel number or the same document content.
- **Kenyan Market Context**: Tailored for Kenyan parcel number formats and property document types (PDFs, Images, DOCX).
- **Secure by Design**: Documents are hashed in memory; the actual file content is never stored on the server, ensuring total privacy.

---

## 🛠️ Technology Stack

### Backend
- **Node.js & Express**: Scalable REST API.
- **MongoDB & Mongoose**: Secure user and document metadata storage.
- **JWT (JSON Web Tokens)**: Secure stateless authentication.
- **Multer**: High-performance middleware for handling file uploads (memory storage).
- **SHA-256 Hashing**: Standardized cryptographic document fingerprinting.

### Frontend
- **React 18 & Vite**: Modern, high-performance user interface.
- **Tailwind CSS 3.4**: Premium, responsive dark-themed styling.
- **React Router DOM**: Seamless client-side navigation.
- **Axios**: Promised-based HTTP client with JWT interceptors.

### Blockchain
- **Solidity**: Smart contract for document registry logic.
- **Hardhat**: Professional Ethereum development environment.
- **Polygon Amoy Testnet**: Low-cost, high-speed L2 blockchain.
- **Ethers.js**: Interaction with smart contracts from the backend.

---

## 📂 Project Structure

```text
TitleGuard/
├── backend/        # Express API & MongoDB Models
├── frontend/       # React App & Tailwind Styling
├── blockchain/     # Solidity Smart Contracts & Hardhat Config
└── README.md       # Project Documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Alchemy](https://www.alchemy.com/) account (for Polygon RPC)
- [MetaMask](https://metamask.io/) or another wallet with Amoy Testnet MATIC

### 1. Clone the Repository
```bash
git clone https://github.com/francis-auka/title-guard.git
cd title-guard
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add MONGO_URI, JWT_SECRET, and CONTRACT_ADDRESS to .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Blockchain Deployment (Optional)
```bash
cd blockchain
npm install
cp .env.example .env
# Add ALCHEMY_RPC_URL and PRIVATE_KEY to .env
npx hardhat run scripts/deploy.js --network amoy
```

---

## 🔒 Security Policy

Title Guard uses a **Zero-Storage Policy** for sensitive documents. When a user uploads a document for registration or verification, the file is processed entirely in the application's RAM. Only the resulting SHA-256 hash is compared or stored. Your property data remains your property.


