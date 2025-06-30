import React, { useState, useCallback } from "react";
import {
    Upload,
    Plus,
    Loader2,
    Eye,
    File,
    X,
    Info,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import FilePreview from "../../../components/common/FilePreview";

const CreateTab = ({ onUpload, contractInfo }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        royaltyPercent: 5,
        properties: "",
    });
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [properties, setProperties] = useState([{ trait_type: "", value: "" }]);

    const handleInputChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));

            // Clear validation error when user starts typing
            if (validationErrors[name]) {
                setValidationErrors((prev) => ({
                    ...prev,
                    [name]: null,
                }));
            }
        },
        [validationErrors]
    );

    const handlePropertyChange = (index, field, value) => {
        const newProperties = [...properties];
        newProperties[index][field] = value;
        setProperties(newProperties);
    };

    const addProperty = () => {
        setProperties([...properties, { trait_type: "", value: "" }]);
    };

    const removeProperty = (index) => {
        if (properties.length > 1) {
            const newProperties = properties.filter((_, i) => i !== index);
            setProperties(newProperties);
        }
    };

    const handleFileSelect = useCallback(
        (e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
                // Validate file size (50MB limit)
                const maxSize = 50 * 1024 * 1024; // 50MB
                if (selectedFile.size > maxSize) {
                    toast.error("File size must be less than 50MB");
                    return;
                }

                // Validate file type
                const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
                const supportedTypes = contractInfo?.supportedFileTypes || [
                    "pdf",
                    "docx",
                    "txt",
                    "md",
                    "png",
                    "jpeg",
                    "jpg",
                ];
                if (!supportedTypes.includes(fileExtension)) {
                    toast.error(`File type .${fileExtension} is not supported`);
                    return;
                }

                setFile(selectedFile);

                // Create preview URL for images
                if (["png", "jpeg", "jpg", "gif"].includes(fileExtension)) {
                    const url = URL.createObjectURL(selectedFile);
                    setPreviewUrl(url);
                } else {
                    setPreviewUrl(null);
                }

                // Clear file validation error
                if (validationErrors.file) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        file: null,
                    }));
                }
            }
        },
        [contractInfo, validationErrors]
    );

    const validateForm = () => {
        const errors = {};

        if (!file) {
            errors.file = "Please select a file to upload";
        }

        if (!formData.name.trim()) {
            errors.name = "Name is required";
        }

        if (!formData.description.trim()) {
            errors.description = "Description is required";
        }

        // Mint price is fixed at 0.01 ETH, so no validation needed

        if (
            formData.royaltyPercent < 0 ||
            formData.royaltyPercent > 20
        ) {
            errors.royaltyPercent = "Royalty must be between 0 and 20%";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the form errors before submitting");
            return;
        }

        setUploading(true);

        try {
            // Filter out empty properties
            const validProperties = properties.filter(
                prop => prop.trait_type.trim() && prop.value.trim()
            );

            await onUpload(file, {
                ...formData,
                properties: validProperties
            });

            // Reset form
            setFormData({
                name: "",
                description: "",
                royaltyPercent: 5,
                properties: "",
            });
            setFile(null);
            setPreviewUrl(null);
            setProperties([{ trait_type: "", value: "" }]);
        } catch (error) {
            toast.error(error.message || "Failed to create NFT");
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreviewUrl(null);
        if (validationErrors.file) {
            setValidationErrors((prev) => ({
                ...prev,
                file: null,
            }));
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Create Your NFT</h2>
                <p className="text-gray-400">Upload your academic document and create an NFT</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Upload Section */}
                <div className="space-y-6">
                    {/* Upload Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Upload Image
                        </label>
                        <div className="relative">
                            {!file ? (
                                <div
                                    className="border-2 border-dashed border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                    onClick={() => document.getElementById('file-input').click()}
                                >
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        PNG, JPG, PDF, DOCX up to 50MB
                                    </p>
                                </div>
                            ) : (
                                <div className="relative bg-gray-800 rounded-2xl p-4">
                                    <div className="flex items-center gap-3">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                                                <File className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            onClick={removeFile}
                                            className="p-1 hover:bg-gray-700 rounded"
                                        >
                                            <X className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <input
                                id="file-input"
                                type="file"
                                accept="image/*,.pdf,.docx,.txt,.md"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                        {validationErrors.file && (
                            <p className="text-red-400 text-sm mt-2">{validationErrors.file}</p>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Item name"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            {validationErrors.name && (
                                <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Provide a detailed description of your item"
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            />
                            {validationErrors.description && (
                                <p className="text-red-400 text-sm mt-1">{validationErrors.description}</p>
                            )}
                        </div>

                        {/* Platform Fee Notice */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-5 h-5 text-blue-400" />
                                <span className="text-sm font-medium text-blue-400">Platform Fee</span>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">
                                Minting fee: <span className="text-white font-semibold">0.01 ETH</span>
                            </p>
                            <p className="text-xs text-gray-400">
                                This is a one-time platform fee to mint your NFT on the blockchain, similar to OpenSea and Rarible.
                            </p>
                        </div>

                        {/* Royalty */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Royalty (%)
                            </label>
                            <input
                                type="number"
                                name="royaltyPercent"
                                value={formData.royaltyPercent}
                                onChange={handleInputChange}
                                placeholder="5"
                                min="0"
                                max="20"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            {validationErrors.royaltyPercent && (
                                <p className="text-red-400 text-sm mt-1">{validationErrors.royaltyPercent}</p>
                            )}
                        </div>

                        {/* Properties */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Properties
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Add properties to your NFT (Optional)
                            </p>
                            <div className="space-y-2">
                                {properties.map((property, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Property name"
                                            value={property.trait_type}
                                            onChange={(e) => handlePropertyChange(index, "trait_type", e.target.value)}
                                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Value"
                                            value={property.value}
                                            onChange={(e) => handlePropertyChange(index, "value", e.target.value)}
                                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            onClick={() => removeProperty(index)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addProperty}
                                className="mt-2 text-blue-400 text-sm hover:text-blue-300"
                            >
                                + Add more
                            </button>
                        </div>

                        {/* Advanced Settings Toggle */}
                        <div className="border-t border-gray-700 pt-4">
                            <button className="flex items-center gap-2 text-gray-400 hover:text-white">
                                Hide advanced settings
                            </button>
                        </div>

                        {/* Create NFT Button */}
                        <div className="pt-6">
                            <Button
                                onClick={handleSubmit}
                                disabled={uploading || !file}
                                variant="primary"
                                className="w-full"
                                size="lg"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Creating NFT...
                                    </>
                                ) : (
                                    "Create NFT"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Preview Section */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>

                        {/* Preview Card */}
                        <div className="bg-gray-800 rounded-2xl overflow-hidden max-w-sm">
                            {/* Preview Image */}
                            <div className="relative aspect-[4/3]">
                                {file ? (
                                    <FilePreview
                                        file={file}
                                        fileType={file.type}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-gray-600 rounded-lg mx-auto mb-2"></div>
                                            <p className="text-sm text-gray-500">Upload a file to preview</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Preview Info */}
                            <div className="p-4">
                                <div className="mb-3">
                                    <div className="text-xs text-gray-500 mb-1">NFT Name</div>
                                    <h4 className="text-lg font-semibold text-white">
                                        {formData.name || (
                                            <span className="text-gray-500 italic">Enter NFT name...</span>
                                        )}
                                    </h4>
                                </div>

                                <div className="text-sm text-gray-400">
                                    {formData.description || (
                                        <span className="text-gray-500 italic">Enter description...</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreateTab;
