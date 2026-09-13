// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { MagnifyingGlassIcon, PlayIcon, ArrowDownTrayIcon, HeartIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { BoltIcon, FireIcon, StarIcon } from '@heroicons/react/24/solid';
import Modal from '@/components/old/Modal';
import VideoCard from '@/components/old/HomePage/VideoCard';
import HeroSection from '@/components/old/HomePage/HeroSection';
import CategorySection from '@/components/old/HomePage/CategorySection';
import Pagination from '@/components/old/Pagination';


const HomePage = ({ videos }) => {


  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoCopied, setVideoCopied] = useState(false);

  const handlePlay = (video) => {
    setCurrentVideo(video);
    setShowPlayer(true);
  };

      // Simple time format helper
      const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">     
      <HeroSection />

      <CategorySection />
      {/* Grid */}
      <section className="container mx-auto py-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                <div className="aspect-video rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="mt-3 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.data.map((video) => (
              <VideoCard key={video.id} video={video} onPlay={handlePlay} />
            ))}
          </div>
        )}
      </section>

      <div className="container mx-auto pb-10">
        <Pagination pagination={videos} links={videos.links} />
      </div>

      {/* Player Modal */}
      <Modal show={showPlayer} maxWidth="xl" onClose={() => setShowPlayer(false)}>
        {currentVideo && (
          <div className="bg-white dark:bg-slate-800">
            <video src={'/server/' + currentVideo.file_path} controls autoPlay className="w-full" poster={currentVideo.thumbnail} />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-400">{currentVideo.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDuration(currentVideo.duration)} • {currentVideo.width}×{currentVideo.height} • {currentVideo.provider}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {currentVideo && (
                    <button
                      type="button"
                      onClick={async () => {
                        const path = currentVideo.disk_path || (currentVideo.file_path ? `/Volumes/Files/server/${currentVideo.file_path}` : '');
                        if (!path) return;
                        try {
                          await navigator.clipboard.writeText(path);
                          setVideoCopied(true);
                          setTimeout(() => setVideoCopied(false), 2000);
                        } catch (err) {
                          console.error('Failed to copy', err);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold shadow transition ${
                        videoCopied
                          ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                      title={currentVideo.disk_path || currentVideo.file_path}
                    >
                      {videoCopied ? (
                        <>
                          <CheckIcon className="h-4 w-4 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span>Copy Path</span>
                        </>
                      )}
                    </button>
                  )}
                  <button className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;
