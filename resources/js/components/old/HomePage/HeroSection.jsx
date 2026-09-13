import { route } from '@/lib/route';
import { BoltIcon, FireIcon, MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/outline';
import { Link, router } from '@inertiajs/react';
import React, { useState } from 'react'

const HeroSection = () => {
    const params = route().params;
    const TABS = [
        { key: 'latest', label: 'Latest', icon: BoltIcon },
        { key: 'trending', label: 'Trending', icon: FireIcon },
        { key: 'popular', label: 'Popular', icon: StarIcon },
    ];
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState('latest');

    return (
        <>
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-20 dark:opacity-25" />
                <div className="relative mx-auto max-w-7xl px-6 py-16">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-5 inline-flex items-center rounded-full bg-white/90 p-1 shadow-sm backdrop-blur dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
                            <Link
                                href={route('homepage')}
                                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow"
                            >
                                <span>Videos</span>
                            </Link>
                            <Link
                                href={route('images')}
                                className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
                            >
                                <span>Images</span>
                            </Link>
                        </div>
                        <Link href={route('homepage')} className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl block">
                            Discover free stock video footage
                        </Link>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Search thousands of high-quality clips. No attribution required. Inspired by the clean, modern feel of premium stock libraries.
                        </p>

                        {/* Search */}
                        <div className="mt-6 flex items-center justify-center gap-3">
                            <div className="mx-auto px-8 flex w-full max-w-2xl items-center gap-2 rounded-full border border-gray-300 bg-white py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                <input
                                    onChange={(e) => {
                                        return router.get(route('search'),
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
                                    className="h-10 w-full bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none focus:boerder-none dark:text-gray-200 outline-none border-none"
                                    placeholder="Search videos (e.g., nature, city, drone)"
                                    type="text"
                                />
                                <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Trending tags */}
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {['Drone', '4K', 'Slow Motion', 'Timelapse', 'Sunset'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => {
                                        setQuery(t);
                                        router.get(route('search'), { search: t });
                                    }}
                                    className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-10 flex items-center justify-center gap-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab.key
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
                                    }`}
                            >
                                <tab.icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

        </>
    )
}

export default HeroSection
