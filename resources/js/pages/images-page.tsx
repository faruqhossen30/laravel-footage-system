// @ts-nocheck
import { route } from '@/lib/route';
import React, { useState } from 'react';
import {
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    XMarkIcon,
    FolderIcon,
    Squares2X2Icon,
    PhotoIcon,
    VideoCameraIcon,
    ClipboardDocumentIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { Link, router, Head } from '@inertiajs/react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import Modal from '@/components/old/Modal';
import ImageCard from '@/components/image-card';
import Pagination from '@/components/old/Pagination';
import { Select } from '@/components/old/select';

const ImagesPage = ({ images, filters = {}, categories = [], tags = [], disk_file_location }) => {
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [modalCopied, setModalCopied] = useState(false);

    const handlePreview = (image) => {
        setCurrentImage(image);
        setPreviewModalOpen(true);
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

        router.get(route('images'), newFilters, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const formatSize = (bytes) => {
        if (!bytes || isNaN(bytes)) return null;
        const num = Number(bytes);
        if (num >= 1024 * 1024) {
            return `${(num / (1024 * 1024)).toFixed(2)} MB`;
        }
        return `${(num / 1024).toFixed(0)} KB`;
    };

    const activeCategoryObj = categories.find((c) => c.slug === filters.category);
    const activeSubCategoryObj = activeCategoryObj?.sub_categories?.find((s) => s.slug === filters.subcategory);

    const fullImageUrl = currentImage
        ? (currentImage.file_path ? `/server/${currentImage.file_path}` : (currentImage.thumbnail ? `/server/${currentImage.thumbnail}` : ''))
        : '';

    const modalDiskPath = currentImage
        ? (currentImage.disk_path || (currentImage.file_path ? `${disk_file_location || '/Volumes/Files/server/'}${currentImage.file_path}` : ''))
        : '';

    const handleModalCopyPath = async () => {
        if (!modalDiskPath) return;
        try {
            await navigator.clipboard.writeText(modalDiskPath);
            setModalCopied(true);
            setTimeout(() => setModalCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy image path', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <Head title="Browse & Search Free Stock Images" />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
                <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    {/* Brand */}
                    <div className="flex items-center gap-6">
                        <Link href={route('homepage')} className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Footage
                        </Link>

                        {/* Media Type Switcher Tabs */}
                        <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                            <Link
                                href={route('homepage')}
                                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
                            >
                                <VideoCameraIcon className="h-4 w-4" />
                                <span>Videos</span>
                            </Link>
                            <Link
                                href={route('images')}
                                className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400 transition"
                            >
                                <PhotoIcon className="h-4 w-4" />
                                <span>Images</span>
                            </Link>
                        </div>
                    </div>

                    {/* Inline Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-4">
                        <div className="relative w-full">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters.search}
                                onChange={(e) => updateFilter('search', e.target.value)}
                                className="block w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                                placeholder="Search all images..."
                            />
                        </div>
                    </div>

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
                <div className="px-4 pb-3 md:hidden">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            defaultValue={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="block w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-xs placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            placeholder="Search images..."
                        />
                    </div>
                </div>
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
                                    type="button"
                                    onClick={() => updateFilter('category', '')}
                                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition ${!filters.category
                                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <Squares2X2Icon className="h-4 w-4 text-indigo-500" />
                                        <span>All Categories</span>
                                    </span>
                                </button>

                                {categories.map((category) => (
                                    <Disclosure as="div" key={category.id} defaultOpen={filters.category === category.slug}>
                                        {({ open }) => (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateFilter('category', category.slug)}
                                                        className={`flex flex-1 items-center justify-between rounded-lg px-2.5 py-2 text-sm transition ${filters.category === category.slug
                                                                ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-2 truncate">
                                                            <FolderIcon className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                                                            <span className="truncate">{category.name}</span>
                                                        </span>
                                                        {category.images_count != null && (
                                                            <span className="ml-1 text-xs text-gray-400">
                                                                ({category.images_count})
                                                            </span>
                                                        )}
                                                    </button>
                                                    {category.sub_categories?.length > 0 && (
                                                        <Disclosure.Button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                            <ChevronUpIcon
                                                                className={`${open ? 'rotate-180 transform' : ''} h-4 w-4 transition-transform`}
                                                            />
                                                        </Disclosure.Button>
                                                    )}
                                                </div>

                                                {category.sub_categories?.length > 0 && (
                                                    <Disclosure.Panel className="mt-1 space-y-1 pl-4">
                                                        {category.sub_categories.map((sub) => (
                                                            <button
                                                                key={sub.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    updateFilter('category', category.slug);
                                                                    updateFilter('subcategory', sub.slug);
                                                                }}
                                                                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition ${filters.subcategory === sub.slug
                                                                        ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                                                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                                                    }`}
                                                            >
                                                                <span className="flex items-center gap-1.5 truncate">
                                                                    <ChevronRightIcon
                                                                        className={`h-3 w-3 ${filters.subcategory === sub.slug ? 'text-indigo-500' : 'text-gray-400'
                                                                            }`}
                                                                    />
                                                                    <span className="truncate">{sub.name}</span>
                                                                </span>
                                                                {sub.images_count != null && (
                                                                    <span className="text-[11px] text-gray-400">
                                                                        ({sub.images_count})
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

                            {/* Sidebar Popular Tags */}
                            {tags && tags.length > 0 && (
                                <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
                                    <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Popular Tags</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => updateFilter('tag', filters.tag === tag.slug ? '' : tag.slug)}
                                                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${filters.tag === tag.slug
                                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750'
                                                    }`}
                                            >
                                                {tag.name}
                                                {tag.images_count != null && (
                                                    <span className="ml-1 text-[10px] opacity-75">
                                                        ({tag.images_count})
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1">
                        {/* Header Stats & Controls */}
                        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {filters.search
                                        ? `Results for "${filters.search}"`
                                        : activeSubCategoryObj
                                            ? `${activeSubCategoryObj.name} Images`
                                            : activeCategoryObj
                                                ? `${activeCategoryObj.name} Images`
                                                : filters.tag
                                                    ? `Tag: #${filters.tag}`
                                                    : 'All Stock Images'}
                                </h2>
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                    {images.total} images found
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Per page */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
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

                                {/* Order */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Order
                                    </span>
                                    <div className="w-36">
                                        <Select
                                            value={filters.order || 'desc'}
                                            onChange={(e) => updateFilter('order', e.target.value)}
                                        >
                                            <option value="desc">Newest First</option>
                                            <option value="asc">Oldest First</option>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Filter Badges */}
                        {(filters.search || filters.category || filters.subcategory || filters.tag) && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active filters:</span>
                                {filters.search && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                        Query: "{filters.search}"
                                        <button type="button" onClick={() => updateFilter('search', '')} className="hover:opacity-75">
                                            <XMarkIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </span>
                                )}
                                {filters.category && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                        Category: {activeCategoryObj?.name || filters.category}
                                        <button type="button" onClick={() => updateFilter('category', '')} className="hover:opacity-75">
                                            <XMarkIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </span>
                                )}
                                {filters.subcategory && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                        SubCategory: {activeSubCategoryObj?.name || filters.subcategory}
                                        <button type="button" onClick={() => updateFilter('subcategory', '')} className="hover:opacity-75">
                                            <XMarkIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </span>
                                )}
                                {filters.tag && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                                        Tag: #{filters.tag}
                                        <button type="button" onClick={() => updateFilter('tag', '')} className="hover:opacity-75">
                                            <XMarkIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => router.visit(route('images'))}
                                    className="text-xs text-red-600 hover:underline dark:text-red-400"
                                >
                                    Reset all
                                </button>
                            </div>
                        )}

                        {/* Images Grid */}
                        {images.data && images.data.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {images.data.map((image) => (
                                    <ImageCard
                                        key={image.id}
                                        image={image}
                                        onPreview={handlePreview}
                                        diskFileLocation={disk_file_location}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 py-16 text-center dark:border-gray-800">
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-white">No images found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Try adjusting your search query or removing some filters.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => router.visit(route('images'))}
                                    className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="mt-10">
                            <Pagination pagination={images} links={images.links} />
                        </div>
                    </main>
                </div>
            </div>

            {/* Lightbox / Modal Image Preview */}
            <Modal show={previewModalOpen} maxWidth="2xl" onClose={() => setPreviewModalOpen(false)}>
                {currentImage && (
                    <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-900">
                        {/* High-res Image View */}
                        <div className="relative flex max-h-[70vh] items-center justify-center bg-black/95 p-2">
                            <img
                                src={fullImageUrl}
                                alt={currentImage.title || 'Preview'}
                                className="max-h-[65vh] w-auto max-w-full object-contain rounded"
                            />
                        </div>

                        {/* Metadata & Actions */}
                        <div className="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                    {currentImage.width && currentImage.height && (
                                        <span><strong>Dimensions:</strong> {currentImage.width}×{currentImage.height}</span>
                                    )}
                                    {currentImage.size && (
                                        <span><strong>Size:</strong> {formatSize(currentImage.size)}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {modalDiskPath && (
                                        <button
                                            type="button"
                                            onClick={handleModalCopyPath}
                                            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold shadow-sm transition ${modalCopied
                                                    ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                                                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                            title={modalDiskPath}
                                        >
                                            {modalCopied ? (
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
                                        href={fullImageUrl}
                                        download={currentImage.file_name || `image_${currentImage.id}.jpg`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition"
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                        <span>Download</span>
                                    </a>
                                </div>
                            </div>

                            {/* Tags in modal */}
                            {currentImage.tags && currentImage.tags.length > 0 && (
                                <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
                                    <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Tags:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {currentImage.tags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => {
                                                    setPreviewModalOpen(false);
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

            {/* Mobile Filters Drawer Overlay */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />

                    <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-2xl dark:bg-gray-900">
                        <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Filters</h2>
                            <button
                                type="button"
                                className="rounded-md p-1.5 text-gray-400 hover:text-gray-500 dark:hover:text-white"
                                onClick={() => setMobileFiltersOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="px-4 py-4 space-y-4">
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Categories</h3>
                                <div className="space-y-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            updateFilter('category', '');
                                            setMobileFiltersOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm ${!filters.category
                                                ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                                                : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Squares2X2Icon className="h-4 w-4 text-indigo-500" />
                                            <span>All Categories</span>
                                        </span>
                                    </button>

                                    {categories.map((category) => (
                                        <div key={category.id} className="space-y-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    updateFilter('category', category.slug);
                                                    setMobileFiltersOpen(false);
                                                }}
                                                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm ${filters.category === category.slug
                                                        ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <FolderIcon className="h-4 w-4 text-indigo-500" />
                                                    <span>{category.name}</span>
                                                </span>
                                                {category.images_count != null && (
                                                    <span className="text-xs text-gray-400">({category.images_count})</span>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

ImagesPage.layout = null;

export default ImagesPage;
