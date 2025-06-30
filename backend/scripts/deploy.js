import pkg from 'hardhat';
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("🚀 Starting Academic NFT contract deployment...");

    // Get the account that will deploy the contract
    const [deployer] = await ethers.getSigners();

    console.log("📋 Deploying contracts with the account:", deployer.address);
    console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

    // Deploy the contract
    const AcademicNFT = await ethers.getContractFactory("AcademicNFT");
    console.log("⏳ Deploying AcademicNFT contract...");

    const academicNFT = await AcademicNFT.deploy();
    await academicNFT.waitForDeployment();

    const contractAddress = await academicNFT.getAddress();
    console.log("✅ AcademicNFT contract deployed to:", contractAddress);
    console.log("🔗 Transaction hash:", academicNFT.deploymentTransaction().hash);

    // Save deployment info
    const network = await ethers.provider.getNetwork();
    const deploymentInfo = {
        contractAddress: contractAddress,
        transactionHash: academicNFT.deploymentTransaction().hash,
        deployerAddress: deployer.address,
        networkName: network.name,
        chainId: network.chainId.toString(),
        deployedAt: new Date().toISOString(),
        contractName: "AcademicNFT",
        mintPrice: "0.01", // ETH
        platformFeePercent: 1,
        maxRoyaltyPercent: 20
    };

    console.log("\n📋 Deployment Summary:");
    console.log("========================");
    console.log("Contract Address:", deploymentInfo.contractAddress);
    console.log("Network:", deploymentInfo.networkName);
    console.log("Chain ID:", deploymentInfo.chainId);
    console.log("Deployer:", deploymentInfo.deployerAddress);
    console.log("Mint Price:", deploymentInfo.mintPrice, "ETH");
    console.log("Platform Fee:", deploymentInfo.platformFeePercent + "%");
    console.log("Max Royalty:", deploymentInfo.maxRoyaltyPercent + "%");

    // Save to file
    const deploymentPath = path.join(__dirname, '../deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n💾 Deployment info saved to:", deploymentPath);

    // Wait for a few confirmations
    console.log("\n⏳ Waiting for 5 confirmations...");
    await academicNFT.deploymentTransaction().wait(5);
    console.log("✅ Contract confirmed on blockchain!");

    console.log("\n🎉 Deployment completed successfully!");
    console.log("📝 Next steps:");
    console.log("1. Update frontend config with contract address");
    console.log("2. Verify contract on Etherscan (optional)");
    console.log("3. Test contract functions");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 