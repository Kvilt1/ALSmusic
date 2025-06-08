import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Utils
import axios from '../../axios';
import login from '../../utils/spotify/login';

// Services
import { authService } from '../../services/auth';

// Interfaces
import type { User } from '../../interfaces/user';
import { getFromLocalStorageWithExpiry, setLocalStorageWithExpiry } from '../../utils/localstorage';
import { mockUser1 } from '../../mockApi/db'; // Import a mock user

const useMockApi = process.env.REACT_APP_USE_MOCK_API === 'true';

let initialToken: string | undefined = getFromLocalStorageWithExpiry('access_token') || undefined;
let initialUser: User | undefined = undefined;
let initialRequesting = true;

if (useMockApi) {
  console.log('Auth Slice: Mock API mode detected. Setting up mock auth state.');
  initialToken = 'mock_access_token_auth_slice';
  initialUser = mockUser1 as User; // Cast if your User type from interfaces matches mockUser1 structure
  initialRequesting = false; // Already "logged in" with mock data

  // Ensure mock token is in local storage for other parts that might check it initially
  if (!getFromLocalStorageWithExpiry('access_token')) {
    setLocalStorageWithExpiry('access_token', initialToken, 3600);
  }
  if (!localStorage.getItem('refresh_token')) {
    localStorage.setItem('refresh_token', 'mock_refresh_token_auth_slice');
  }
}


const initialState: { token?: string; playerLoaded: boolean; user?: User; requesting: boolean } = {
  user: initialUser,
  requesting: initialRequesting,
  playerLoaded: false, // This can be set to true if player also mocked, or handled by its own logic
  token: initialToken,
};

export const loginToSpotify = createAsyncThunk<{ token?: string; loaded: boolean }, boolean>(
  'auth/loginToSpotify',
  async (anonymous, api) => {
    if (useMockApi) {
      console.log('Auth Slice: loginToSpotify thunk called in mock mode.');
      // In mock mode, user and token should already be set in initialState.
      // This thunk might still be called by existing app logic.
      // We ensure it resolves correctly without performing real login operations.
      const token = initialState.token || 'mock_access_token_thunk';
      if (!initialState.user) { // If initialUser wasn't set for some reason, dispatch fetchUser
        api.dispatch(fetchUser()); // fetchUser will use the mock /me handler
      }
      return { token, loaded: true }; // loaded: true indicates no further loading/redirect needed
    }

    // Original logic for non-mock mode:
    const userToken: string | undefined = getFromLocalStorageWithExpiry('access_token') as string;
    const anonymousToken: string | undefined = getFromLocalStorageWithExpiry('public_access_token');

    let token = userToken || anonymousToken;

    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      if (userToken) api.dispatch(fetchUser());
      return { token, loaded: false }; // loaded: false might imply further checks or loading UI
    }

    let [requestedToken, requestUser] = await login.getToken(); // login.getToken() is mock-aware
    if (requestUser && requestedToken) { // only dispatch if token was successfully retrieved and is for a user
        api.dispatch(fetchUser());
    }


    if (!requestedToken) {
      login.logInWithSpotify(anonymous); // login.logInWithSpotify() is mock-aware
    } else {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + requestedToken;
    }

    return { token: requestedToken, loaded: true };
  }
);

export const fetchUser = createAsyncThunk('auth/fetchUser', async () => {
  // This will use the mock '/me' handler if in mock mode, due to axios adapter
  const response = await authService.fetchUser();
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRequesting(state, action: PayloadAction<{ requesting: boolean }>) {
      state.requesting = action.payload.requesting;
    },
    setToken(state, action: PayloadAction<{ token?: string }>) {
      state.token = action.payload.token;
      if (useMockApi && !action.payload.token) {
        // If token is cleared in mock mode, reset to mock token to maintain "logged in" state
        state.token = 'mock_access_token_auth_slice_reset';
        if (axios.defaults.headers.common) {
         axios.defaults.headers.common['Authorization'] = 'Bearer ' + state.token;
        }
      }
    },
    setPlayerLoaded(state, action: PayloadAction<{ playerLoaded: boolean }>) {
      state.playerLoaded = action.payload.playerLoaded;
    },
    logout(state) { // Example logout action
      if (useMockApi) {
        state.token = 'mock_access_token_after_logout'; // Or some other mock default
        state.user = mockUser1 as User; // Persist mock user or set to a default anonymous mock user
        state.requesting = false;
        setLocalStorageWithExpiry('access_token', state.token, 3600);
        localStorage.setItem('refresh_token', 'mock_refresh_token_after_logout');
        if (axios.defaults.headers.common) {
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + state.token;
        }
      } else {
        state.token = undefined;
        state.user = undefined;
        state.requesting = true; // Or false depending on desired state after logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (axios.defaults.headers.common) {
          delete axios.defaults.headers.common['Authorization'];
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loginToSpotify.fulfilled, (state, action) => {
      state.token = action.payload.token || (useMockApi ? 'mock_fallback_token' : undefined);
      // In mock mode, requesting should be false if loginToSpotify implies "logged in"
      state.requesting = useMockApi ? false : !action.payload.loaded;
      if (useMockApi && !state.user) { // Ensure user is set in mock mode
        state.user = mockUser1 as User;
      }
    });
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.user = action.payload; // This will be mockUser1 in mock mode
      state.requesting = false;
    });
    builder.addCase(fetchUser.rejected, (state) => {
      if (useMockApi) {
        console.log("Auth Slice: fetchUser rejected in mock mode. Setting fallback mock user.");
        state.user = mockUser1 as User; // Ensure mock user is set even if fetch fails
        state.requesting = false;
      }
      // For non-mock, handle normally
    });
  },
});

export const authActions = { ...authSlice.actions, loginToSpotify, fetchUser };

export default authSlice.reducer;
