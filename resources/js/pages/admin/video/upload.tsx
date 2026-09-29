// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from '@/lib/route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    UploadCloud,
    Film,
    Camera,
    CheckCircle2,
    Clock,
    Maximize2,
    HardDrive,
    X,
    Sparkles,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

interface Category {
    id: number;
    name: string;
    slug?: string;
}

interface SubCategory {
    id: number;
    name: string;
    slug?: string;
    category_id: number;
}

interface Tag {
    id: number;
    name: string;
    slug?: string;
}

interface Props {
    categories?: Category[];
    subCategories?: SubCategory[];
    tags?: Tag[];
}

export default function VideoUpload({ categories = [], subCategories = [], tags = [] }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);

    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [capturedFrame, setCapturedFrame] = useState(false);

    const [meta, setMeta] = useState({
        duration: 0,
        width: 0,
        height: 0,
        sizeFormatted: '',
        quality: '',
    });

    const { data, setData, post, processing, errors, progress } = useForm({
        video: null as File | null,
        title: '',
        thumbnail: null as File | null,
        thumbnail_blob: '',
        duration: '',
        width: '',
        height: '',
        video_quality: '',
        category_ids: [] as number[],
        sub_category_ids: [] as number[],
        tag_ids: [] as number[],
        new_tags: [] as string[],
    });

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
            if (thumbPreviewUrl && !thumbPreviewUrl.startsWith('data:')) {
                URL.revokeObjectURL(thumbPreviewUrl);
            }
        };
    }, [videoPreviewUrl, thumbPreviewUrl]);

    const formatSeconds = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const determineQuality = (height: number) => {
        if (height >= 2160) return '4K';
        if (height >= 1440) return '2K';
        if (height >= 1080) return '1080p';
        if (height >= 720) return '720p';
        if (height >= 480) return '480p';
        return `${height}p`;
    };

    const handleVideoFile = (file: File) => {
        if (!file) return;

        // Set video file in form
        setData(prev => {
            const defaultTitle = prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            return {
                ...prev,
                video: file,
                title: defaultTitle,
            };
        });

        // Set preview URL
        if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
        const url = URL.createObjectURL(file);
        setVideoPreviewUrl(url);

        setMeta(prev => ({
            ...prev,
            sizeFormatted: formatBytes(file.size),
        }));
    };

    const onVideoLoadedMetadata = () => {
        if (!videoRef.current) return;
        const v = videoRef.current;
        const duration = Math.round(v.duration || 0);
        const width = v.videoWidth || 0;
        const height = v.videoHeight || 0;
        const quality = determineQuality(height);

        setMeta(prev => ({
            ...prev,
            duration,
            width,
            height,
            quality,
        }));

        setData(prev => ({
            ...prev,
            duration: String(duration),
            width: String(width),
            height: String(height),
            video_quality: quality,
        }));

        // Attempt automatic thumbnail capture at 1 second mark if no thumbnail set yet
        setTimeout(() => {
            if (v && v.readyState >= 2 && !thumbPreviewUrl) {
                captureFrame();
            }
        }, 500);
    };

    const captureFrame = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setThumbPreviewUrl(dataUrl);
        setCapturedFrame(true);
        setData(prev => ({
            ...prev,
            thumbnail: null,
            thumbnail_blob: dataUrl,
        }));
    };

    const handleCustomThumbnail = (file: File) => {
        if (!file) return;
        if (thumbPreviewUrl && !thumbPreviewUrl.startsWith('data:')) {
            URL.revokeObjectURL(thumbPreviewUrl);
        }
        const url = URL.createObjectURL(file);
        setThumbPreviewUrl(url);
        setCapturedFrame(false);
        setData(prev => ({
            ...prev,
            thumbnail: file,
            thumbnail_blob: '',
        }));
    };

    const removeVideo = () => {
        if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
        setVideoPreviewUrl(null);
        setThumbPreviewUrl(null);
        setMeta({ duration: 0, width: 0, height: 0, sizeFormatted: '', quality: '' });
        setData(prev => ({
            ...prev,
            video: null,
            thumbnail: null,
            thumbnail_blob: '',
            duration: '',
            width: '',
            height: '',
            video_quality: '',
        }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeThumbnail = () => {
        if (thumbPreviewUrl && !thumbPreviewUrl.startsWith('data:')) {
            URL.revokeObjectURL(thumbPreviewUrl);
        }
        setThumbPreviewUrl(null);
        setCapturedFrame(false);
        setData(prev => ({
            ...prev,
            thumbnail: null,
            thumbnail_blob: '',
        }));
        if (thumbInputRef.current) thumbInputRef.current.value = '';
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleVideoFile(e.dataTransfer.files[0]);
        }
    };

    // Category options
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
    const selectedCategories = categoryOptions.filter(opt => data.category_ids.includes(opt.value));

    // SubCategory options (filtered by selected categories)
    const filteredSubCategories = data.category_ids.length > 0
        ? subCategories.filter(sc => data.category_ids.includes(sc.category_id))
        : subCategories;
    const subCategoryOptions = filteredSubCategories.map(sc => ({ value: sc.id, label: sc.name }));
    const selectedSubCategories = subCategoryOptions.filter(opt => data.sub_category_ids.includes(opt.value));

    // Tag options
    const tagOptions = tags.map(t => ({ value: t.id, label: t.name }));
    // Combined tag value representation
    const currentTagValues = [
        ...tagOptions.filter(opt => data.tag_ids.includes(opt.value)),
        ...data.new_tags.map(name => ({ value: name, label: name, isNew: true }))
    ];

    const handleTagChange = (selectedOptions: any) => {
        const selected = selectedOptions || [];
        const existingIds: number[] = [];
        const newNames: string[] = [];

        selected.forEach((item: any) => {
            if (typeof item.value === 'number') {
                existingIds.push(item.value);
            } else {
                newNames.push(item.label || item.value);
            }
        });

        setData(prev => ({
            ...prev,
            tag_ids: existingIds,
            new_tags: newNames,
        }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('video.upload.store'), {
            forceFormData: true,
        });
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 sm:p-6 max-w-6xl mx-auto w-full">
            <Head title="Upload Video" />

            {/* Breadcrumb Navigation */}
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
                            <BreadcrumbLink asChild>
                                <Link href={route("video.index")}>Videos</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Upload Video</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <Button variant="outline" size="sm" asChild className="gap-2">
                    <Link href={route('video.index')}>
                        <ArrowLeft className="w-4 h-4" />
                        Back to Videos
                    </Link>
                </Button>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Video Dropzone & Preview (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="border-dashed shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Film className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    Video File
                                </CardTitle>
                                <CardDescription>
                                    Select or drag & drop video file from your computer (MP4, MOV, WebM, MKV)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!videoPreviewUrl ? (
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={onDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[260px] ${
                                            isDragging
                                                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                                                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50/50 dark:border-gray-700 dark:hover:bg-gray-800/50'
                                        }`}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                        <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
                                            Click to browse or drag video here
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            MP4, MOV, WebM, MKV up to 200MB
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/avi"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    handleVideoFile(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Video Preview Player */}
                                        <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-md">
                                            <video
                                                ref={videoRef}
                                                src={videoPreviewUrl}
                                                controls
                                                playsInline
                                                crossOrigin="anonymous"
                                                onLoadedMetadata={onVideoLoadedMetadata}
                                                className="w-full h-full object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeVideo}
                                                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                                                title="Remove video"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Video Quick Stats Badge Bar */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-800 text-xs">
                                                <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                                                <div>
                                                    <span className="text-gray-400 block text-[10px]">Duration</span>
                                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                        {meta.duration ? formatSeconds(meta.duration) : '--:--'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-800 text-xs">
                                                <Maximize2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                <div>
                                                    <span className="text-gray-400 block text-[10px]">Resolution</span>
                                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                        {meta.width && meta.height ? `${meta.width}x${meta.height}` : '--'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-800 text-xs">
                                                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                                                <div>
                                                    <span className="text-gray-400 block text-[10px]">Quality</span>
                                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                        {meta.quality || 'Auto'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-800 text-xs">
                                                <HardDrive className="w-4 h-4 text-purple-500 shrink-0" />
                                                <div>
                                                    <span className="text-gray-400 block text-[10px]">Size</span>
                                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                        {meta.sizeFormatted || '--'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Capture Frame Tool */}
                                        <div className="flex items-center justify-between p-3 rounded-lg border border-indigo-100 bg-indigo-50/40 dark:border-indigo-950 dark:bg-indigo-950/20 text-xs text-indigo-900 dark:text-indigo-200">
                                            <span>Pause video at desired frame & snapshot as thumbnail:</span>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={captureFrame}
                                                className="gap-1.5 h-8 text-xs font-medium bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border"
                                            >
                                                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                                                Capture Frame
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {errors.video && (
                                    <div className="flex items-center gap-1.5 text-red-500 text-sm mt-3">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{errors.video}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Thumbnail Section */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        Thumbnail
                                    </div>
                                    {thumbPreviewUrl && (
                                        <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                                            {capturedFrame ? 'Captured Frame' : 'Custom Image'}
                                        </span>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Capture from current video player position or upload custom image
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {thumbPreviewUrl ? (
                                        <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 shrink-0 shadow-sm">
                                            <img
                                                src={thumbPreviewUrl}
                                                alt="Thumbnail preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeThumbnail}
                                                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                                                title="Remove thumbnail"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-40 h-24 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col items-center justify-center text-gray-400 text-xs text-center p-2 shrink-0">
                                            <Camera className="w-5 h-5 mb-1 text-gray-300 dark:text-gray-600" />
                                            No thumbnail
                                        </div>
                                    )}

                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => thumbInputRef.current?.click()}
                                                className="h-8 text-xs gap-1.5"
                                            >
                                                <UploadCloud className="w-3.5 h-3.5" />
                                                Upload Custom Image
                                            </Button>

                                            {videoPreviewUrl && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={captureFrame}
                                                    className="h-8 text-xs gap-1.5"
                                                >
                                                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                                                    Re-capture Frame
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            Supported: JPG, PNG, WEBP. If empty, thumbnail will automatically generate from video.
                                        </p>
                                        <input
                                            ref={thumbInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    handleCustomThumbnail(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                {errors.thumbnail && (
                                    <div className="text-red-500 text-sm mt-2">{errors.thumbnail}</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Metadata & Classification Form (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b bg-gray-50/50 dark:bg-gray-800/50">
                                <CardTitle className="text-base font-semibold">Video Details</CardTitle>
                                <CardDescription>Enter title, tags, and select categories</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-medium">
                                        Title <span className="text-gray-400 text-xs font-normal">(optional)</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. Drone Shot of Sunset Over City"
                                        className="h-10 text-sm"
                                    />
                                    {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                                </div>

                                {/* Tags (Creatable) */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Tags</Label>
                                        <span className="text-[11px] text-gray-400">Type & press Enter to add new</span>
                                    </div>
                                    <CreatableSelect
                                        isMulti
                                        options={tagOptions}
                                        value={currentTagValues}
                                        onChange={handleTagChange}
                                        placeholder="Select or type new tags..."
                                        className="react-select-container text-sm"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: '#e5e7eb',
                                                borderRadius: '0.5rem',
                                                padding: '0.125rem',
                                                boxShadow: 'none',
                                                '&:hover': { borderColor: '#d1d5db' }
                                            })
                                        }}
                                    />
                                    {errors.tag_ids && <div className="text-red-500 text-xs mt-1">{errors.tag_ids}</div>}
                                </div>

                                {/* Categories */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Categories</Label>
                                    <Select
                                        isMulti
                                        options={categoryOptions}
                                        value={selectedCategories}
                                        onChange={(vals) => setData('category_ids', (vals ?? []).map((v: any) => v.value))}
                                        placeholder="Select categories..."
                                        className="react-select-container text-sm"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: '#e5e7eb',
                                                borderRadius: '0.5rem',
                                                padding: '0.125rem',
                                                boxShadow: 'none',
                                                '&:hover': { borderColor: '#d1d5db' }
                                            })
                                        }}
                                    />
                                    {errors.category_ids && <div className="text-red-500 text-xs mt-1">{errors.category_ids}</div>}
                                </div>

                                {/* SubCategories */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Sub Categories</Label>
                                    <Select
                                        isMulti
                                        options={subCategoryOptions}
                                        value={selectedSubCategories}
                                        onChange={(vals) => setData('sub_category_ids', (vals ?? []).map((v: any) => v.value))}
                                        placeholder={data.category_ids.length > 0 ? "Select sub categories..." : "Select categories first or choose all..."}
                                        className="react-select-container text-sm"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: '#e5e7eb',
                                                borderRadius: '0.5rem',
                                                padding: '0.125rem',
                                                boxShadow: 'none',
                                                '&:hover': { borderColor: '#d1d5db' }
                                            })
                                        }}
                                    />
                                    {errors.sub_category_ids && <div className="text-red-500 text-xs mt-1">{errors.sub_category_ids}</div>}
                                </div>

                                {/* Quality Override (Optional) */}
                                <div className="space-y-2">
                                    <Label htmlFor="quality" className="text-sm font-medium">
                                        Quality Tag <span className="text-gray-400 text-xs font-normal">(auto-detected: {meta.quality || 'N/A'})</span>
                                    </Label>
                                    <Input
                                        id="quality"
                                        value={data.video_quality}
                                        onChange={(e) => setData('video_quality', e.target.value)}
                                        placeholder="e.g. 1080p, 4K, 720p"
                                        className="h-10 text-sm"
                                    />
                                </div>

                                {/* Upload Progress Bar */}
                                {progress && (
                                    <div className="space-y-1.5 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">
                                        <div className="flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-300 font-medium">
                                            <span>Uploading video...</span>
                                            <span>{progress.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${progress.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-4 flex items-center justify-end gap-3 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                        disabled={processing}
                                    >
                                        <Link href={route('video.index')}>Cancel</Link>
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={!data.video || processing}
                                        className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white min-w-[130px]"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-4 h-4" />
                                                <span>Upload Video</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>

            {/* Hidden canvas for capturing video frames */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
