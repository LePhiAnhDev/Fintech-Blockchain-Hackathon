/**
 * Cấu hình ứng dụng
 */
const config = {
  app: {
    name: "CashDig9",
    description:
      "AI-powered platform for students to manage finances, analyze blockchain data, and get study assistance",
    version: "1.0.0",
  },
  api: {
    backendUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:5001",
    aiServerUrl: import.meta.env.VITE_AI_SERVER_URL || "http://localhost:8000",
  },
  blockchain: {
    defaultNetwork: "sepolia",
    contracts: {
      academicNFT: {
        address: "0x68bDBfe015f454239A259795fa523475894601e0",
        network: "sepolia",
        mintPrice: "0.01", // ETH
        platformFeePercent: 1,
        maxRoyaltyPercent: 20,
      },
    },
    networks: {
      sepolia: {
        chainId: "0xaa36a7", // 11155111 in hex
        chainName: "Sepolia test network",
        nativeCurrency: {
          name: "SepoliaETH",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: ["https://sepolia.infura.io/v3/"],
        blockExplorerUrls: ["https://sepolia.etherscan.io/"],
      },
      mainnet: {
        chainId: "0x1", // 1 in hex
        chainName: "Ethereum Mainnet",
        nativeCurrency: {
          name: "Ether",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: ["https://mainnet.infura.io/v3/"],
        blockExplorerUrls: ["https://etherscan.io/"],
      },
    },
  },
  theme: {
    colors: {
      primary: "#0369a1",
      secondary: "#7c3aed",
      accent: "#06b6d4",
    },
  },
};

export default config;
