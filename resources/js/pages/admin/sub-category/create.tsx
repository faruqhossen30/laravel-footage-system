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

export default function Create({ auth, categories }) {
    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        name: '',
        description: '',
        thumbnail: null,
        status: "1",
    });

    function submit(e) {
        e.preventDefault();
        post(route('sub-category.store'));
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
                        <BreadcrumbPage>Create</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card>
                <CardHeader className="bg-gray-100/50 dark:bg-gray-800/50 border-b">
                    <CardTitle className="text-lg">SubCategory Create</CardTitle>
                    <CardDescription>Add a new sub-category</CardDescription>
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
                            <Textarea id="description" rows={5} name="description" placeholder="Write about SubCategory." onChange={(e) => setData('description', e.target.value)} value={data.description} />
                            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="thumbnail">Thumbnail</Label>
                            <ThumbnailInput name="thumbnail" setData={setData} errors={errors} placeholder="Feature Photo" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select onValueChange={(value) => setData('status', value)} value={data.status.toString()}>
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

                        <Button type="submit" disabled={processing}>Save</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
