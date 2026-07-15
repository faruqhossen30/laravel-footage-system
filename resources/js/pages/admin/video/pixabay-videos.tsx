// @ts-nocheck
import { route } from '@/lib/route';

import { Head, router, useForm, usePage } from '@inertiajs/react';
import BreadcumComponent from '@/components/old/Dashboard/BreadcumComponent';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/old/button';
import Pagination from '@/components/old/Pagination';
import Modal from '@/components/old/Modal';
import { useState } from 'react';

export default function PizabayVideos({ items = [], existIds = [], totalHits }) {
    const [showPlayer, setShowPlayer] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);

    const handlePlay = (video) => {
        setCurrentVideo(video);
        setShowPlayer(true);
    };

    const totalVideos = totalHits ?? 500;
    const params = route().params;
    const perpage = Number(params.per_page ?? 10);
    const page = Number(params.page ?? 1);
    const lastPage = Math.ceil(totalVideos / perpage);

    const generateLinks = () => {
        const links = [];
        const urlParams = { ...params };

        const makeUrl = (p) => {
            if (p < 1 || p > lastPage) return null;
            return route('video.create', { ...urlParams, page: p });
        };

        // Previous
        links.push({
            url: page > 1 ? makeUrl(page - 1) : null,
            label: '&laquo; Previous',
            active: false
        });

        const delta = 2;
        const range = [];
        for (let i = Math.max(2, page - delta); i <= Math.min(lastPage - 1, page + delta); i++) {
            range.push(i);
        }

        if (page - delta > 2) {
            range.unshift('...');
        }
        if (page + delta < lastPage - 1) {
            range.push('...');
        }

        range.unshift(1);
        if (lastPage > 1) {
            range.push(lastPage);
        }

        range.forEach(i => {
            if (i === '...') {
                links.push({ url: null, label: '...', active: false });
            } else {
                links.push({
                    url: makeUrl(i),
                    label: i.toString(),
                    active: page === i
                });
            }
        });

        // Next
        links.push({
            url: page < lastPage ? makeUrl(page + 1) : null,
            label: 'Next &raquo;',
            active: false
        });

        return links;
    };

    const links = generateLinks();

    const pagination = {
        total: totalVideos,
        from: (page - 1) * perpage + 1,
        to: Math.min(page * perpage, totalVideos),
        current_page: page,
        last_page: lastPage,
    };




    const { data, setData, post, processing, errors, reset } = useForm({
        videos: [],
    });

    function submit(e) {
        e.preventDefault()
        console.log(data);

        post(route('video.pixabay.store'));
    }


    return <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between py-3 space-x-5">
            <div className="flex items-center flex-1  px-3 border bg-white dark:border-gray-700 rounded-md">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                    onChange={(e) => {
                        return router.get(route('video.create', params),
                            {
                                search: e.target.value
                            },
                            {
                                preserveState: true,
                                replace: true
                            }
                        )
                    }}
                    defaultValue={params.search && params.search}
                    type="text" name="search" className="py-2 block w-full dark:bg-transparent border-gray-200 dark:border-gray-700 rounded-lg text-sm border-none focus:ring-0" placeholder="Search" />
            </div>
            <div className="space-x-5 flex items-center">
                <select name="order"
                    onChange={(e) => {
                        return router.get(route('video.create', params),
                            {
                                order: e.target.value
                            },
                            {
                                preserveState: true,
                                replace: true
                            }
                        )
                    }}
                    defaultValue={params.order && params.order}
                    className="py-2 px-3 pe-9 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                    <option value="popular">Popular</option>
                    <option value="latest">Latest</option>
                </select>
                
                <select name="per_page"
                    onChange={(e) => {
                        return router.get(route('video.create', params),
                            {
                                per_page: e.target.value
                            },
                            {
                                preserveState: true,
                                replace: true
                            }
                        )
                    }}
                    className="py-2 px-3 pe-9 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                </select>
            </div>
        </div>

        {processing && <div>
            <p>processing</p>
        </div>}

        <form onSubmit={submit}>
            <div className="flex items-center gap-2 mb-3">
                <Button size="sm"
                    onClick={() => setData('videos', items.map(i => (
                        {
                            id: i.id,
                            thumbnail: i.videos.medium?.thumbnail,
                            url: i.videos.medium?.url,
                            tags: i.tags,
                            width: i.videos.medium?.width,
                            height: i.videos.medium?.height,
                            size: i.videos.medium?.size,
                            duration: i.duration
                        }
                    )))}
                    disabled={items.length > 0 && data.videos.length === items.length}
                >Select All</Button>
                <Button size="sm" variant="secondary"
                    onClick={() => setData('videos', [])}
                    disabled={data.videos.length === 0}
                >Unselect All</Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`relative flex items-center space-x-3 rounded-lg border ${existIds.includes(item.id) ? 'border-green-700 shadow-gray-700' : 'dark:border-gray-700 border-gray-300'}  bg-white dark:bg-gray-800 p-3 shadow-sm  hover:border-gray-400`}
                    >
                        <div className="flex h-6 items-center">
                            <input
                                id={`links-${index}`}
                                name=""
                                type="checkbox"
                                aria-describedby="links-description"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                checked={data.videos.some(i => i.id === item.id)}
                                onChange={(e) => {
                                    const { checked } = e.target;
                                    if (checked) {
                                        // Add selected item (id, previewURL) without duplicates
                                        if (!data.videos.some(i => i.id === item.id)) {
                                            setData('videos', [...data.videos,
                                            {
                                                id: item.id,
                                                thumbnail: item.videos.medium?.thumbnail,
                                                url: item.videos.medium?.url,
                                                tags: item.tags,
                                                width: item.videos.medium?.width,
                                                height: item.videos.medium?.height,
                                                size: item.videos.medium?.size,
                                                duration: item.duration
                                            }
                                            ]);
                                        }
                                    } else {
                                        // Remove item when unchecked
                                        setData('videos', data.videos.filter(i => i.id !== item.id));
                                    }
                                }}
                            />
                        </div>
                        <div className="flex-shrink-0 relative group cursor-pointer" onClick={() => handlePlay(item)}>
                            <img alt="" src={item.videos.medium?.thumbnail} className="h-16 rounded-md" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all rounded-md">
                                <PlayIcon className="w-8 h-8 text-white opacity-80 group-hover:opacity-100" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="focus:outline-none">
                                {/* Ensure overlay doesn't block interactions like checkbox clicks */}
                                <span aria-hidden="true" className="absolute inset-0 pointer-events-none" />
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-400">Tags : {item.tags}</p>
                                <div className="truncate text-sm text-gray-800 dark:text-gray-400">
                                    <span>Duration: <span className="font-extrabold">{item.duration}</span>s </span>
                                    <span>Size: <span className="font-bold italic">{(item.videos.medium?.size / 1024 / 1024).toFixed(2)}</span> MB </span>
                                    <span>Width x Height: {item.videos.medium?.width} x {item.videos.medium?.height} </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
            <div className="py-5">
                <Button type="submit" >Save</Button>
            </div>
            <div className="py-5">
                <Pagination pagination={pagination} links={links} />
            </div>
        </form>

        <Modal show={showPlayer} maxWidth="3xl" onClose={() => setShowPlayer(false)}>
            {currentVideo && (
                <div className="bg-black">
                    <video
                        src={currentVideo.videos.medium?.url}
                        controls
                        autoPlay
                        className="w-full max-h-[80vh] mx-auto"
                        poster={currentVideo.videos.medium?.thumbnail}
                    />
                    <div className="p-4 bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-400">
                                    Tags: {currentVideo.tags}
                                </p>
                                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span>Duration: {currentVideo.duration}s</span>
                                    <span>Size: {(currentVideo.videos.medium?.size / 1024 / 1024).toFixed(2)} MB</span>
                                    <span>Resolution: {currentVideo.videos.medium?.width} x {currentVideo.videos.medium?.height}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>

    </div>
}
