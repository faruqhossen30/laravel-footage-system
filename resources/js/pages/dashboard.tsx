import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import DashbardCard from '@/components/old/Dashboard/DashbardCard';
import { PlayCircleIcon, ArrowDownTrayIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { route } from '@/lib/route';

export default function Dashboard({ videos }: { videos?: any }) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {videos && (
                        <>
                            <DashbardCard title={videos.total_done} subtitle="Total Videos" icon={<PlayCircleIcon className="w-6 h-6 text-white" />} />
                            <Link onClick={(e) => !confirm("Are you sure? This will start downloading all pending videos.") && e.preventDefault()} href={route('video.enqueue')} method="post" className="text-start">
                                <DashbardCard
                                    title="Download Queue"
                                    subtitle={`${videos.total_list} Video is listed for download ${videos.total_run ? ' | ' + videos.total_run + ' Video is downloading ...' : ''}`}
                                    icon={<ArrowDownTrayIcon className="w-6 h-6 text-white" />}                      
                                />
                            </Link>
                            <Link onClick={(e) => !confirm("Are you sure you want to STOP all downloads? This will clear the queue.") && e.preventDefault()} href={route('video.stop-downloads')} method="post" className="text-start">
                                <DashbardCard
                                    title="Stop Downloads"
                                    subtitle="Clear queue & stop running"
                                    icon={<XCircleIcon className="w-6 h-6 text-white" />}
                                />
                            </Link>
                        </>
                    )}
                </div>
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
