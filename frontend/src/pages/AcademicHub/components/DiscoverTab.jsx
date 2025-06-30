import React, { useState, useMemo } from "react";
import {
    Search,
    BookOpen,
    Loader2,
    Filter,
    TrendingUp,
    Users,
    Clock,
    ChevronDown,
    RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import CustomSelect from "../../../components/common/CustomSelect";
import NFTCard from "./NFTCard";

const DiscoverTab = ({ listings, loading, onPurchase, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBy, setFilterBy] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    console.log("🔍 DiscoverTab render:", {
        listingsCount: listings.length,
        loading,
        hasListings: listings && listings.length > 0,
    });

    // Memoize filtered and sorted listings
    const { filteredListings, stats } = useMemo(() => {
        let filtered = listings.filter((listing) => {
            const matchesSearch =
                listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (listing.attributes &&
                    listing.attributes.some(
                        (attr) =>
                            attr.value
                                .toString()
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                            attr.trait_type.toLowerCase().includes(searchTerm.toLowerCase())
                    ));
            const matchesFilter = filterBy === "all" || listing.fileType === filterBy;
            return matchesSearch && matchesFilter;
        });

        // Sort listings
        switch (sortBy) {
            case "price-low":
                filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case "price-high":
                filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case "oldest":
                filtered.sort((a, b) => new Date(a.listedAt) - new Date(b.listedAt));
                break;
            case "newest":
            default:
                filtered.sort((a, b) => new Date(b.listedAt) - new Date(a.listedAt));
                break;
        }

        // Calculate stats
        const totalValue = listings.reduce(
            (sum, listing) => sum + parseFloat(listing.price || 0),
            0
        );
        const avgPrice = listings.length > 0 ? totalValue / listings.length : 0;
        const uniqueCreators = new Set(listings.map((listing) => listing.creator))
            .size;

        return {
            filteredListings: filtered,
            stats: {
                total: listings.length,
                totalValue: totalValue.toFixed(2),
                avgPrice: avgPrice.toFixed(3),
                uniqueCreators,
            },
        };
    }, [listings, searchTerm, filterBy, sortBy]);

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
        { value: "price-low", label: "Price: Low to High" },
        { value: "price-high", label: "Price: High to Low" },
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
                    <span className="ml-2 text-gray-400">Loading listings...</span>
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
                            <BookOpen className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Listings</p>
                            <p className="text-xl font-semibold text-white">{stats.total}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Value</p>
                            <p className="text-xl font-semibold text-white">
                                {stats.totalValue} ETH
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Avg Price</p>
                            <p className="text-xl font-semibold text-white">
                                {stats.avgPrice} ETH
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Creators</p>
                            <p className="text-xl font-semibold text-white">
                                {stats.uniqueCreators}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search and Filter Controls */}
            <Card className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documents, creators, or attributes..."
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
                        className="min-w-[160px]"
                    />

                    {/* Refresh Button */}
                    <Button
                        onClick={onRefresh}
                        disabled={loading}
                        variant="outline"
                        size="md"
                        className="px-6 py-3 h-12 whitespace-nowrap flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading...</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                <span>Refresh</span>
                            </>
                        )}
                    </Button>
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
                                {fileTypeOptions.find((opt) => opt.value === filterBy)?.label}
                            </span>
                        )}
                        {sortBy !== "newest" && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                                Sort: {sortOptions.find((opt) => opt.value === sortBy)?.label}
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
                    Showing {filteredListings.length} of {listings.length} documents
                </p>
            </div>

            {/* Listings Grid */}
            {filteredListings.length === 0 ? (
                <Card className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                        No documents found
                    </h3>
                    <p className="text-gray-400 mb-4">
                        {searchTerm || filterBy !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "Be the first to create and list an academic document!"}
                    </p>

                    {/* Debug info for empty state */}
                    {process.env.NODE_ENV === "development" && (
                        <div className="text-xs text-gray-500 space-y-1 mb-4 p-3 bg-gray-800/30 rounded-lg">
                            <div>Total listings: {listings.length}</div>
                            <div>Filtered listings: {filteredListings.length}</div>
                            <div>Loading: {loading ? "Yes" : "No"}</div>
                            <div>Search term: "{searchTerm}"</div>
                            <div>Filter: {filterBy}</div>
                        </div>
                    )}

                    {listings.length === 0 && !loading && (
                        <Button
                            onClick={() => {
                                console.log("🔄 Try Loading Again clicked");
                                onRefresh();
                            }}
                            variant="primary"
                            size="md"
                        >
                            Try Loading Again
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredListings.map((listing) => (
                        <NFTCard
                            key={listing.tokenId}
                            nft={listing}
                            onAction={async () => {
                                try {
                                    console.log(
                                        "🛒 Purchase initiated for token:",
                                        listing.tokenId
                                    );
                                    await onPurchase(listing.tokenId);
                                } catch (error) {
                                    console.error("💰 Purchase failed:", error);
                                    toast.error(error.message || "Failed to purchase NFT");
                                }
                            }}
                            actionLabel="Purchase"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiscoverTab;
