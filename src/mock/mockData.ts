import { Album } from '../interfaces/albums';
import { Playlist } from '../interfaces/playlists';
import { Track } from '../interfaces/track';
import { Artist } from '../interfaces/artist';
import { PlayHistoryObject } from '../interfaces/player';
import { User } from '../interfaces/user';

// Basic mock user for authentication
export const mockUser: User = {
  display_name: 'Demo User',
  external_urls: { spotify: '' },
  href: '',
  id: 'demo',
  images: [],
  type: 'user',
  uri: '',
  followers: { href: null, total: 0 },
  country: 'US',
  product: 'premium',
  explicit_content: { filter_enabled: false, filter_locked: false },
  email: 'demo@example.com',
} as any;

export const mockArtist: Artist = {
  followers: { href: null, total: 0 },
  genres: [],
  href: '',
  id: 'artist1',
  images: [],
  name: 'Mock Artist',
  popularity: 0,
  type: 'artist',
  uri: 'artist:1',
  external_urls: { spotify: '' },
} as any;

export const mockAlbum: Album = {
  album_type: 'album',
  artists: [mockArtist],
  available_markets: [],
  external_urls: { spotify: '' },
  href: '',
  id: 'album1',
  images: [],
  name: 'Mock Album',
  release_date: '2024-01-01',
  release_date_precision: 'day',
  total_tracks: 1,
  type: 'album',
  uri: 'album:1',
} as any;

export const mockTrack: Track = {
  album: mockAlbum,
  artists: [mockArtist],
  available_markets: [],
  disc_number: 1,
  duration_ms: 180000,
  explicit: false,
  external_ids: { isrc: '' },
  external_urls: { spotify: '' },
  href: '',
  id: 'track1',
  is_local: false,
  is_playable: true,
  name: 'Mock Track',
  popularity: 0,
  preview_url: '',
  track_number: 1,
  type: 'track',
  uri: 'track:1',
} as any;

export const mockPlaylist: Playlist = {
  collaborative: false,
  description: 'Mock playlist',
  external_urls: { spotify: '' },
  href: '',
  id: 'playlist1',
  images: [],
  followers: { href: '', total: 0 },
  name: 'Mock Playlist',
  owner: mockUser,
  public: true,
  snapshot_id: '1',
  tracks: { href: '', total: 1 },
  type: 'playlist',
  uri: 'playlist:1',
} as any;

export const mockPlayHistory: PlayHistoryObject = {
  track: mockTrack,
  played_at: new Date().toISOString(),
  context: { type: 'artist', uri: mockArtist.uri, href: '' },
} as any;

export const data = {
  '/me': mockUser,
  '/me/top/tracks': { items: [mockTrack] },
  '/browse/new-releases': { albums: { items: [mockAlbum] } },
  '/browse/featured-playlists': { playlists: { items: [mockPlaylist] } },
  '/browse/categories/0JQ5DAudkNjCgYMM0TZXDw/playlists': { playlists: { items: [mockPlaylist] } },
  '/browse/categories/0JQ5DAqbMKFQIL0AXnG5AK/playlists': { playlists: { items: [mockPlaylist] } },
  '/browse/categories/0JQ5DAt0tbjZptfcdMSKl3/playlists': { playlists: { items: [mockPlaylist] } },
  '/me/player/recently-played': { items: [mockPlayHistory] },
  '/me/following': { artists: { items: [mockArtist] } },
};
