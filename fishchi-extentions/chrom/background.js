// Background Script for Fishchi Extension
// Handles authentication and API communication

(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api/v1', // Change this to your production URL
    STORAGE_KEYS: {
      USER_TOKEN: 'fishchi_user_token',
      USER_INFO: 'fishchi_user_info',
      PROJECTS: 'fishchi_projects',
    },
  };

  // API Client
  class FishchiAPI {
    constructor() {
      this.baseURL = CONFIG.API_BASE_URL;
    }

    async request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      console.log('Making request to:', url);

      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      };

      const response = await fetch(url, { ...defaultOptions, ...options });
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    }

    // Token management removed - server uses HTTP-only cookies

    // Authentication methods
    async login(email, password) {
      try {
        const response = await this.request('/users/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (response.status === 'success' && response.data) {
          // Store user info and token (server uses cookies, so we'll store user info)
          await chrome.storage.local.set({
            [CONFIG.STORAGE_KEYS.USER_INFO]: response.data,
          });
          return { success: true, user: response.data };
        }

        return { success: false, message: response.message || 'خطا در ورود' };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'خطا در ارتباط با سرور' };
      }
    }

    async logout() {
      try {
        // Clear cookies for logout
        await chrome.cookies.remove({
          url: CONFIG.API_BASE_URL,
          name: 'token',
        });

        // Clear local storage
        await chrome.storage.local.remove(CONFIG.STORAGE_KEYS.USER_INFO);
        await chrome.storage.local.remove(CONFIG.STORAGE_KEYS.PROJECTS);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    async getCurrentUser() {
      try {
        const response = await this.request('/users/profile');
        if (response.status === 'success' && response.data) {
          return { success: true, user: response.data };
        }
        return {
          success: false,
          message: response.message || 'خطا در دریافت اطلاعات کاربر',
        };
      } catch (error) {
        console.error('Get user error:', error);
        return { success: false, message: 'خطا در دریافت اطلاعات کاربر' };
      }
    }

    // Source methods
    async createSource(sourceData, projectId = null) {
      try {
        const body = { ...sourceData };
        if (projectId) {
          body.projectId = projectId;
        }

        const response = await this.request('/sources', {
          method: 'POST',
          body: JSON.stringify(body),
        });

        if (response.status === 'success' && response.data) {
          return { success: true, source: response.data };
        }
        return {
          success: false,
          message: response.message || 'خطا در ذخیره منبع',
        };
      } catch (error) {
        console.error('Create source error:', error);
        return { success: false, message: 'خطا در ذخیره منبع' };
      }
    }

    async getProjects() {
      try {
        const response = await this.request('/projects');
        if (response.status === 'success' && response.data) {
          return { success: true, projects: response.data };
        }
        return {
          success: false,
          message: response.message || 'خطا در دریافت پروژه‌ها',
        };
      } catch (error) {
        console.error('Get projects error:', error);
        return { success: false, message: 'خطا در دریافت پروژه‌ها' };
      }
    }

    async checkAuthStatus() {
      try {
        // Check if user info exists in storage
        const result = await chrome.storage.local.get(
          CONFIG.STORAGE_KEYS.USER_INFO
        );
        const userInfo = result[CONFIG.STORAGE_KEYS.USER_INFO];

        if (!userInfo) {
          return { authenticated: false };
        }

        // Verify with server
        const userResponse = await this.getCurrentUser();
        if (userResponse.success) {
          return { authenticated: true, user: userResponse.user };
        } else {
          await this.logout();
          return { authenticated: false };
        }
      } catch (error) {
        console.error('Auth check error:', error);
        await this.logout();
        return { authenticated: false };
      }
    }
  }

  // Initialize API client
  const api = new FishchiAPI();

  // Message handling
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleMessage(request, sender, sendResponse);
    return true; // Keep message channel open for async response
  });

  async function handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'login':
          const loginResult = await api.login(request.email, request.password);
          sendResponse(loginResult);
          break;

        case 'logout':
          await api.logout();
          sendResponse({ success: true });
          break;

        case 'checkAuth':
          const authStatus = await api.checkAuthStatus();
          sendResponse(authStatus);
          break;

        case 'getProjects':
          const projectsResult = await api.getProjects();
          sendResponse(projectsResult);
          break;

        case 'createSource':
          const sourceResult = await api.createSource(
            request.sourceInfo,
            request.projectId
          );
          sendResponse(sourceResult);
          break;

        case 'extractSource':
          // Handle source extraction from content script
          await handleSourceExtraction(request, sendResponse);
          break;

        default:
          sendResponse({ success: false, message: 'عملیات نامشخص' });
      }
    } catch (error) {
      console.error('Message handling error:', error);
      sendResponse({ success: false, message: 'خطا در پردازش درخواست' });
    }
  }

  async function handleSourceExtraction(request, sendResponse) {
    try {
      // Extract source info from the page
      const sourceInfo = request.sourceInfo;
      if (!sourceInfo || !sourceInfo.title) {
        sendResponse({ success: false, message: 'اطلاعات منبع یافت نشد' });
        return;
      }

      // Check if user is authenticated
      const authStatus = await api.checkAuthStatus();
      if (!authStatus.authenticated) {
        // Open popup for login
        chrome.action.openPopup();
        sendResponse({ success: false, message: 'لطفاً ابتدا وارد شوید' });
        return;
      }

      // Create source
      const result = await api.createSource(sourceInfo);
      sendResponse(result);
    } catch (error) {
      console.error('Source extraction error:', error);
      sendResponse({ success: false, message: 'خطا در استخراج منبع' });
    }
  }

  // Handle extension installation
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      console.log('Fishchi extension installed');
      // Set default settings or show welcome page
    }
  });

  // Handle tab updates to check for supported sites
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      const supportedSites = ['sid.ir', 'civilica.com', 'noormags.ir'];
      const isSupported = supportedSites.some((site) => tab.url.includes(site));

      if (isSupported) {
        // Enable extension action for supported sites
        chrome.action.enable(tabId);
      } else {
        // Disable extension action for unsupported sites
        chrome.action.disable(tabId);
      }
    }
  });

  // Handle extension icon click
  chrome.action.onClicked.addListener((tab) => {
    // This will open the popup automatically due to manifest configuration
    console.log('Extension icon clicked on tab:', tab.url);
  });

  // Periodic auth check
  setInterval(async () => {
    try {
      await api.checkAuthStatus();
    } catch (error) {
      console.error('Periodic auth check error:', error);
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
})();
