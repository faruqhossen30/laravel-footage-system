// @ts-nocheck
import { route } from '@/lib/route';
import React, { useState } from 'react';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, FunnelIcon, XMarkIcon, FolderIcon, Squares2X2Icon, TagIcon } from '@heroicons/react/24/outline';
import { Link, router, Head } from '@inertiajs/react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import Modal from '@/components/old/Modal';
import VideoCard from '@/components/old/HomePage/VideoCard';
import Pagination from '@/components/old/Pagination';
import { Select } from '@/components/old/select';

const SearchPage = ({ videos, filters, categories, tags }) => {
    const [showPlayer, setShowPlayer] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const handlePlay = (video) => {
        setCurrentVideo(video);
        setShowPlayer(true);
    };

    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        // If we select a category, we might want to clear the subcategory if it doesn't belong to it (simplified logic: clear subcategory on category change)
        if (key === 'category') {
            delete newFilters.subcategory;
        }
        // Remove empty filters
        Object.keys(newFilters).forEach(k => !newFilters[k] && delete newFilters[k]);

        router.get(route('search'), newFilters, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="min-h-screen  bg-gray-50 dark:bg-black">
            <Head title="Search Videos" />

            {/* Header / Search Bar */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <Link href={route('homepage')} className="text-xl font-bold text-gray-900 dark:text-white">
                        Footage
                    </Link>

                    <div className="flex-1 max-w-6xl">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                name="search"
                                className="block w-full rounded-full border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:bg-gray-900 sm:text-sm"
                                placeholder="Search videos..."
                                defaultValue={filters.search}
                                onChange={(e) => updateFilter('search', e.target.value)}
                            />
                        </div>
                    </div>

                     {/* Mobile filter button */}
                     <button
                        type="button"
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-500"
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    >
                        <span className="sr-only">Filters</span>
                        <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="mx-auto container">
                <div className="flex items-start gap-8 pt-8 pb-10">

                    {/* Sidebar (Desktop) */}
                    <aside className="hidden w-64 flex-shrink-0 lg:block">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Categories</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <button
                                    onClick={() => updateFilter('category', '')}
                                    className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm ${
                                        !filters.category
                                            ? 'bg-indigo-50 text-indigo-600 font-semibold'
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
                                                        className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm ${
                                                            filters.category === category.slug
                                                                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        <span className="flex items-center">
                                                            <FolderIcon className="mr-2 h-4 w-4 text-indigo-500" />
                                                            <span>{category.name}</span>
                                                        </span>
                                                        {category.videos_count != null && (
                                                            <span className="ml-1 text-xs text-gray-400">
                                                                ({category.videos_count})
                                                            </span>
                                                        )}
                                                    </button>
                                                    {category.sub_categories?.length > 0 && (
                                                        <Disclosure.Button className="p-1 text-gray-400 hover:text-gray-500">
                                                            <ChevronUpIcon
                                                                className={`${open ? 'rotate-180 transform' : ''} h-4 w-4`}
                                                            />
                                                        </Disclosure.Button>
                                                    )}
                                                </div>
                                                <Disclosure.Panel className="pl-4 pt-2 space-y-2">
                                                    {category.sub_categories.map((sub) => (
                                                        <button
                                                            key={sub.id}
                                                            onClick={() => updateFilter('subcategory', sub.slug)}
                                                            className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm ${
                                                                filters.subcategory === sub.slug
                                                                    ? 'bg-indigo-50 text-indigo-500 font-semibold'
                                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                        >
                                                            <span className="flex items-center">
                                                                <ChevronRightIcon
                                                                    className={`mr-2 h-3 w-3 ${
                                                                        filters.subcategory === sub.slug
                                                                            ? 'text-indigo-500'
                                                                            : 'text-gray-400 dark:text-gray-500'
                                                                    }`}
                                                                />
                                                                <span>{sub.name}</span>
                                                            </span>
                                                            {sub.videos_count != null && (
                                                                <span className="ml-1 text-xs text-gray-400">
                                                                    ({sub.videos_count})
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </Disclosure.Panel>
                                            </>
                                        )}
                                    </Disclosure>
                                ))}
                            </div>

                            {/* Sidebar Tags */}
                            <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Popular Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <button
                                            key={tag.id}
                                            onClick={() => updateFilter('tag', tag.slug === filters.tag ? '' : tag.slug)}
                                            className={`rounded-full px-2 py-1 text-xs font-medium border ${filters.tag === tag.slug
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-black dark:text-gray-300 dark:border-gray-700'
                                            }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">

                        {/* Stats, Title, Controls */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {filters.search ? `Results for "${filters.search}"` :
                                     filters.category ? categories.find(c => c.slug === filters.category)?.name || 'Category' :
                                     filters.tag ? `Tag: ${filters.tag}` :
                                     'All Videos'}
                                </h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {videos.total} videos found
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Per page
                                    </span>
                                    <div className="w-28">
                                        <Select
                                            value={filters.show || '10'}
                                            onChange={(e) => updateFilter('show', e.target.value)}
                                        >
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                            <option value="30">30</option>
                                            <option value="50">50</option>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Order
                                    </span>
                                    <div className="w-40">
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
                        {videos.data.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                                {videos.data.map((video) => (
                                    <VideoCard key={video.id} video={video} onPlay={handlePlay} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No videos found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms.</p>
                                <button
                                    onClick={() => router.visit(route('search'))}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        <div className="mt-8">
                            <Pagination pagination={videos} links={videos.links} />
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile Filters (Overlay) */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-40 flex lg:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white dark:bg-gray-900 py-4 pb-12 shadow-xl">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
                            <button
                                type="button"
                                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white dark:bg-gray-900 p-2 text-gray-400"
                                onClick={() => setMobileFiltersOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Mobile Sidebar Content */}
                        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 px-4 py-6">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Categories</h3>
                             <div className="space-y-2">
                                <button
                                    onClick={() => { updateFilter('category', ''); setMobileFiltersOpen(false); }}
                                    className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm ${
                                        !filters.category
                                            ? 'bg-indigo-50 text-indigo-600 font-semibold'
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
                                            onClick={() => { updateFilter('category', category.slug); setMobileFiltersOpen(false); }}
                                            className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm ${
                                                filters.category === category.slug
                                                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <span className="flex items-center">
                                                <FolderIcon className="mr-2 h-4 w-4 text-indigo-500" />
                                                <span>{category.name}</span>
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
                                                        onClick={() => { updateFilter('subcategory', sub.slug); setMobileFiltersOpen(false); }}
                                                        className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm ${
                                                            filters.subcategory === sub.slug
                                                                ? 'bg-indigo-50 text-indigo-500 font-semibold'
                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        <span className="flex items-center">
                                                            <ChevronRightIcon
                                                                className={`mr-2 h-3 w-3 ${
                                                                    filters.subcategory === sub.slug
                                                                        ? 'text-indigo-500'
                                                                        : 'text-gray-400 dark:text-gray-500'
                                                                }`}
                                                            />
                                                            <span>{sub.name}</span>
                                                        </span>
                                                        {sub.videos_count != null && (
                                                            <span className="ml-1 text-xs text-gray-400">
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
                        </div>
                    </div>
                </div>
            )}

            {/* Player Modal */}
            <Modal show={showPlayer} maxWidth="xl" onClose={() => setShowPlayer(false)}>
                {currentVideo && (
                    <div className="bg-white dark:bg-slate-800">
                        <video
                            src={window.location.origin + '/server/' + currentVideo.file_path}
                            controls
                            autoPlay
                            className="w-full"
                            poster={currentVideo.thumbnail}
                        />
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-400">
                                        {currentVideo.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatDuration(currentVideo.duration)} • {currentVideo.width}×{currentVideo.height} • {currentVideo.provider}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
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

export default SearchPage;
