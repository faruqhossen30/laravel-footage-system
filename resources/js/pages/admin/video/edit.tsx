// @ts-nocheck
import { route } from '@/lib/route';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/old/input';
import { Button } from '@/components/old/button';
import Select from 'react-select';

export default function Edit({ video, tags = [], categories = [], subCategories = [], selectedCategoryIds = [], selectedSubCategoryIds = [], selectedTagIds = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        title: video.title ?? '',
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
        put(route('video.update', video.id));
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Head title={`Edit Video #${video.id}`} />
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-4 space-y-4">
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium">Title</label>
                        <Input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Enter title" />
                        {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Tags</label>
                        <Select
                            isMulti
                            options={tagOptions}
                            value={tagValue}
                            onChange={(vals) => setData('tag_ids', (vals ?? []).map(v => v.value))}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                        {errors.tag_ids && <div className="text-red-500 text-sm mt-1">{errors.tag_ids}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Categories</label>
                        <Select
                            isMulti
                            options={categoryOptions}
                            value={categoryValue}
                            onChange={(vals) => setData('category_ids', (vals ?? []).map(v => v.value))}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                        {errors.category_ids && <div className="text-red-500 text-sm mt-1">{errors.category_ids}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Sub Categories</label>
                        <Select
                            isMulti
                            options={subCategoryOptions}
                            value={subCategoryValue}
                            onChange={(vals) => setData('sub_category_ids', (vals ?? []).map(v => v.value))}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                        {errors.sub_category_ids && <div className="text-red-500 text-sm mt-1">{errors.sub_category_ids}</div>}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
