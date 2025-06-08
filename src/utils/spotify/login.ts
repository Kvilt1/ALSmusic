import Axios from 'axios';
import { getFromLocalStorageWithExpiry, setLocalStorageWithExpiry } from '../localstorage';
import axiosInstance from '../../axios'; // Use the central axios instance
import * as mockDb from '../../mockApi/db'; // To get mock user for profile

/* eslint-disable import/no-anonymous-default-export */
const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID as string;
const useMockApi = process.env.REACT_APP_USE_MOCK_API === 'true';
const redirect_uri = process.env.REACT_APP_SPOTIFY_REDIRECT_URL as string;

const authUrl = new URL('https://accounts.spotify.com/authorize');

const SCOPES = [
  'ugc-image-upload',
  'streaming',

  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',

  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-collaborative',

  'user-follow-modify',
  'user-follow-read',

  'user-read-playback-position',
  'user-top-read',
  'user-read-recently-played',

  'user-library-read',
  'user-library-modify',
] as const;

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: ArrayBuffer) => {
  // @ts-ignore
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const generateRandomString = (length: number) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

const logInWithSpotify = async (anonymous?: boolean) => {
  if (useMockApi) {
    console.log('Mock Mode: logInWithSpotify called, simulating login.');
    // In mock mode, we don't redirect. We can simulate a successful login.
    // The actual "login" will be handled by setting auth state in the Redux store.
    // We can set mock tokens here if the app expects them for initial checks,
    // though the mock adapter in axios.ts won't use them.
    if (!getFromLocalStorageWithExpiry('access_token')) {
      setLocalStorageWithExpiry('access_token', 'mock_access_token', 3600); // 1 hour expiry
    }
    if (!localStorage.getItem('refresh_token')) {
      localStorage.setItem('refresh_token', 'mock_refresh_token');
    }
    //
    // The actual user profile and auth status should be set in the Redux store
    // possibly triggered by an effect hook in App.tsx or similar,
    // which checks for useMockApi and dispatches relevant actions.
    // This function's role is now primarily to prevent actual redirection.
    // Optionally, dispatch a global event or return a promise that indicates mock login success.
    return Promise.resolve();
  }

  let codeVerifier = localStorage.getItem('code_verifier');

  if (!codeVerifier) {
    codeVerifier = generateRandomString(64);
    localStorage.setItem('code_verifier', codeVerifier);
  }

  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  if (anonymous) {
    authUrl.search = new URLSearchParams({
      client_id,
      scope: '',
      redirect_uri,
      response_type: 'token',
    }).toString();
  } else {
    authUrl.search = new URLSearchParams({
      client_id,
      redirect_uri,
      response_type: 'code',
      scope: SCOPES.join(' '),
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    }).toString();
  }
  window.location.href = authUrl.toString();
};

const requestToken = async (code: string) => {
  // This function should ideally not be called in mock mode if logInWithSpotify is properly bypassed.
  if (useMockApi) {
    console.log("Mock Mode: requestToken called, returning mock token.");
    const mockAccessToken = 'mock_access_token_from_requestToken';
    setLocalStorageWithExpiry('access_token', mockAccessToken, 3600);
    localStorage.setItem('refresh_token', 'mock_refresh_token_from_requestToken');
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + mockAccessToken;
    return mockAccessToken;
  }

  const code_verifier = localStorage.getItem('code_verifier') as string;

  const body = {
    code,
    client_id,
    redirect_uri,
    code_verifier,
    grant_type: 'authorization_code',
  };

  const { data: response } = await Axios.post<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
  }>('https://accounts.spotify.com/api/token', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (response.access_token) {
    setLocalStorageWithExpiry('access_token', response.access_token, response.expires_in * 60 * 60);
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + response.access_token;
    localStorage.setItem('refresh_token', response.refresh_token);
  }

  return response.access_token;
};

const getToken = async () => {
  if (useMockApi) {
    console.log('Mock Mode: getToken called.');
    let token = getFromLocalStorageWithExpiry('access_token');
    if (token) return [token, true]; // Mock token exists

    // If no mock token, set one up as if login just happened
    token = 'mock_initial_access_token';
    setLocalStorageWithExpiry('access_token', token, 3600);
    localStorage.setItem('refresh_token', 'mock_initial_refresh_token');
    // The user profile should be set in Redux store based on REACT_APP_USE_MOCK_API
    // No need to fetch profile here, just ensure tokens are set for app's logic.
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token; // For completeness, though mock adapter ignores it
    return [token, true]; // Simulate a "successful" token retrieval
  }

  const token = getFromLocalStorageWithExpiry('access_token');
  if (token) return [token, true];

  const urlParams = new URLSearchParams(window.location.search);

  let code = urlParams.get('code') as string;
  // Clear the code from URL after processing once
  if (code) {
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl); // remove code from URL
    return [await requestToken(code), true];
  }


  const publicToken = getFromLocalStorageWithExpiry('public_access_token');
  if (publicToken) return [publicToken, false];

  // Handle implicit grant flow (anonymous login)
  const hashParams = new URLSearchParams(window.location.hash.substring(1)); // Remove #
  const accessTokenFromHash = hashParams.get('access_token');
  if (accessTokenFromHash) {
    const expiresIn = hashParams.get('expires_in');
    setLocalStorageWithExpiry('public_access_token', accessTokenFromHash, expiresIn ? parseInt(expiresIn) : 3600);
    window.location.hash = ''; // Clear hash
    return [accessTokenFromHash, false]; // false indicates it's a public/anonymous token
  }

  return [null, false];
};

export const getRefreshToken = async () => {
  if (useMockApi) {
    console.log('Mock Mode: getRefreshToken called, returning mock token.');
    const mockAccessToken = 'mock_refreshed_access_token';
    setLocalStorageWithExpiry('access_token', mockAccessToken, 3600);
    // Mock adapter in axios.ts will handle requests, but update header for consistency if any non-adapted direct calls were made.
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + mockAccessToken;
    return mockAccessToken;
  }

  // refresh token that has been previously stored
  const refreshToken = localStorage.getItem('refresh_token') as string;

  if (!refreshToken) {
    // For non-mock mode, if no refresh token, trigger anonymous login
    // This part might need review based on desired app flow if public access is used.
    // For now, assume full login is preferred over anonymous if refresh fails.
    // logInWithSpotify(true); // Or simply return null / throw error if full login is always expected path.
    console.warn("No refresh token available. User might need to log in again.");
    return null;
  }

  const url = 'https://accounts.spotify.com/api/token';

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  };

  try {
    const body = await fetch(url, payload);
    const response = await body.json();

    if (!response.access_token) {
      // logInWithSpotify(true); // Or handle re-login more gracefully
      console.error("Failed to refresh token. Response:", response);
      // Clear potentially invalid tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // window.location.href = '/login'; // Or trigger login flow
      return null;
    }

    setLocalStorageWithExpiry('access_token', response.access_token, response.expires_in * 60 * 60);
    axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + response.access_token;
    // Spotify sometimes returns a new refresh_token, but not always.
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    return response.access_token;
  } catch (error) {
    console.error("Error during token refresh:", error);
    // Clear potentially invalid tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // window.location.href = '/login'; // Or trigger login flow
    return null;
  }
};

export default { logInWithSpotify, getToken, getRefreshToken };
