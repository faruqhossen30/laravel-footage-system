// @ts-nocheck
import { route } from '@/lib/route';
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/old/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/old/table'
import { EyeIcon, ListBulletIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import SearchFilter from '@/components/old/Custom/SearchFilter';
import Pagination from '@/components/old/Pagination';
import { Badge } from '@/components/old/badge';
import Modal from '@/components/old/Modal';
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
            {/* <Link href={route('video.create')} className="bg-gray-100 border-b rounded-t-xl py-3 px-4 md:py-4 md:px-5 dark:bg-gray-800 dark:border-neutral-700 m-2">Insert Video</Link> */}

            <Button color="light" href={route('video.create')} className="my-2">
                <PlusIcon />
                Insert Video
            </Button>

            <div className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                    <select
                        name="order"
                        value={filters.order ?? 'latest'}
                        onChange={(e) => {
                            const value = e.target.value;
                            router.get(route('video.index'), { order: value, category_id: filters.category_id, sub_category_id: filters.sub_category_id }, { preserveState: true, replace: true });
                        }}
                        className="py-2 px-3 pe-9 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
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
                        className="py-2 px-3 pe-9 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
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
                        className="py-2 px-3 pe-9 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
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

            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden dark:bg-slate-900 dark:border-gray-700">
                <Table dense >
                    <TableHead className="bg-gray-50 dark:bg-slate-800">
                        <TableRow>
                            <TableHeader>
                                <span className="mx-5">S.N</span>
                            </TableHeader>
                            <TableHeader>Thumbnail</TableHeader>
                            <TableHeader>Title</TableHeader>
                            <TableHeader>Tags</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Action</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {videos.data.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <span className="mx-5">{index + 1}</span>
                                </TableCell>

                                <TableCell>
                                    <img src={window.location.origin + '/server/' + item.thumbnail} alt="" className="h-10 rounded-sm" />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="space-y-1">
                                        <div className="truncate max-w-[16rem] sm:max-w-[20rem]">{item.title ?? '—'}</div>
                                        <div className="flex flex-wrap gap-1 max-w-[20rem]">
                                            {(Array.isArray(item.categories) ? item.categories : []).map((c) => (
                                                <Badge color="blue" key={`c-${item.id}-${c.id}`}>{c.name}</Badge>
                                            ))}
                                            {((item.subCategories ?? item.sub_categories) ?? []).map((sc) => (
                                                <Badge color="indigo" key={`sc-${item.id}-${sc.id}`}>{sc.name}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex flex-wrap gap-1">
                                        {(Array.isArray(item.tags) ? item.tags : []).map((t) => (
                                            <Badge key={`t-${item.id}-${t.id}`}>{t.name}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <Badge className="capitalize">{item.status}</Badge>
                                </TableCell>
                                <TableCell className="text-zinc-500 flex space-x-1">
                                    <button
                                        type="button"
                                        onClick={() => handlePlay(item)}
                                        className={`border p-1 rounded-md dark:border-gray-700 ${item?.file_path ? 'text-indigo-500' : 'text-gray-400 cursor-not-allowed opacity-60'}`}
                                        disabled={!item?.file_path}
                                        title={item?.file_path ? 'Quick view' : 'Video not available yet'}
                                    >
                                        <PlayIcon className="w-4 h-4" />
                                    </button>
                                    <Link href={route('video.edit', item.id)} className="border p-1 rounded-md dark:border-gray-700 text-gray-500">
                                        <EyeIcon className="w-4 h-4" />
                                    </Link>

                                    <Link href={route('video.edit', item.id)} className="border p-1 rounded-md dark:border-gray-700 text-green-500">
                                        <PencilIcon className="w-4 h-5" />
                                    </Link>
                                    <Link href={route('video.destroy', item.id)} method="Delete" as="button" className="border p-1 rounded-md dark:border-gray-700 text-red-500">
                                        <TrashIcon className="w-4 h-4 " />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Modal show={showPlayer} maxWidth="xl" onClose={() => setShowPlayer(false)}>
                {currentVideo && (
                    <div className="bg-white dark:bg-slate-800">
                        <video
                            src={window.location.origin + '/server/' + currentVideo.file_path}
                            controls
                            autoPlay
                            className="w-full"
                            poster={currentVideo.thumbnail ? window.location.origin + '/server/' + currentVideo.thumbnail : undefined}
                        />
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-400">
                                        {currentVideo.title ?? 'Video'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {typeof currentVideo.duration === 'number' ? `${currentVideo.duration}s` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            <div className='py-5'>
                <Pagination pagination={videos} links={videos.links} />
            </div>
        </div>
    );
}
