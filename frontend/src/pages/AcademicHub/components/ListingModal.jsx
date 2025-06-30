import React, { useState } from "react";
import { X, File, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import CustomSelect from "../../../components/common/CustomSelect";

const ListingModal = ({ selectedNFT, onClose, onConfirm }) => {
    const [listingPrice, setListingPrice] = useState("");
    const [listingDuration, setListingDuration] = useState("7");

    const handleListForSale = async () => {
        if (!selectedNFT || !listingPrice) return;

        try {
            const priceInWei = parseFloat(listingPrice);
            if (priceInWei <= 0) {
                toast.error("Price must be greater than 0");
                return;
            }

            await onConfirm(selectedNFT.tokenId, listingPrice);
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to list NFT");
        }
    };

    const getFileTypeIcon = (fileType) => {
        switch (fileType?.toLowerCase()) {
            case "png":
            case "jpeg":
            case "jpg":
            case "gif":
                return <ImageIcon className="w-8 h-8 text-blue-400" />;
            case "pdf":
                return <div className="text-2xl">📄</div>;
            case "docx":
            case "doc":
                return <div className="text-2xl">📝</div>;
            case "txt":
                return <div className="text-2xl">📄</div>;
            case "md":
                return <div className="text-2xl">📋</div>;
            default:
                return <File className="w-8 h-8 text-blue-400" />;
        }
    };

    if (!selectedNFT) return null;

    const fee = listingPrice ? (parseFloat(listingPrice) * 0.01).toFixed(4) : "0";
    const youReceive = listingPrice ? (parseFloat(listingPrice) * 0.99).toFixed(4) : "0";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-md w-full mx-4 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-6">List NFT for Sale</h3>

                    {/* NFT Preview */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getFileTypeIcon(selectedNFT.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate mb-1">
                                {selectedNFT.name}
                            </h4>
                            <p className="text-sm text-gray-400 truncate">
                                {selectedNFT.description}
                            </p>
                        </div>
                    </div>

                    {/* Price Input - Moved up */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Price
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={listingPrice}
                                onChange={(e) => setListingPrice(e.target.value)}
                                placeholder="0.1"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors pr-12"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                                ETH
                            </div>
                        </div>
                    </div>

                    {/* Fee Breakdown */}
                    {listingPrice && (
                        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Fee 1%</span>
                                <span className="text-white">{fee} ETH</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span className="text-gray-300">You will receive</span>
                                <span className="text-white">{youReceive} ETH</span>
                            </div>
                        </div>
                    )}

                    {/* Listing Duration */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Listing Duration</span>
                            <CustomSelect
                                value={listingDuration}
                                onChange={(value) => setListingDuration(value)}
                                options={[
                                    { value: "1", label: "1 Day" },
                                    { value: "3", label: "3 Days" },
                                    { value: "7", label: "7 Days" },
                                    { value: "30", label: "30 Days" }
                                ]}
                                className="min-w-[120px]"
                            />
                        </div>
                    </div>

                    {/* Confirm Button */}
                    <Button
                        onClick={handleListForSale}
                        disabled={!listingPrice || parseFloat(listingPrice) <= 0}
                        variant="primary"
                        className="w-full"
                        size="lg"
                    >
                        Confirm Listing
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ListingModal; 