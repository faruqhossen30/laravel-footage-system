// @ts-nocheck
import { route } from '@/lib/route';
import { Head, useForm } from '@inertiajs/react';
import ThumbnailInput from '@/components/old/ThumbnailInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function Edit({ auth, category }) {
    const { data, setData, put, post, processing, errors, reset } = useForm({
        name: category.name || '',
        description: category.description || '',
        status: String(category.status),
    });

    function submit(e) {
        e.preventDefault()
        put(route('category.update', category.id));
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={route("dashboard")}>Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={route("category.index")}>Categories</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Edit</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card>
                <CardHeader className="bg-gray-100/50 dark:bg-gray-800/50 border-b">
                    <CardTitle className="text-lg">Edit Category</CardTitle>
                    <CardDescription>Update category details</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={submit} className="space-y-6 max-w-2xl mx-auto">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" type="text" name="name" value={data.name} autoComplete="name" placeholder="Category name" onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" rows={5} name="description" placeholder="Write about Category." onChange={(e) => setData('description', e.target.value)} value={data.description} />
                            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="thumbnail">Thumbnail</Label>
                            <ThumbnailInput name="thumbnail" thumbnail={category.thumbnail} setData={setData} errors={errors} placeholder="Feature Photo" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select onValueChange={(value) => setData('status', value)} defaultValue={data.status}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Yes</SelectItem>
                                    <SelectItem value="0">No</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                        </div>

                        <Button type="submit" disabled={processing}>Update</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
