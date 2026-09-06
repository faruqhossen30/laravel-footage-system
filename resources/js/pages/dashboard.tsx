import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import DashbardCard from '@/components/old/Dashboard/DashbardCard';
import { PlayCircleIcon, ArrowDownTrayIcon, XCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { route } from '@/lib/route';

export default function Dashboard({ videos, images }: { videos?: any, images?: any }) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {videos && (
                    <>
                        <h2 className="text-lg font-semibold mt-2">Videos</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            <DashbardCard title={videos.total_done} subtitle="Total Videos" icon={<PlayCircleIcon className="w-6 h-6 text-white" />} />
                            <Link onClick={(e) => !confirm("Are you sure? This will start downloading all pending videos.") && e.preventDefault()} href={route('video.enqueue')} method="post" className="text-start">
                                <DashbardCard
                                    title="Download Videos"
                                    subtitle={`${videos.total_list} Video listed ${videos.total_run ? ' | ' + videos.total_run + ' downloading ...' : ''}`}
                                    icon={<ArrowDownTrayIcon className="w-6 h-6 text-white" />}                      
                                />
                            </Link>
                            <Link onClick={(e) => !confirm("Are you sure you want to STOP all video downloads? This will clear the queue.") && e.preventDefault()} href={route('video.stop-downloads')} method="post" className="text-start">
                                <DashbardCard
                                    title="Stop Video Downloads"
                                    subtitle="Clear queue & stop running"
                                    icon={<XCircleIcon className="w-6 h-6 text-white" />}
                                />
                            </Link>
                        </div>
                    </>
                )}
                
                {images && (
                    <>
                        <h2 className="text-lg font-semibold mt-4">Images</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            <DashbardCard title={images.total_done} subtitle="Total Images" icon={<PhotoIcon className="w-6 h-6 text-white" />} />
                            <Link onClick={(e) => !confirm("Are you sure? This will start downloading all pending images.") && e.preventDefault()} href={route('image.enqueue')} method="post" className="text-start">
                                <DashbardCard
                                    title="Download Images"
                                    subtitle={`${images.total_list} Image listed ${images.total_run ? ' | ' + images.total_run + ' downloading ...' : ''}`}
                                    icon={<ArrowDownTrayIcon className="w-6 h-6 text-white" />}                      
                                />
                            </Link>
                            <Link onClick={(e) => !confirm("Are you sure you want to STOP all image downloads? This will clear the queue.") && e.preventDefault()} href={route('image.stop-downloads')} method="post" className="text-start">
                                <DashbardCard
                                    title="Stop Image Downloads"
                                    subtitle="Clear queue & stop running"
                                    icon={<XCircleIcon className="w-6 h-6 text-white" />}
                                />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
