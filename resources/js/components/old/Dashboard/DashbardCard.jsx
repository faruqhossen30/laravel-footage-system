import { UserGroupIcon } from '@heroicons/react/24/outline'
import React from 'react'

const DashbardCard = ({ title, subtitle, icon }) => {
    return (
        <div className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md focus:outline-none focus:shadow-md transition dark:bg-neutral-900 dark:border-neutral-800">
            <div className="">
                <div className="flex gap-x-5">
                    <div className="bg-green-500 dark:bg-green-900 p-4 rounded-l-md">
                        {icon ?? <UserGroupIcon className="w-6 h-6" />}
                    </div>
                    <div className="grow p-2">
                        <h3 className="group-hover:text-blue-600 font-semibold text-gray-800 dark:group-hover:text-neutral-400 dark:text-neutral-200">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-neutral-500">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashbardCard
