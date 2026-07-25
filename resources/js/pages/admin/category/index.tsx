// @ts-nocheck
import { route } from '@/lib/route';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { EyeIcon } from '@heroicons/react/24/solid';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import SearchFilter from '@/components/old/Custom/SearchFilter';
import Pagination from '@/components/old/Pagination';

export default function Index({ auth, categories }) {
    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={route("dashboard")}>Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Categories</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                
                <Link href={route('category.create')}>
                    <Button variant="outline" type="button">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add item
                    </Button>
                </Link>
            </div>
            
            <Card className="overflow-hidden">
                <CardHeader className="p-4 border-b">
                    <SearchFilter routeName={'category.index'} />
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-slate-800">
                            <TableRow>
                                <TableHead className="w-[100px] text-center">S.N</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.data.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium text-center">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2 mr-4">
                                            <Link href={route('category.show', item.id)} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 text-gray-500">
                                                <EyeIcon className="w-4 h-4" />
                                            </Link>

                                            <Link href={route('category.edit', item.id)} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 text-green-500">
                                                <PencilIcon className="w-4 h-4" />
                                            </Link>

                                            <Link href={route('category.destroy', item.id)} method="Delete" as="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 text-red-500">
                                                <TrashIcon className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="p-4 border-t">
                        <Pagination pagination={categories} links={categories.links} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
