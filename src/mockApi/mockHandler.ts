import * as db from './db';
import { Album } from '../interfaces/albums';
import { Track } from '../interfaces/track';
import { Artist } from '../interfaces/artist';
import { Playlist } from '../interfaces/playlists'; // Added for featured playlists
import { Category } from '../interfaces/categories'; // Added for categories
import { PlayHistoryObject, SavedTrack } from '../interfaces/track'; // For recently played & saved tracks

interface MockResponse {
  data: any;
  status: number;
  statusText: string;
}

// Helper for pagination
const paginate = (items: any[], page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  return {
    items: paginatedItems,
    total: items.length,
    page,
    limit,
    offset,
    href: `mock://url?page=${page}&limit=${limit}`, // Mock href
    next: offset + limit < items.length ? `mock://url?page=${page + 1}&limit=${limit}` : null,
    previous: page > 1 ? `mock://url?page=${page - 1}&limit=${limit}` : null,
  };
};

// In-memory stores for user's saved items
const userSavedAlbums = new Set<string>([db.mockAlbum1.id]); // Pre-populate with one saved album
const userSavedTracks = new Set<string>([db.mockTrack1.id, db.mockTrack2.id]); // Pre-populate

export async function handleMockRequest(
  url: string,
  method: string,
  params?: Record<string, any>, // Usually query params from Axios config
  body?: any // Usually request body for PUT, POST, DELETE from Axios config
): Promise<MockResponse> {
  console.log(`Mock Handler: Received ${method} ${url}`, "Query Params:", params, "Body:", body);

  // For query params passed via axios's `params` object
  const queryParamsFromConfig = new URLSearchParams(params as any);

  // For query params directly in URL string (e.g. if URL is manually constructed)
  const queryParamsFromUrl = new URLSearchParams(url.split('?')[1] || '');

  // Merge them, giving precedence to queryParamsFromConfig if keys overlap
  const finalQueryParams = new URLSearchParams({
    ...Object.fromEntries(queryParamsFromUrl),
    ...Object.fromEntries(queryParamsFromConfig),
  });


  const urlParts = url.startsWith('/') ? url.substring(1).split('?')[0].split('/') : url.split('?')[0].split('/');
  const page = parseInt(finalQueryParams.get('page') || '1', 10);
  const limit = parseInt(finalQueryParams.get('limit') || '20', 10);

  // --- /me endpoints ---

  // GET /me (User Profile) - Existing
  if (urlParts[0] === 'me' && urlParts.length === 1 && method === 'GET') {
    const userProfile = db.getUserById('user1') || db.mockUser1;
    return { data: userProfile, status: 200, statusText: 'OK' };
  }

  // GET /me/albums - Existing
  if (urlParts[0] === 'me' && urlParts[1] === 'albums' && method === 'GET') {
    const savedAlbumObjects = Array.from(userSavedAlbums)
                                  .map(id => ({ added_at: new Date().toISOString(), album: db.getAlbumById(id) }))
                                  .filter(item => item.album);
    return { data: paginate(savedAlbumObjects, page, limit), status: 200, statusText: 'OK' };
  }

  // PUT /me/albums - Existing
  if (urlParts[0] === 'me' && urlParts[1] === 'albums' && method === 'PUT') {
    const idsToSave: string[] = (body?.ids || finalQueryParams.get('ids')?.split(',')) || [];
    idsToSave.forEach(id => { if (db.getAlbumById(id)) userSavedAlbums.add(id); });
    return { data: null, status: 200, statusText: 'OK' };
  }

  // DELETE /me/albums - Existing
  if (urlParts[0] === 'me' && urlParts[1] === 'albums' && method === 'DELETE') {
    const idsToDelete: string[] = (body?.ids || finalQueryParams.get('ids')?.split(',')) || [];
    idsToDelete.forEach(id => userSavedAlbums.delete(id));
    return { data: null, status: 200, statusText: 'OK' };
  }

  // GET /me/top/tracks - New
  if (urlParts[0] === 'me' && urlParts[1] === 'top' && urlParts[2] === 'tracks' && method === 'GET') {
    const allTracks = [db.mockTrack1, db.mockTrack2, db.mockTrack3, db.mockTrack4, db.mockTrack5, db.mockTrack6, db.mockTrack7];
    return { data: paginate(allTracks, page, limit), status: 200, statusText: 'OK' };
  }

  // GET /me/player/recently-played - New
  if (urlParts[0] === 'me' && urlParts[1] === 'player' && urlParts[2] === 'recently-played' && method === 'GET') {
    const recentTracks: PlayHistoryObject[] = [
      { track: db.mockTrack1, played_at: new Date(Date.now() - 3600000).toISOString(), context: null }, // Played 1 hour ago
      { track: db.mockTrack3, played_at: new Date(Date.now() - 7200000).toISOString(), context: null }, // Played 2 hours ago
      { track: db.mockTrack5, played_at: new Date(Date.now() - 10800000).toISOString(), context: null }, // Played 3 hours ago
    ];
    return { data: paginate(recentTracks, page, limit), status: 200, statusText: 'OK' };
  }

  // GET /me/tracks - New
  if (urlParts[0] === 'me' && urlParts[1] === 'tracks' && method === 'GET') {
    const savedTrackObjects: SavedTrack[] = Array.from(userSavedTracks)
      .map(id => ({ added_at: new Date().toISOString(), track: db.getTrackById(id) }))
      .filter(item => item.track); // Filter out undefined if any ID is invalid
    return { data: paginate(savedTrackObjects, page, limit), status: 200, statusText: 'OK' };
  }

  // PUT /me/tracks - New
  if (urlParts[0] === 'me' && urlParts[1] === 'tracks' && method === 'PUT') {
    const idsToSave: string[] = (body?.ids || finalQueryParams.get('ids')?.split(',')) || [];
    idsToSave.forEach(id => { if (db.getTrackById(id)) userSavedTracks.add(id); });
    console.log('Updated saved tracks:', userSavedTracks);
    return { data: null, status: 200, statusText: 'OK' };
  }

  // DELETE /me/tracks - New
  if (urlParts[0] === 'me' && urlParts[1] === 'tracks' && method === 'DELETE') {
    const idsToDelete: string[] = (body?.ids || finalQueryParams.get('ids')?.split(',')) || [];
    idsToDelete.forEach(id => userSavedTracks.delete(id));
    console.log('Updated saved tracks:', userSavedTracks);
    return { data: null, status: 200, statusText: 'OK' };
  }

  // --- /browse endpoints ---

  // GET /browse/new-releases - Existing
  if (urlParts[0] === 'browse' && urlParts[1] === 'new-releases' && method === 'GET') {
    const allAlbums = Object.values(db.db.albums);
    return { data: { albums: paginate(allAlbums, page, limit) }, status: 200, statusText: 'OK' };
  }

  // GET /browse/featured-playlists - New
  if (urlParts[0] === 'browse' && urlParts[1] === 'featured-playlists' && method === 'GET') {
    const allPlaylists = [db.mockPlaylist1, db.mockPlaylist2, db.mockPlaylist3, db.mockPlaylistCat1, db.mockPlaylistCat2 ];
    return {
      data: { message: 'Popular Playlists For You', playlists: paginate(allPlaylists, page, limit) },
      status: 200,
      statusText: 'OK',
    };
  }

  // GET /browse/categories - New
  if (urlParts[0] === 'browse' && urlParts[1] === 'categories' && urlParts.length === 2 && method === 'GET') {
    const allCategories = Object.values(db.db.categories);
    // The API typically wraps this in a 'categories' object.
    return { data: { categories: paginate(allCategories, page, limit) }, status: 200, statusText: 'OK' };
  }

  // GET /browse/categories/:id/playlists - New
  if (urlParts[0] === 'browse' && urlParts[1] === 'categories' && urlParts.length === 4 && urlParts[3] === 'playlists' && method === 'GET') {
    const categoryId = urlParts[2];
    const category = db.getCategoryById(categoryId);
    if (!category) {
      return { data: { error: 'Category not found' }, status: 404, statusText: 'Not Found' };
    }
    // @ts-ignore
    const categoryPlaylists = Object.values(db.db.playlists).filter(p => p.category_id === categoryId);
    // The API typically wraps this in a 'playlists' object.
    return { data: { playlists: paginate(categoryPlaylists, page, limit) }, status: 200, statusText: 'OK' };
  }

  // --- /artists endpoints ---

  // GET /artists/:id - Existing
  if (urlParts[0] === 'artists' && urlParts.length === 2 && !urlParts.includes('albums') && !urlParts.includes('top-tracks') && !urlParts.includes('related-artists') && method === 'GET') {
    const artist = db.getArtistById(urlParts[1]);
    if (artist) return { data: artist, status: 200, statusText: 'OK' };
  }

  // GET /artists/:id/albums - Existing
  if (urlParts[0] === 'artists' && urlParts.length === 3 && urlParts[2] === 'albums' && method === 'GET') {
    const artistId = urlParts[1];
    const artistAlbums = Object.values(db.db.albums).filter(album => album.artists.some(artist => artist.id === artistId));
    return { data: paginate(artistAlbums, page, limit), status: 200, statusText: 'OK' }; // Spotify API doesn't wrap this in 'items' but paginate does. Adjust if needed.
  }

  // GET /artists/:id/top-tracks - Existing
  if (urlParts[0] === 'artists' && urlParts.length === 3 && urlParts[2] === 'top-tracks' && method === 'GET') {
    const artistId = urlParts[1];
    const artistTracks = Object.values(db.db.tracks).filter(track => track.artists.some(artist => artist.id === artistId)).slice(0, 10);
    return { data: { tracks: artistTracks }, status: 200, statusText: 'OK' };
  }

  // GET /artists/:id/related-artists - New
  if (urlParts[0] === 'artists' && urlParts.length === 3 && urlParts[2] === 'related-artists' && method === 'GET') {
    const artistId = urlParts[1];
    const allArtists = Object.values(db.db.artists);
    const relatedArtists = allArtists.filter(artist => artist.id !== artistId).slice(0, 5); // Get up to 5 related
    return { data: { artists: relatedArtists }, status: 200, statusText: 'OK' };
  }

  // --- /albums endpoints ---
  // GET /albums/:id - Existing (adjusted to avoid conflict with /albums/:id/tracks)
  if (urlParts[0] === 'albums' && urlParts.length === 2 && !urlParts.includes('tracks') && method === 'GET') {
    const album = db.getAlbumById(urlParts[1]);
    if (album) return { data: album, status: 200, statusText: 'OK' };
  }

  // GET /albums/:id/tracks - Existing
  if (urlParts[0] === 'albums' && urlParts.length === 3 && urlParts[2] === 'tracks' && method === 'GET') {
    const album = db.getAlbumById(urlParts[1]);
    if (album) return { data: paginate(album.tracks.items, page, limit), status: 200, statusText: 'OK' };
  }

  // --- /recommendations endpoint (generic) --- New
  if (urlParts[0] === 'recommendations' && method === 'GET') {
    // Example: 2 albums and 3 playlists
    const recommendedAlbums = Object.values(db.db.albums).slice(0, 2);
    const recommendedPlaylists = Object.values(db.db.playlists).slice(0, 3);
    // Spotify's recommendation seeds are complex. This is a very simplified version.
    // It might return a list of tracks based on seeds, or a mix of albums/playlists.
    // For this mock, let's return a structure that provides some albums and playlists.
    return {
      data: {
        seeds: [{id: 'mockseed', type: 'genre', href:null, initialPoolSize:0, afterFilteringSize:0, afterRelinkingSize:0}], // Dummy seeds
        tracks: [ // Typically recommendations are tracks, but can also be other entities if client expects
            ...db.mockAlbum1.tracks.items.slice(0,2),
            ...db.mockPlaylist1.tracks.items.slice(0,2).map(pt => pt.track)
        ].filter(t => t), // Filter out nulls if any
        // Or, if your app expects albums/playlists directly in a "recommendations" section:
        // albums: recommendedAlbums,
        // playlists: recommendedPlaylists,
      },
      status: 200,
      statusText: 'OK',
    };
  }

  // --- /search endpoint --- Existing
  if (urlParts[0] === 'search' && method === 'GET') {
    const query = finalQueryParams.get('q');
    const type = finalQueryParams.get('type') || 'album,artist,track,playlist';
    const typesToSearch = type.split(',');
    const searchLimit = parseInt(finalQueryParams.get('limit') || '10', 10); // per type

    if (!query) return { data: { error: 'Query parameter "q" is required' }, status: 400, statusText: 'Bad Request' };
    const lowerQuery = query.toLowerCase();
    const results: { albums?: any; artists?: any; tracks?: any; playlists?: any } = {};

    if (typesToSearch.includes('album')) {
      results.albums = paginate(Object.values(db.db.albums).filter(a => a.name.toLowerCase().includes(lowerQuery)), page, searchLimit);
    }
    if (typesToSearch.includes('artist')) {
      results.artists = paginate(Object.values(db.db.artists).filter(a => a.name.toLowerCase().includes(lowerQuery)), page, searchLimit);
    }
    if (typesToSearch.includes('track')) {
      results.tracks = paginate(Object.values(db.db.tracks).filter(t => t.name.toLowerCase().includes(lowerQuery)), page, searchLimit);
    }
    if (typesToSearch.includes('playlist')) {
      results.playlists = paginate(Object.values(db.db.playlists).filter(p => p.name.toLowerCase().includes(lowerQuery)), page, searchLimit);
    }
    return { data: results, status: 200, statusText: 'OK' };
  }

  // Default: Not Found
  return {
    data: { error: 'Not Found', message: `Endpoint ${method} ${urlParts.join('/')} not mocked.` },
    status: 404,
    statusText: 'Not Found',
  };
}

// Example test calls (can be removed or commented out)
// async function testNewHandlers() {
//   console.log('--- Testing /me/top/tracks ---');
//   console.log(JSON.stringify(await handleMockRequest('/me/top/tracks', 'GET', {limit: '2'}), null, 2));
//   console.log('--- Testing /me/player/recently-played ---');
//   console.log(JSON.stringify(await handleMockRequest('/me/player/recently-played', 'GET', {limit: '2'}), null, 2));
//   console.log('--- Testing /browse/featured-playlists ---');
//   console.log(JSON.stringify(await handleMockRequest('/browse/featured-playlists', 'GET', {limit: '2'}), null, 2));
//   console.log('--- Testing /browse/categories ---');
//   console.log(JSON.stringify(await handleMockRequest('/browse/categories', 'GET', {limit: '2'}), null, 2));
//   console.log('--- Testing /browse/categories/cat1/playlists ---');
//   console.log(JSON.stringify(await handleMockRequest('/browse/categories/cat1/playlists', 'GET', {limit: '2'}), null, 2));
//   console.log('--- Testing /artists/artist1/related-artists ---');
//   console.log(JSON.stringify(await handleMockRequest('/artists/artist1/related-artists', 'GET'), null, 2));
//   console.log('--- Testing /me/tracks (GET) ---');
//   console.log(JSON.stringify(await handleMockRequest('/me/tracks', 'GET', {limit: '1'}), null, 2));
//   console.log('--- Testing /me/tracks (PUT) ---');
//   await handleMockRequest('/me/tracks', 'PUT', undefined, { ids: [db.mockTrack3.id] });
//   console.log(JSON.stringify(await handleMockRequest('/me/tracks', 'GET', {limit: '5'}), null, 2));
//   console.log('--- Testing /me/tracks (DELETE) ---');
//   await handleMockRequest('/me/tracks', 'DELETE', undefined, { ids: [db.mockTrack1.id] });
//   console.log(JSON.stringify(await handleMockRequest('/me/tracks', 'GET', {limit: '5'}), null, 2));
//   console.log('--- Testing /recommendations ---');
//   console.log(JSON.stringify(await handleMockRequest('/recommendations', 'GET', {limit: '2'}), null, 2));
// }
// if (require.main === module) { testNewHandlers(); }
