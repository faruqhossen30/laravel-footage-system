export function route(name?: string, params: any = {}): any {
    if (!name) {
        const search = typeof window !== 'undefined' ? window.location.search : '';
        const queryParams = Object.fromEntries(new URLSearchParams(search));
        return { params: queryParams };
    }

    let url = '';
    
    // Convert primitive params to object if needed (e.g. for edit/destroy)
    if (typeof params !== 'object' && params !== undefined) {
        params = { id: params };
    }

    if (name === 'video.index') url = '/admin/video';
    else if (name === 'video.upload') url = '/admin/video/upload';
    else if (name === 'video.upload.store') url = '/admin/video/upload';
    else if (name === 'video.create') url = '/admin/video/create';
    else if (name === 'video.search') url = '/admin/video/search';
    else if (name === 'video.edit') url = `/admin/video/${params.id}`;
    else if (name === 'video.update') url = `/admin/video/${params.id}`;
    else if (name === 'video.destroy') url = `/admin/video/${params.id}`;
    else if (name === 'video.enqueue') url = '/admin/video/enqueue';
    else if (name === 'video.stop-downloads') url = '/admin/video/stop-downloads';
    else if (name === 'video.pixabay.store') url = '/admin/video';
    else if (name === 'image.index') url = '/admin/image';
    else if (name === 'image.create') url = '/admin/image/create';
    else if (name === 'image.edit') url = `/admin/image/${params.id}`;
    else if (name === 'image.update') url = `/admin/image/${params.id}`;
    else if (name === 'image.destroy') url = `/admin/image/${params.id}`;
    else if (name === 'image.enqueue') url = '/admin/image/enqueue';
    else if (name === 'image.stop-downloads') url = '/admin/image/stop-downloads';
    else if (name === 'image.pixabay.store') url = '/admin/image';
    else if (name === 'category.index') url = '/admin/category';
    else if (name === 'category.create') url = '/admin/category/create';
    else if (name === 'category.show') url = `/admin/category/${params.id}`;
    else if (name === 'category.edit') url = `/admin/category/${params.id}/edit`;
    else if (name === 'category.update') url = `/admin/category/${params.id}`;
    else if (name === 'category.destroy') url = `/admin/category/${params.id}`;
    else if (name === 'category.store') url = '/admin/category';
    else if (name === 'sub-category.index') url = '/admin/sub-category';
    else if (name === 'sub-category.create') url = '/admin/sub-category/create';
    else if (name === 'sub-category.show') url = `/admin/sub-category/${params.id}`;
    else if (name === 'sub-category.edit') url = `/admin/sub-category/${params.id}/edit`;
    else if (name === 'sub-category.update') url = `/admin/sub-category/${params.id}`;
    else if (name === 'sub-category.destroy') url = `/admin/sub-category/${params.id}`;
    else if (name === 'sub-category.store') url = '/admin/sub-category';
    else if (name === 'tag.index') url = '/admin/tag';
    else if (name === 'tag.create') url = '/admin/tag/create';
    else if (name === 'tag.show') url = `/admin/tag/${params.id}`;
    else if (name === 'tag.edit') url = `/admin/tag/${params.id}/edit`;
    else if (name === 'tag.update') url = `/admin/tag/${params.id}`;
    else if (name === 'tag.destroy') url = `/admin/tag/${params.id}`;
    else if (name === 'tag.store') url = '/admin/tag';
    else if (name === 'homepage') url = '/';
    else if (name === 'search') url = '/search';
    else if (name === 'images') url = '/images';
    else url = `/${name.replace(/\./g, '/')}`;

    const queryParams = { ...params };
    delete queryParams.id; // remove id from query params since it's in the path
    
    if (Object.keys(queryParams).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, String(value));
            }
        });
        const qs = searchParams.toString();
        if (qs) {
            url += `?${qs}`;
        }
    }
    return url;
}
