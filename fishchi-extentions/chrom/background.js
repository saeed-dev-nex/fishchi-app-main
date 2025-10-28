// Background Script for Fishchi Extension
// Handles authentication, API calls, and communication with popup/content scripts

(function () {
  'use strict';

  // Configuration
  const API_BASE_URL = 'https://localhost:5000/api/v1';
  const STORAGE_KEYS = {
    AUTH_TOKEN: 'fishchi_auth_token',
    USER_DATA: 'fishchi_user_data',
    PROJECTS: 'fishchi_projects',
  };

  // State management
  let authToken = null;
  let userData = null;
  let projects = [];

  // Initialize background script
  async function init() {
    try {
      console.log('Fishchi background script initialized');

      // Load stored data
      await loadStoredData();

      // Set up message listeners
      setupMessageListeners();

      console.log('Background script ready');
    } catch (error) {
      console.error('Background script initialization error:', error);
    }
  }

  // Load data from storage
  async function loadStoredData() {
    try {
      const result = await chrome.storage.local.get([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.PROJECTS,
      ]);

      authToken = result[STORAGE_KEYS.AUTH_TOKEN] || null;
      userData = result[STORAGE_KEYS.USER_DATA] || null;
      projects = result[STORAGE_KEYS.PROJECTS] || [];

      console.log('Stored data loaded:', {
        hasToken: !!authToken,
        hasUserData: !!userData,
        projectsCount: projects.length,
      });
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  }

  // Save data to storage
  async function saveToStorage(key, data) {
    try {
      await chrome.storage.local.set({ [key]: data });
      console.log(`Data saved to storage: ${key}`);
    } catch (error) {
      console.error(`Error saving to storage (${key}):`, error);
    }
  }

  // Setup message listeners
  function setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Background received message:', message);

      // Handle async operations
      handleMessage(message, sender)
        .then((response) => {
          console.log('Background sending response:', response);
          sendResponse(response);
        })
        .catch((error) => {
          console.error('Background message handling error:', error);
          sendResponse({
            success: false,
            error: error.message,
          });
        });

      // Return true to indicate async response
      return true;
    });
  }

  // Handle incoming messages
  async function handleMessage(message, sender) {
    const { action } = message;

    switch (action) {
      case 'ping':
        return { success: true, message: 'Background script is running' };

      case 'checkAuth':
        return await checkAuthStatus();

      case 'login':
        return await handleLogin(message.email, message.password);

      case 'logout':
        return await handleLogout();

      case 'getProjects':
        return await getProjects();

      case 'createSource':
        return await createSource(message.sourceInfo, message.projectId);

      case 'refreshProjects':
        return await refreshProjects();

      case 'extractSource':
        return await handleExtractSource(message.sourceInfo, message.url);

      case 'checkOAuthStatus':
        return await checkOAuthStatus();

      case 'debugCookies':
        return await debugCookies();

      case 'testAuthWithCookies':
        return await testAuthWithCookies();

      default:
        return {
          success: false,
          error: `Unknown action: ${action}`,
        };
    }
  }

  // Check authentication status
  async function checkAuthStatus() {
    try {
      // First try with stored token
      if (authToken) {
        const response = await makeApiRequest('/users/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (
          (response.success && response.user) ||
          (response.status === 'success' && response.data)
        ) {
          userData = response.user || response.data;
          await saveToStorage(STORAGE_KEYS.USER_DATA, userData);

          return {
            authenticated: true,
            user: userData,
          };
        }
      }

      // If no token or token is invalid, try with cookies
      console.log('No valid token found, checking cookies...');

      const cookies = await chrome.cookies.getAll({
        domain: 'localhost',
      });

      const authCookies = cookies.filter(
        (cookie) =>
          cookie.name.includes('auth') ||
          cookie.name.includes('token') ||
          cookie.name.includes('session') ||
          cookie.name.includes('jwt')
      );

      if (authCookies.length > 0) {
        console.log('Found auth cookies, trying to authenticate...');

        const response = await makeApiRequestWithCookies('/users/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Check for different response formats
        if (
          (response.success && response.user) ||
          (response.status === 'success' && response.data)
        ) {
          userData = response.user || response.data;
          await saveToStorage(STORAGE_KEYS.USER_DATA, userData);

          // Try to extract token from cookies
          const tokenCookie = authCookies.find(
            (cookie) =>
              cookie.name.includes('token') || cookie.name.includes('jwt')
          );

          if (tokenCookie) {
            authToken = tokenCookie.value;
            await saveToStorage(STORAGE_KEYS.AUTH_TOKEN, authToken);
          }

          return {
            authenticated: true,
            user: userData,
          };
        }
      }

      // No valid authentication found
      await clearAuthData();
      return {
        authenticated: false,
        message: 'No valid authentication found',
      };
    } catch (error) {
      console.error('Auth check error:', error);
      return {
        authenticated: false,
        error: error.message,
      };
    }
  }

  // Handle login
  async function handleLogin(email, password) {
    try {
      const response = await makeApiRequest('/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.success) {
        authToken = response.token;
        userData = response.user;

        // Save to storage
        await saveToStorage(STORAGE_KEYS.AUTH_TOKEN, authToken);
        await saveToStorage(STORAGE_KEYS.USER_DATA, userData);

        // Load projects after successful login
        await refreshProjects();

        return {
          success: true,
          user: userData,
          token: authToken,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Handle logout
  async function handleLogout() {
    try {
      // Call logout endpoint if token exists
      if (authToken) {
        try {
          await makeApiRequest('/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
        } catch (error) {
          console.log(
            'Logout API call failed, but continuing with local logout'
          );
        }
      }

      // Clear local data
      await clearAuthData();

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Clear authentication data
  async function clearAuthData() {
    authToken = null;
    userData = null;
    projects = [];

    await chrome.storage.local.remove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.PROJECTS,
    ]);

    console.log('Authentication data cleared');
  }

  // Get user projects
  async function getProjects() {
    try {
      if (!authToken) {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      // Return cached projects if available
      if (projects.length > 0) {
        return {
          success: true,
          projects: projects,
        };
      }

      // Fetch from server
      const response = await makeApiRequest('/projects', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 'success') {
        projects = response.data || [];
        await saveToStorage(STORAGE_KEYS.PROJECTS, projects);

        return {
          success: true,
          projects: projects,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch projects',
        };
      }
    } catch (error) {
      console.error('Get projects error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Refresh projects from server
  async function refreshProjects() {
    try {
      if (!authToken) {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      const response = await makeApiRequest('/projects', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 'success') {
        projects = response.data || [];
        await saveToStorage(STORAGE_KEYS.PROJECTS, projects);

        return {
          success: true,
          projects: projects,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to refresh projects',
        };
      }
    } catch (error) {
      console.error('Refresh projects error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Handle extract source from content script
  async function handleExtractSource(sourceInfo, url) {
    try {
      console.log('Extract source request received:', { sourceInfo, url });

      // Validate source info
      if (!sourceInfo || !sourceInfo.title) {
        return {
          success: false,
          error: 'Invalid source information provided',
        };
      }

      // Check if user is authenticated
      if (!authToken) {
        return {
          success: false,
          error: 'Not authenticated. Please log in first.',
        };
      }

      // Get user's projects to determine which project to add the source to
      const projectsResponse = await getProjects();
      if (
        !projectsResponse.success ||
        !projectsResponse.projects ||
        projectsResponse.projects.length === 0
      ) {
        return {
          success: false,
          error: 'No projects found. Please create a project first.',
        };
      }

      // Use the first project as default (or you could let user choose)
      const projectId = projectsResponse.projects[0]._id;

      // Create the source
      const createResponse = await createSource(sourceInfo, projectId);

      if (createResponse.success) {
        return {
          success: true,
          source: createResponse.source,
          message: 'Source extracted and saved successfully',
          tabUrl: url,
          extractedData: {
            success: true,
            sourceInfo: sourceInfo,
          },
        };
      } else {
        return {
          success: false,
          error:
            createResponse.message ||
            createResponse.error ||
            'Failed to save source',
          tabUrl: url,
          extractedData: {
            success: true,
            sourceInfo: sourceInfo,
          },
        };
      }
    } catch (error) {
      console.error('Extract source error:', error);
      return {
        success: false,
        error: error.message,
        tabUrl: url,
        extractedData: {
          success: true,
          sourceInfo: sourceInfo,
        },
      };
    }
  }

  // Create source
  async function createSource(sourceInfo, projectId) {
    try {
      if (!authToken) {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      const response = await makeApiRequest('/sources', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sourceInfo,
          projectId: projectId,
        }),
      });

      if (response.status === 'success') {
        return {
          success: true,
          source: response.data,
          message: response.message || 'Source created successfully',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to create source',
        };
      }
    } catch (error) {
      console.error('Create source error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check OAuth status by making a request to server
  async function checkOAuthStatus() {
    try {
      // First try to get cookies from the server domain
      const cookies = await chrome.cookies.getAll({
        domain: 'localhost',
      });

      console.log('Found cookies:', cookies);

      // Look for authentication cookies
      const authCookies = cookies.filter(
        (cookie) =>
          cookie.name.includes('auth') ||
          cookie.name.includes('token') ||
          cookie.name.includes('session') ||
          cookie.name.includes('jwt')
      );

      console.log('Auth cookies found:', authCookies);

      // Check specifically for token cookie
      const tokenCookie = cookies.find((cookie) => cookie.name === 'token');
      console.log('Token cookie:', tokenCookie);

      if (authCookies.length > 0) {
        // Try to get user profile with cookies
        const response = await makeApiRequestWithCookies('/users/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Check for different response formats
        if (
          (response.success && response.user) ||
          (response.status === 'success' && response.data)
        ) {
          // User is authenticated, save the data
          userData = response.user || response.data;
          await saveToStorage(STORAGE_KEYS.USER_DATA, userData);

          // Try to get auth token from cookies or response
          if (response.token) {
            authToken = response.token;
            await saveToStorage(STORAGE_KEYS.AUTH_TOKEN, authToken);
          }

          // Load projects
          await refreshProjects();

          return {
            success: true,
            authenticated: true,
            user: userData,
            message: 'OAuth authentication successful',
          };
        }
      }

      // Fallback: Try without cookies
      const response = await makeApiRequest('/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check for different response formats
      if (
        (response.success && response.user) ||
        (response.status === 'success' && response.data)
      ) {
        // User is authenticated, save the data
        userData = response.user || response.data;
        await saveToStorage(STORAGE_KEYS.USER_DATA, userData);

        // Try to get auth token from cookies or response
        if (response.token) {
          authToken = response.token;
          await saveToStorage(STORAGE_KEYS.AUTH_TOKEN, authToken);
        }

        // Load projects
        await refreshProjects();

        return {
          success: true,
          authenticated: true,
          user: userData,
          message: 'OAuth authentication successful',
        };
      } else {
        return {
          success: false,
          authenticated: false,
          message: 'OAuth authentication failed',
        };
      }
    } catch (error) {
      console.error('OAuth status check error:', error);
      return {
        success: false,
        authenticated: false,
        error: error.message,
      };
    }
  }

  // Debug cookies function
  async function debugCookies() {
    try {
      const cookies = await chrome.cookies.getAll({
        domain: 'localhost',
      });

      const allCookies = await chrome.cookies.getAll({});

      return {
        success: true,
        localhostCookies: cookies,
        allCookies: allCookies.slice(0, 10), // Limit to first 10 cookies
        authCookies: cookies.filter(
          (cookie) =>
            cookie.name.includes('auth') ||
            cookie.name.includes('token') ||
            cookie.name.includes('session') ||
            cookie.name.includes('jwt')
        ),
        message: 'Cookie debug information retrieved',
      };
    } catch (error) {
      console.error('Debug cookies error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Test authentication with cookies
  async function testAuthWithCookies() {
    try {
      const cookies = await chrome.cookies.getAll({
        domain: 'localhost',
      });

      const tokenCookie = cookies.find((cookie) => cookie.name === 'token');

      if (!tokenCookie) {
        return {
          success: false,
          error: 'No token cookie found',
          cookies: cookies,
        };
      }

      // Test with credentials: include
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      return {
        success: response.ok,
        status: response.status,
        response: data,
        tokenCookie: tokenCookie,
        allCookies: cookies,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Make API request with cookies
  async function makeApiRequestWithCookies(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get cookies for the domain
    const cookies = await chrome.cookies.getAll({
      domain: 'localhost',
    });

    // Build cookie header
    const cookieHeader = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    console.log('Cookie header:', cookieHeader);

    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      credentials: 'include', // Important: include cookies in request
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      console.log(`Making API request with cookies to: ${url}`);
      console.log('Request options:', requestOptions);

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response:', data);

      return data;
    } catch (error) {
      console.error('API request with cookies error:', error);

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(
          'خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.'
        );
      }

      throw error;
    }
  }

  // Make API request
  async function makeApiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in all requests
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      console.log(`Making API request to: ${url}`);
      console.log('Request options:', requestOptions);

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response:', data);

      return data;
    } catch (error) {
      console.error('API request error:', error);

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(
          'خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.'
        );
      }

      throw error;
    }
  }

  // Handle extension installation/update
  chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed/updated:', details);

    if (details.reason === 'install') {
      console.log('Extension installed for the first time');
    } else if (details.reason === 'update') {
      console.log('Extension updated from version:', details.previousVersion);
    }
  });

  // Handle extension startup
  chrome.runtime.onStartup.addListener(() => {
    console.log('Extension startup');
    init();
  });

  // Initialize when background script loads
  init();
})();
