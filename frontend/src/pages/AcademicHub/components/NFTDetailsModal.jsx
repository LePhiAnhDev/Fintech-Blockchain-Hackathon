import React from "react";
import {
    X,
    ExternalLink,
    Copy,
    User,
    FileText,
    Image as ImageIcon,
    Calendar,
    Shield,
    Hash,
    Network,
    Eye,
    Globe
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import FilePreview from "../../../components/common/FilePreview";
import config from "../../../config/config";

const NFTDetailsModal = ({ nft, onClose, onAction, actionLabel, isOwned }) => {
    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const getFileTypeIcon = (fileType) => {
        switch (fileType?.toLowerCase()) {
            case 'png':
            case 'jpeg':
            case 'jpg':
            case 'gif':
                return <ImageIcon className="w-16 h-16 text-blue-400" />;
            case 'pdf':
                return <div className="text-4xl">📄</div>;
            case 'docx':
            case 'doc':
                return <div className="text-4xl">📝</div>;
            case 'txt':
                return <div className="text-4xl">📄</div>;
            case 'md':
                return <div className="text-4xl">📋</div>;
            default:
                return <FileText className="w-16 h-16 text-blue-400" />;
        }
    };

    const formatAddress = (address) => {
        if (!address) return 'Unknown';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Unknown';
        }
    };

    if (!nft) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-white">NFT Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content - Horizontal Layout */}
                <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
                    <div className="p-6">
                        {/* Top Section - NFT Info & Preview */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Preview - Wider */}
                            <div className="bg-gray-800 rounded-xl p-6">
                                <div className="aspect-[4/3] mb-4">
                                    <FilePreview
                                        fileUrl={nft.ipfsUrl}
                                        fileType={nft.fileType}
                                        className="w-full h-full"
                                    />
                                </div>
                                <div className="text-center">
                                    <span className="inline-block bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm mb-3">
                                        {nft.fileType?.toUpperCase() || 'FILE'}
                                    </span>
                                    <h3 className="text-xl font-bold text-white mb-4">{nft.name}</h3>

                                    {/* Price if listed */}
                                    {nft.price && (
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                                            <div className="text-sm text-green-400 mb-1">Current Price</div>
                                            <div className="text-2xl font-bold text-white">{nft.price} ETH</div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        {nft.ipfsUrl && (
                                            <Button
                                                onClick={() => window.open(nft.ipfsUrl, '_blank')}
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View File
                                            </Button>
                                        )}
                                        {onAction && actionLabel && (
                                            <Button
                                                onClick={onAction}
                                                variant="primary"
                                                size="sm"
                                                className="flex-1"
                                            >
                                                {actionLabel}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Information & Contract & Description stacked vertically */}
                            <div className="space-y-4">
                                {/* Basic Info */}
                                <div className="bg-gray-800 rounded-xl p-4">
                                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Information
                                    </h4>

                                    {/* Owned by */}
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
                                        <span className="text-gray-400 text-sm">Owned by</span>
                                        <button
                                            onClick={() => copyToClipboard(nft.creator || nft.owner || '0x1234567890123456789012345678901234567890', 'Owner address')}
                                            className="text-blue-400 hover:text-blue-300 font-mono text-sm flex items-center gap-1"
                                        >
                                            {formatAddress(nft.creator || nft.owner || '0x1234567890123456789012345678901234567890')}
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Token ID */}
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
                                        <span className="text-gray-400 text-sm">Token ID</span>
                                        <span className="text-white font-mono text-sm">{nft.tokenId}</span>
                                    </div>

                                    {/* Network */}
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
                                        <span className="text-gray-400 text-sm">Network</span>
                                        <span className="text-white text-sm">Sepolia</span>
                                    </div>

                                    {/* Royalty */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">Royalty</span>
                                        <span className="text-white text-sm">{
                                            (() => {
                                                const royalty = nft.royaltyPercent;
                                                if (!royalty && royalty !== 0) return '0%';

                                                // Handle different formats
                                                let value = parseFloat(royalty);

                                                // If value is greater than 100, it might be in basis points (10000 = 100%)
                                                if (value > 100) {
                                                    value = value / 100;
                                                }

                                                // If value is between 0-1, it might be decimal (0.05 = 5%)
                                                if (value > 0 && value <= 1) {
                                                    value = value * 100;
                                                }

                                                return Math.min(Math.max(value, 0), 100).toFixed(0) + '%';
                                            })()
                                        }</span>
                                    </div>
                                </div>

                                {/* Contract Info */}
                                <div className="bg-gray-800 rounded-xl p-4">
                                    <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Contract Details
                                    </h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">Standard</span>
                                            <span className="text-white">ERC-721</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">Address</span>
                                            <button
                                                onClick={() => copyToClipboard(config?.blockchain?.contracts?.academicNFT?.address || '0x0000000000000000000000000000000000000000', 'Contract address')}
                                                className="text-blue-400 hover:text-blue-300 font-mono text-xs flex items-center gap-1"
                                            >
                                                {formatAddress(config?.blockchain?.contracts?.academicNFT?.address || '0x0000000000000000000000000000000000000000')}
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-gray-800 rounded-xl p-4">
                                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Description
                                    </h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {nft.description || 'No description provided.'}
                                    </p>

                                    {/* Created Date */}
                                    {nft.createdAt && (
                                        <div className="mt-4 pt-3 border-t border-gray-700">
                                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                <Calendar className="w-4 h-4" />
                                                <span>Created: {formatDate(nft.createdAt)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section - Properties Full Width */}
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                Properties
                            </h4>
                            {nft.attributes && nft.attributes.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {nft.attributes.map((attr, index) => (
                                        <div key={index} className="bg-gray-700/50 rounded-lg p-4 text-center">
                                            <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">
                                                {attr.trait_type}
                                            </div>
                                            <div className="text-white font-medium">{attr.value}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No properties available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NFTDetailsModal; 