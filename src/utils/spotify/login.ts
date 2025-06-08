import { setLocalStorageWithExpiry, getFromLocalStorageWithExpiry } from '../localstorage';

const USERNAME = 'demo';
const PASSWORD = 'password';
const TOKEN = 'mock-token';

const logInWithSpotify = async () => {
  const user = window.prompt('Username');
  const pass = window.prompt('Password');
  if (user === USERNAME && pass === PASSWORD) {
    setLocalStorageWithExpiry('access_token', TOKEN, 3600 * 24);
  } else {
    alert('Invalid credentials');
  }
};

const getToken = async (): Promise<[string | null, boolean]> => {
  const token = getFromLocalStorageWithExpiry('access_token');
  return [token || null, !!token];
};

const getRefreshToken = async () => {
  const token = getFromLocalStorageWithExpiry('access_token');
  return token || null;
};

export default { logInWithSpotify, getToken, getRefreshToken };
