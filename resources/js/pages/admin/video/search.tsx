// @ts-nocheck
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from '@/lib/route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Pagination from '@/components/old/Pagination';
import { 
    PlayIcon, 
    PencilIcon, 
    TrashIcon, 
    MagnifyingGlassIcon, 
    XMarkIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    FolderIcon,
    FilmIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface VideoItem {
    id: number;
    title: string | null;
    file_name: string | null;
    file_path: string | null;
    disk_path?: string | null;
    duration: number | null;
    thumbnail: string | null;
    size: string | number | null;
    width: string | number | null;
    height: string | number | null;
    povider: string | null;
    povider_id: string | null;
    status: string;
    categories?: Array<{ id: number; name: string }>;
    subCategories?: Array<{ id: number; name: string }>;
    sub_categories?: Array<{ id: number; name: string }>;
    tags?: Array<{ id: number; name: string }>;
}

interface SearchProps {
    videos: {
        data: VideoItem[];
        current_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    filters?: {
        path?: string;
    };
}

function formatBytes(bytes: string | number | null | undefined, decimals = 2): string {
    if (!bytes) return '—';
    const num = Number(bytes);
    if (isNaN(num) || num === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function SearchPage({ videos, filters = {} }: SearchProps) {
    const [pathInput, setPathInput] = useState(filters.path || '');
    const [showPlayer, setShowPlayer] = useState(false);
    const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const hasSearched = Boolean(filters.path && filters.path.trim().length > 0);

    const handleSearch = (pathValue?: string) => {
        const query = pathValue !== undefined ? pathValue : pathInput;
        router.get(
            route('video.search'),
            { path: query.trim() },
            { preserveState: true, replace: true }
        );
    };

    const handleClear = () => {
        setPathInput('');
        router.get(
            route('video.search'),
            { path: '' },
            { preserveState: true, replace: true }
        );
    };

    const handlePlay = (video: VideoItem) => {
        if (!video?.file_path) return;
        setCurrentVideo(video);
        setShowPlayer(true);
    };

    const copyToClipboard = (video: VideoItem) => {
        const textToCopy = video.disk_path || ('/Volumes/Files/server/' + (video.file_path || ''));
        navigator.clipboard.writeText(textToCopy);
        setCopiedId(video.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const sampleQueries = [
        '/Volumes/Files/server/videos/370013_medium.mp4',
        'videos/370013_medium.mp4',
        '370013_medium.mp4'
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Head title="Search Video by Path" />

            {/* Breadcrumb & Navigation */}
            <div className="flex items-center justify-between">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={route('dashboard')}>Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={route('video.index')}>Videos</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Search by Path</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <Button variant="outline" asChild className="gap-2">
                    <Link href={route('video.index')}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        All Videos
                    </Link>
                </Button>
            </div>

            {/* Search Input Card */}
            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                <CardHeader className="bg-gray-50/70 dark:bg-gray-800/40 border-b pb-4">
                    <div className="flex items-center gap-2">
                        <FolderIcon className="w-5 h-5 text-indigo-500" />
                        <CardTitle className="text-lg">Search Video by File Path</CardTitle>
                    </div>
                    <CardDescription>
                        Enter an absolute server path (e.g. <code>/Volumes/Files/server/videos/370013_medium.mp4</code>), relative path, or filename.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSearch();
                        }}
                        className="flex flex-col sm:flex-row gap-2"
                    >
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <MagnifyingGlassIcon className="h-5 w-5" />
                            </div>
                            <Input
                                type="text"
                                value={pathInput}
                                onChange={(e) => setPathInput(e.target.value)}
                                placeholder="Paste video path here, e.g. /Volumes/Files/server/videos/370013_medium.mp4"
                                className="pl-10 pr-10 py-2 h-10 w-full text-sm font-mono"
                            />
                            {pathInput && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="gap-2 px-5">
                                <MagnifyingGlassIcon className="w-4 h-4" />
                                Search
                            </Button>
                            {hasSearched && (
                                <Button type="button" variant="outline" onClick={handleClear}>
                                    Reset
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Quick Example Tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-1">
                        <span className="font-medium">Quick Examples:</span>
                        {sampleQueries.map((example) => (
                            <button
                                key={example}
                                type="button"
                                onClick={() => {
                                    setPathInput(example);
                                    handleSearch(example);
                                }}
                                className="inline-flex items-center px-2 py-1 rounded bg-gray-100 hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-mono text-[11px] border border-gray-200 dark:border-gray-700"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            {!hasSearched ? (
                /* Initial Prompt State */
                <Card className="p-8 text-center border-dashed border-gray-300 dark:border-gray-800">
                    <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <FilmIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            Ready to Search Videos
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Paste the full path of any video from your file manager or server into the search bar above to inspect its details, view thumbnails, or play it directly.
                        </p>
                    </div>
                </Card>
            ) : videos.data.length === 0 ? (
                /* No Results State */
                <Card className="p-8 text-center border-gray-200 dark:border-gray-800">
                    <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <XMarkIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            No Video Found
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No video matched the path <span className="font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">"{filters.path}"</span>.
                        </p>
                        <p className="text-xs text-gray-400">
                            Tip: Ensure the video has been downloaded and indexed into the system database.
                        </p>
                        <Button variant="outline" size="sm" onClick={handleClear} className="mt-2">
                            Clear Search
                        </Button>
                    </div>
                </Card>
            ) : (
                /* Results Table Card */
                <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                    <CardHeader className="bg-gray-100/50 dark:bg-gray-800/50 border-b py-3 px-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-medium">
                                    Search Results
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Found {videos.total} {videos.total === 1 ? 'video' : 'videos'} matching your path
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="font-mono text-xs">
                                Total: {videos.total}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50">
                                    <TableHead className="w-12 text-center">#</TableHead>
                                    <TableHead className="w-24">Thumbnail</TableHead>
                                    <TableHead>Title & Path</TableHead>
                                    <TableHead className="w-32">Media Info</TableHead>
                                    <TableHead className="w-24">Status</TableHead>
                                    <TableHead className="text-right pr-6 w-32">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {videos.data.map((item, index) => {
                                    const fullDiskPath = item.disk_path || ('/Volumes/Files/server/' + (item.file_path || ''));
                                    return (
                                        <TableRow key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40">
                                            <TableCell className="text-center font-medium text-gray-500 text-xs">
                                                {(videos.current_page - 1) * videos.per_page + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div 
                                                    className="relative group rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 h-12 w-20 cursor-pointer border border-gray-200 dark:border-gray-700 flex-shrink-0"
                                                    onClick={() => handlePlay(item)}
                                                >
                                                    {item.thumbnail ? (
                                                        <img 
                                                            src={'/server/' + item.thumbnail} 
                                                            alt={item.title || 'Thumbnail'} 
                                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200" 
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                            <FilmIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                    {item.file_path && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <PlayIcon className="h-6 w-6 text-white drop-shadow" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1.5 py-1">
                                                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                        {item.title || (item.file_path ? item.file_path.split('/').pop() : 'Untitled Video')}
                                                    </div>

                                                    {/* Full Disk Path with Copy Button */}
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[11px] truncate max-w-[28rem] select-all border border-gray-200 dark:border-gray-700" title={fullDiskPath}>
                                                            {fullDiskPath}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(item)}
                                                            className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1"
                                                            title="Copy disk path to clipboard"
                                                        >
                                                            {copiedId === item.id ? (
                                                                <CheckIcon className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <ClipboardDocumentIcon className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Badges for Categories & Tags */}
                                                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                                        {item.povider && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                                                {item.povider}
                                                            </Badge>
                                                        )}
                                                        {(Array.isArray(item.categories) ? item.categories : []).map((c) => (
                                                            <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0 font-normal" key={`c-${item.id}-${c.id}`}>
                                                                {c.name}
                                                            </Badge>
                                                        ))}
                                                        {((item.subCategories ?? item.sub_categories) ?? []).map((sc) => (
                                                            <Badge className="bg-indigo-500 text-white text-[10px] px-1.5 py-0 font-normal" key={`sc-${item.id}-${sc.id}`}>
                                                                {sc.name}
                                                            </Badge>
                                                        ))}
                                                        {(Array.isArray(item.tags) ? item.tags : []).slice(0, 4).map((t) => (
                                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal" key={`t-${item.id}-${t.id}`}>
                                                                {t.name}
                                                            </Badge>
                                                        ))}
                                                        {(Array.isArray(item.tags) ? item.tags : []).length > 4 && (
                                                            <span className="text-[10px] text-gray-400">
                                                                +{(item.tags?.length || 0) - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                                                    {item.duration !== null && (
                                                        <div><span className="font-semibold text-gray-700 dark:text-gray-300">Length:</span> {item.duration}s</div>
                                                    )}
                                                    {item.width && item.height && (
                                                        <div><span className="font-semibold text-gray-700 dark:text-gray-300">Res:</span> {item.width}x{item.height}</div>
                                                    )}
                                                    {item.size && (
                                                        <div><span className="font-semibold text-gray-700 dark:text-gray-300">Size:</span> {formatBytes(item.size)}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={item.status === 'done' ? 'default' : item.status === 'run' ? 'secondary' : 'outline'} 
                                                    className="capitalize text-xs font-normal"
                                                >
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1.5 pr-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className={`h-8 w-8 ${item?.file_path ? 'text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-900/50 dark:hover:bg-indigo-900/30' : 'text-gray-400 opacity-60'}`}
                                                        onClick={() => handlePlay(item)}
                                                        disabled={!item?.file_path}
                                                        title={item?.file_path ? 'Play video preview' : 'File not available on disk'}
                                                    >
                                                        <PlayIcon className="h-4 w-4" />
                                                    </Button>
                                                    
                                                    <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-900/50 dark:hover:bg-blue-900/30" asChild title="Edit video details">
                                                        <Link href={route('video.edit', item.id)}>
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                    </Button>

                                                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/30" asChild title="Delete video">
                                                        <Link href={route('video.destroy', item.id)} method="delete" as="button">
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Video Player Modal */}
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
                                    {currentVideo.title ?? currentVideo.file_path}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    {currentVideo.disk_path && (
                                        <span>Disk: {currentVideo.disk_path}</span>
                                    )}
                                    {typeof currentVideo.duration === 'number' && (
                                        <span>Duration: {currentVideo.duration}s</span>
                                    )}
                                    {currentVideo.width && currentVideo.height && (
                                        <span>Res: {currentVideo.width}x{currentVideo.height}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Pagination if applicable */}
            {videos.links && videos.links.length > 3 && (
                <div className="py-4 flex justify-center">
                    <Pagination pagination={videos} links={videos.links} />
                </div>
            )}
        </div>
    );
}
