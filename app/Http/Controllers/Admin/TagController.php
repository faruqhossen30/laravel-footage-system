<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Tag::query()->withCount(['videos', 'images']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('show', 10);
        $tags = $query->latest('id')->paginate($perPage)->withQueryString();

        return Inertia::render('admin/tag/index', [
            'tags' => $tags,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
        ]);

        $slug = Str::slug($request->name);
        if (Tag::where('slug', $slug)->exists()) {
            return back()->withErrors(['name' => 'Slug already exists for a similar name.'])->withInput();
        }

        Tag::create([
            'name' => $request->name,
            'slug' => $slug,
            'status' => $request->boolean('status', true),
        ]);

        return to_route('tag.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $tag = Tag::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:tags,name,'.$id,
        ]);

        $slug = Str::slug($request->name);
        if (Tag::where('slug', $slug)->where('id', '!=', $id)->exists()) {
            return back()->withErrors(['name' => 'Slug already exists for a similar name.'])->withInput();
        }

        $tag->update([
            'name' => $request->name,
            'slug' => $slug,
            'status' => $request->has('status') ? $request->boolean('status') : $tag->status,
        ]);

        return to_route('tag.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $tag = Tag::findOrFail($id);
        $tag->videos()->detach();
        $tag->images()->detach();
        $tag->delete();

        return redirect()->route('tag.index');
    }
}
