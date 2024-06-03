<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class FavoriteController extends Controller
{   
    public function index()
    {
        $api_key = config('services.tmdb.api_key');
        $user = Auth::user();
        $favorites = $user->favorites;

        $details = [];

        foreach ($favorites as $favorite) {
            $tmdb_api_key = 'https://api.themoviedb.org/3/' . $favorite->media_type . '/' . $favorite->media_id . '?api_key=' . $api_key;
            $response = Http::get($tmdb_api_key);

            if ($response->successful()) {
                $details[] = array_merge($response->json(), ['media_type' => $favorite->media_type]);
            }
        }

        return response()->json($details);
    }

    public function toggleFavorite(Request $request)
    {
        $validatedData = $request->validate([
            'media_type' => 'required|string',
            'media_id' => 'required|integer',
        ]);

        $existingFavorite = Favorite::where('user_id', Auth::id())
            ->where('media_type', $validatedData['media_type'])
            ->where('media_id', $validatedData['media_id'])
            ->first();

        //お気に入りが存在している場合
        if ($existingFavorite) {
            $existingFavorite->delete();

            return response()->json(['status' => 'removed']);
        }
        //お気に入りが存在していない場合
        Favorite::create([
            'media_type' => $validatedData['media_type'],
            'media_id' => $validatedData['media_id'],
            'user_id' => Auth::id(),
        ]);

        return response()->json(['status' => 'added']);
    }

    public function checkFavoriteStatus(Request $request)
    {
        $validatedData = $request->validate([
            'media_type' => 'required|string',
            'media_id' => 'required|integer',
        ]);

        $isFavorite =Favorite::where('user_id', Auth::id())
            ->where('media_type', $validatedData['media_type'])
            ->where('media_id', $validatedData['media_id'])
            ->exists();

        return response()->json($isFavorite);
    }
}
