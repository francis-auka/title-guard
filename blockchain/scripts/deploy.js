const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying TitleGuard to", hre.network.name, "...\n");

    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📬 Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(
        "💰 Account balance:",
        hre.ethers.formatEther(balance),
        "MATIC\n"
    );

    // Deploy the contract
    const TitleGuard = await hre.ethers.getContractFactory("TitleGuard");
    console.log("⏳ Deploying contract...");
    const titleGuard = await TitleGuard.deploy();

    await titleGuard.waitForDeployment();

    const contractAddress = await titleGuard.getAddress();

    console.log("✅ TitleGuard deployed successfully!");
    console.log("📄 Contract address:", contractAddress);
    console.log(
        "🔗 Explorer:",
        `https://amoy.polygonscan.com/address/${contractAddress}`
    );
    console.log("\n─────────────────────────────────────────────────────────");
    console.log("📋 Add this to your backend .env file:");
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);
    console.log("─────────────────────────────────────────────────────────\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
