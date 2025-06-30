import React, { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "../contexts/WalletContext";
import academicService from "../services/api/academicService";
import toast from "react-hot-toast";

export const useAcademicHub = () => {
    const { account, provider, signer } = useWallet();
    const [listings, setListings] = useState([]);
    const [userNFTs, setUserNFTs] = useState([]);
    const [contractInfo, setContractInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [contractInstance, setContractInstance] = useState(null);

    // Success modal state
    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        data: null,
        type: 'mint'
    });

    // Contract interface - defined once to avoid recreation
    const contractInterface = React.useMemo(
        () =>
            new ethers.Interface([
                {
                    inputs: [],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "sender",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                        {
                            internalType: "address",
                            name: "owner",
                            type: "address",
                        },
                    ],
                    name: "ERC721IncorrectOwner",
                    type: "error",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "operator",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "ERC721InsufficientApproval",
                    type: "error",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "approver",
                            type: "address",
                        },
                    ],
                    name: "ERC721InvalidApprover",
                    type: "error",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "operator",
                            type: "address",
                        },
                    ],
                    name: "ERC721InvalidOperator",
                    type: "error",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "owner",
                            type: "address",
                        },
                    ],
                    name: "ERC721InvalidOwner",
                    type: "error",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "receiver",
                            type: "address",
                        },
                    ],
                    name: "ERC721InvalidReceiver",
                    type: "error",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "sender",
                            type: "address",
                        },
                    ],
                    name: "ERC721InvalidSender",
                    type: "error",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "ERC721NonexistentToken",
                    type: "error",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "owner",
                            type: "address",
                        },
                    ],
                    name: "OwnableInvalidOwner",
                    type: "error",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "account",
                            type: "address",
                        },
                    ],
                    name: "OwnableUnauthorizedAccount",
                    type: "error",
                },
                {
                    inputs: [],
                    name: "ReentrancyGuardReentrantCall",
                    type: "error",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "address",
                            name: "owner",
                            type: "address",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "approved",
                            type: "address",
                        },
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "Approval",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "address",
                            name: "owner",
                            type: "address",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "operator",
                            type: "address",
                        },
                        {
                            indexed: false,
                            internalType: "bool",
                            name: "approved",
                            type: "bool",
                        },
                    ],
                    name: "ApprovalForAll",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: false,
                            internalType: "uint256",
                            name: "_fromTokenId",
                            type: "uint256",
                        },
                        {
                            indexed: false,
                            internalType: "uint256",
                            name: "_toTokenId",
                            type: "uint256",
                        },
                    ],
                    name: "BatchMetadataUpdate",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "seller",
                            type: "address",
                        },
                        {
                            indexed: false,
                            internalType: "uint256",
                            name: "price",
                            type: "uint256",
                        },
                    ],
                    name: "DocumentListed",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "creator",
                            type: "address",
                        },
                        {
                            indexed: false,
                            internalType: "string",
                            name: "name",
                            type: "string",
                        },
                        {
                            indexed: false,
                            internalType: "string",
                            name: "tokenURI",
                            type: "string",
                        },
                        {
                            indexed: false,
                            internalType: "string",
                            name: "fileType",
                            type: "string",
                        },
                    ],
                    name: "DocumentMinted",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "seller",
                            type: "address",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "buyer",
                            type: "address",
                        },
                        {
                            indexed: false,
                            internalType: "uint256",
                            name: "price",
                            type: "uint256",
                        },
                        {
                            indexed: false,
                            internalType: "uint256",
                            name: "royalty",
                            type: "uint256",
                        },
                        {
                            indexed: false,
                            internalType: "uint256",
                            name: "platformFee",
                            type: "uint256",
                        },
                    ],
                    name: "DocumentSold",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "seller",
                            type: "address",
                        },
                    ],
                    name: "ListingCancelled",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: false,
                            internalType: "uint256",
                            name: "_tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "MetadataUpdate",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "address",
                            name: "previousOwner",
                            type: "address",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "newOwner",
                            type: "address",
                        },
                    ],
                    name: "OwnershipTransferred",
                    type: "event",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "address",
                            name: "from",
                            type: "address",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "to",
                            type: "address",
                        },
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "Transfer",
                    type: "event",
                },
                {
                    inputs: [],
                    name: "MINT_PRICE",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "PLATFORM_FEE_PERCENT",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "ROYALTY_MAX_PERCENT",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "to",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "approve",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "owner",
                            type: "address",
                        },
                    ],
                    name: "balanceOf",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "cancelListing",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    name: "documents",
                    outputs: [
                        {
                            internalType: "string",
                            name: "name",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "description",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "fileType",
                            type: "string",
                        },
                        {
                            internalType: "address",
                            name: "creator",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "royaltyPercent",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "createdAt",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "getActiveListings",
                    outputs: [
                        {
                            internalType: "uint256[]",
                            name: "",
                            type: "uint256[]",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "getApproved",
                    outputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "getDocument",
                    outputs: [
                        {
                            components: [
                                {
                                    internalType: "string",
                                    name: "name",
                                    type: "string",
                                },
                                {
                                    internalType: "string",
                                    name: "description",
                                    type: "string",
                                },
                                {
                                    internalType: "string",
                                    name: "fileType",
                                    type: "string",
                                },
                                {
                                    internalType: "address",
                                    name: "creator",
                                    type: "address",
                                },
                                {
                                    internalType: "uint256",
                                    name: "royaltyPercent",
                                    type: "uint256",
                                },
                                {
                                    internalType: "uint256",
                                    name: "createdAt",
                                    type: "uint256",
                                },
                            ],
                            internalType: "struct AcademicNFT.DocumentNFT",
                            name: "",
                            type: "tuple",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "getListing",
                    outputs: [
                        {
                            components: [
                                {
                                    internalType: "uint256",
                                    name: "tokenId",
                                    type: "uint256",
                                },
                                {
                                    internalType: "address",
                                    name: "seller",
                                    type: "address",
                                },
                                {
                                    internalType: "uint256",
                                    name: "price",
                                    type: "uint256",
                                },
                                {
                                    internalType: "bool",
                                    name: "active",
                                    type: "bool",
                                },
                                {
                                    internalType: "uint256",
                                    name: "listedAt",
                                    type: "uint256",
                                },
                            ],
                            internalType: "struct AcademicNFT.Listing",
                            name: "",
                            type: "tuple",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "user",
                            type: "address",
                        },
                    ],
                    name: "getUserTokens",
                    outputs: [
                        {
                            internalType: "uint256[]",
                            name: "",
                            type: "uint256[]",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "owner",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "operator",
                            type: "address",
                        },
                    ],
                    name: "isApprovedForAll",
                    outputs: [
                        {
                            internalType: "bool",
                            name: "",
                            type: "bool",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "price",
                            type: "uint256",
                        },
                    ],
                    name: "listForSale",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    name: "listings",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                        {
                            internalType: "address",
                            name: "seller",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "price",
                            type: "uint256",
                        },
                        {
                            internalType: "bool",
                            name: "active",
                            type: "bool",
                        },
                        {
                            internalType: "uint256",
                            name: "listedAt",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "to",
                            type: "address",
                        },
                        {
                            internalType: "string",
                            name: "name",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "description",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "tokenMetadataURI",
                            type: "string",
                        },
                        {
                            internalType: "string",
                            name: "fileType",
                            type: "string",
                        },
                        {
                            internalType: "uint256",
                            name: "royaltyPercent",
                            type: "uint256",
                        },
                    ],
                    name: "mintDocument",
                    outputs: [],
                    stateMutability: "payable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "name",
                    outputs: [
                        {
                            internalType: "string",
                            name: "",
                            type: "string",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "owner",
                    outputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "ownerOf",
                    outputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "purchaseNFT",
                    outputs: [],
                    stateMutability: "payable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "renounceOwnership",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "from",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "to",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "safeTransferFrom",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "from",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "to",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                        {
                            internalType: "bytes",
                            name: "data",
                            type: "bytes",
                        },
                    ],
                    name: "safeTransferFrom",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "operator",
                            type: "address",
                        },
                        {
                            internalType: "bool",
                            name: "approved",
                            type: "bool",
                        },
                    ],
                    name: "setApprovalForAll",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "bytes4",
                            name: "interfaceId",
                            type: "bytes4",
                        },
                    ],
                    name: "supportsInterface",
                    outputs: [
                        {
                            internalType: "bool",
                            name: "",
                            type: "bool",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "symbol",
                    outputs: [
                        {
                            internalType: "string",
                            name: "",
                            type: "string",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "tokenURI",
                    outputs: [
                        {
                            internalType: "string",
                            name: "",
                            type: "string",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "totalSupply",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "from",
                            type: "address",
                        },
                        {
                            internalType: "address",
                            name: "to",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "transferFrom",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "newOwner",
                            type: "address",
                        },
                    ],
                    name: "transferOwnership",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    name: "userTokens",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "withdraw",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
            ]),
        []
    );

    // Initialize contract with caching and optimization
    const initializeContract = useCallback(async () => {
        try {
            console.log("🔧 Initializing contract info...");

            // Use cached contract info if available and valid
            const cachedInfo = sessionStorage.getItem("contractInfo");
            let contractData;

            if (cachedInfo) {
                try {
                    contractData = JSON.parse(cachedInfo);
                    console.log("📋 Using cached contract info:", contractData);
                    setContractInfo(contractData);
                } catch (e) {
                    console.warn(
                        "⚠️ Failed to parse cached contract info, fetching fresh"
                    );
                }
            }

            // If no cached data or failed to parse, fetch fresh
            if (!contractData) {
                const info = await academicService.getContractInfo();
                console.log("📋 Contract info response:", info);

                if (info.success && info.data) {
                    console.log("✅ Contract info loaded:", info.data);
                    contractData = info.data;
                } else if (info.contractAddress) {
                    console.log("✅ Contract info loaded (direct format):", info);
                    contractData = info;
                } else {
                    console.error("❌ Contract info request failed, using fallback");
                    contractData = {
                        contractAddress: "0x68bDBfe015f454239A259795fa523475894601e0",
                        hasABI: true,
                        mintPrice: "0.01",
                        platformFeePercent: 1,
                        maxRoyaltyPercent: 20,
                        supportedFileTypes: [
                            "pdf",
                            "docx",
                            "txt",
                            "md",
                            "png",
                            "jpg",
                            "jpeg",
                        ],
                    };
                }

                // Cache the contract info for future use
                sessionStorage.setItem("contractInfo", JSON.stringify(contractData));
                setContractInfo(contractData);
            }

            // Initialize contract instance if we have provider and contract info
            if (provider && contractData.contractAddress && contractData.hasABI) {
                const contract = new ethers.Contract(
                    contractData.contractAddress,
                    contractInterface,
                    signer || provider
                );

                setContractInstance(contract);
                console.log("✅ Contract instance initialized");
            }
        } catch (error) {
            console.error("❌ Failed to initialize contract:", error);
            // Set fallback contract info
            const fallbackInfo = {
                contractAddress: "0x68bDBfe015f454239A259795fa523475894601e0",
                hasABI: true,
                mintPrice: "0.01",
                platformFeePercent: 1,
                maxRoyaltyPercent: 20,
                supportedFileTypes: ["pdf", "docx", "txt", "md", "png", "jpg", "jpeg"],
            };
            setContractInfo(fallbackInfo);
        }
    }, [provider, signer, contractInterface]);

    // Load active listings with optimization
    const loadListings = useCallback(
        async (forceReload = false) => {
            // Check cache first if not forcing reload
            if (!forceReload) {
                const cachedListings = sessionStorage.getItem("listings");
                const cacheTime = sessionStorage.getItem("listingsTime");
                if (cachedListings && cacheTime) {
                    const age = Date.now() - parseInt(cacheTime);
                    if (age < 30000) {
                        // 30 seconds cache
                        try {
                            const parsed = JSON.parse(cachedListings);
                            setListings(parsed);
                            console.log("📋 Using cached listings:", parsed.length, "items");
                            return;
                        } catch (e) {
                            console.warn("⚠️ Failed to parse cached listings");
                        }
                    }
                }
            }

            try {
                setLoading(true);
                console.log("📊 Loading listings...", {
                    forceReload,
                    hasContract: !!contractInstance,
                });

                // Try to get from smart contract first
                if (contractInstance) {
                    try {
                        const activeTokenIds = await contractInstance.getActiveListings();
                        console.log("🔍 Found active token IDs:", activeTokenIds.length);

                        if (activeTokenIds.length === 0) {
                            setListings([]);
                            sessionStorage.setItem("listings", JSON.stringify([]));
                            sessionStorage.setItem("listingsTime", Date.now().toString());
                            return;
                        }

                        // Batch process token data with parallel requests
                        const listingsData = await Promise.all(
                            activeTokenIds.map(async (tokenId) => {
                                try {
                                    const [document, listing, tokenURI] = await Promise.all([
                                        contractInstance.getDocument(tokenId),
                                        contractInstance.getListing(tokenId),
                                        contractInstance.tokenURI(tokenId),
                                    ]);

                                    // Fetch metadata from IPFS with timeout
                                    let metadata = {};
                                    try {
                                        const controller = new AbortController();
                                        const timeoutId = setTimeout(
                                            () => controller.abort(),
                                            5000
                                        ); // 5s timeout

                                        const response = await fetch(tokenURI, {
                                            signal: controller.signal,
                                        });
                                        clearTimeout(timeoutId);

                                        if (response.ok) {
                                            metadata = await response.json();
                                        }
                                    } catch (error) {
                                        console.warn(
                                            "Failed to fetch metadata for token",
                                            tokenId.toString(),
                                            error.message
                                        );
                                    }

                                    return {
                                        tokenId: tokenId.toString(),
                                        name: document.name,
                                        description: document.description,
                                        fileType: document.fileType,
                                        creator: document.creator,
                                        royaltyPercent: document.royaltyPercent.toString(),
                                        price: ethers.formatEther(listing.price),
                                        seller: listing.seller,
                                        listedAt: new Date(
                                            Number(listing.listedAt) * 1000
                                        ).toISOString(),
                                        tokenURI,
                                        metadata,
                                        externalUrl: metadata.external_url,
                                        attributes: metadata.attributes || [],
                                    };
                                } catch (error) {
                                    console.error(
                                        "Failed to process token",
                                        tokenId.toString(),
                                        error
                                    );
                                    return null;
                                }
                            })
                        );

                        // Filter out failed tokens
                        const validListings = listingsData.filter(Boolean);
                        console.log(
                            "✅ Processed listings:",
                            validListings.length,
                            "of",
                            activeTokenIds.length
                        );

                        setListings(validListings);

                        // Cache the results
                        sessionStorage.setItem("listings", JSON.stringify(validListings));
                        sessionStorage.setItem("listingsTime", Date.now().toString());
                    } catch (contractError) {
                        console.error("Failed to load from contract:", contractError);
                        // Fallback to API
                        await loadListingsFromAPI();
                    }
                } else {
                    // Fallback to API
                    await loadListingsFromAPI();
                }
            } catch (error) {
                console.error("Failed to load listings:", error);
                toast.error("Failed to load listings");
            } finally {
                setLoading(false);
            }
        },
        [contractInstance]
    );

    // Fallback API call for listings
    const loadListingsFromAPI = async () => {
        try {
            const response = await academicService.getListings();
            if (response.success) {
                setListings(response.data.listings || []);
            }
        } catch (error) {
            console.error("API listings error:", error);
        }
    };

    // Load user's NFTs with optimization
    const loadUserNFTs = useCallback(
        async (forceReload = false) => {
            if (!account) return;

            // Check cache first if not forcing reload
            const cacheKey = `userNFTs_${account}`;
            const cacheTimeKey = `userNFTsTime_${account}`;

            if (!forceReload) {
                const cachedNFTs = sessionStorage.getItem(cacheKey);
                const cacheTime = sessionStorage.getItem(cacheTimeKey);
                if (cachedNFTs && cacheTime) {
                    const age = Date.now() - parseInt(cacheTime);
                    if (age < 30000) {
                        // 30 seconds cache
                        try {
                            const parsed = JSON.parse(cachedNFTs);
                            setUserNFTs(parsed);
                            console.log("📋 Using cached user NFTs:", parsed.length, "items");
                            return;
                        } catch (e) {
                            console.warn("⚠️ Failed to parse cached user NFTs");
                        }
                    }
                }
            }

            try {
                setLoading(true);
                console.log("👤 Loading user NFTs...", {
                    account,
                    forceReload,
                    hasContract: !!contractInstance,
                });

                // Try to get from smart contract first
                if (contractInstance) {
                    try {
                        console.log(
                            "🔍 Loading user NFTs from contract for account:",
                            account
                        );
                        const userTokenIds = await contractInstance.getUserTokens(account);
                        console.log("📋 User token IDs:", userTokenIds.length);

                        if (userTokenIds.length === 0) {
                            setUserNFTs([]);
                            sessionStorage.setItem(cacheKey, JSON.stringify([]));
                            sessionStorage.setItem(cacheTimeKey, Date.now().toString());
                            return;
                        }

                        // Batch process user NFTs with parallel requests
                        const nftsData = await Promise.all(
                            userTokenIds.map(async (tokenId) => {
                                try {
                                    const [document, tokenURI] = await Promise.all([
                                        contractInstance.getDocument(tokenId),
                                        contractInstance.tokenURI(tokenId),
                                    ]);

                                    // Fetch metadata from IPFS with timeout
                                    let metadata = {};
                                    try {
                                        const controller = new AbortController();
                                        const timeoutId = setTimeout(
                                            () => controller.abort(),
                                            5000
                                        );

                                        const response = await fetch(tokenURI, {
                                            signal: controller.signal,
                                        });
                                        clearTimeout(timeoutId);

                                        if (response.ok) {
                                            metadata = await response.json();
                                        }
                                    } catch (error) {
                                        console.warn(
                                            "Failed to fetch metadata for token",
                                            tokenId.toString(),
                                            error.message
                                        );
                                    }

                                    // Check if listed for sale
                                    let listing = null;
                                    try {
                                        const listingData = await contractInstance.getListing(
                                            tokenId
                                        );
                                        if (listingData.active) {
                                            listing = {
                                                price: ethers.formatEther(listingData.price),
                                                listedAt: new Date(
                                                    Number(listingData.listedAt) * 1000
                                                ).toISOString(),
                                            };
                                        }
                                    } catch (error) {
                                        // Token might not be listed - this is normal
                                    }

                                    return {
                                        tokenId: tokenId.toString(),
                                        name: document.name,
                                        description: document.description,
                                        fileType: document.fileType,
                                        creator: document.creator,
                                        royaltyPercent: document.royaltyPercent.toString(),
                                        createdAt: new Date(
                                            Number(document.createdAt) * 1000
                                        ).toISOString(),
                                        tokenURI,
                                        metadata,
                                        externalUrl: metadata.external_url,
                                        attributes: metadata.attributes || [],
                                        listing,
                                        isListed: !!listing,
                                    };
                                } catch (error) {
                                    console.error(
                                        "Failed to process user token",
                                        tokenId.toString(),
                                        error
                                    );
                                    return null;
                                }
                            })
                        );

                        // Filter out failed tokens
                        const validNFTs = nftsData.filter(Boolean);
                        console.log(
                            "✅ User NFTs loaded from contract:",
                            validNFTs.length,
                            "of",
                            userTokenIds.length
                        );

                        setUserNFTs(validNFTs);

                        // Cache the results
                        sessionStorage.setItem(cacheKey, JSON.stringify(validNFTs));
                        sessionStorage.setItem(cacheTimeKey, Date.now().toString());
                    } catch (contractError) {
                        console.error(
                            "Failed to load user NFTs from contract:",
                            contractError
                        );
                        // Fallback to API
                        await loadUserNFTsFromAPI();
                    }
                } else {
                    // Fallback to API
                    await loadUserNFTsFromAPI();
                }
            } catch (error) {
                console.error("Failed to load user NFTs:", error);
                toast.error("Failed to load your NFTs");
            } finally {
                setLoading(false);
            }
        },
        [account, contractInstance]
    );

    // Fallback API call for user NFTs
    const loadUserNFTsFromAPI = async () => {
        try {
            const response = await academicService.getUserNFTs();
            if (response.success) {
                setUserNFTs(response.data.nfts || []);
            }
        } catch (error) {
            console.error("API user NFTs error:", error);
        }
    };

    // Upload document and mint NFT
    const uploadDocument = useCallback(
        async (file, formData, onProgress) => {
            console.log("🔍 Wallet State Check:", {
                account,
                hasProvider: !!provider,
                hasSigner: !!signer,
                hasContractInstance: !!contractInstance,
                contractInfo: contractInfo,
            });

            if (!account) {
                throw new Error("Please connect your wallet");
            }

            try {
                // Step 1: Upload to IPFS via API
                if (onProgress && typeof onProgress === "function") {
                    onProgress({ step: 1, message: "Uploading data to IPFS..." });
                }

                const uploadFormData = new FormData();
                uploadFormData.append("file", file);
                uploadFormData.append("name", formData.name);
                uploadFormData.append("description", formData.description);
                uploadFormData.append(
                    "royaltyPercent",
                    formData.royaltyPercent.toString()
                );

                // Add properties if provided
                if (formData.properties && Array.isArray(formData.properties)) {
                    uploadFormData.append(
                        "properties",
                        JSON.stringify(formData.properties)
                    );
                }

                const uploadResponse = await academicService.uploadDocument(
                    uploadFormData
                );

                console.log("🔍 Upload response in hook:", {
                    response: uploadResponse,
                    success: uploadResponse.success,
                    hasData: !!uploadResponse.data,
                    keys: Object.keys(uploadResponse || {}),
                });

                if (!uploadResponse.success) {
                    console.error("❌ Upload response failed:", {
                        success: uploadResponse.success,
                        message: uploadResponse.message,
                        fullResponse: uploadResponse,
                    });
                    throw new Error(uploadResponse.message || "Failed to upload to IPFS");
                }

                // Step 2: Upload metadata to IPFS
                if (onProgress && typeof onProgress === "function") {
                    onProgress({ step: 2, message: "Uploading metadata to IPFS..." });
                }

                const { contractData, metadataIpfs } = uploadResponse.data;

                // Ensure contract info is loaded before proceeding
                let currentContractInfo = contractInfo;
                if (!currentContractInfo) {
                    console.log(
                        "⚠️ Contract info not loaded, using cached or fallback..."
                    );

                    // Try to get from session storage first
                    const cachedInfo = sessionStorage.getItem("contractInfo");
                    if (cachedInfo) {
                        try {
                            currentContractInfo = JSON.parse(cachedInfo);
                            console.log(
                                "✅ Using cached contract info during upload:",
                                currentContractInfo
                            );
                        } catch (e) {
                            console.warn(
                                "⚠️ Failed to parse cached contract info during upload"
                            );
                        }
                    }

                    // If still no contract info, use fallback
                    if (!currentContractInfo) {
                        console.log("⚠️ Using fallback contract info during upload");
                        currentContractInfo = {
                            contractAddress: "0x68bDBfe015f454239A259795fa523475894601e0",
                            hasABI: true,
                            mintPrice: "0.01",
                            platformFeePercent: 1,
                            maxRoyaltyPercent: 20,
                            supportedFileTypes: [
                                "pdf",
                                "docx",
                                "txt",
                                "md",
                                "png",
                                "jpg",
                                "jpeg",
                            ],
                        };
                        // Set and cache the fallback
                        setContractInfo(currentContractInfo);
                        sessionStorage.setItem(
                            "contractInfo",
                            JSON.stringify(currentContractInfo)
                        );
                    }
                }

                // Step 3: Mint NFT on blockchain
                if (onProgress && typeof onProgress === "function") {
                    onProgress({ step: 3, message: "Minting NFT on blockchain..." });
                }

                // Ensure we have contract instance or create it optimized
                let contractToUse = contractInstance;

                // Get signer efficiently
                let signerToUse = signer;
                if (!signerToUse && provider) {
                    console.log("🔧 Getting signer from provider...");
                    try {
                        signerToUse = await provider.getSigner();
                    } catch (error) {
                        console.error("Failed to get signer from provider:", error);
                        throw new Error(
                            "Unable to get wallet signer. Please check your wallet connection."
                        );
                    }
                }

                if (
                    !contractToUse &&
                    signerToUse &&
                    currentContractInfo?.contractAddress
                ) {
                    console.log("🔧 Creating contract instance on-demand...");
                    contractToUse = new ethers.Contract(
                        currentContractInfo.contractAddress,
                        contractInterface,
                        signerToUse
                    );

                    // Update the state for future use (non-blocking)
                    setContractInstance(contractToUse);
                }

                if (!contractToUse) {
                    const errorDetails = {
                        hasAccount: !!account,
                        hasProvider: !!provider,
                        hasSigner: !!signer,
                        hasSignerToUse: !!signerToUse,
                        hasContractInfo: !!currentContractInfo,
                        contractAddress: currentContractInfo?.contractAddress,
                    };
                    console.error("❌ Contract initialization failed:", errorDetails);
                    throw new Error(
                        `Smart contract not initialized. Wallet state: ${JSON.stringify(
                            errorDetails
                        )}`
                    );
                }

                const mintPrice = ethers.parseEther(
                    currentContractInfo?.mintPrice || "0.01"
                );

                console.log("🔧 Minting parameters:", {
                    account,
                    name: contractData.name,
                    description: contractData.description,
                    tokenURI: contractData.tokenURI,
                    fileType: contractData.fileType,
                    royaltyPercent: contractData.royaltyPercent,
                    mintPrice: ethers.formatEther(mintPrice),
                    contractAddress: currentContractInfo?.contractAddress,
                });

                const tx = await contractToUse.mintDocument(
                    account,
                    contractData.name,
                    contractData.description,
                    contractData.tokenURI, // This maps to tokenMetadataURI in contract
                    contractData.fileType,
                    contractData.royaltyPercent,
                    { value: mintPrice }
                );

                if (onProgress && typeof onProgress === "function") {
                    onProgress({
                        step: 3,
                        message: "Waiting for transaction confirmation...",
                    });
                }
                const receipt = await tx.wait();

                // Extract token ID from events
                const mintEvent = receipt.logs.find((log) => {
                    try {
                        const parsed = contractToUse.interface.parseLog(log);
                        return parsed.name === "DocumentMinted";
                    } catch {
                        return false;
                    }
                });

                let tokenId = null;
                if (mintEvent) {
                    const parsed = contractToUse.interface.parseLog(mintEvent);
                    tokenId = parsed.args.tokenId.toString();
                }

                // Show success message with details
                const successData = {
                    tokenId,
                    transactionHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    fileIpfs: uploadResponse.data.fileIpfs,
                    metadataIpfs: uploadResponse.data.metadataIpfs,
                    contractData,
                };

                // Show detailed success modal
                showSuccessModal(successData);

                // Invalidate cache and reload user NFTs
                const cacheKey = `userNFTs_${account}`;
                const cacheTimeKey = `userNFTsTime_${account}`;
                sessionStorage.removeItem(cacheKey);
                sessionStorage.removeItem(cacheTimeKey);
                sessionStorage.removeItem("listings");
                sessionStorage.removeItem("listingsTime");

                await loadUserNFTs(true); // Force reload

                return {
                    success: true,
                    data: successData,
                };
            } catch (error) {
                console.error("Upload document error:", error);

                // Handle specific error types
                if (error.code === "ACTION_REJECTED") {
                    throw new Error("Transaction cancelled by user");
                } else if (error.code === "INSUFFICIENT_FUNDS") {
                    throw new Error("Insufficient funds for minting");
                } else if (
                    error.message &&
                    error.message.includes("insufficient funds")
                ) {
                    throw new Error(
                        "Insufficient funds for minting (need 0.01 ETH + gas fees)"
                    );
                } else if (
                    error.message &&
                    error.message.includes("execution reverted")
                ) {
                    // Extract revert reason if available
                    const revertMatch = error.message.match(
                        /reverted with reason string '([^']+)'/
                    );
                    if (revertMatch) {
                        throw new Error(`Transaction failed: ${revertMatch[1]}`);
                    } else {
                        throw new Error(
                            "Transaction failed. Please check your wallet balance and try again (need 0.01 ETH + gas fees)."
                        );
                    }
                } else if (error.reason) {
                    throw new Error(error.reason);
                } else {
                    throw new Error(error.message || "Failed to create NFT");
                }
            }
        },
        [account, contractInstance, contractInfo, loadUserNFTs]
    );

    // Purchase NFT
    const purchaseNFT = useCallback(
        async (tokenId) => {
            console.log("🛒 Purchase NFT called:", {
                tokenId,
                account,
                hasContract: !!contractInstance,
            });

            if (!account || !contractInstance) {
                const error = "Wallet not connected or contract not initialized";
                console.error("❌ Purchase validation failed:", {
                    account: !!account,
                    hasContract: !!contractInstance,
                });
                throw new Error(error);
            }

            try {
                console.log("📊 Getting listing details for token:", tokenId);
                // Get listing details
                const listing = await contractInstance.getListing(tokenId);
                console.log("📋 Listing details:", listing);

                if (!listing.active) {
                    throw new Error("NFT is not for sale");
                }

                console.log("💰 Initiating purchase transaction...", {
                    tokenId,
                    price: ethers.formatEther(listing.price),
                    seller: listing.seller,
                    buyer: account,
                });

                const tx = await contractInstance.purchaseNFT(tokenId, {
                    value: listing.price,
                });

                console.log("⏳ Transaction sent:", tx.hash);
                toast.loading("Processing purchase...", { id: "purchase" });
                const receipt = await tx.wait();
                toast.dismiss("purchase");

                console.log("✅ Purchase successful:", receipt);

                // Show detailed success popup
                const successData = {
                    transactionHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    tokenId: tokenId,
                };

                showSuccessModal(successData, "purchase");

                // Invalidate cache and reload data
                const cacheKey = `userNFTs_${account}`;
                const cacheTimeKey = `userNFTsTime_${account}`;
                sessionStorage.removeItem(cacheKey);
                sessionStorage.removeItem(cacheTimeKey);
                sessionStorage.removeItem("listings");
                sessionStorage.removeItem("listingsTime");

                await Promise.all([loadListings(true), loadUserNFTs(true)]); // Force reload

                return {
                    success: true,
                    transactionHash: receipt.hash,
                };
            } catch (error) {
                console.error("❌ Purchase NFT error:", error);
                console.error("❌ Error details:", {
                    code: error.code,
                    reason: error.reason,
                    message: error.message,
                });
                toast.dismiss("purchase");

                if (error.code === "ACTION_REJECTED") {
                    throw new Error("Transaction cancelled by user");
                } else if (error.code === "INSUFFICIENT_FUNDS") {
                    throw new Error("Insufficient funds for purchase");
                } else if (error.reason) {
                    throw new Error(error.reason);
                } else {
                    throw new Error(error.message || "Failed to purchase NFT");
                }
            }
        },
        [account, contractInstance, loadListings, loadUserNFTs]
    );

    // List NFT for sale
    const listForSale = useCallback(
        async (tokenId, priceInEth) => {
            if (!account || !contractInstance) {
                throw new Error("Wallet not connected or contract not initialized");
            }

            try {
                const priceInWei = ethers.parseEther(priceInEth.toString());

                const tx = await contractInstance.listForSale(tokenId, priceInWei);

                toast.loading("Listing NFT for sale...", { id: "listing" });
                const receipt = await tx.wait();
                toast.dismiss("listing");

                // Show detailed success popup
                const successData = {
                    transactionHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString(),
                    tokenId: tokenId,
                    listingPrice: priceInEth,
                };

                showSuccessModal(successData, "list");

                // Invalidate cache and reload data
                const cacheKey = `userNFTs_${account}`;
                const cacheTimeKey = `userNFTsTime_${account}`;
                sessionStorage.removeItem(cacheKey);
                sessionStorage.removeItem(cacheTimeKey);
                sessionStorage.removeItem("listings");
                sessionStorage.removeItem("listingsTime");

                await Promise.all([loadListings(true), loadUserNFTs(true)]); // Force reload

                return {
                    success: true,
                };
            } catch (error) {
                console.error("List for sale error:", error);
                toast.dismiss("listing");

                if (error.code === "ACTION_REJECTED") {
                    throw new Error("Transaction cancelled by user");
                } else {
                    throw new Error(error.message || "Failed to list NFT for sale");
                }
            }
        },
        [account, contractInstance, loadListings, loadUserNFTs]
    );

    // Show success modal for NFT operations
    const showSuccessModal = (data, type = "mint") => {
        setSuccessModal({
            isOpen: true,
            data,
            type
        });
    };

    // Close success modal
    const closeSuccessModal = () => {
        setSuccessModal({
            isOpen: false,
            data: null,
            type: 'mint'
        });
    };

    // Initialize on mount and when wallet connects
    React.useEffect(() => {
        console.log("🚀 useEffect triggered for contract initialization");
        initializeContract();
    }, [initializeContract]);

    // Also initialize immediately when component mounts (independent of wallet)
    React.useEffect(() => {
        console.log("📞 Calling initializeContract on component mount");
        initializeContract();
    }, []); // Empty dependency - run once on mount

    // Load data when account and contract are available
    React.useEffect(() => {
        if (account && contractInstance) {
            console.log(
                "🔄 Loading listings and user NFTs due to account/contract change"
            );
            loadListings();
            loadUserNFTs();
        }
    }, [account, contractInstance, loadListings, loadUserNFTs]);

    return {
        listings,
        userNFTs,
        contractInfo,
        loading,
        contractInstance,
        loadListings,
        loadUserNFTs,
        uploadDocument,
        purchaseNFT,
        listForSale,
        initializeContract,
        successModal,
        closeSuccessModal,
    };
}; 
