import { route } from '@/lib/route';
import { ChevronDoubleRightIcon, ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { Link } from '@inertiajs/react'
import React from 'react'

export default function BreadcumComponent({ pageOne, pageOneRoute, pageTwo }) {
    return (
        <div className='py-4'>
            <ol className="flex items-center space-x-2 whitespace-nowrap min-w-0" aria-label="Breadcrumb">
                <li className="text-sm">
                    <Link href={route("dashboard")} className="flex items-center space-x-2 text-gray-500 hover:text-blue-600">
                        <HomeIcon className="w-5 h-5" />
                        <span className="font-bold">Dashboard</span>
                    </Link>
                </li>
                <li className="text-sm">
                    <Link href={pageOneRoute && route(pageOneRoute)} className="flex items-center space-x-2 text-gray-500 hover:text-blue-600">
                        <ChevronRightIcon className="w-5 h-5" />
                        <span className="font-bold">{pageOne}</span>
                    </Link>
                </li>
                {
                    pageTwo &&
                    <li className="text-sm">
                    <Link href="#" className="flex items-center space-x-2 text-gray-500 hover:text-blue-600">
                        <ChevronRightIcon className="w-5 h-5" />
                        <span>{pageTwo}</span>
                    </Link>
                </li>
                }


            </ol>
        </div>
    )
}
