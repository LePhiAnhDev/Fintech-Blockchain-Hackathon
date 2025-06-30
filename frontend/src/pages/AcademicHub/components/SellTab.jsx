import React, { useState, useMemo } from "react";
import {
    FileText,
    Loader2,
    Search,
    Filter,
    TrendingUp,
    DollarSign,
    Package,
    Tag,
    ChevronDown,
} from "lucide-react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import CustomSelect from "../../../components/common/CustomSelect";
import NFTCard from "./NFTCard";
import ListingModal from "./ListingModal";

const SellTab = ({ userNFTs, loading, onList }) => {
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [showListingModal, setShowListingModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBy, setFilterBy] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // Sample NFT for testing modal
    const sampleNFTs = userNFTs.length === 0 ? [
        {
            tokenId: "1",
            name: "Sample Academic Paper",
            description: "This is a sample academic paper NFT for testing the modal functionality.",
            fileType: "pdf",
            creator: "0x1234567890123456789012345678901234567890",
            owner: "0x1234567890123456789012345678901234567890",
            royaltyPercent: 5,
            price: "0.1",
            isListed: false,
            createdAt: new Date().toISOString(),
            attributes: [
                { trait_type: "Subject", value: "Computer Science" },
                { trait_type: "Year", value: "2024" },
                { trait_type: "Pages", value: "15" }
            ],
            ipfsUrl: "https://gateway.pinata.cloud/ipfs/sample",
            metadataUrl: "https://gateway.pinata.cloud/ipfs/sample-metadata"
        },
        {
            tokenId: "2",
            name: "Research Proposal",
            description: "A comprehensive research proposal document.",
            fileType: "docx",
            creator: "0x1234567890123456789012345678901234567890",
            owner: "0x1234567890123456789012345678901234567890",
            royaltyPercent: 3,
            price: "0.05",
            isListed: true,
            createdAt: new Date().toISOString(),
            attributes: [
                { trait_type: "Subject", value: "Biology" },
                { trait_type: "Year", value: "2024" }
            ]
        }
    ] : userNFTs;

    // Memoize filtered and sorted NFTs with stats
    const { filteredNFTs, stats } = useMemo(() => {
        let filtered = sampleNFTs.filter((nft) => {
            const matchesSearch =
                nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                nft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (nft.attributes &&
                    nft.attributes.some(
                        (attr) =>
                            attr.value
                                .toString()
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                            attr.trait_type.toLowerCase().includes(searchTerm.toLowerCase())
                    ));
            const matchesFilter = filterBy === "all" || nft.fileType === filterBy;
            return matchesSearch && matchesFilter;
        });

        // Sort NFTs
        switch (sortBy) {
            case "name":
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "oldest":
                filtered.sort(
                    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                );
                break;
            case "newest":
            default:
                filtered.sort(
                    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                );
                break;
        }

        // Calculate stats
        const totalNFTs = sampleNFTs.length;
        const listedNFTs = sampleNFTs.filter((nft) => nft.isListed).length;
        const unlistedNFTs = totalNFTs - listedNFTs;
        const fileTypes = [...new Set(sampleNFTs.map((nft) => nft.fileType))].length;

        return {
            filteredNFTs: filtered,
            stats: {
                total: totalNFTs,
                listed: listedNFTs,
                unlisted: unlistedNFTs,
                fileTypes,
            },
        };
    }, [sampleNFTs, searchTerm, filterBy, sortBy]);

    const handleOpenListingModal = (nft) => {
        setSelectedNFT(nft);
        setShowListingModal(true);
    };

    const handleCloseListingModal = () => {
        setShowListingModal(false);
        setSelectedNFT(null);
    };

    const fileTypeOptions = [
        { value: "all", label: "All Types" },
        { value: "pdf", label: "PDF" },
        { value: "docx", label: "DOCX" },
        { value: "txt", label: "TXT" },
        { value: "md", label: "Markdown" },
        { value: "png", label: "PNG" },
        { value: "jpeg", label: "JPEG" },
    ];

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
        { value: "name", label: "Name A-Z" },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Loading Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="p-4">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-6 bg-gray-600 rounded w-1/2"></div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    <span className="ml-2 text-gray-400">Loading your NFTs...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Package className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total NFTs</p>
                            <p className="text-xl font-semibold text-white">{stats.total}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Tag className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Listed</p>
                            <p className="text-xl font-semibold text-white">{stats.listed}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <DollarSign className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Unlisted</p>
                            <p className="text-xl font-semibold text-white">
                                {stats.unlisted}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">File Types</p>
                            <p className="text-xl font-semibold text-white">
                                {stats.fileTypes}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {sampleNFTs.length === 0 ? (
                <Card className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                        No NFTs found
                    </h3>
                    <p className="text-gray-400 mb-6">
                        Create your first academic NFT to start building your collection!
                    </p>
                    <Button
                        onClick={() => {
                            // This would typically trigger a tab change to "create"
                            // For now, we'll just show a message
                            console.log("Navigate to create tab");
                        }}
                        variant="primary"
                        size="md"
                    >
                        Create Your First NFT
                    </Button>
                </Card>
            ) : (
                <>
                    {/* Search and Filter Controls */}
                    <Card className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search your NFTs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-colors"
                                />
                            </div>

                            {/* Filter by Type */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <CustomSelect
                                    value={filterBy}
                                    onChange={(value) => setFilterBy(value)}
                                    options={fileTypeOptions}
                                    className="min-w-[140px]"
                                />
                            </div>

                            {/* Sort */}
                            <CustomSelect
                                value={sortBy}
                                onChange={(value) => setSortBy(value)}
                                options={sortOptions}
                                className="min-w-[140px]"
                            />
                        </div>

                        {/* Active Filters Display */}
                        {(searchTerm || filterBy !== "all" || sortBy !== "newest") && (
                            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-700/50">
                                <span className="text-sm text-gray-400">Active filters:</span>
                                {searchTerm && (
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                                        Search: "{searchTerm}"
                                    </span>
                                )}
                                {filterBy !== "all" && (
                                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">
                                        Type:{" "}
                                        {
                                            fileTypeOptions.find((opt) => opt.value === filterBy)
                                                ?.label
                                        }
                                    </span>
                                )}
                                {sortBy !== "newest" && (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                                        Sort:{" "}
                                        {sortOptions.find((opt) => opt.value === sortBy)?.label}
                                    </span>
                                )}
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterBy("all");
                                        setSortBy("newest");
                                    }}
                                    className="text-xs text-gray-400 hover:text-white underline ml-2"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </Card>

                    {/* Results Summary */}
                    <div className="flex items-center justify-between">
                        <p className="text-gray-400">
                            Showing {filteredNFTs.length} of {sampleNFTs.length} NFTs
                        </p>
                    </div>

                    {/* NFTs Grid */}
                    {filteredNFTs.length === 0 ? (
                        <Card className="text-center py-12">
                            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-300 mb-2">
                                No NFTs match your criteria
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Try adjusting your search or filter settings
                            </p>
                            <Button
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterBy("all");
                                    setSortBy("newest");
                                }}
                                variant="outline"
                                size="md"
                            >
                                Clear Filters
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filteredNFTs.map((nft) => (
                                <NFTCard
                                    key={nft.tokenId}
                                    nft={nft}
                                    onAction={() => handleOpenListingModal(nft)}
                                    actionLabel={
                                        nft.isListed ? "Update Listing" : "List for Sale"
                                    }
                                    isOwned={true}
                                />
                            ))}
                        </div>
                    )}

                    {/* Listing Modal */}
                    {showListingModal && (
                        <ListingModal
                            selectedNFT={selectedNFT}
                            onClose={handleCloseListingModal}
                            onConfirm={onList}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default SellTab;
