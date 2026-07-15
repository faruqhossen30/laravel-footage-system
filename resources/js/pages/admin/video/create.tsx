// @ts-nocheck
import { route } from '@/lib/route';

import { Head, router, useForm } from '@inertiajs/react';
import BreadcumComponent from '@/components/old/Dashboard/BreadcumComponent';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/old/button';

export default function Create() {
    const params = route().params;
    const { data, setData, post, processing, errors, reset } = useForm({
        videos: [],
    });

    function submit(e) {
        e.preventDefault()
        console.log(data);
        
        // post(route('category.store'));
    }
    return <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between py-3 space-x-5">
            <div className="flex items-center flex-1  px-3 border dark:border-gray-700 rounded-md">
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
            <div className="space-y-3">
                <select name="show"
                    onChange={(e) => {
                        return router.get(route('video.create', params),
                            {
                                provider: e.target.value
                            },
                            {
                                preserveState: true,
                                replace: true
                            }
                        )
                    }}
                    defaultValue={params.provider && params.provider}
                    className="py-2 px-3 pe-9 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                    <option value="all">All</option>
                    <option value="pixabay">Pizabay</option>
                    <option value="freepik">Freepik</option>
                    <option value="storyblocks">Story Blocks</option>
                </select>
            </div>
        </div>

        <form onSubmit={submit}>
            <div className="flex items-center gap-2 mb-3">
                <Button size="sm"
                    onClick={() => setData('videos', items.map(i => ({ id: i.id, thumbnail: i.videos.medium?.thumbnail, url: i.videos.medium?.url })))}
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
                        className="relative flex items-center space-x-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm  hover:border-gray-400"
                    >
                        <div className="flex h-6 items-center">
                            <input
                                id={`links-${index}`}
                                name=""
                                type="checkbox"
                                aria-describedby="links-description"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                checked={data.videos.some(v => v.id === item.id)}
                                onChange={(e) => {
                                    const { checked } = e.target;
                                    if (checked) {
                                        // Add selected item (id, previewURL) without duplicates
                                        if (!data.videos.some(v => v.id === item.id)) {
                                            setData('videos', [...data.videos, { id: item.id, thumbnail: item.videos.medium?.thumbnail,url:item.videos.medium?.url }]);
                                        }
                                    } else {
                                        // Remove item when unchecked
                                        setData('videos', data.videos.filter(v => v.id !== item.id));
                                    }
                                }}
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <img alt="" src={item.videos.medium?.thumbnail} className="h-10 w-10 rounded-md" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="focus:outline-none">
                                {/* Ensure overlay doesn't block interactions like checkbox clicks */}
                                <span aria-hidden="true" className="absolute inset-0 pointer-events-none" />
                                <p className="text-sm font-medium text-gray-900">{item.tags}</p>
                                <div>
                                    <span>Duration: {item.duration}s</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
            <Button type="submit" >Save</Button>
        </form>

    </div>
}
