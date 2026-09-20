// @ts-nocheck
import { route } from '@/lib/route';
import React, { useState, useEffect, useRef } from 'react';
import {
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    XMarkIcon,
    FolderIcon,
    Squares2X2Icon,
    TagIcon,
    VideoCameraIcon,
    PhotoIcon,
    ClipboardDocumentIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { Link, router, Head } from '@inertiajs/react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import Modal from '@/components/old/Modal';
import VideoCard from '@/components/old/HomePage/VideoCard';
import Pagination from '@/components/old/Pagination';
import { Select } from '@/components/old/select';

const HomePage = ({
    videos = { data: [], links: [], total: 0 },
    filters = {},
    categories = [],
    tags = [],
    disk_file_location = '/Volumes/Files/server/',
}) => {
    const [showPlayer, setShowPlayer] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [videoCopied, setVideoCopied] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const isFirstRender = useRef(true);

    useEffect(() => {
        setSearchTerm(filters.search || '');
    }, [filters.search]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                updateFilter('search', searchTerm);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handlePlay = (video) => {
        setCurrentVideo(video);
        setShowPlayer(true);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };

        // Clear subcategory if category changes
        if (key === 'category') {
            delete newFilters.subcategory;
        }

        // Remove empty or undefined filters
        Object.keys(newFilters).forEach((k) => {
            if (!newFilters[k]) {
                delete newFilters[k];
            }
        });

        // Determine destination route safely: /search or / (homepage)
        const targetUrl = typeof window !== 'undefined' && window.location.pathname.startsWith('/search')
            ? route('search')
            : route('homepage');

        router.get(targetUrl, newFilters, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        updateFilter('search', searchTerm);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        updateFilter('search', '');
    };

    const modalDiskPath = currentVideo
        ? (currentVideo.disk_path || (currentVideo.file_path ? `${disk_file_location}${currentVideo.file_path}` : ''))
        : '';

    const handleCopyPath = async () => {
        if (!modalDiskPath) return;
        try {
            await navigator.clipboard.writeText(modalDiskPath);
            setVideoCopied(true);
            setTimeout(() => setVideoCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <Head title="Search & Browse Stock Videos" />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
                <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    {/* Brand & Switcher */}
                    <div className="flex items-center gap-6">
                        <Link href={route('homepage')} className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Footage
                        </Link>

                        {/* Media Type Switcher Tabs */}
                        <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                            <Link
                                href={route('homepage', filters.search ? { search: filters.search } : {})}
                                className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400 transition"
                            >
                                <VideoCameraIcon className="h-4 w-4" />
                                <span>Videos</span>
                            </Link>
                            <Link
                                href={route('images', filters.search ? { search: filters.search } : {})}
                                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
                            >
                                <PhotoIcon className="h-4 w-4" />
                                <span>Images</span>
                            </Link>
                        </div>
                    </div>

                    {/* Inline Search Bar (Desktop) */}
                    <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-4">
                        <div className="relative w-full">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                name="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-10 text-sm placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                                placeholder="Search all videos..."
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    title="Clear search"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Mobile filter toggle button */}
                    <button
                        type="button"
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    >
                        <span className="sr-only">Open Filters</span>
                        <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Mobile Search Bar */}
                <form onSubmit={handleSearchSubmit} className="px-4 pb-3 md:hidden">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-9 text-xs placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            placeholder="Search videos..."
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                title="Clear search"
                            >
                                <XMarkIcon className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </form>
            </header>

            {/* Main Content Area: Sidebar + Grid */}
            <div className="container mx-auto px-4 py-8 sm:px-6">
                <div className="flex items-start gap-8">
                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden w-64 flex-shrink-0 lg:block">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Categories</h3>

                            <div className="space-y-1.5">
                                <button
                                    onClick={() => updateFilter('category', '')}
                                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition ${!filters.category
                                            ? 'bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-950/50 dark:text-indigo-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <span className="flex items-center">
                                        <Squares2X2Icon className="mr-2 h-4 w-4 text-indigo-500" />
                                        <span>All Categories</span>
                                    </span>
                                </button>

                                {categories.map((category) => (
                                    <Disclosure as="div" key={category.id} defaultOpen={filters.category === category.slug}>
                                        {({ open }) => (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        onClick={() => updateFilter('category', category.slug)}
                                                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition ${filters.category === category.slug
                                                                ? 'bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-950/50 dark:text-indigo-400'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        <span className="flex items-center truncate">
                                                            <FolderIcon className="mr-2 h-4 w-4 shrink-0 text-indigo-500" />
                                                            <span className="truncate">{category.name}</span>
                                                        </span>
                                                        {category.videos_count != null && (
                                                            <span className="ml-1 text-xs text-gray-400">
                                                                ({category.videos_count})
                                                            </span>
                                                        )}
                                                    </button>
                                                    {category.sub_categories?.length > 0 && (
                                                        <Disclosure.Button className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                                            <ChevronUpIcon
                                                                className={`${open ? 'rotate-180 transform' : ''} h-4 w-4 transition-transform`}
                                                            />
                                                        </Disclosure.Button>
                                                    )}
                                                </div>

                                                {category.sub_categories?.length > 0 && (
                                                    <Disclosure.Panel className="pl-4 pt-1 space-y-1">
                                                        {category.sub_categories.map((sub) => (
                                                            <button
                                                                key={sub.id}
                                                                onClick={() => updateFilter('subcategory', sub.slug)}
                                                                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1 text-xs transition ${filters.subcategory === sub.slug
                                                                        ? 'bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-950/50 dark:text-indigo-400'
                                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                                    }`}
                                                            >
                                                                <span className="flex items-center truncate">
                                                                    <ChevronRightIcon
                                                                        className={`mr-1.5 h-3 w-3 shrink-0 ${filters.subcategory === sub.slug
                                                                                ? 'text-indigo-500'
                                                                                : 'text-gray-400 dark:text-gray-500'
                                                                            }`}
                                                                    />
                                                                    <span className="truncate">{sub.name}</span>
                                                                </span>
                                                                {sub.videos_count != null && (
                                                                    <span className="ml-1 text-[11px] text-gray-400">
                                                                        ({sub.videos_count})
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </Disclosure.Panel>
                                                )}
                                            </>
                                        )}
                                    </Disclosure>
                                ))}
                            </div>

                            {/* Popular Tags */}
                            {tags.length > 0 && (
                                <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-1.5 mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                                        <TagIcon className="h-4 w-4 text-indigo-500" />
                                        <span>Popular Tags</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                onClick={() => updateFilter('tag', tag.slug === filters.tag ? '' : tag.slug)}
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition ${filters.tag === tag.slug
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content (Videos Grid) */}
                    <main className="flex-1 min-w-0">
                        {/* Header Controls */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {filters.search
                                        ? `Results for "${filters.search}"`
                                        : filters.category
                                            ? categories.find((c) => c.slug === filters.category)?.name || 'Category'
                                            : filters.tag
                                                ? `Tag: ${filters.tag}`
                                                : 'All Videos'}
                                </h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {videos.total || 0} videos found
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Per page
                                    </span>
                                    <div className="w-24">
                                        <Select
                                            value={filters.show || '12'}
                                            onChange={(e) => updateFilter('show', e.target.value)}
                                        >
                                            <option value="12">12</option>
                                            <option value="24">24</option>
                                            <option value="36">36</option>
                                            <option value="48">48</option>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Order
                                    </span>
                                    <div className="w-36">
                                        <Select
                                            value={filters.order || 'desc'}
                                            onChange={(e) => updateFilter('order', e.target.value)}
                                        >
                                            <option value="desc">Newest (DESC)</option>
                                            <option value="asc">Oldest (ASC)</option>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Videos Grid */}
                        {videos.data && videos.data.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                                {videos.data.map((video) => (
                                    <VideoCard
                                        key={video.id}
                                        video={video}
                                        onPlay={handlePlay}
                                        onTagClick={(tagSlug) => updateFilter('tag', tagSlug)}
                                        diskFileLocation={disk_file_location}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-xl bg-white/50 dark:bg-gray-900/50">
                                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">No videos found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or search query.</p>
                                <button
                                    onClick={() => router.visit(route('homepage'))}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {videos.links && videos.links.length > 3 && (
                            <div className="mt-8">
                                <Pagination pagination={videos} links={videos.links} />
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filters Drawer */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-40 flex lg:hidden">
                    <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white dark:bg-gray-900 py-4 pb-12 shadow-xl">
                        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                            <button
                                type="button"
                                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                onClick={() => setMobileFiltersOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Mobile Categories Content */}
                        <div className="px-4 py-4 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Categories</h3>
                            <div className="space-y-1.5">
                                <button
                                    onClick={() => {
                                        updateFilter('category', '');
                                        setMobileFiltersOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm ${!filters.category
                                            ? 'bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-950/50 dark:text-indigo-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <span className="flex items-center">
                                        <Squares2X2Icon className="mr-2 h-4 w-4 text-indigo-500" />
                                        <span>All Categories</span>
                                    </span>
                                </button>

                                {categories.map((category) => (
                                    <div key={category.id} className="space-y-1">
                                        <button
                                            onClick={() => {
                                                updateFilter('category', category.slug);
                                                setMobileFiltersOpen(false);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm ${filters.category === category.slug
                                                    ? 'bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-950/50 dark:text-indigo-400'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <span className="flex items-center truncate">
                                                <FolderIcon className="mr-2 h-4 w-4 shrink-0 text-indigo-500" />
                                                <span className="truncate">{category.name}</span>
                                            </span>
                                            {category.videos_count != null && (
                                                <span className="ml-1 text-xs text-gray-400">
                                                    ({category.videos_count})
                                                </span>
                                            )}
                                        </button>
                                        {category.sub_categories?.length > 0 && (
                                            <div className="pl-4 space-y-1">
                                                {category.sub_categories.map((sub) => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => {
                                                            updateFilter('subcategory', sub.slug);
                                                            setMobileFiltersOpen(false);
                                                        }}
                                                        className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-xs ${filters.subcategory === sub.slug
                                                                ? 'bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-950/50 dark:text-indigo-400'
                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        <span className="flex items-center truncate">
                                                            <ChevronRightIcon
                                                                className={`mr-1.5 h-3 w-3 shrink-0 ${filters.subcategory === sub.slug
                                                                        ? 'text-indigo-500'
                                                                        : 'text-gray-400 dark:text-gray-500'
                                                                    }`}
                                                            />
                                                            <span className="truncate">{sub.name}</span>
                                                        </span>
                                                        {sub.videos_count != null && (
                                                            <span className="ml-1 text-[11px] text-gray-400">
                                                                ({sub.videos_count})
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Mobile Tags */}
                            {tags.length > 0 && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Popular Tags</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                onClick={() => {
                                                    updateFilter('tag', tag.slug === filters.tag ? '' : tag.slug);
                                                    setMobileFiltersOpen(false);
                                                }}
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium border ${filters.tag === tag.slug
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                                                    }`}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Video Player Modal */}
            <Modal show={showPlayer} maxWidth="xl" onClose={() => setShowPlayer(false)}>
                {currentVideo && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
                        <video
                            src={'/server/' + currentVideo.file_path}
                            controls
                            autoPlay
                            className="w-full aspect-video bg-black"
                            poster={currentVideo.thumbnail ? `/server/${currentVideo.thumbnail}` : undefined}
                        />
                        <div className="p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                        {currentVideo.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {formatDuration(currentVideo.duration)} • {currentVideo.width || 1920}×{currentVideo.height || 1080}
                                        {currentVideo.provider ? ` • ${currentVideo.provider}` : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {modalDiskPath && (
                                        <button
                                            type="button"
                                            onClick={handleCopyPath}
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition ${videoCopied
                                                    ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                                                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                            title={modalDiskPath}
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
                                    <a
                                        href={'/server/' + currentVideo.file_path}
                                        download
                                        className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm transition"
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                        <span>Download</span>
                                    </a>
                                </div>
                            </div>

                            {/* Tags in modal */}
                            {currentVideo.tags && currentVideo.tags.length > 0 && (
                                <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
                                    <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Tags:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {currentVideo.tags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => {
                                                    setShowPlayer(false);
                                                    updateFilter('tag', tag.slug);
                                                }}
                                                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
                                            >
                                                #{tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HomePage;
