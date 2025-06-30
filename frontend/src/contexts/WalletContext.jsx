import { createContext, useContext, useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import authService from "../services/api/authService";
import { backendAPI } from "../services/api/apiClient";

const WalletContext = createContext(null);

// Thông tin mạng Sepolia
const SEPOLIA_NETWORK = {
    chainId: "0xaa36a7", // 11155111 in hex
    chainName: "Sepolia test network",
    nativeCurrency: {
        name: "SepoliaETH",
        symbol: "SEP",
        decimals: 18,
    },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
};

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState("");
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [balance, setBalance] = useState("0");
    const [userInfo, setUserInfo] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("auth_token") || "");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Ref để tránh duplicate initialization
    const isInitialized = useRef(false);

    // Kiểm tra kết nối ví và token khi component mount
    useEffect(() => {
        const checkConnection = async () => {
            // Tránh chạy lại nếu đã initialize
            if (isInitialized.current) return;

            setIsInitializing(true);
            const startTime = Date.now();

            try {
                // Bước 1: Kiểm tra token trước
                const savedToken = localStorage.getItem("auth_token");
                let hasValidToken = false;

                if (savedToken) {
                    try {
                        backendAPI.defaults.headers.common[
                            "Authorization"
                        ] = `Bearer ${savedToken}`;
                        const response = await authService.verifyToken();

                        if (response && response.success) {
                            setToken(savedToken);
                            setIsAuthenticated(true);
                            hasValidToken = true;

                            // Lấy thông tin profile
                            const profileResponse = await authService.getProfile();
                            if (profileResponse && profileResponse.success) {
                                setUserInfo(profileResponse.data.user);
                            }
                        } else {
                            // Token không hợp lệ
                            localStorage.removeItem("auth_token");
                            setToken("");
                            setIsAuthenticated(false);
                            delete backendAPI.defaults.headers.common["Authorization"];
                        }
                    } catch (error) {
                        console.error("Token verification failed:", error);
                        localStorage.removeItem("auth_token");
                        setToken("");
                        setIsAuthenticated(false);
                        delete backendAPI.defaults.headers.common["Authorization"];
                    }
                }

                // Bước 2: Kiểm tra kết nối ví
                if (typeof window.ethereum !== "undefined") {
                    try {
                        const accounts = await window.ethereum.request({
                            method: "eth_accounts",
                        });

                        if (accounts.length > 0) {
                            const provider = new ethers.BrowserProvider(window.ethereum);
                            const signer = await provider.getSigner();
                            const address = await signer.getAddress();

                            console.log('🔗 Wallet connected:', {
                                address,
                                hasProvider: !!provider,
                                hasSigner: !!signer
                            });

                            setAccount(address);
                            setProvider(provider);
                            setSigner(signer);

                            // Lấy số dư
                            const balance = await provider.getBalance(address);
                            setBalance(ethers.formatEther(balance));

                            // Kiểm tra mạng Sepolia
                            const network = await provider.getNetwork();
                            if (network.chainId !== 11155111n) {
                                await switchToSepolia();
                            }

                            // Bước 3: Quyết định có cần đăng nhập không
                            // CHỈ đăng nhập khi không có token hợp lệ
                            if (!hasValidToken) {
                                console.log(
                                    "No valid token found, requesting wallet signature..."
                                );
                                await loginWithWallet(address, signer);
                            } else {
                                console.log("Valid token found, skipping wallet signature");
                            }
                        }
                    } catch (error) {
                        console.error("Error checking wallet connection:", error);
                    }
                }
            } catch (error) {
                console.error("Wallet initialization error:", error);
            } finally {
                // Đảm bảo loading hiển thị ít nhất 1.5 giây
                const elapsedTime = Date.now() - startTime;
                const minLoadingTime = 1500; // 1.5 giây

                if (elapsedTime < minLoadingTime) {
                    await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
                }

                setIsInitializing(false);
                isInitialized.current = true;
            }
        };

        checkConnection();
    }, []); // Empty dependency array để chỉ chạy 1 lần

    // Lắng nghe sự kiện thay đổi tài khoản
    useEffect(() => {
        if (typeof window.ethereum !== "undefined") {
            const handleAccountsChanged = async (accounts) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else if (accounts[0] !== account) {
                    // Địa chỉ thay đổi - cần đăng nhập lại
                    setAccount(accounts[0]);
                    updateBalance(accounts[0]);

                    if (provider) {
                        const signer = await provider.getSigner();
                        await loginWithWallet(accounts[0], signer);
                    }
                }
            };

            const handleChainChanged = () => {
                window.location.reload();
            };

            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);

            return () => {
                if (window.ethereum.removeListener) {
                    window.ethereum.removeListener(
                        "accountsChanged",
                        handleAccountsChanged
                    );
                    window.ethereum.removeListener("chainChanged", handleChainChanged);
                }
            };
        }
    }, [account, provider]);

    const updateBalance = async (address) => {
        if (provider && address) {
            try {
                const balance = await provider.getBalance(address);
                setBalance(ethers.formatEther(balance));
            } catch (error) {
                console.error("Error updating balance:", error);
            }
        }
    };

    const switchToSepolia = async () => {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: SEPOLIA_NETWORK.chainId }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [SEPOLIA_NETWORK],
                    });
                } catch (addError) {
                    console.error("Error adding Sepolia network:", addError);
                    toast.error("Failed to add Sepolia network");
                    throw addError;
                }
            } else {
                console.error("Error switching to Sepolia:", switchError);
                toast.error("Failed to switch to Sepolia network");
                throw switchError;
            }
        }
    };

    // Hàm đăng nhập với ví
    const loginWithWallet = async (address, signer) => {
        try {
            const timestamp = Date.now();
            const message = `Welcome to Student AI Platform!\n\nSign this message to prove you own this wallet.\n\nWallet: ${address}\nTimestamp: ${timestamp}`;

            const signature = await signer.signMessage(message);
            const response = await authService.login(address, signature);

            if (response && response.success) {
                const { token, user } = response.data;

                localStorage.setItem("auth_token", token);
                setToken(token);
                setIsAuthenticated(true);
                backendAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                setUserInfo(user);

                toast.success("Đăng nhập thành công!");
                return true;
            }

            return false;
        } catch (error) {
            console.error("Error logging in with wallet:", error);

            if (error.code === 4001) {
                toast.error("Vui lòng ký tin nhắn để đăng nhập");
            } else {
                toast.error("Đăng nhập thất bại");
            }

            return false;
        }
    };

    const connectWallet = async () => {
        if (typeof window.ethereum === "undefined") {
            toast.error("MetaMask chưa được cài đặt!");
            return;
        }

        setIsConnecting(true);

        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            if (accounts.length === 0) {
                throw new Error("No accounts found");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            await switchToSepolia();

            setAccount(address);
            setProvider(provider);
            setSigner(signer);

            const balance = await provider.getBalance(address);
            setBalance(ethers.formatEther(balance));

            const loginSuccess = await loginWithWallet(address, signer);

            if (loginSuccess) {
                toast.success("Ví đã kết nối thành công!");
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);

            if (error.code === 4001) {
                toast.error("Vui lòng kết nối với MetaMask");
            } else if (error.code === -32002) {
                toast.error("Yêu cầu kết nối đang chờ xử lý");
            } else {
                toast.error("Kết nối ví thất bại");
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = async () => {
        try {
            if (token) {
                await authService.logout();
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }

        localStorage.removeItem("auth_token");
        setToken("");
        setIsAuthenticated(false);
        delete backendAPI.defaults.headers.common["Authorization"];

        setAccount("");
        setProvider(null);
        setSigner(null);
        setBalance("0");
        setUserInfo(null);
        isInitialized.current = false;

        toast.success("Đã ngắt kết nối ví");
    };

    const formatAddress = (address) => {
        if (!address) return "";
        return `${address.substring(0, 6)}...${address.substring(
            address.length - 4
        )}`;
    };

    const formatBalance = (balance) => {
        return parseFloat(balance).toFixed(4);
    };

    const getExplorerUrl = (address) => {
        return `https://sepolia.etherscan.io/address/${address}`;
    };

    const value = {
        account,
        provider,
        signer,
        balance,
        userInfo,
        isConnecting,
        token,
        isAuthenticated,
        isInitializing,
        connectWallet,
        disconnectWallet,
        formatAddress,
        formatBalance,
        getExplorerUrl,
        updateBalance,
    };

    return (
        <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === null) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};
