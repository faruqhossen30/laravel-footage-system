// @ts-nocheck
import { route } from '@/lib/route';
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowUpTrayIcon, EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Pagination from '@/components/old/Pagination';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { PlayIcon } from '@heroicons/react/24/solid';

export default function Index({ videos, categories = [], subCategories = [], filters = {} }) {
    const [showPlayer, setShowPlayer] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);

    const handlePlay = (video) => {
        if (!video?.file_path) return;
        setCurrentVideo(video);
        setShowPlayer(true);
    };
    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Head title="Videos" />
            
            <div className="flex items-center justify-between">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={route("dashboard")}>Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Videos</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild className="gap-2">
                        <Link href={route('video.create')}>
                            <PlusIcon className="w-4 h-4" />
                            Import API Video
                        </Link>
                    </Button>
                    <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Link href={route('video.upload')}>
                            <ArrowUpTrayIcon className="w-4 h-4" />
                            Upload Video
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="bg-gray-100/50 dark:bg-gray-800/50 border-b">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">Video Library</CardTitle>
                            <CardDescription>Manage all videos in the system</CardDescription>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                            <select
                                name="order"
                                value={filters.order ?? 'latest'}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    router.get(route('video.index'), { order: value, category_id: filters.category_id, sub_category_id: filters.sub_category_id }, { preserveState: true, replace: true });
                                }}
                                className="py-2 px-3 pe-9 block border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                            >
                                <option value="latest">Latest</option>
                                <option value="old">Old</option>
                            </select>

                            <select
                                name="category_id"
                                value={filters.category_id ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value || null;
                                    router.get(route('video.index'), { order: filters.order ?? 'latest', category_id: value, sub_category_id: '' }, { preserveState: true, replace: true });
                                }}
                                className="py-2 px-3 pe-9 block border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                            >
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <select
                                name="sub_category_id"
                                value={filters.sub_category_id ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value || null;
                                    router.get(route('video.index'), { order: filters.order ?? 'latest', category_id: filters.category_id ?? '', sub_category_id: value }, { preserveState: true, replace: true });
                                }}
                                className="py-2 px-3 pe-9 block border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                            >
                                <option value="">All SubCategories</option>
                                {(Array.isArray(subCategories) ? subCategories : [])
                                    .filter(sc => {
                                        if (!filters.category_id) return true;
                                        const selectedCategoryId = Number(filters.category_id);
                                        return sc.category_id === selectedCategoryId;
                                    })
                                    .map((sc) => (
                                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50">
                                <TableHead className="w-16 text-center">S.N</TableHead>
                                <TableHead className="w-24">Thumbnail</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {videos.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                        No videos found.
                                    </TableCell>
                                </TableRow>
                            ) : videos.data.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-center font-medium text-gray-500">
                                        {(videos.current_page - 1) * videos.per_page + index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative group rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 h-10 w-16">
                                            <img src={'/server/' + item.thumbnail} alt="" className="h-full w-full object-cover" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="truncate max-w-[16rem] sm:max-w-[20rem] font-medium text-gray-900 dark:text-gray-100">{item.title ?? '—'}</div>
                                            <div className="flex flex-wrap gap-1">
                                                {(Array.isArray(item.categories) ? item.categories : []).map((c) => (
                                                    <Badge className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-normal" key={`c-${item.id}-${c.id}`}>{c.name}</Badge>
                                                ))}
                                                {((item.subCategories ?? item.sub_categories) ?? []).map((sc) => (
                                                    <Badge className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-normal" key={`sc-${item.id}-${sc.id}`}>{sc.name}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1 max-w-[16rem]">
                                            {(Array.isArray(item.tags) ? item.tags : []).map((t) => (
                                                <Badge variant="secondary" className="font-normal" key={`t-${item.id}-${t.id}`}>{t.name}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === 'run' ? 'default' : item.status === 'list' ? 'secondary' : 'outline'} className="capitalize">
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 pr-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className={`h-8 w-8 ${item?.file_path ? 'text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-900/50 dark:hover:bg-indigo-900/30' : 'text-gray-400 opacity-60'}`}
                                                onClick={() => handlePlay(item)}
                                                disabled={!item?.file_path}
                                                title={item?.file_path ? 'Quick view' : 'Video not available yet'}
                                            >
                                                <PlayIcon className="h-4 w-4" />
                                            </Button>
                                            
                                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-900/50 dark:hover:bg-blue-900/30" asChild>
                                                <Link href={route('video.edit', item.id)}>
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/30" asChild>
                                                <Link href={route('video.destroy', item.id)} method="delete" as="button">
                                                    <TrashIcon className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
                <DialogContent className="sm:max-w-4xl p-0 bg-black border-none overflow-hidden rounded-xl">
                    <DialogTitle className="sr-only">Video Player</DialogTitle>
                    <DialogDescription className="sr-only">Playing selected video</DialogDescription>
                    {currentVideo && (
                        <div className="bg-black w-full flex flex-col">
                            <video
                                src={'/server/' + currentVideo.file_path}
                                controls
                                autoPlay
                                className="w-full max-h-[75vh] object-contain bg-black"
                                poster={currentVideo.thumbnail ? '/server/' + currentVideo.thumbnail : undefined}
                            />
                            <div className="p-4 bg-white dark:bg-slate-900">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {currentVideo.title ?? 'Video'}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    {typeof currentVideo.duration === 'number' && (
                                        <span><strong className="text-gray-700 dark:text-gray-300">Duration:</strong> {currentVideo.duration}s</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className='py-5 flex justify-center'>
                <Pagination pagination={videos} links={videos.links} />
            </div>
        </div>
    );
}
