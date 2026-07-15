// @ts-nocheck
import { route } from '@/lib/route';
import { Head, useForm } from '@inertiajs/react';
import BreadcumComponent from '@/components/old/Dashboard/BreadcumComponent';
import ThumbnailInput from '@/components/old/ThumbnailInput';
import InputLabel from '@/components/old/InputLabel';
import { Input } from '@/components/old/input';
import { Button } from '@/components/old/button';

export default function Create({ auth, categories }) {
    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        name: '',
        description: '',
        thumbnail: null,
        status: 1,
    });

    function submit(e) {
        e.preventDefault();
        post(route('sub-category.store'));
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <BreadcumComponent pageOne="SubCategories" pageOneRoute="sub-category.index" />
            <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-gray-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
                <div className="bg-gray-100 border-b rounded-t-xl py-3 px-4 md:py-4 md:px-5 dark:bg-gray-800 dark:border-neutral-700">
                    <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                        SubCategory Create
                    </p>
                </div>
                <div className="p-4 md:p-5">
                    <div className=" px-2 py-2 sm:px-6 lg:px-4 mx-auto">
                        <form onSubmit={submit}>
                            <div>
                                <InputLabel htmlFor="category_id" />
                                <select id="category_id" name="category_id" className="py-2 px-4 pr-9 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}>
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <p className="text-sm text-red-600 mt-2">{errors.category_id}</p>
                            </div>
                            <div>
                                <InputLabel htmlFor="name" />
                                <Input id="name" type="text" name="name" value={data.name} autoComplete="name" placeholder="name" onChange={(e) => setData('name', e.target.value)} />
                                <p className="text-sm text-red-600 mt-2">{errors.name}</p>
                            </div>
                            <div>
                                <InputLabel htmlFor="Description" />
                                <textarea id="description" rows={5} name="description" placeholder="Write about SubCategory." onChange={(e) => setData('description', e.target.value)}
                                    className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600">{data.description}</textarea>
                                <p className="text-sm text-red-600 mt-2">{errors.description}</p>
                            </div>
                            <div>
                                <InputLabel htmlFor="thumbnail" />
                                <ThumbnailInput name="thumbnail" setData={setData} errors={errors} placeholder="Feature Photo" />
                            </div>
                            <div>
                                <InputLabel htmlFor="status" />
                                <select id="status" name="status" className="py-2 px-4 pr-9 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400"
                                    onChange={(e) => setData('status', e.target.value)}>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                                <p className="text-sm text-red-600 mt-2">{errors.status}</p>
                            </div>
                            <Button type="submit" disabled={processing} >Save </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
