import { Fragment, useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function FlashMessage({ type = 'success', message }) {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const bgColor = type === 'success' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30';
    const textColor = type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200';
    const borderColor = type === 'success' ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800';
    const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

    return (
        <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className={`rounded-md ${bgColor} p-4 mb-4 border ${borderColor}`}>
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Icon className={`h-5 w-5 ${textColor}`} aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className={`text-sm font-medium ${textColor}`}>{message}</p>
                    </div>
                    <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                            <button
                                type="button"
                                className={`inline-flex rounded-md p-1.5 ${bgColor} ${textColor} hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type === 'success' ? 'green' : 'red'}-50 focus:ring-${type === 'success' ? 'green' : 'red'}-600`}
                                onClick={() => setShow(false)}
                            >
                                <span className="sr-only">Dismiss</span>
                                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    );
} 