// Popup Script for Fishchi Extension
// Handles UI interactions and communication with background script

(function () {
  'use strict';

  // DOM Elements
  const elements = {
    // Sections
    loginSection: document.getElementById('loginSection'),
    extractSection: document.getElementById('extractSection'),
    successSection: document.getElementById('successSection'),
    errorSection: document.getElementById('errorSection'),
    debugSection: document.getElementById('debugSection'),

    // Status
    statusIndicator: document.getElementById('statusIndicator'),
    statusDot: document.querySelector('.status-dot'),
    statusText: document.querySelector('.status-text'),

    // Login form
    emailInput: document.getElementById('email'),
    passwordInput: document.getElementById('password'),
    loginBtn: document.getElementById('loginBtn'),
    loginBtnText: document.querySelector('#loginBtn .btn-text'),
    loginBtnLoader: document.querySelector('#loginBtn .btn-loader'),

    // Source preview
    previewTitle: document.getElementById('previewTitle'),
    previewAuthors: document.getElementById('previewAuthors'),
    previewYear: document.getElementById('previewYear'),
    previewType: document.getElementById('previewType'),

    // Project selection
    projectSelect: document.getElementById('projectSelect'),

    // Action buttons
    refreshBtn: document.getElementById('refreshBtn'),
    extractBtn: document.getElementById('extractBtn'),
    extractBtnText: document.querySelector('#extractBtn .btn-text'),
    extractBtnLoader: document.querySelector('#extractBtn .btn-loader'),

    // Success/Error
    errorMessage: document.getElementById('errorMessage'),
    newExtractBtn: document.getElementById('newExtractBtn'),
    retryBtn: document.getElementById('retryBtn'),

    // Links
    registerLink: document.getElementById('registerLink'),
    forgotPasswordLink: document.getElementById('forgotPasswordLink'),
    settingsLink: document.getElementById('settingsLink'),
    helpLink: document.getElementById('helpLink'),
    testLink: document.getElementById('testLink'),

    // Debug elements
    debugEmail: document.getElementById('debugEmail'),
    debugPassword: document.getElementById('debugPassword'),
    debugLoginBtn: document.getElementById('debugLoginBtn'),
    debugProjectsBtn: document.getElementById('debugProjectsBtn'),
    debugSourceBtn: document.getElementById('debugSourceBtn'),
    debugContentBtn: document.getElementById('debugContentBtn'),
    debugExtractBtn: document.getElementById('debugExtractBtn'),
    debugResult: document.getElementById('debugResult'),
    debugOutput: document.getElementById('debugOutput'),
  };

  // State management
  let currentState = 'loading';
  let currentSourceInfo = null;
  let projects = [];

  // Initialize popup
  async function init() {
    try {
      await checkAuthStatus();
      await loadProjects();
      setupEventListeners();
    } catch (error) {
      console.error('Initialization error:', error);
      showError('خطا در راه‌اندازی اکستنشن');
    }
  }

  // Check authentication status
  async function checkAuthStatus() {
    try {
      const response = await sendMessage({ action: 'checkAuth' });

      if (response.authenticated) {
        showExtractSection();
        updateStatus('connected', 'متصل به فیشچی');
      } else {
        showLoginSection();
        updateStatus('disconnected', 'نیاز به ورود');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      showLoginSection();
      updateStatus('error', 'خطا در ارتباط');
    }
  }

  // Load user projects
  async function loadProjects() {
    try {
      const response = await sendMessage({ action: 'getProjects' });
      if (response.success) {
        projects = response.projects || [];
        updateProjectSelect();
      }
    } catch (error) {
      console.error('Load projects error:', error);
    }
  }

  // Update project selection dropdown
  function updateProjectSelect() {
    elements.projectSelect.innerHTML = '<option value="">بدون پروژه</option>';

    projects.forEach((project) => {
      const option = document.createElement('option');
      option.value = project._id;
      option.textContent = project.title;
      elements.projectSelect.appendChild(option);
    });
  }

  // Setup event listeners
  function setupEventListeners() {
    // Login form
    elements.loginBtn.addEventListener('click', handleLogin);
    elements.emailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
    elements.passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });

    // Extract actions
    elements.refreshBtn.addEventListener('click', refreshSourceInfo);
    elements.extractBtn.addEventListener('click', handleExtract);
    elements.newExtractBtn.addEventListener('click', () => {
      showExtractSection();
      refreshSourceInfo();
    });
    elements.retryBtn.addEventListener('click', () => {
      showExtractSection();
      refreshSourceInfo();
    });

    // Links
    elements.registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'http://localhost:3000/register' });
    });
    elements.forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'http://localhost:3000/forgot-password' });
    });
    elements.settingsLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'http://localhost:3000/settings' });
    });
    elements.helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'http://localhost:3000/help' });
    });
    elements.testLink.addEventListener('click', (e) => {
      e.preventDefault();
      showDebugSection();
    });

    // Debug event listeners
    elements.debugLoginBtn.addEventListener('click', debugLogin);
    elements.debugProjectsBtn.addEventListener('click', debugProjects);
    elements.debugSourceBtn.addEventListener('click', debugCreateSource);
    elements.debugContentBtn.addEventListener('click', debugContentScript);
    elements.debugExtractBtn.addEventListener('click', debugExtract);
  }

  // Handle login
  async function handleLogin() {
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value.trim();

    if (!email || !password) {
      showError('لطفاً ایمیل و رمز عبور را وارد کنید');
      return;
    }

    setLoading(true, 'در حال ورود...');

    try {
      const response = await sendMessage({
        action: 'login',
        email: email,
        password: password,
      });

      if (response.success) {
        showExtractSection();
        updateStatus('connected', 'ورود موفق');
        await loadProjects();
      } else {
        showError(response.message || 'خطا در ورود');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  // Handle source extraction
  async function handleExtract() {
    if (!currentSourceInfo) {
      showError('اطلاعات منبع یافت نشد');
      return;
    }

    const projectId = elements.projectSelect.value || null;
    setLoading(true, 'در حال ذخیره...');

    try {
      const response = await sendMessage({
        action: 'createSource',
        sourceInfo: currentSourceInfo,
        projectId: projectId,
      });

      if (response.success) {
        showSuccess();
        updateStatus('success', 'ذخیره موفق');
      } else {
        showError(response.message || 'خطا در ذخیره منبع');
      }
    } catch (error) {
      console.error('Extract error:', error);
      showError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  // Refresh source information
  async function refreshSourceInfo() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab) {
        showError('تب فعلی یافت نشد');
        return;
      }

      // Check if current tab is supported
      const supportedSites = ['sid.ir', 'civilica.com', 'noormags.ir'];
      const isSupported = supportedSites.some((site) => tab.url.includes(site));

      if (!isSupported) {
        showError(
          'این سایت پشتیبانی نمی‌شود. لطفاً به یکی از سایت‌های SID، Civilica یا Noormags بروید.'
        );
        return;
      }

      // Check if content script should be auto-injected by manifest
      console.log('Checking if content script should be auto-injected...');
      console.log('Tab URL:', tab.url);
      console.log('Tab ID:', tab.id);

      // Check if URL matches manifest content_scripts patterns
      const manifestPatterns = [
        'https://*.sid.ir/*',
        'https://*.civilica.com/*',
        'https://*.noormags.ir/*',
      ];

      const matchesManifest = manifestPatterns.some((pattern) => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(tab.url);
      });

      console.log('URL matches manifest patterns:', matchesManifest);

      // First try to communicate with existing content script
      let response = null;
      try {
        console.log('Attempting to communicate with existing content script');
        response = await chrome.tabs.sendMessage(tab.id, {
          action: 'getSourceInfo',
        });
        console.log('Existing content script responded:', response);
      } catch (error) {
        console.log('No existing content script found, attempting injection');
        console.log('Error details:', error.message);

        // Try to inject content script if not already injected
        try {
          console.log('Attempting to inject content script into tab:', tab.id);
          console.log(
            'Using chrome.scripting.executeScript with files: ["content.js"]'
          );

          const injectionResult = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js'],
          });

          console.log('Content script injection result:', injectionResult);
          console.log('Content script injected successfully');

          // Wait a bit for the content script to initialize
          console.log('Waiting for content script to initialize...');
          await new Promise((resolve) => setTimeout(resolve, 2000));
          console.log('Content script initialization wait completed');

          // Test if content script is actually running
          try {
            const testResult = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                console.log('Test function executing in page context');

                // Check if content script file is loaded
                const scripts = Array.from(document.querySelectorAll('script'));
                const contentScriptLoaded = scripts.some(
                  (script) => script.src && script.src.includes('content.js')
                );

                // Check CSP (Content Security Policy)
                const cspMeta = document.querySelector(
                  'meta[http-equiv="Content-Security-Policy"]'
                );
                const cspContent = cspMeta
                  ? cspMeta.getAttribute('content')
                  : null;

                // Check for inline script restrictions
                const inlineScripts = scripts.filter((script) => !script.src);
                const hasInlineScripts = inlineScripts.length > 0;

                const button = document.getElementById('fishchi-extract-btn');
                const testFunction = window.fishchiTest;
                console.log('fishchiTest function:', testFunction);
                console.log('Content script file loaded:', contentScriptLoaded);

                // Check for JavaScript errors
                const originalError = window.onerror;
                const errors = [];
                window.onerror = function (msg, url, line, col, error) {
                  errors.push({ msg, url, line, col, error: error?.stack });
                  return false;
                };

                // Check if content script logs exist in console
                const consoleLogs = [];
                const originalLog = console.log;
                console.log = function (...args) {
                  consoleLogs.push(args.join(' '));
                  originalLog.apply(console, args);
                };

                return {
                  testFunction: testFunction ? testFunction() : null,
                  buttonExists: !!button,
                  buttonVisible: button
                    ? button.style.display !== 'none'
                    : false,
                  documentReady: document.readyState,
                  url: window.location.href,
                  hasChromeRuntime:
                    typeof chrome !== 'undefined' && chrome.runtime,
                  hasOnMessage:
                    typeof chrome !== 'undefined' &&
                    chrome.runtime &&
                    chrome.runtime.onMessage,
                  consoleLogs: consoleLogs.slice(-10), // Last 10 logs
                  errors: errors,
                  scriptTags: Array.from(document.querySelectorAll('script'))
                    .map((s) => s.src || 'inline')
                    .slice(0, 5),
                  windowKeys: Object.keys(window).filter(
                    (k) => k.includes('fishchi') || k.includes('chrome')
                  ),
                  contentScriptLoaded: contentScriptLoaded,
                  cspContent: cspContent,
                  hasInlineScripts: hasInlineScripts,
                  inlineScriptsCount: inlineScripts.length,
                };
              },
            });
            console.log('Content script test result:', testResult[0]?.result);

            // Log detailed test results
            const result = testResult[0]?.result;
            if (result) {
              console.log('Detailed test results:');
              console.log('- testFunction:', result.testFunction);
              console.log('- buttonExists:', result.buttonExists);
              console.log('- hasChromeRuntime:', result.hasChromeRuntime);
              console.log('- hasOnMessage:', result.hasOnMessage);
              console.log('- errors:', result.errors);
              console.log('- scriptTags:', result.scriptTags);
              console.log('- consoleLogs:', result.consoleLogs);
              console.log('- windowKeys:', result.windowKeys);
              console.log('- contentScriptLoaded:', result.contentScriptLoaded);
              console.log('- cspContent:', result.cspContent);
              console.log('- hasInlineScripts:', result.hasInlineScripts);
              console.log('- inlineScriptsCount:', result.inlineScriptsCount);
            }
          } catch (testError) {
            console.log('Content script test failed:', testError);
          }
        } catch (injectionError) {
          console.log('Content script injection failed:', injectionError);
          throw new Error(
            'Failed to inject content script: ' + injectionError.message
          );
        }
      }

      // If no response yet, try to send message with retry mechanism
      if (!response) {
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries && !response) {
          try {
            console.log(
              `Attempting to send message to content script (attempt ${
                retryCount + 1
              })`
            );
            response = await chrome.tabs.sendMessage(tab.id, {
              action: 'getSourceInfo',
            });
            console.log('Received response from content script:', response);
          } catch (error) {
            retryCount++;
            console.log(
              `Message send failed (attempt ${retryCount}):`,
              error.message
            );
            if (retryCount < maxRetries) {
              console.log(
                `Retry ${retryCount} for content script communication`
              );
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
              throw error;
            }
          }
        }
      }

      if (response && response.success && response.sourceInfo) {
        currentSourceInfo = response.sourceInfo;
        updateSourcePreview(response.sourceInfo);
        updateStatus('ready', 'آماده استخراج');
      } else {
        showError('اطلاعات منبع از این صفحه قابل استخراج نیست');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      if (error.message.includes('Receiving end does not exist')) {
        showError(
          'Content script در این صفحه اجرا نشده است. لطفاً صفحه را refresh کنید و دوباره تلاش کنید.'
        );
      } else {
        showError('خطا در دریافت اطلاعات صفحه: ' + error.message);
      }
    }
  }

  // Update source preview
  function updateSourcePreview(sourceInfo) {
    elements.previewTitle.textContent = sourceInfo.title || 'عنوان یافت نشد';
    elements.previewAuthors.textContent =
      sourceInfo.authors?.map((a) => a.name).join(', ') || 'نویسنده نامشخص';
    elements.previewYear.textContent = sourceInfo.year || 'سال نامشخص';
    elements.previewType.textContent = getTypeLabel(sourceInfo.type);
  }

  // Get type label in Persian
  function getTypeLabel(type) {
    const labels = {
      article: 'مقاله',
      book: 'کتاب',
      thesis: 'پایان‌نامه',
      website: 'وب‌سایت',
      other: 'سایر',
    };
    return labels[type] || 'نامشخص';
  }

  // Show different sections
  function showLoginSection() {
    hideAllSections();
    elements.loginSection.style.display = 'block';
    currentState = 'login';
  }

  function showExtractSection() {
    hideAllSections();
    elements.extractSection.style.display = 'block';
    currentState = 'extract';
    refreshSourceInfo();
  }

  function showSuccess() {
    hideAllSections();
    elements.successSection.style.display = 'block';
    currentState = 'success';
  }

  function showError(message) {
    hideAllSections();
    elements.errorSection.style.display = 'block';
    elements.errorMessage.textContent = message;
    currentState = 'error';
  }

  function hideAllSections() {
    elements.loginSection.style.display = 'none';
    elements.extractSection.style.display = 'none';
    elements.successSection.style.display = 'none';
    elements.errorSection.style.display = 'none';
    elements.debugSection.style.display = 'none';
  }

  // Update status indicator
  function updateStatus(type, text) {
    elements.statusDot.className = `status-dot ${type}`;
    elements.statusText.textContent = text;
  }

  // Set loading state
  function setLoading(isLoading, text = '') {
    if (currentState === 'login') {
      elements.loginBtn.disabled = isLoading;
      elements.loginBtnText.style.display = isLoading ? 'none' : 'inline';
      elements.loginBtnLoader.style.display = isLoading ? 'block' : 'none';
    } else if (currentState === 'extract') {
      elements.extractBtn.disabled = isLoading;
      elements.extractBtnText.style.display = isLoading ? 'none' : 'inline';
      elements.extractBtnLoader.style.display = isLoading ? 'block' : 'none';
    }

    if (text) {
      updateStatus('loading', text);
    }
  }

  // Send message to background script
  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Debug functions
  function showDebugSection() {
    hideAllSections();
    elements.debugSection.style.display = 'block';
    currentState = 'debug';
  }

  async function debugLogin() {
    const email = elements.debugEmail.value.trim();
    const password = elements.debugPassword.value.trim();

    try {
      const response = await sendMessage({
        action: 'login',
        email: email,
        password: password,
      });

      showDebugResult('تست ورود', response, response.success);
    } catch (error) {
      showDebugResult('تست ورود', { error: error.message }, false);
    }
  }

  async function debugProjects() {
    try {
      const response = await sendMessage({
        action: 'getProjects',
      });

      showDebugResult('تست پروژه‌ها', response, response.success);
    } catch (error) {
      showDebugResult('تست پروژه‌ها', { error: error.message }, false);
    }
  }

  async function debugCreateSource() {
    const testSource = {
      title: 'منبع تست اکستنشن',
      authors: [{ name: 'نویسنده تست' }],
      year: 2024,
      type: 'article',
      abstract: 'این یک منبع تست است',
      tags: ['تست', 'اکستنشن'],
    };

    try {
      const response = await sendMessage({
        action: 'createSource',
        sourceInfo: testSource,
      });

      showDebugResult('تست ایجاد منبع', response, response.success);
    } catch (error) {
      showDebugResult('تست ایجاد منبع', { error: error.message }, false);
    }
  }

  async function debugContentScript() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab) {
        showDebugResult(
          'تست Content Script',
          { error: 'تب فعلی یافت نشد' },
          false
        );
        return;
      }

      // Check if current tab is supported
      const supportedSites = ['sid.ir', 'civilica.com', 'noormags.ir'];
      const isSupported = supportedSites.some((site) => tab.url.includes(site));

      if (!isSupported) {
        showDebugResult(
          'تست Content Script',
          {
            error: 'این سایت پشتیبانی نمی‌شود',
            currentUrl: tab.url,
            supportedSites: supportedSites,
          },
          false
        );
        return;
      }

      // Try to inject content script
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        });
      } catch (injectionError) {
        console.log('Content script injection result:', injectionError);
      }

      // Try to send message
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getSourceInfo',
      });

      showDebugResult(
        'تست Content Script',
        {
          success: true,
          tabUrl: tab.url,
          response: response,
          message: 'Content script فعال است',
        },
        true
      );
    } catch (error) {
      showDebugResult(
        'تست Content Script',
        {
          error: error.message,
          details: 'Content script در این صفحه فعال نیست',
        },
        false
      );
    }
  }

  async function debugExtract() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab) {
        showDebugResult('تست استخراج', { error: 'تب فعلی یافت نشد' }, false);
        return;
      }

      // Check if current tab is supported
      const supportedSites = ['sid.ir', 'civilica.com', 'noormags.ir'];
      const isSupported = supportedSites.some((site) => tab.url.includes(site));

      if (!isSupported) {
        showDebugResult(
          'تست استخراج',
          {
            error: 'این سایت پشتیبانی نمی‌شود',
            currentUrl: tab.url,
            supportedSites: supportedSites,
          },
          false
        );
        return;
      }

      // Try to inject content script
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        });
      } catch (injectionError) {
        console.log('Content script injection result:', injectionError);
      }

      // Try to extract source info
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getSourceInfo',
      });

      showDebugResult(
        'تست استخراج',
        {
          success: true,
          tabUrl: tab.url,
          extractedData: response,
          message: 'اطلاعات استخراج شد',
        },
        true
      );
    } catch (error) {
      showDebugResult(
        'تست استخراج',
        {
          error: error.message,
          details: 'خطا در استخراج اطلاعات',
        },
        false
      );
    }
  }

  function showDebugResult(title, data, isSuccess) {
    elements.debugResult.style.display = 'block';
    elements.debugOutput.textContent = `${title}: ${
      isSuccess ? 'موفق' : 'ناموفق'
    }\n\n${JSON.stringify(data, null, 2)}`;
    elements.debugOutput.style.color = isSuccess ? '#28a745' : '#dc3545';
  }

  // Start the popup
  init();
})();
