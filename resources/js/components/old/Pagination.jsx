import React from 'react';
import { Link } from '@inertiajs/react';
import classNames from 'classnames';

const PageLink = ({ active, label, url }) => {
    const className = classNames(
        [
            'px-4 py-2',
            'border border-solid border-gray-300 dark:border-gray-700 rounded',
            'text-sm',
            'text-gray-800 dark:text-gray-400',
            'hover:bg-gray-300 dark:hover:bg-gray-700',
            'focus:outline-none focus:border-indigo-700 focus:text-indigo-700'
        ],
        {
            'bg-gray-300 dark:bg-gray-700': active
        }
    );
    return (
        <Link className={className} href={url}>
            <span dangerouslySetInnerHTML={{ __html: label }}></span>
        </Link>
    );
};

// Previous, if on first page
// Next, if on last page
// and dots, if exists (...)
const PageInactive = ({ label }) => {
    const className = classNames(
        'px-4 py-2 text-sm border rounded border-solid border-gray-300 text-gray dark:border-gray-700'
    );
    return (
        <div className={className} dangerouslySetInnerHTML={{ __html: label }} />
    );
};

export default ({ pagination,links = [],meta = null }) => {
    // dont render, if there's only 1 page (previous, 1, next)
    if (links.length === 3) return null;
    return (
        <div className="md:flex md:flex-1 md:items-center lg:justify-between dark:text-gray-400 ">
            <p className="text-sm leading-5 text-gray-700 py-2">
                Showing{' '}
                <span className="font-medium">
                    {meta ? meta.from : pagination.from}
                </span>
                /
                <span className="font-medium">
                    {meta ? meta.to : pagination.to}{' '}
                </span>
                (
                <span className="font-medium">
                    {meta ? meta.total : pagination.total}
                </span>{' '}
                total)
            </p>

            <div className="flex flex-wrap space-x-2">
                {links.map(({ active, label, url }) => {
                    return url === null ? (
                        <PageInactive key={label} label={label} />
                    ) : (
                        <PageLink key={label} label={label} active={active} url={url} />
                    );
                })}
            </div>
        </div>

    );
};
