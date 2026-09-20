// @ts-nocheck
import React, { useState } from 'react';
import { ArrowDownTrayIcon, PlayIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

const VideoCard = ({ video, onPlay, onTagClick, diskFileLocation }) => {
    const [copied, setCopied] = useState(false);

    // Simple time format helper
    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Full disk path according to VideoResource: env('DISK_FILE_LOCATION') . $video->file_path
    const diskPath = video.disk_path || (video.file_path ? `${diskFileLocation || '/Volumes/Files/server/'}${video.file_path}` : '');

    const handleCopyPath = async (e) => {
        e.stopPropagation();
        if (!diskPath) return;

        try {
            await navigator.clipboard.writeText(diskPath);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy video path', err);
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="aspect-video w-full overflow-hidden cursor-pointer bg-gray-200 dark:bg-gray-900" onClick={() => onPlay(video)}>
                <img
                    src={'/server/' + video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
            </div>
            {/* Top-left badges */}
            <div className="absolute left-3 top-3 flex items-center gap-2 pointer-events-none">
                {video.duration ? (
                    <span className="rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                        {formatDuration(video.duration)}
                    </span>
                ) : null}
                {video.width && video.height ? (
                    <span className="rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                        {video.width}×{video.height}
                    </span>
                ) : null}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-300 pointer-events-none" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    type="button"
                    onClick={() => onPlay(video)}
                    className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-gray-900 shadow hover:bg-white transition"
                    title="Play Video"
                >
                    <PlayIcon className="h-4 w-4 text-gray-700" />
                    <span>Play</span>
                </button>

                {diskPath && (
                    <button
                        type="button"
                        onClick={handleCopyPath}
                        className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow transition ${
                            copied
                                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                                : 'bg-white/95 text-gray-900 hover:bg-white'
                        }`}
                        title={diskPath}
                    >
                        {copied ? (
                            <>
                                <CheckIcon className="h-4 w-4 text-white" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <ClipboardDocumentIcon className="h-4 w-4 text-gray-700" />
                                <span>Copy Path</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Bottom content: Title and Tags like ImageCard */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pointer-events-none">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-100 text-xs font-medium line-clamp-1">
                        {video.title || (video.tags && video.tags.length > 0 ? video.tags.slice(0, 2).map((t) => t.name).join(', ') : 'Stock Video')}
                    </p>
                </div>
                {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {video.tags.slice(0, 3).map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onTagClick) {
                                        onTagClick(tag.slug);
                                    }
                                }}
                                className="pointer-events-auto text-[10px] text-gray-300 hover:text-white transition"
                                title={`Filter by tag: ${tag.name}`}
                            >
                                #{tag.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCard;