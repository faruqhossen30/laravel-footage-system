// @ts-nocheck
import React, { useState } from 'react';
import { ArrowDownTrayIcon, EyeIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

const ImageCard = ({ image, onPreview, diskFileLocation }) => {
    const [copied, setCopied] = useState(false);

    const formatSize = (bytes) => {
        if (!bytes || isNaN(bytes)) return null;
        const num = Number(bytes);
        if (num >= 1024 * 1024) {
            return `${(num / (1024 * 1024)).toFixed(1)} MB`;
        }
        return `${(num / 1024).toFixed(0)} KB`;
    };

    const imageSrc = image.thumbnail ? `/server/${image.thumbnail}` : (image.file_path ? `/server/${image.file_path}` : '');
    const downloadSrc = image.file_path ? `/server/${image.file_path}` : imageSrc;

    // Full disk path according to ImageResource or disk_path attribute
    const diskPath = image.disk_path || (image.file_path ? `${diskFileLocation || ''}${image.file_path}` : '');

    const handleCopyPath = async (e) => {
        e.stopPropagation();
        if (!diskPath) return;

        try {
            await navigator.clipboard.writeText(diskPath);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy image path', err);
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            {/* Image Container */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-200 dark:bg-gray-900 cursor-pointer" onClick={() => onPreview(image)}>
                <img
                    src={imageSrc}
                    alt="Stock Image"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
            </div>

            {/* Top Badges */}
            <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
                {image.width && image.height && (
                    <span className="rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-white shadow">
                        {image.width}×{image.height}
                    </span>
                )}
                {image.size && (
                    <span className="rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-white shadow">
                        {formatSize(image.size)}
                    </span>
                )}
            </div>

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 pointer-events-none" />
            
            <div className="pointer-events-none absolute inset-0 flex flex-wrap items-center justify-center gap-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPreview(image);
                    }}
                    className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-lg hover:bg-white transition"
                    title="View Image"
                >
                    <EyeIcon className="h-3.5 w-3.5 text-gray-700" />
                    <span>Preview</span>
                </button>

                {diskPath && (
                    <button
                        type="button"
                        onClick={handleCopyPath}
                        className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg transition ${
                            copied
                                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                                : 'bg-white/95 text-gray-900 hover:bg-white'
                        }`}
                        title={diskPath}
                    >
                        {copied ? (
                            <>
                                <CheckIcon className="h-3.5 w-3.5 text-white" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <ClipboardDocumentIcon className="h-3.5 w-3.5 text-gray-700" />
                                <span>Copy Path</span>
                            </>
                        )}
                    </button>
                )}

                <a
                    href={downloadSrc}
                    download={image.file_name || `image_${image.id}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-indigo-500 transition"
                    title="Download Image"
                >
                    <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                    <span>Download</span>
                </a>
            </div>

            {/* Bottom Info Bar (Tags only) */}
            {image.tags && image.tags.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 pointer-events-none">
                    <div className="flex flex-wrap gap-1">
                        {image.tags.slice(0, 3).map((tag) => (
                            <span key={tag.id} className="text-[10px] text-gray-300">
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageCard;
