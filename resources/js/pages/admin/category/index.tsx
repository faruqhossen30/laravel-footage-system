// @ts-nocheck
import { route } from '@/lib/route';
import BreadcumComponent from '@/components/old/Dashboard/BreadcumComponent';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { EyeIcon } from '@heroicons/react/24/solid';
import { Head, Link } from '@inertiajs/react';
import Pagination from '@/components/old/Pagination';
import { Button } from '@/components/old/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/old/table'
import SearchFilter from '@/components/old/Custom/SearchFilter';


export default function Index({ auth, categories }) {
    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="flex justify-between items-center">
                <BreadcumComponent pageOne="Categories" pageOneRoute="category.index" />
                <Button color="light" href={route('category.create')}>
                    <PlusIcon />
                    Add item
                </Button>
            </div>
            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden dark:bg-slate-900 dark:border-gray-700">
                <SearchFilter routeName={'category.index'} />
                <Table dense >
                    <TableHead className="bg-gray-50 dark:bg-slate-800">
                        <TableRow>
                            <TableHeader>
                                <span className="mx-5">S.N</span>
                            </TableHeader>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>Action</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.data.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <span className="mx-5">{index +1}</span>
                                </TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-zinc-500 flex space-x-1">
                                    <Link href={route('category.destroy', item.id)} method="Delete" as="button" className="border p-1 rounded-md dark:border-gray-700 text-gray-500">
                                        <EyeIcon className="w-4 h-4" />
                                    </Link>

                                    <Link href={route('category.edit', item.id)} className="border p-1 rounded-md dark:border-gray-700 text-green-500">
                                        <PencilIcon className="w-4 h-5" />
                                    </Link>
                                    <Link href={route('category.destroy', item.id)} method="Delete" as="button" className="border p-1 rounded-md dark:border-gray-700 text-red-500">
                                        <TrashIcon className="w-4 h-4 " />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Pagination pagination={categories} links={categories.links} />
            </div>



        </div>
    );
}
