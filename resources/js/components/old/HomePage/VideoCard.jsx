import { ArrowDownTrayIcon, HeartIcon, PlayIcon } from '@heroicons/react/24/outline';
import React from 'react'

const VideoCard = ({ video, onPlay }) => {
    // Simple time format helper
    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="aspect-video w-full overflow-hidden">
                <img
                    // src={`${video.thumbnail}`}
                    src={window.location.origin + '/server/' + video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
            </div>
            {/* Top-left badges */}
            <div className="absolute left-3 top-3 flex items-center gap-2">
                <span className="rounded bg-black/60 px-2 py-1 text-xs text-white">
                    {formatDuration(video.duration)}
                </span>
                <span className="rounded bg-black/60 px-2 py-1 text-xs text-white">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                </span>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-300" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => onPlay(video)}
                    className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-gray-900 shadow hover:bg-white"
                >
                    <PlayIcon className="h-5 w-5" />
                    <span className="text-sm font-semibold">Play</span>
                </button>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="flex items-center justify-between">
                    <p className="text-gray-100 text-sm line-clamp-1">{video.title}</p>
                </div>
            </div>

        </div>
    );
};

export default VideoCard