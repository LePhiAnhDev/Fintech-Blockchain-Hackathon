import React, { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, File, AlertCircle } from 'lucide-react';

const FilePreview = ({ file, fileUrl, fileType, className = '' }) => {
    const [previewContent, setPreviewContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (file || fileUrl) {
            loadPreview();
        }
    }, [file, fileUrl, fileType]);

    const loadPreview = async () => {
        setLoading(true);
        setError(null);

        try {
            const actualFile = file;
            const type = fileType?.toLowerCase() || actualFile?.type?.toLowerCase() || '';

            // Handle different file types
            if (type.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(type)) {
                if (actualFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setPreviewContent({
                            type: 'image',
                            content: e.target.result
                        });
                        setLoading(false);
                    };
                    reader.readAsDataURL(actualFile);
                } else if (fileUrl) {
                    setPreviewContent({
                        type: 'image',
                        content: fileUrl
                    });
                    setLoading(false);
                }
            } else if (type.includes('text') || ['txt', 'md'].includes(type)) {
                if (actualFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const text = e.target.result.substring(0, 200); // First 200 chars
                        setPreviewContent({
                            type: 'text',
                            content: text + (e.target.result.length > 200 ? '...' : '')
                        });
                        setLoading(false);
                    };
                    reader.readAsText(actualFile);
                } else {
                    // For remote files, we can't read content easily
                    setPreviewContent({
                        type: 'file-icon',
                        content: type
                    });
                    setLoading(false);
                }
            } else if (type.includes('pdf') || type === 'pdf') {
                setPreviewContent({
                    type: 'pdf-preview',
                    content: actualFile?.name || 'PDF Document'
                });
                setLoading(false);
            } else {
                // Default file preview
                setPreviewContent({
                    type: 'file-icon',
                    content: type
                });
                setLoading(false);
            }
        } catch (err) {
            setError('Failed to load preview');
            setLoading(false);
        }
    };

    const getFileIcon = (type) => {
        switch (type) {
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
                return <FileText className="w-12 h-12 text-blue-400" />;
        }
    };

    const renderPreview = () => {
        if (loading) {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading preview...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="w-full h-full flex items-center justify-center text-center">
                    <div>
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                </div>
            );
        }

        if (!previewContent) {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <File className="w-12 h-12 text-gray-400" />
                </div>
            );
        }

        switch (previewContent.type) {
            case 'image':
                return (
                    <img
                        src={previewContent.content}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                );

            case 'text':
                return (
                    <div className="w-full h-full p-3 overflow-hidden">
                        <div className="text-xs text-gray-300 leading-relaxed font-mono">
                            {previewContent.content}
                        </div>
                    </div>
                );

            case 'pdf-preview':
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-3">
                        <div className="text-3xl mb-2">📄</div>
                        <div className="text-xs text-gray-300 mb-1">PDF Document</div>
                        <div className="text-xs text-gray-500 truncate w-full">
                            {previewContent.content}
                        </div>
                        <div className="text-xs text-blue-400 mt-2">Click to view</div>
                    </div>
                );

            case 'file-icon':
            default:
                return (
                    <div className="w-full h-full flex items-center justify-center">
                        {getFileIcon(previewContent.content)}
                    </div>
                );
        }
    };

    return (
        <div className={`relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg overflow-hidden ${className}`}>
            {renderPreview()}
        </div>
    );
};

export default FilePreview; 