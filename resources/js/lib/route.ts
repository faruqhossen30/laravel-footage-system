export function route(name?: string, params: any = {}): any {
    if (!name) {
        const queryParams = Object.fromEntries(new URLSearchParams(window.location.search));
        return { params: queryParams };
    }

    let url = '';
    
    // Convert primitive params to object if needed (e.g. for edit/destroy)
    if (typeof params !== 'object' && params !== undefined) {
        params = { id: params };
    }

    if (name === 'video.index') url = '/admin/video';
    else if (name === 'video.create') url = '/admin/video/create';
    else if (name === 'video.edit') url = `/admin/video/${params.id}`;
    else if (name === 'video.update') url = `/admin/video/${params.id}`;
    else if (name === 'video.destroy') url = `/admin/video/${params.id}`;
    else if (name === 'video.enqueue') url = '/admin/video/enqueue';
    else if (name === 'video.stop-downloads') url = '/admin/video/stop-downloads';
    else if (name === 'video.pixabay.store') url = '/admin/video';
    else if (name === 'category.index') url = '/admin/category';
    else if (name === 'category.store') url = '/admin/category';
    else if (name === 'homepage') url = '/';
    else if (name === 'search') url = '/search';
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
