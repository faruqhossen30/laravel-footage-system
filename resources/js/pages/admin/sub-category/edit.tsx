// @ts-nocheck
import { route } from '@/lib/route';
import { Head, useForm, Link } from '@inertiajs/react';
import ThumbnailInput from '@/components/old/ThumbnailInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function Edit({ auth, subCategory, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        category_id: subCategory.category_id ? subCategory.category_id.toString() : '',
        name: subCategory.name || '',
        description: subCategory.description || '',
        status: subCategory.status !== undefined ? subCategory.status.toString() : "1",
    });

    function submit(e) {
        e.preventDefault();
        put(route('sub-category.update', subCategory.id));
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={route("dashboard")}>Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={route("sub-category.index")}>SubCategories</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Edit</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card>
                <CardHeader className="bg-gray-100/50 dark:bg-gray-800/50 border-b">
                    <CardTitle className="text-lg">Edit SubCategory</CardTitle>
                    <CardDescription>Update sub-category details</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={submit} className="space-y-6 max-w-2xl mx-auto">
                        <div className="space-y-2">
                            <Label htmlFor="category_id">Category</Label>
                            <Select onValueChange={(value) => setData('category_id', value)} value={data.category_id}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" type="text" name="name" value={data.name} autoComplete="name" placeholder="SubCategory name" onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" rows={5} name="description" value={data.description} placeholder="Write about SubCategory." onChange={(e) => setData('description', e.target.value)} />
                            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="thumbnail">Thumbnail</Label>
                            <ThumbnailInput name="thumbnail" thumbnail={subCategory.thumbnail} setData={setData} errors={errors} placeholder="Feature Photo" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select onValueChange={(value) => setData('status', value)} value={data.status}>
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
