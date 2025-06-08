import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getRefreshToken } from './utils/spotify/login';
import { getFromLocalStorageWithExpiry } from './utils/localstorage';
import { handleMockRequest } from './mockApi/mockHandler'; // Adjusted path

const path = 'https://api.spotify.com/v1' as const;
const useMockApi = process.env.REACT_APP_USE_MOCK_API === 'true';

const axios = Axios.create({
  baseURL: path,
  headers: {},
});

if (useMockApi) {
  console.log('Using Mock API');
  // Remove Authorization header for mock API
  delete axios.defaults.headers.common['Authorization'];

  axios.defaults.adapter = async (config: AxiosRequestConfig) => {
    console.log('Mock Adapter Request:', config);
    let urlToMock = config.url || '';

    // If baseURL is present and url is relative, combine them
    if (config.baseURL && !urlToMock.startsWith('http')) {
      urlToMock = config.baseURL + urlToMock;
    }

    // Remove the base Spotify URL prefix for matching in mockHandler
    // e.g. "https://api.spotify.com/v1/browse/new-releases" becomes "/browse/new-releases"
    if (urlToMock.startsWith(path)) {
      urlToMock = urlToMock.substring(path.length);
    }

    // Ensure leading slash for consistency with mockHandler
    if (!urlToMock.startsWith('/')) {
      urlToMock = '/' + urlToMock;
    }

    try {
      const mockResponse = await handleMockRequest(
        urlToMock,
        config.method ? config.method.toUpperCase() : 'GET',
        config.params,
        config.data
      );

      console.log('Mock Adapter Response:', mockResponse);

      return Promise.resolve({
        data: mockResponse.data,
        status: mockResponse.status,
        statusText: mockResponse.statusText,
        headers: { 'content-type': 'application/json' }, // Mock headers
        config: config,
        request: {}, // Mock request object
      } as AxiosResponse);
    } catch (error: any) {
      console.error('Mock Adapter Error:', error);
      return Promise.reject({
        data: error.response?.data || { message: 'Mocking error' },
        status: error.response?.status || 500,
        statusText: error.response?.statusText || 'Internal Server Error',
        headers: { 'content-type': 'application/json' },
        config: config,
        request: {},
      } as AxiosResponse);
    }
  };
} else {
  const access_token = getFromLocalStorageWithExpiry('access_token') as string;
  if (access_token) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
  }

  axios.interceptors.response.use(
    (response) => response,
    async (error) => { // Changed to async
      // Add null check for error.response
      if (error.response && error.response.status === 401) {
        try {
          const token = await getRefreshToken(); // Changed to await
          if (!token) {
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('access_token');
            // Optionally redirect to login or show a global message
            return Promise.reject(error);
          }
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
          // Ensure error.config and error.config.headers exist
          if (error.config && error.config.headers) {
            error.config.headers['Authorization'] = 'Bearer ' + token;
            return axios(error.config);
          } else {
            // If config or headers are missing, reject or handle appropriately
            return Promise.reject(error);
          }
        } catch (refreshError) {
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('access_token');
          // Optionally redirect to login or show a global message
          return Promise.reject(error); // Reject with the original error, or the refreshError
        }
      }
      return Promise.reject(error);
    }
  );
}

export default axios;
