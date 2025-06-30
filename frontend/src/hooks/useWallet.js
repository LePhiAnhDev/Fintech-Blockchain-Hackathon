// import { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import toast from 'react-hot-toast';

// const SEPOLIA_NETWORK = {
//     chainId: '0xaa36a7', // 11155111 in hex
//     chainName: 'Sepolia test network',
//   nativeCurrency: {
//         name: 'SepoliaETH',
//         symbol: 'SEP',
//     decimals: 18,
//   },
//     rpcUrls: ['https://sepolia.infura.io/v3/'],
//     blockExplorerUrls: ['https://sepolia.etherscan.io/'],
// };

// export const useWallet = () => {
//     const [account, setAccount] = useState('');
//   const [provider, setProvider] = useState(null);
//   const [signer, setSigner] = useState(null);
//   const [isConnecting, setIsConnecting] = useState(false);
//     const [balance, setBalance] = useState('0');

//   // Check if wallet is already connected
//   useEffect(() => {
//     const checkConnection = async () => {
//             if (typeof window.ethereum !== 'undefined') {
//         try {
//           const accounts = await window.ethereum.request({
//                         method: 'eth_accounts'
//           });

//           if (accounts.length > 0) {
//             const provider = new ethers.BrowserProvider(window.ethereum);
//             const signer = await provider.getSigner();
//             const address = await signer.getAddress();

//             setAccount(address);
//             setProvider(provider);
//             setSigner(signer);

//             // Get balance
//             const balance = await provider.getBalance(address);
//             setBalance(ethers.formatEther(balance));

//             // Check if on Sepolia network
//             const network = await provider.getNetwork();
//             if (network.chainId !== 11155111n) {
//               await switchToSepolia();
//             }
//           }
//         } catch (error) {
//                     console.error('Error checking wallet connection:', error);
//         }
//       }
//     };

//     checkConnection();
//   }, []);

//   // Listen for account changes
//   useEffect(() => {
//         if (typeof window.ethereum !== 'undefined') {
//       const handleAccountsChanged = (accounts) => {
//         if (accounts.length === 0) {
//           disconnectWallet();
//         } else {
//           setAccount(accounts[0]);
//           updateBalance(accounts[0]);
//         }
//       };

//       const handleChainChanged = (chainId) => {
//         // Reload the page to reset state
//         window.location.reload();
//       };

//       window.ethereum.on("accountsChanged", handleAccountsChanged);
//       window.ethereum.on("chainChanged", handleChainChanged);

//       return () => {
//         if (window.ethereum.removeListener) {
//           window.ethereum.removeListener(
//             "accountsChanged",
//             handleAccountsChanged
//           );
//           window.ethereum.removeListener("chainChanged", handleChainChanged);
//         }
//       };
//     }
//   }, []);

//   const updateBalance = async (address) => {
//     if (provider && address) {
//       try {
//         const balance = await provider.getBalance(address);
//         setBalance(ethers.formatEther(balance));
//       } catch (error) {
//         console.error("Error updating balance:", error);
//       }
//     }
//   };

//   const switchToSepolia = async () => {
//     try {
//       await window.ethereum.request({
//         method: "wallet_switchEthereumChain",
//         params: [{ chainId: SEPOLIA_NETWORK.chainId }],
//       });
//     } catch (switchError) {
//       // Network doesn't exist, add it
//       if (switchError.code === 4902) {
//         try {
//           await window.ethereum.request({
//             method: "wallet_addEthereumChain",
//             params: [SEPOLIA_NETWORK],
//           });
//         } catch (addError) {
//           console.error("Error adding Sepolia network:", addError);
//           toast.error("Failed to add Sepolia network");
//           throw addError;
//         }
//       } else {
//         console.error("Error switching to Sepolia:", switchError);
//         toast.error("Failed to switch to Sepolia network");
//         throw switchError;
//       }
//     }
//   };

//   const connectWallet = async () => {
//     if (typeof window.ethereum === "undefined") {
//       toast.error("MetaMask is not installed!");
//       return;
//     }

//     setIsConnecting(true);

//     try {
//       // Request account access
//       const accounts = await window.ethereum.request({
//         method: "eth_requestAccounts",
//       });

//       if (accounts.length === 0) {
//         throw new Error("No accounts found");
//       }

//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();
//       const address = await signer.getAddress();

//       // Switch to Sepolia network
//       await switchToSepolia();

//       setAccount(address);
//       setProvider(provider);
//       setSigner(signer);

//       // Get balance
//       const balance = await provider.getBalance(address);
//       setBalance(ethers.formatEther(balance));

//       toast.success("Wallet connected successfully!");
//     } catch (error) {
//       console.error("Error connecting wallet:", error);

//       if (error.code === 4001) {
//         toast.error("Please connect to MetaMask");
//       } else if (error.code === -32002) {
//         toast.error("Connection request already pending");
//       } else {
//         toast.error("Failed to connect wallet");
//       }
//     } finally {
//       setIsConnecting(false);
//     }
//   };

//   const disconnectWallet = () => {
//     setAccount("");
//     setProvider(null);
//     setSigner(null);
//     setBalance("0");
//     toast.success("Wallet disconnected");
//   };

//   const formatAddress = (address) => {
//     if (!address) return "";
//     return `${address.substring(0, 6)}...${address.substring(
//       address.length - 4
//     )}`;
//   };

//   const formatBalance = (balance) => {
//     return parseFloat(balance).toFixed(4);
//   };

//   const getExplorerUrl = (address) => {
//     return `https://sepolia.etherscan.io/address/${address}`;
//   };

//   return {
//     account,
//     provider,
//     signer,
//     balance,
//     isConnecting,
//     connectWallet,
//     disconnectWallet,
//     formatAddress,
//     formatBalance,
//     getExplorerUrl,
//     updateBalance,
//   };
// };
