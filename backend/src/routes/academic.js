import express from 'express';
import multer from 'multer';
import { ethers } from 'ethers';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Pinata configuration
const PINATA_API_KEY = process.env.PINATA_API_KEY || '513c6bcf004188faa226';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || 'a7e34ddcdf8c130010071b4c14c4025b86e488f462f5fd30dbdc3b7dbe72df78';
const PINATA_JWT = process.env.PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmODcwNWU2Ni1kMzlhLTQ2YTUtYjJkMC01ZGFiODA5ZTM5MjgiLCJlbWFpbCI6ImhlbnJ5YWtlMDYyODk5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1MTNjNmJjZjAwNDE4OGZhYTIyNiIsInNjb3BlZEtleVNlY3JldCI6ImE3ZTM0ZGRjZGY4YzEzMDAxMDA3MWI0YzE0YzQwMjViODZlNDg4ZjQ2MmY1ZmQzMGRiZGMzYjdkYmU3MmRmNzgiLCJleHAiOjE3ODI3NDM0OTZ9.xcABBmF3260V2s06Fo-UctxDmuwTs8iEXIc6j5RppNE';

// Contract configuration
let contractAddress, contractABI;
try {
    const deploymentPath = path.join(__dirname, '../../deployment.json');
    if (fs.existsSync(deploymentPath)) {
        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        contractAddress = deployment.contractAddress;
    }

    const abiPath = path.join(__dirname, '../../artifacts/contracts/AcademicNFT.sol/AcademicNFT.json');
    if (fs.existsSync(abiPath)) {
        const artifactFile = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        contractABI = artifactFile.abi;
    }
} catch (error) {
    console.error('Error loading contract config:', error);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['pdf', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg'];
        const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);

        if (allowedTypes.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
        }
    }
});

// Helper function to upload file to IPFS
async function uploadToIPFS(filePath, filename) {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const metadata = JSON.stringify({
            name: filename,
            keyvalues: {
                uploadedAt: new Date().toISOString(),
                fileType: path.extname(filename).toLowerCase().slice(1)
            }
        });
        formData.append('pinataMetadata', metadata);

        const options = JSON.stringify({
            cidVersion: 1,
            wrapWithDirectory: false
        });
        formData.append('pinataOptions', options);

        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                maxBodyLength: 'Infinity',
                timeout: 60000, // 60 second timeout
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'Authorization': `Bearer ${PINATA_JWT}`
                }
            }
        );

        return {
            success: true,
            ipfsHash: response.data.IpfsHash,
            pinSize: response.data.PinSize,
            timestamp: response.data.Timestamp,
            url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
        };
    } catch (error) {
        console.error('IPFS upload error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
}

// Helper function to upload JSON metadata to IPFS
async function uploadMetadataToIPFS(metadata) {
    try {
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            metadata,
            {
                timeout: 30000, // 30 second timeout
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PINATA_JWT}`
                }
            }
        );

        return {
            success: true,
            ipfsHash: response.data.IpfsHash,
            pinSize: response.data.PinSize,
            timestamp: response.data.Timestamp,
            url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
        };
    } catch (error) {
        console.error('IPFS metadata upload error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
}

// Get contract info
router.get('/contract-info', (req, res) => {
    res.json({
        success: true,
        data: {
            contractAddress,
            hasABI: !!contractABI,
            mintPrice: "0.01",
            platformFeePercent: 1,
            maxRoyaltyPercent: 20,
            supportedFileTypes: ['pdf', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg']
        }
    });
});

// Upload file and create NFT metadata
router.post('/upload-document', optionalAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const {
            name,
            description,
            royaltyPercent,
            properties
        } = req.body;

        // Validate required fields
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Name and description are required'
            });
        }

        // Validate and normalize royalty percentage
        let normalizedRoyalty = 0;
        if (royaltyPercent !== undefined && royaltyPercent !== null) {
            const royaltyNum = parseFloat(royaltyPercent);
            if (isNaN(royaltyNum)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid royalty percentage format'
                });
            }

            // Handle different input formats
            if (royaltyNum > 100) {
                // Assume basis points (10000 = 100%)
                normalizedRoyalty = Math.floor(royaltyNum / 100);
            } else if (royaltyNum > 0 && royaltyNum < 1) {
                // Assume decimal (0.05 = 5%, 0.1 = 10%)
                normalizedRoyalty = Math.floor(royaltyNum * 100);
            } else {
                // Assume percentage (1 = 1%, 5 = 5%, 20 = 20%)
                normalizedRoyalty = Math.floor(royaltyNum);
            }

            // Validate range (0-20% as per contract)
            if (normalizedRoyalty < 0 || normalizedRoyalty > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Royalty percentage must be between 0% and 20%'
                });
            }
        }

        // Upload file to IPFS
        console.log('Uploading file to IPFS...');
        const fileUpload = await uploadToIPFS(req.file.path, req.file.originalname);

        if (!fileUpload.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload file to IPFS',
                error: fileUpload.error
            });
        }

        // Parse properties if provided
        let parsedProperties = [];
        if (properties) {
            try {
                parsedProperties = typeof properties === 'string' ? JSON.parse(properties) : properties;
                if (!Array.isArray(parsedProperties)) {
                    parsedProperties = [];
                }
            } catch (error) {
                console.warn('Failed to parse properties:', error);
                parsedProperties = [];
            }
        }

        // Create default attributes
        const defaultAttributes = [
            {
                trait_type: "File Type",
                value: path.extname(req.file.originalname).toLowerCase().slice(1).toUpperCase()
            },
            {
                trait_type: "File Size",
                value: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`
            },
            {
                trait_type: "Royalty Percent",
                value: normalizedRoyalty
            },
            {
                trait_type: "Created At",
                value: new Date().toISOString()
            }
        ];

        // Combine default attributes with user-defined properties
        const allAttributes = [...defaultAttributes, ...parsedProperties];

        // Create NFT metadata
        const metadata = {
            name: name,
            description: description,
            image: fileUpload.url, // For documents, we'll use file URL as image
            external_url: fileUpload.url,
            attributes: allAttributes,
            properties: {
                files: [
                    {
                        uri: fileUpload.url,
                        type: req.file.mimetype,
                        name: req.file.originalname,
                        size: req.file.size
                    }
                ],
                category: "nft_document",
                creators: [
                    {
                        address: req.user?.walletAddress || "0x0000000000000000000000000000000000000000",
                        verified: !!req.user,
                        share: 100
                    }
                ],
                royalty: normalizedRoyalty
            }
        };

        // Upload metadata to IPFS
        console.log('Uploading metadata to IPFS...');
        const metadataUpload = await uploadMetadataToIPFS(metadata);

        if (!metadataUpload.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload metadata to IPFS',
                error: metadataUpload.error
            });
        }

        // Clean up uploaded file
        try {
            fs.unlinkSync(req.file.path);
        } catch (error) {
            console.error('Error cleaning up file:', error);
        }

        res.json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                fileIpfs: {
                    hash: fileUpload.ipfsHash,
                    url: fileUpload.url,
                    size: fileUpload.pinSize
                },
                metadataIpfs: {
                    hash: metadataUpload.ipfsHash,
                    url: metadataUpload.url,
                    size: metadataUpload.pinSize
                },
                metadata: metadata,
                contractData: {
                    name: name,
                    description: description,
                    tokenURI: metadataUpload.url,
                    fileType: path.extname(req.file.originalname).toLowerCase().slice(1),
                    royaltyPercent: normalizedRoyalty,
                    properties: parsedProperties
                }
            }
        });
    } catch (error) {
        console.error('Upload document error:', error);

        // Clean up uploaded file if exists
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get active listings from smart contract
router.get('/listings', async (req, res) => {
    try {
        if (!contractAddress || !contractABI) {
            return res.status(500).json({
                success: false,
                message: 'Contract not configured'
            });
        }

        // This is a mock response since we need the actual contract interaction
        // In real implementation, you would connect to the contract and fetch listings
        res.json({
            success: true,
            data: {
                listings: [],
                totalCount: 0
            }
        });
    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch listings',
            error: error.message
        });
    }
});

// Get user's NFTs
router.get('/my-nfts', authenticate, async (req, res) => {
    try {
        if (!contractAddress || !contractABI) {
            return res.status(500).json({
                success: false,
                message: 'Contract not configured'
            });
        }

        // This is a mock response since we need the actual contract interaction
        // In real implementation, you would connect to the contract and fetch user's NFTs
        res.json({
            success: true,
            data: {
                nfts: [],
                totalCount: 0
            }
        });
    } catch (error) {
        console.error('Get user NFTs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user NFTs',
            error: error.message
        });
    }
});

// Get NFT details
router.get('/nft/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;

        if (!contractAddress || !contractABI) {
            return res.status(500).json({
                success: false,
                message: 'Contract not configured'
            });
        }

        // This is a mock response since we need the actual contract interaction
        // In real implementation, you would connect to the contract and fetch NFT details
        res.json({
            success: true,
            data: {
                tokenId: tokenId,
                owner: '',
                metadata: {},
                listing: null
            }
        });
    } catch (error) {
        console.error('Get NFT details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch NFT details',
            error: error.message
        });
    }
});

// Test IPFS connection
router.get('/test-ipfs', async (req, res) => {
    try {
        const testData = {
            message: "Hello from Academic Hub!",
            timestamp: new Date().toISOString(),
            test: true
        };

        const result = await uploadMetadataToIPFS(testData);

        res.json({
            success: result.success,
            message: result.success ? 'IPFS connection successful' : 'IPFS connection failed',
            data: result
        });
    } catch (error) {
        console.error('IPFS test error:', error);
        res.status(500).json({
            success: false,
            message: 'IPFS test failed',
            error: error.message
        });
    }
});

export default router; 