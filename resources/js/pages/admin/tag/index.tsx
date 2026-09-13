// @ts-nocheck
import React, { useState } from 'react';
import { route } from '@/lib/route';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import SearchFilter from '@/components/old/Custom/SearchFilter';
import Pagination from '@/components/old/Pagination';

export default function Index({ auth, tags }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTag, setEditingTag] = useState(null);

    const createForm = useForm({
        name: '',
        status: true,
    });

    const editForm = useForm({
        name: '',
        status: true,
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('tag.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditOpen = (item) => {
        setEditingTag(item);
        editForm.setData({
            name: item.name,
            status: Boolean(item.status),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingTag) return;

        editForm.put(route('tag.update', editingTag.id), {
            onSuccess: () => {
                setEditingTag(null);
                editForm.reset();
            },
        });
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Head title="Tags" />

            <div className="mb-2 flex items-center justify-between">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={route('dashboard')}>Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Tags</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Tag
                </Button>
            </div>

            <Card className="overflow-hidden">
                <CardHeader className="border-b p-4">
                    <SearchFilter routeName={'tag.index'} />
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-slate-800">
                            <TableRow>
                                <TableHead className="w-[80px] text-center">S.N</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-center">Videos</TableHead>
                                <TableHead className="text-center">Images</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="pr-6 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tags.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                        No tags found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tags.data.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-center font-medium">
                                            {(tags.current_page - 1) * tags.per_page + index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {item.name}
                                        </TableCell>
                                        <TableCell>
                                            <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                                                {item.slug}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                {item.videos_count ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                {item.images_count ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.status ? (
                                                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="mr-4 flex justify-end space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditOpen(item)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-green-600 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                                    title="Edit Tag"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>

                                                <Link
                                                    href={route('tag.destroy', item.id)}
                                                    method="delete"
                                                    as="button"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-red-600 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                                    title="Delete Tag"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {tags.links && tags.links.length > 3 && (
                        <div className="border-t p-4">
                            <Pagination pagination={tags} links={tags.links} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Tag Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Tag</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new tag below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-name">Tag Name</Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="e.g. Technology"
                                autoFocus
                            />
                            {createForm.errors.name && (
                                <p className="text-sm text-red-600">{createForm.errors.name}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                id="create-status"
                                type="checkbox"
                                checked={createForm.data.status}
                                onChange={(e) => createForm.setData('status', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="create-status" className="cursor-pointer">Active</Label>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Save Tag
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Tag Dialog */}
            <Dialog open={Boolean(editingTag)} onOpenChange={(open) => !open && setEditingTag(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Tag</DialogTitle>
                        <DialogDescription>
                            Update tag name and status.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Tag Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                placeholder="Tag Name"
                                autoFocus
                            />
                            {editForm.errors.name && (
                                <p className="text-sm text-red-600">{editForm.errors.name}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                id="edit-status"
                                type="checkbox"
                                checked={editForm.data.status}
                                onChange={(e) => editForm.setData('status', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="edit-status" className="cursor-pointer">Active</Label>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingTag(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Update Tag
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
