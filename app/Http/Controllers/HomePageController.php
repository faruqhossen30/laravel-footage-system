<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class HomePageController extends Controller
{
    public function homePage(Request $request)
    {
        $show = null;
        if (isset($_GET['show']) && $_GET['show']) {
            $show = $_GET['show'];
        }

        $search = null;
        if (isset($_GET['search']) && $_GET['search']) {
            $search = trim($_GET['search']);
        }

        $provider = null;
        if (isset($_GET['provider']) && $_GET['provider']) {
            $provider = $_GET['provider'];
        }

        $videos = Video::when($search, function ($query) use ($search) {
            $query->
            where('title','like', "%{$search}%")
            ->orWhereHas('tags', function ($tagsQuery) use ($search) {
                $terms = array_filter(explode(' ', $search));
                $tagsQuery->where(function ($q) use ($terms) {
                    foreach ($terms as $term) {
                        $q->orWhere('tags.name', 'like', "%{$term}%");
                    }
                });
            });
        })
            ->paginate($per_page ?? 10)
            ->appends(request()->query());
    
        return Inertia::render('home-page', ['videos' => $videos]);
    }
}
