import { Album } from '../interfaces/albums';
import { Artist } from '../interfaces/artist';
import { Track } from '../interfaces/track';
import { UserProfile } from '../interfaces/user'; // For playlist owner
import { Playlist, PlaylistTrack } from '../interfaces/playlists';
import { Category } from '../interfaces/categories'; // Added for categories
import { Image } from '../interfaces/spotify'; // Common Image type

// --- DB Store Initialization ---
interface MockDB {
  albums: Record<string, Album>;
  artists: Record<string, Artist>;
  tracks: Record<string, Track>;
  playlists: Record<string, Playlist>;
  users: Record<string, UserProfile>;
  categories: Record<string, Category>; // Added for categories
}

export const db: MockDB = {
  albums: {},
  artists: {},
  tracks: {},
  playlists: {},
  users: {},
  categories: {}, // Added for categories
};

// --- Helper to add artist to DB if not exists ---
function addArtistToDb(artist: Artist): Artist {
  if (!db.artists[artist.id]) {
    db.artists[artist.id] = artist;
  }
  return db.artists[artist.id];
}

// --- Helper to add track to DB if not exists ---
function addTrackToDb(track: Track): Track {
  if (!db.tracks[track.id]) {
    db.tracks[track.id] = track;
  }
  track.artists.forEach(addArtistToDb);
  if (track.album) {
    track.album.artists.forEach(addArtistToDb);
  }
  return db.tracks[track.id];
}

// --- Mock User Generation ---
export function generateMockUser(id: string, displayName: string): UserProfile {
  if (db.users[id]) return db.users[id];
  const user: UserProfile = {
    id,
    display_name: displayName,
    href: `https://api.spotify.com/v1/users/${id}`,
    external_urls: { spotify: `https://open.spotify.com/user/${id}` },
    images: [{ url: `https://i.scdn.co/image/ab6775700000ee85${id}user`, height: 64, width: 64 }],
    type: 'user',
    uri: `spotify:user:${id}`,
    followers: { href: null, total: 0 },
    country: 'US', product: 'premium'
  };
  db.users[id] = user;
  return user;
}

// --- Mock Category Generation ---
export function generateMockCategory(id: string, name: string): Category {
  if (db.categories[id]) return db.categories[id];
  const category: Category = {
    id,
    name,
    href: `https://api.spotify.com/v1/browse/categories/${id}`,
    icons: [{ url: `https://t.scdn.co/images/categories/${id}.jpg`, height: 274, width: 274 }] // Example icon
  };
  db.categories[id] = category;
  return category;
}

// --- Mock Artist Generation ---
export function generateMockArtist(id: string, name?: string, genres?: string[]): Artist {
  if (db.artists[id]) return db.artists[id];
  const artist: Artist = {
    id, name: name || `Artist ${id}`,
    href: `https://api.spotify.com/v1/artists/${id}`,
    external_urls: { spotify: `https://open.spotify.com/artist/${id}` },
    images: [{ url: `https://i.scdn.co/image/ab6761610000e5eb${id}artist`, height: 320, width: 320 }],
    genres: genres || ['mock-genre', 'electro-mock'],
    popularity: Math.floor(Math.random() * 100),
    type: 'artist', uri: `spotify:artist:${id}`,
    followers: { href: null, total: Math.floor(Math.random() * 100000) }
  };
  return addArtistToDb(artist);
}

// --- Mock Track Generation ---
export function generateMockTrack(
  id: string, name?: string, artistIds?: string[], albumId?: string, durationMs?: number
): Track {
  if (db.tracks[id]) return db.tracks[id];
  const trackArtists: Artist[] = (artistIds || ['defaultArtistForTrack']).map(artistId => generateMockArtist(artistId));
  const albumArtistForTrack = trackArtists[0] || generateMockArtist('defaultArtistForAlbumInTrack');
  const actualAlbumId = albumId || 'defaultAlbumForTrack';
  const minimalAlbumForTrack: Album = {
    id: actualAlbumId, name: `Album ${actualAlbumId}`,
    href: `https://api.spotify.com/v1/albums/${actualAlbumId}`,
    external_urls: { spotify: `https://open.spotify.com/album/${actualAlbumId}` },
    images: [{ url: `https://i.scdn.co/image/ab67616d0000b273${actualAlbumId}album`, height: 640, width: 640 }],
    album_type: 'album', artists: [albumArtistForTrack],
    release_date: '2023-01-01', release_date_precision: 'day', total_tracks: 10,
    type: 'album', uri: `spotify:album:${actualAlbumId}`, available_markets: ['US', 'GB'],
    tracks: {
      href: `https://api.spotify.com/v1/albums/${actualAlbumId}/tracks?offset=0&limit=20`,
      items: [], limit: 20, next: null, offset: 0, previous: null, total: 10,
    },
  };
  const track: Track = {
    id, name: name || `Track ${id}`, artists: trackArtists, album: minimalAlbumForTrack,
    duration_ms: durationMs || Math.floor(180000 + Math.random() * 120000),
    explicit: Math.random() > 0.8, href: `https://api.spotify.com/v1/tracks/${id}`,
    external_urls: { spotify: `https://open.spotify.com/track/${id}` },
    is_local: false, is_playable: true, popularity: Math.floor(Math.random() * 100),
    preview_url: `https://p.scdn.co/mp3-preview/${id}preview`,
    track_number: Math.floor(Math.random() * 10) + 1, type: 'track', uri: `spotify:track:${id}`,
    disc_number: 1, available_markets: ['US', 'GB', 'CA', 'DE'],
  };
  return addTrackToDb(track);
}

// --- Mock Album Generation ---
export function generateMockAlbum(
  id: string, name?: string, artistIds?: string[], numTracks: number = 3
): Album {
  if (db.albums[id]) return db.albums[id];
  const albumArtists: Artist[] = (artistIds || [`${id}_artistGeneric`]).map(artistId => generateMockArtist(artistId));
  const albumTracks: Track[] = [];
  for (let i = 1; i <= numTracks; i++) {
    const trackId = `${id}_track${i}`;
    const trackArtistSample = albumArtists.slice(0, Math.floor(Math.random() * albumArtists.length) + 1);
    const track = generateMockTrack(trackId, `Song ${i} from ${name || id}`, trackArtistSample.map(a => a.id), id);
    albumTracks.push(track);
  }
  const album: Album = {
    id, name: name || `Album ${id}`, artists: albumArtists,
    images: [{ url: `https://i.scdn.co/image/ab67616d0000b273${id}album`, height: 640, width: 640 }],
    album_type: 'album', href: `https://api.spotify.com/v1/albums/${id}`,
    external_urls: { spotify: `https://open.spotify.com/album/${id}` },
    release_date: `${2020 + Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}-${String(Math.floor(Math.random()*28)+1).padStart(2,'0')}`,
    release_date_precision: 'day', total_tracks: albumTracks.length, type: 'album', uri: `spotify:album:${id}`,
    available_markets: ['US', 'GB', 'CA', 'DE', 'JP'],
    genres: albumArtists.reduce((acc, art) => [...acc, ...art.genres], [] as string[]).filter((v,i,a)=>a.indexOf(v)===i),
    label: `Mock Label ${id.charAt(0).toUpperCase()}`, popularity: Math.floor(Math.random() * 100),
    copyrights: [{ text: `© ${new Date().getFullYear()} Mock Records ${id}`, type: 'C' }],
    external_ids: { upc: `${Math.floor(Math.random() * 1e12)}` },
    tracks: {
      href: `https://api.spotify.com/v1/albums/${id}/tracks?offset=0&limit=${numTracks}`,
      items: albumTracks, limit: numTracks, next: null, offset: 0, previous: null, total: albumTracks.length
    }
  };
  db.albums[id] = album;
  return album;
}

// --- Mock Playlist Generation ---
export function generateMockPlaylist(
  id: string, name: string, description: string, ownerId: string, trackIds: string[],
  isPublic: boolean = true, numFollowers: number = 0, categoryId?: string // Optional categoryId
): Playlist {
  if (db.playlists[id]) return db.playlists[id];
  const owner = db.users[ownerId] || generateMockUser(ownerId, `User ${ownerId}`);
  const images: Image[] = [{ url: `https://i.scdn.co/image/ab67706f00000002${id}playlist`, height: 300, width: 300 }];
  const playlistTracks: PlaylistTrack[] = trackIds.map((trackId, index) => {
    const track = db.tracks[trackId] || generateMockTrack(trackId, `Fallback Track ${trackId}`);
    if (!db.tracks[trackId] && track) addTrackToDb(track);
    return {
      added_at: new Date(Date.now() - index * 3600000).toISOString(), added_by: owner,
      is_local: false, track: track,
    };
  }).filter(pt => pt.track);
  const playlist: Playlist = {
    id, name, description, owner, images, public: isPublic, collaborative: false,
    href: `https://api.spotify.com/v1/playlists/${id}`,
    external_urls: { spotify: `https://open.spotify.com/playlist/${id}` },
    snapshot_id: `snapshot_${Date.now()}`,
    tracks: {
      href: `https://api.spotify.com/v1/playlists/${id}/tracks?offset=0&limit=${playlistTracks.length}`,
      items: playlistTracks, limit: playlistTracks.length, next: null, offset: 0, previous: null, total: playlistTracks.length,
    },
    type: 'playlist', uri: `spotify:playlist:${id}`,
    followers: { href: null, total: numFollowers || Math.floor(Math.random() * 1000) },
    primary_color: null,
    // @ts-ignore - If Category is a custom field for your app's version of Playlist
    category_id: categoryId
  };
  db.playlists[id] = playlist;
  return playlist;
}

// --- Generate Initial Mock Data ---
export const mockUser1 = generateMockUser('user1', 'Mock User One');
export const mockUser2 = generateMockUser('user2', 'Another User');

export const mockArtist1 = generateMockArtist('artist1', 'The Mockers', ['mock-rock', 'indie-mock']);
export const mockArtist2 = generateMockArtist('artist2', 'DJ Mockster', ['mocktronic', 'dance-mock']);
export const mockArtist3 = generateMockArtist('artist3', 'Acoustic Mock', ['acoustic-mock', 'folk-mock']);
export const mockArtist4 = generateMockArtist('artist4', 'Synth Wave Mockers', ['synthwave', 'retrowave']);
export const mockArtist5 = generateMockArtist('artist5', 'Lofi Mock Beats', ['lofi', 'chillhop']);

export const mockTrack1 = generateMockTrack('track1', 'Mockingbird Melody', [mockArtist1.id], 'album1');
export const mockTrack2 = generateMockTrack('track2', 'Electronic Echoes', [mockArtist2.id], 'album2');
export const mockTrack3 = generateMockTrack('track3', 'Acoustic Dreams', [mockArtist3.id], 'album3');
export const mockTrack4 = generateMockTrack('track4', 'Neon Nights', [mockArtist4.id, mockArtist2.id], 'album4');
export const mockTrack5 = generateMockTrack('track5', 'Chill Vibes', [mockArtist5.id], 'album5');
export const mockTrack6 = generateMockTrack('track6', 'Sunrise Synth', [mockArtist4.id], 'album4');
export const mockTrack7 = generateMockTrack('track7', 'Lost in Mock', [mockArtist1.id, mockArtist3.id], 'album1');

export const mockAlbum1 = generateMockAlbum('album1', 'Tales of Mockery', [mockArtist1.id, mockArtist3.id], 5);
export const mockAlbum2 = generateMockAlbum('album2', 'Digital Depths', [mockArtist2.id], 4);
export const mockAlbum3 = generateMockAlbum('album3', 'Unplugged Mockments', [mockArtist3.id], 3);
export const mockAlbum4 = generateMockAlbum('album4', 'Retrowave Riders', [mockArtist4.id, mockArtist2.id], 6);
export const mockAlbum5 = generateMockAlbum('album5', 'Beat Tapes & Mockscapes', [mockArtist5.id], 7);
export const mockAlbum6 = generateMockAlbum('album6', 'Another Mocktastic Album', [mockArtist1.id], 2);

// Generate Mock Categories
export const mockCategory1 = generateMockCategory('cat1', 'Focus');
export const mockCategory2 = generateMockCategory('cat2', 'Workout');
export const mockCategory3 = generateMockCategory('cat3', 'Chill');
export const mockCategory4 = generateMockCategory('cat4', 'Party');
export const mockCategory5 = generateMockCategory('cat5', 'Sleep');


const playlist1TrackIds = [mockTrack1.id, mockTrack2.id, mockTrack5.id, mockAlbum4.tracks.items[0].id];
const playlist2TrackIds = [mockTrack3.id, mockTrack4.id, mockAlbum1.tracks.items[1].id, mockAlbum5.tracks.items[2].id];
const playlist3TrackIds = [mockTrack6.id, mockTrack7.id, mockAlbum2.tracks.items[0].id, mockAlbum3.tracks.items[1].id];
// Playlists associated with categories
export const mockPlaylistCat1 = generateMockPlaylist('playlistCat1', 'Deep Focus Zone', 'Instrumental tracks for concentration.', mockUser1.id, [mockTrack5.id, mockTrack2.id], true, 250, mockCategory1.id);
export const mockPlaylistCat2 = generateMockPlaylist('playlistCat2', 'Workout Beats', 'High energy tracks for your workout.', mockUser2.id, [mockTrack4.id, mockTrack6.id], true, 180, mockCategory2.id);
export const mockPlaylistCat3 = generateMockPlaylist('playlistCat3', 'Chillout Lounge', 'Relax and unwind.', mockUser1.id, [mockTrack3.id, mockTrack5.id], true, 300, mockCategory3.id);
export const mockPlaylistCat4 = generateMockPlaylist('playlistCat4', 'Party Starters', 'Get the party going.', mockUser1.id, [mockTrack1.id, mockTrack2.id, mockTrack4.id], true, 500, mockCategory4.id);


export const mockPlaylist1 = generateMockPlaylist('playlist1', 'Chill Mock Vibes', 'A selection of relaxing mock tracks.', mockUser1.id, playlist1TrackIds, true, 123);
export const mockPlaylist2 = generateMockPlaylist('playlist2', 'Energetic Mocks', 'Upbeat mock tunes for workout.', mockUser2.id, playlist2TrackIds, false, 45);
export const mockPlaylist3 = generateMockPlaylist('playlist3', 'Late Night Mocking', 'Synth and acoustic mocks for the night.', mockUser1.id, playlist3TrackIds, true, 78);


// --- DB Accessor Functions ---
export const getAlbumById = (id: string): Album | undefined => db.albums[id];
export const getArtistById = (id: string): Artist | undefined => db.artists[id];
export const getTrackById = (id: string): Track | undefined => db.tracks[id];
export const getPlaylistById = (id: string): Playlist | undefined => db.playlists[id];
export const getUserById = (id: string): UserProfile | undefined => db.users[id];
export const getCategoryById = (id: string): Category | undefined => db.categories[id]; // Added

console.log('Mock DB Initialized with extended data including categories.');
