// @ts-nocheck
import { route } from '@/lib/route';
import { Head, useForm, Link } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Select from 'react-select';

export default function Edit({ image, tags = [], categories = [], subCategories = [], selectedCategoryIds = [], selectedSubCategoryIds = [], selectedTagIds = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        title: image.title ?? '',
        tag_ids: selectedTagIds ?? [],
        category_ids: selectedCategoryIds ?? [],
        sub_category_ids: selectedSubCategoryIds ?? [],
    });

    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
    const categoryValue = categoryOptions.filter(opt => data.category_ids.includes(opt.value));

    const tagOptions = tags.map(t => ({ value: t.id, label: t.name }));
    const tagValue = tagOptions.filter(opt => data.tag_ids.includes(opt.value));

    // Filter sub-categories by selected categories
    const filteredSubCategories = (Array.isArray(data.category_ids) && data.category_ids.length > 0)
        ? subCategories.filter(sc => data.category_ids.includes(sc.category_id))
        : [];

    const subCategoryOptions = filteredSubCategories.map(c => ({ value: c.id, label: c.name }));
    const subCategoryValue = subCategoryOptions.filter(opt => data.sub_category_ids.includes(opt.value));

    const submit = (e) => {
        e.preventDefault();
        put(route('image.update', image.id));
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Head title={`Edit Image #${image.id}`} />
            
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
                            <Link href={route("image.index")}>Images</Link>
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
                    <CardTitle className="text-lg">Edit Image #{image.id}</CardTitle>
                    <CardDescription>Update image details</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={submit} className="space-y-6 max-w-2xl mx-auto">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Enter title" />
                            {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <Select
                                isMulti
                                options={tagOptions}
                                value={tagValue}
                                onChange={(vals) => setData('tag_ids', (vals ?? []).map(v => v.value))}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: '#e5e7eb',
                                        borderRadius: '0.375rem',
                                        padding: '0.125rem',
                                        boxShadow: 'none',
                                        '&:hover': { borderColor: '#d1d5db' }
                                    })
                                }}
                            />
                            {errors.tag_ids && <div className="text-red-500 text-sm mt-1">{errors.tag_ids}</div>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Categories</Label>
                            <Select
                                isMulti
                                options={categoryOptions}
                                value={categoryValue}
                                onChange={(vals) => setData('category_ids', (vals ?? []).map(v => v.value))}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: '#e5e7eb',
                                        borderRadius: '0.375rem',
                                        padding: '0.125rem',
                                        boxShadow: 'none',
                                        '&:hover': { borderColor: '#d1d5db' }
                                    })
                                }}
                            />
                            {errors.category_ids && <div className="text-red-500 text-sm mt-1">{errors.category_ids}</div>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Sub Categories</Label>
                            <Select
                                isMulti
                                options={subCategoryOptions}
                                value={subCategoryValue}
                                onChange={(vals) => setData('sub_category_ids', (vals ?? []).map(v => v.value))}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: '#e5e7eb',
                                        borderRadius: '0.375rem',
                                        padding: '0.125rem',
                                        boxShadow: 'none',
                                        '&:hover': { borderColor: '#d1d5db' }
                                    })
                                }}
                            />
                            {errors.sub_category_ids && <div className="text-red-500 text-sm mt-1">{errors.sub_category_ids}</div>}
                        </div>

                        <Button type="submit" disabled={processing}>Save Changes</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
