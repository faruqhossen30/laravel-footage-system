<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\SubCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubCategoryController extends Controller
{
    public function index()
    {
        $subCategories = SubCategory::with('category')->paginate(10);

        return Inertia::render('admin/sub-category/index', ['subCategories' => $subCategories]);
    }

    public function create()
    {
        $categories = Category::select('id', 'name')->get();

        return Inertia::render('admin/sub-category/create', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|unique:sub_categories,name',
        ]);

        $slug = Str::slug($request->name);
        if (SubCategory::where('slug', $slug)->exists()) {
            return back()->withErrors(['name' => 'Slug already exists for a similar name.'])->withInput();
        }

        $data = [
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'user_id' => Auth::user()->id,
            'status' => $request->status ?? 1,
        ];

        if ($request->file('thumbnail')) {
            $file_name = $request->file('thumbnail')->store('sub-category');
            $data['thumbnail'] = $file_name;
        }

        SubCategory::create($data);

        return to_route('sub-category.index');
    }

    public function edit(string $id)
    {
        $subCategory = SubCategory::with('category')->firstWhere('id', $id);
        $categories = Category::select('id', 'name')->get();

        return Inertia::render('admin/sub-category/edit', ['subCategory' => $subCategory, 'categories' => $categories]);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|unique:sub_categories,name,'.$id,
        ]);

        $slug = Str::slug($request->name);
        if (SubCategory::where('slug', $slug)->where('id', '!=', $id)->exists()) {
            return back()->withErrors(['name' => 'Slug already exists for a similar name.'])->withInput();
        }

        $data = [
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'user_id' => Auth::user()->id,
            'status' => $request->status ?? 1,
        ];

        $existing = SubCategory::firstWhere('id', $id);
        if ($request->file('thumbnail')) {
            if ($existing->thumbnail != null && Storage::exists($existing->thumbnail)) {
                Storage::delete($existing->thumbnail);
            }
            $file_name = $request->file('thumbnail')->store('sub-category');
            $data['thumbnail'] = $file_name;
        }

        SubCategory::firstWhere('id', $id)->update($data);

        return to_route('sub-category.index');
    }

    public function destroy(string $id)
    {
        SubCategory::where('id', $id)->delete();

        return redirect()->route('sub-category.index');
    }
}
