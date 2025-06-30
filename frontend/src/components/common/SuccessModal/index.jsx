import React, { useEffect } from 'react';
import { ExternalLink, CheckCircle, Hash, File, X } from 'lucide-react';

const SuccessModal = ({ data, type = 'mint', isOpen, onClose }) => {
    const getTitle = () => {
        switch (type) {
            case 'mint': return 'NFT Created Successfully!';
            case 'purchase': return 'NFT Purchased Successfully!';
            case 'list': return 'NFT Listed Successfully!';
            default: return 'Success!';
        }
    };

    // Auto close after 10 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-gray-900/95 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 max-w-lg w-full shadow-2xl animate-fadeIn">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-800/50 rounded-full transition-colors group"
                >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-white font-semibold text-lg pr-8">{getTitle()}</h3>
                </div>

                <div className="space-y-4 text-sm">
                    {/* NFT Details */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <File className="w-4 h-4 text-blue-400" />
                            NFT Details
                        </h4>
                        <div className="space-y-2 text-gray-300">
                            {data.contractData && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Name:</span>
                                        <span className="font-medium">{data.contractData.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Description:</span>
                                        <span className="font-medium max-w-60 text-right truncate">{data.contractData.description}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">File Type:</span>
                                        <span className="font-medium">{data.contractData.fileType.toUpperCase()}</span>
                                    </div>
                                </>
                            )}
                            {data.tokenId && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Token ID:</span>
                                    <span className="font-mono font-medium">#{data.tokenId}</span>
                                </div>
                            )}
                            {data.listingPrice && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Listing Price:</span>
                                    <span className="font-medium">{data.listingPrice} ETH</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-400" />
                            Transaction Details
                        </h4>
                        <div className="space-y-3 text-gray-300">
                            {data.transactionHash && (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-400">Transaction Hash:</span>
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${data.transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                    >
                                        View on Explorer
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                            {data.fileIpfs && (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-400">IPFS File:</span>
                                    <a
                                        href={data.fileIpfs.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                    >
                                        View File
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                            {data.metadataIpfs && (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-400">IPFS Metadata:</span>
                                    <a
                                        href={data.metadataIpfs.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                    >
                                        View Metadata
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                            {data.blockNumber && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Block Number:</span>
                                    <span className="font-mono font-medium">{data.blockNumber}</span>
                                </div>
                            )}
                            {data.gasUsed && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Gas Used:</span>
                                    <span className="font-mono font-medium">{parseInt(data.gasUsed).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal; 