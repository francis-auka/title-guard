# 🛡️ Title Guard

**Blockchain-Based Property Document Authentication & Fraud Detection Platform**

Title Guard is a full-stack SaaS application built specifically for the Kenyan property market. It leverages the immutability of the Polygon blockchain and cryptographic SHA-256 hashing to ensure that property title deeds cannot be forged or tampered with.

---

## 🌍 Sustainable Development Goals (SDGs)

TitleGuard directly contributes to four UN Sustainable Development Goals:

| SDG | Goal | How TitleGuard Contributes |
| :-- | :--- | :------------------------- |
| ![SDG 1](https://img.shields.io/badge/SDG%201-No%20Poverty-E5243B?style=flat-square) | **No Poverty** | Land fraud disproportionately strips wealth from Kenya's most vulnerable — rural smallholders, women, and peri-urban residents. TitleGuard provides a low-cost, M-Pesa-accessible tool that protects their most valuable asset. |
| ![SDG 10](https://img.shields.io/badge/SDG%2010-Reduced%20Inequalities-DD1367?style=flat-square) | **Reduced Inequalities** | By making cryptographic title verification accessible via mobile money at fair-value pricing, TitleGuard levels the playing field between sophisticated institutional buyers and ordinary Kenyan citizens. |
| ![SDG 11](https://img.shields.io/badge/SDG%2011-Sustainable%20Cities-FD9D24?style=flat-square) | **Sustainable Cities & Communities** | Secure, transparent land tenure is foundational to sustainable urban development. TitleGuard reduces the land disputes that fuel informal settlement conflicts and slow urban planning in Kenyan cities. |
| ![SDG 16](https://img.shields.io/badge/SDG%2016-Peace%20%26%20Justice-00689D?style=flat-square) | **Peace, Justice & Strong Institutions** | TitleGuard strengthens public institutions by adding an independent, cryptographically verifiable integrity layer to Kenya's land registry — combating corruption, reducing court backlogs, and building public trust in property rights. |

---

## 🔴 The Problem

Land fraud is one of Kenya's most destructive financial crimes. Every year, thousands of Kenyans lose their life savings, homes, and inherited land to fraudulent title deeds — forged documents that are nearly impossible to detect with the naked eye.

The consequences are devastating:
- **Families lose their most valuable financial asset**
- **Buyers pay millions of shillings for land they will never legally own**
- **Court battles drag on for years** with no guarantee of recovery
- **Tampering is easy** in largely paper-based registry systems
- **Ardhisasa, Kenya's digital registry, is centralised** — meaning there is no independent mechanism to verify whether its records have been manipulated

There is currently no fast, accessible, or trustworthy way for an ordinary Kenyan to verify whether a title deed is authentic before completing a land transaction.

---

## ✅ The Solution

TitleGuard is a blockchain-powered verification platform that creates a **tamper-proof digital fingerprint** of title deeds on the Polygon blockchain.

- **Immutable Registration**: Document hashes are stored on-chain, making them impossible to alter.
- **Instant Verification**: Anyone can upload a deed to check it against the original record in seconds.
- **M-Pesa Integration**: Low-cost verification paid via STK Push, making it accessible to every Kenyan.
- **Fraud Alerts**: Immediate detection of even the slightest modification (Match = Authentic, Mismatch = Fraud).
- **Zero-Storage Policy**: Documents are processed in memory only — your data never touches our servers.

---

## 🌐 Live Demo & Testing

**🚀 Live Demo**: [https://title-guard.vercel.app/](https://title-guard.vercel.app/)

### 🔑 Test Account
Use the following credentials to explore the dashboard and verification flows:
- **Email**: `francisauka5@gmail.com`
- **Password**: `12345678`

### 🔗 On-Chain Verification
Smart contract deployed on Polygon Amoy Testnet:
[`0x9A0B4113F73bFC37FEB6A94524685302a6696855`](https://amoy.polygonscan.com/address/0x9A0B4113F73bFC37FEB6A94524685302a6696855)

---

## 📸 Screenshots

### 1. User Dashboard
Shows all registered documents with their on-chain verification status.
![Dashboard](./screenshots/dashboard.png)

### 2. Document Verification
The interface where users upload files to detect tampering.
![Verification](./screenshots/verification.png)

### 3. Land Registry Simulation
TitleGuard cross-references data with this simulated official land registry.
![Registry](./screenshots/registry.png)

### 4. M-Pesa Payment Flow
Seamless STK Push integration for processing verification fees.
![M-Pesa](./screenshots/mpesa.png)

---

## 🚀 Key Features

- **On-Chain Registration**: Store SHA-256 hashes permanently on Polygon Amoy Testnet.
- **Automated Data Extraction**: Extracts metadata (Owner, Parcel No, Area) directly from PDFs.
- **Registry Cross-Referencing**: Authenticates data against the Land Registry in real-time.
- **M-Pesa STK Push**: Native support for Safaricom M-Pesa mobile payments.
- **Tamper Detection**: Detects modifications down to a single pixel.
- **Secure by Design**: Documents are hashed in memory; file content is **never** stored on our servers.

---

## 🛠️ Technology Stack

### Backend
- **Node.js & Express**: Scalable REST API
- **MongoDB & Mongoose**: Secure user and document metadata storage
- **JWT**: Secure stateless authentication
- **SHA-256 Hashing**: Standardized cryptographic fingerprinting

### Frontend
- **React 18 & Vite**: Modern, high-performance user interface
- **Tailwind CSS 3.4**: Premium, responsive dark-themed styling
- **Axios**: Promise-based HTTP client with JWT interceptors

### Blockchain
- **Solidity**: Smart contract for document registry logic
- **Polygon Amoy Testnet**: Low-cost, high-speed L2 blockchain
- **Ethers.js**: Smart contract interaction from the backend

### Payments
- **M-Pesa Daraja API**: STK Push for mobile money verification fees

---

## 👥 TitleGuard Team

| Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Francis Auka** | Backend Developer & Lead | Server architecture, blockchain integration, API development |
| **Kelly Melchris** | Frontend Developer | React UI development, dashboard, document upload flows |
| **Faith Mbeneka** | UI/UX Designer | Experience design, wireframes, visual design system |
| **Harriet Wambura** | M-Pesa Integration | M-Pesa Daraja API, STK Push implementation |
| **Alicia Mbatha** | M-Pesa Integration | Payment callbacks, transaction verification logic |
| **Reney Mogeni** | Business Analyst — Market research, problem validation, pitch content|

*Affiliated with Machakos University, School of Computing and Information Technology.*

---

## ⚙️ Installation & Setup

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
# Add your environment variables to .env:
# MONGO_URI, JWT_SECRET, CONTRACT_ADDRESS
# MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET
# MPESA_SHORTCODE, MPESA_PASSKEY
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Security Policy

TitleGuard operates a **Zero-Storage Policy**. When a user uploads a document for verification, it is processed entirely in RAM. Only the resulting SHA-256 hash is compared against the on-chain record. Your property documents remain entirely in your control.

---

## 📄 Research Foundation

TitleGuard is grounded in academic research conducted at Machakos University:

> *"Blockchain Technology in Land Title Registration: Addressing Systemic Fraud and Inefficiency in Kenya's Property Market"* — Francis Auka, SCO 309: Research Methodology, April 2026.

The research examined Kenya's legal framework (Land Registration Act 2012, Data Protection Act 2019, Computer Misuse and Cybercrimes Act 2018), global blockchain land registry implementations (Georgia, Ghana, Sweden), and the structural vulnerabilities of Kenya's Ardhisasa system — directly informing TitleGuard's architecture and legal positioning.

---

## 📜 License

This project is licensed under the MIT License.
