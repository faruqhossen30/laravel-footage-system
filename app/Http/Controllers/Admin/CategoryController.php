<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::paginate(10);

        // return $categories;
        return Inertia::render('admin/category/index', ['categories' => $categories]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/category/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:categories,name',
        ]);

        $slug = Str::slug($request->name);
        if (Category::where('slug', $slug)->exists()) {
            return back()->withErrors(['name' => 'Slug already exists for a similar name.'])->withInput();
        }

        $data = [
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'user_id' => Auth::user()->id,
        ];
        if ($request->file('thumbnail')) {
            $file_name = $request->file('thumbnail')->store('category');
            $data['thumbnail'] = $file_name;
        }

        Category::create($data);

        return to_route('category.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $category = Category::where('id', $id)->first();

        return Inertia::render('admin/category/edit', ['category' => $category]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|unique:categories,name,'.$id,
        ]);

        $slug = Str::slug($request->name);
        if (Category::where('slug', $slug)->where('id', '!=', $id)->exists()) {
            return back()->withErrors(['name' => 'Slug already exists for a similar name.'])->withInput();
        }

        $data = [
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'user_id' => Auth::user()->id,
        ];

        $skill = Category::firstwhere('id', $id);
        if ($request->file('thumbnail')) {
            if ($skill->thumbnail != null && Storage::exists($skill->thumbnail)) {
                Storage::delete($skill->thumbnail);
            }

            $file_name = $request->file('thumbnail')->store('category');
            $data['thumbnail'] = $file_name;
        }

        Category::firstwhere('id', $id)->update($data);

        return to_route('category.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Category::where('id', $id)->delete();

        return redirect()->route('category.index');
    }
}
