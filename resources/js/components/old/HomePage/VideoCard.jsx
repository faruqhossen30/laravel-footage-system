// @ts-nocheck
import React, { useState } from 'react';
import { ArrowDownTrayIcon, PlayIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

const VideoCard = ({ video, onPlay }) => {
    const [copied, setCopied] = useState(false);

    // Simple time format helper
    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Full disk path according to VideoResource: env('DISK_FILE_LOCATION') . $video->file_path
    const diskPath = video.disk_path || (video.file_path ? `/Volumes/Files/server/${video.file_path}` : '');

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
            <div className="aspect-video w-full overflow-hidden cursor-pointer" onClick={() => onPlay(video)}>
                <img
                    src={'/server/' + video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
            </div>
            {/* Top-left badges */}
            <div className="absolute left-3 top-3 flex items-center gap-2 pointer-events-none">
                <span className="rounded bg-black/60 px-2 py-1 text-xs text-white">
                    {formatDuration(video.duration)}
                </span>
                <span className="rounded bg-black/60 px-2 py-1 text-xs text-white">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                </span>
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

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pointer-events-none">
                <div className="flex items-center justify-between">
                    <p className="text-gray-100 text-sm line-clamp-1">{video.title}</p>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;