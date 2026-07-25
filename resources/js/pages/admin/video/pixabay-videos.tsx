// @ts-nocheck
import { route } from '@/lib/route';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/old/Pagination';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
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
        post(route('video.pixabay.store'));
    }

    return <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Head title="Pixabay Videos" />
        
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={route("dashboard")}>Dashboard</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={route("video.index")}>Videos</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Import from Pixabay</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <Card>
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between py-3 space-y-3 sm:space-y-0 sm:space-x-5">
                    <div className="flex items-center flex-1 w-full px-3 border bg-white dark:bg-slate-900 dark:border-gray-700 rounded-md">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        <input
                            onChange={(e) => {
                                return router.get(route('video.create', params),
                                    { search: e.target.value },
                                    { preserveState: true, replace: true }
                                )
                            }}
                            defaultValue={params.search && params.search}
                            type="text" name="search" className="py-2 block w-full dark:bg-transparent border-gray-200 dark:border-gray-700 rounded-lg text-sm border-none focus:ring-0" placeholder="Search pixabay videos..." />
                    </div>
                    <div className="space-x-2 sm:space-x-5 flex items-center w-full sm:w-auto">
                        <select name="order"
                            onChange={(e) => {
                                return router.get(route('video.create', params),
                                    { order: e.target.value },
                                    { preserveState: true, replace: true }
                                )
                            }}
                            defaultValue={params.order && params.order}
                            className="py-2 px-3 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-neutral-400">
                            <option value="popular">Popular</option>
                            <option value="latest">Latest</option>
                        </select>
                        
                        <select name="per_page"
                            onChange={(e) => {
                                return router.get(route('video.create', params),
                                    { per_page: e.target.value },
                                    { preserveState: true, replace: true }
                                )
                            }}
                            defaultValue={params.per_page && params.per_page}
                            className="py-2 px-3 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-neutral-400">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="200">200</option>
                        </select>
                    </div>
                </div>

                {processing && <div className="text-sm text-blue-500 my-2">
                    <p>Processing...</p>
                </div>}

                <form onSubmit={submit}>
                    <div className="flex items-center gap-2 mb-4">
                        <Button size="sm" type="button"
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
                        <Button size="sm" variant="secondary" type="button"
                            onClick={() => setData('videos', [])}
                            disabled={data.videos.length === 0}
                        >Unselect All</Button>
                        
                        <span className="ml-auto text-sm text-gray-500 font-medium">
                            {data.videos.length} selected
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className={`relative flex items-center space-x-3 rounded-lg border ${existIds.includes(item.id) ? 'border-green-600 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10' : 'dark:border-slate-800 border-gray-200'} bg-white dark:bg-slate-900 p-3 shadow-sm hover:border-gray-400 transition-colors`}
                            >
                                <div className="flex h-6 items-center">
                                    <input
                                        id={`links-${index}`}
                                        name=""
                                        type="checkbox"
                                        aria-describedby="links-description"
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
                                        checked={data.videos.some(i => i.id === item.id) || existIds.includes(item.id)}
                                        disabled={existIds.includes(item.id)}
                                        onChange={(e) => {
                                            const { checked } = e.target;
                                            if (checked) {
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
                                                setData('videos', data.videos.filter(i => i.id !== item.id));
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex-shrink-0 relative group cursor-pointer overflow-hidden rounded-md" onClick={() => handlePlay(item)}>
                                    <img alt="" src={item.videos.medium?.thumbnail} className="h-16 w-24 object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-all">
                                        <PlayIcon className="w-8 h-8 text-white opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="focus:outline-none">
                                        <p className="text-xs font-medium text-gray-800 dark:text-gray-300 truncate" title={item.tags}>
                                            {item.tags}
                                        </p>
                                        <div className="mt-1 flex flex-col text-[11px] text-gray-500 dark:text-gray-400">
                                            <span>Duration: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.duration}s</span></span>
                                            <span>Size: <span className="font-semibold text-gray-700 dark:text-gray-300">{(item.videos.medium?.size / 1024 / 1024).toFixed(1)} MB</span></span>
                                        </div>
                                    </div>
                                </div>
                                {existIds.includes(item.id) && (
                                    <span className="absolute top-2 right-2 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="py-6 flex items-center justify-between border-t mt-6 dark:border-slate-800">
                        <Button type="submit" disabled={processing || data.videos.length === 0}>
                            Import Selected ({data.videos.length})
                        </Button>
                        <Pagination pagination={pagination} links={links} />
                    </div>
                </form>
            </CardContent>
        </Card>

        <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
            <DialogContent className="sm:max-w-4xl p-0 bg-black border-none overflow-hidden rounded-xl">
                <DialogTitle className="sr-only">Video Player</DialogTitle>
                <DialogDescription className="sr-only">Playing selected video</DialogDescription>
                {currentVideo && (
                    <div className="bg-black w-full flex flex-col">
                        <video
                            src={currentVideo.videos.medium?.url}
                            controls
                            autoPlay
                            className="w-full max-h-[75vh] object-contain bg-black"
                            poster={currentVideo.videos.medium?.thumbnail}
                        />
                        <div className="p-4 bg-white dark:bg-slate-900">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {currentVideo.tags}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span><strong className="text-gray-700 dark:text-gray-300">Duration:</strong> {currentVideo.duration}s</span>
                                <span><strong className="text-gray-700 dark:text-gray-300">Size:</strong> {(currentVideo.videos.medium?.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span><strong className="text-gray-700 dark:text-gray-300">Resolution:</strong> {currentVideo.videos.medium?.width} x {currentVideo.videos.medium?.height}</span>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
}
