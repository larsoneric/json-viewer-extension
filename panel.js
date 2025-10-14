// Panel logic for JSON Viewer Chrome DevTools extension

// Constants
const DEFAULT_REQUEST_LIMIT = 20;
const TRUNCATE_LENGTH = 200;
const NOTIFICATION_TIMEOUT_MS = 3000;
const PROCESS_REQUEST_DEBOUNCE_MS = 100;

// State
let allRequests = []; // Store all requests with escaped JSON
let isRecording = true; // Start recording by default
let expandedRequests = new Map(); // Track which requests are expanded (using timestamp as key)
let requestLimit = DEFAULT_REQUEST_LIMIT; // Default limit for stored requests
let lastRenderedCount = 0; // Track how many requests were last rendered for incremental updates
let searchQuery = ''; // Current search query
let processRequestTimeout = null; // For debouncing request processing

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('JSON Viewer panel initialized');
  try {
    initializeI18n();
    setupRecordingToggle();
    setupClearButton();
    setupRequestLimitSelect();
    setupSearchFilter();
    listenToNetworkRequests();
    console.log('JSON Viewer setup complete');
  } catch (err) {
    console.error('Failed to initialize JSON Viewer:', err);
    showFatalError(err);
  }
});

// Show fatal error UI when initialization fails
function showFatalError(error) {
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; color: #f48771;">
      <h3>❌ JSON Viewer Failed to Initialize</h3>
      <p style="color: #858585; margin: 10px 0;">An error occurred while loading the extension.</p>
      <details style="margin-top: 20px; text-align: left; background: #252526; padding: 10px; border-radius: 4px;">
        <summary style="cursor: pointer; color: #9cdcfe;">Error Details</summary>
        <pre style="margin-top: 10px; color: #ce9178; font-size: 11px; overflow: auto;">${escapeHtml(error.toString())}\n\n${escapeHtml(error.stack || '')}</pre>
      </details>
      <p style="margin-top: 20px; font-size: 12px; color: #858585;">
        Try reloading DevTools or <a href="https://github.com/larsoneric/json-viewer-extension/issues" style="color: #0e639c;">report this issue</a>.
      </p>
    </div>
  `;
}

// Initialize internationalization
function initializeI18n() {
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });
}

// Setup recording toggle button
function setupRecordingToggle() {
  const toggleBtn = document.getElementById('recordToggleBtn');
  const statusSpan = document.getElementById('recordingStatus');
  const iconSpan = document.getElementById('recordIcon');
  const textSpan = document.getElementById('recordToggleText');

  toggleBtn.addEventListener('click', () => {
    isRecording = !isRecording;

    if (isRecording) {
      // Resume recording
      statusSpan.textContent = t('recordingActive');
      statusSpan.className = 'recording-status active';
      iconSpan.textContent = '⏸';
      iconSpan.className = 'record-icon recording';
      textSpan.textContent = t('pauseRecording');
    } else {
      // Pause recording
      statusSpan.textContent = t('recordingPaused');
      statusSpan.className = 'recording-status paused';
      iconSpan.textContent = '▶';
      iconSpan.className = 'record-icon paused';
      textSpan.textContent = t('resumeRecording');
    }
  });
}

// Setup clear button
function setupClearButton() {
  const clearBtn = document.getElementById('clearBtn');
  clearBtn.addEventListener('click', () => {
    allRequests = [];
    expandedRequests.clear();
    updateUI(true);
  });
}

// Setup request limit select
function setupRequestLimitSelect() {
  const select = document.getElementById('requestLimitSelect');
  select.addEventListener('change', (e) => {
    requestLimit = parseInt(e.target.value, 10);

    // Trim requests if current count exceeds new limit
    if (allRequests.length > requestLimit) {
      const removed = allRequests.slice(requestLimit);
      allRequests = allRequests.slice(0, requestLimit);

      // Clean up expanded state for removed requests
      removed.forEach(req => {
        expandedRequests.delete(req.timestamp);
      });

      updateUI(true);
    }
  });
}

// Setup search/filter functionality
function setupSearchFilter() {
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();

    // Show/hide clear button
    if (searchQuery) {
      clearSearchBtn.classList.add('visible');
    } else {
      clearSearchBtn.classList.remove('visible');
    }

    applySearchFilter();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.remove('visible');
    applySearchFilter();
    searchInput.focus();
  });
}

function applySearchFilter() {
  const requestsList = document.getElementById('requestsList');
  const wrappers = requestsList.querySelectorAll('.request-wrapper');

  if (!searchQuery) {
    // Show all requests
    wrappers.forEach(wrapper => wrapper.classList.remove('hidden'));
    return;
  }

  // Filter requests by URL or method
  wrappers.forEach((wrapper) => {
    const timestamp = parseInt(wrapper.getAttribute('data-timestamp'), 10);
    const reqData = allRequests.find(req => req.timestamp === timestamp);
    if (!reqData) return;

    const matchesUrl = reqData.url.toLowerCase().includes(searchQuery);
    const matchesMethod = reqData.method.toLowerCase().includes(searchQuery);

    if (matchesUrl || matchesMethod) {
      wrapper.classList.remove('hidden');
    } else {
      wrapper.classList.add('hidden');
    }
  });
}

// Listen for network requests
function listenToNetworkRequests() {
  chrome.devtools.network.onRequestFinished.addListener((request) => {
    // Only process if it's a JSON response
    if (!request.response || !request.response.content) return;

    const contentType = request.response.content.mimeType || '';
    if (!contentType.includes('json') && !contentType.includes('javascript')) return;

    request.getContent((content) => {
      if (content) {
        processRequestDebounced(request, content);
      }
    });
  });
}

// Debounced version of processRequest to handle high-frequency requests
function processRequestDebounced(request, content) {
  // Clear existing timeout
  if (processRequestTimeout) {
    clearTimeout(processRequestTimeout);
  }

  // Process immediately for first request, then debounce subsequent ones
  if (allRequests.length === 0) {
    processRequest(request, content);
  } else {
    processRequestTimeout = setTimeout(() => {
      processRequest(request, content);
      processRequestTimeout = null;
    }, PROCESS_REQUEST_DEBOUNCE_MS);
  }
}

function processRequest(request, content) {
  // Skip processing if recording is paused
  if (!isRecording) {
    console.log('Recording paused, skipping request:', request.request.url);
    return;
  }

  try {
    const data = JSON.parse(content);
    const properties = [];

    // Always include the full response as the first property
    properties.push({
      path: t('fullResponse'),
      value: content
    });

    // Find any escaped JSON properties within the response
    const escapedProperties = findEscapedJsonProperties(data);
    properties.push(...escapedProperties);

    console.log(`Processing request: ${request.request.method} ${request.request.url} - Found ${properties.length} properties`);

    // Add to list of requests (only store what we need to avoid memory bloat)
    const requestData = {
      // Store minimal request info instead of the entire request object
      request: {
        request: {
          url: request.request.url,
          method: request.request.method,
          headers: request.request.headers || [],
          postData: request.request.postData || null
        },
        response: {
          headers: request.response.headers || []
        }
      },
      properties: properties,
      url: request.request.url,
      method: request.request.method,
      timestamp: Date.now()
    };

    allRequests.unshift(requestData); // Add to beginning

    // Keep only last N requests based on configured limit
    if (allRequests.length > requestLimit) {
      const removed = allRequests.slice(requestLimit);
      allRequests = allRequests.slice(0, requestLimit);

      // Clean up expanded state for removed requests
      removed.forEach(req => {
        expandedRequests.delete(req.timestamp);
      });

      console.log(`Removed ${removed.length} old requests, keeping ${requestLimit}`);
    }

    updateUI();
  } catch (e) {
    // Not valid JSON or parsing error, log and ignore
    console.debug(`Failed to parse JSON from ${request.request.url}:`, e.message);
  }
}

// Recursively find all properties containing escaped JSON
function findEscapedJsonProperties(obj, path = '') {
  const results = [];

  function traverse(value, currentPath) {
    if (value === null || value === undefined) return;

    if (typeof value === 'string') {
      // Check if this string contains escaped JSON
      if (isEscapedJSON(value)) {
        results.push({
          path: currentPath,
          value: value
        });
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        traverse(item, `${currentPath}[${index}]`);
      });
    } else if (typeof value === 'object') {
      Object.keys(value).forEach(key => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        traverse(value[key], newPath);
      });
    }
  }

  traverse(obj, path);
  return results;
}

function isEscapedJSON(str) {
  if (typeof str !== 'string') return false;

  // Check if string looks like it contains escaped JSON
  try {
    const parsed = JSON.parse(str);
    // If it parses and is an object or array, it's probably escaped JSON
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    return false;
  }
}

function updateUI(forceFullRender = false) {
  const emptyState = document.getElementById('emptyState');
  const mainContent = document.getElementById('mainContent');
  const requestsList = document.getElementById('requestsList');

  if (allRequests.length === 0) {
    emptyState.style.display = 'block';
    mainContent.style.display = 'none';
    lastRenderedCount = 0;
    return;
  }

  emptyState.style.display = 'none';
  mainContent.style.display = 'block';

  // Optimization: Only add new requests incrementally if list hasn't changed significantly
  // Full re-render is needed when: forcing, expansion state changes, or requests were removed
  if (forceFullRender || lastRenderedCount > allRequests.length) {
    // Full re-render
    requestsList.innerHTML = '';
    allRequests.forEach((reqData, index) => {
      const wrapper = createRequestWrapper(reqData, index);
      requestsList.appendChild(wrapper);
    });
    lastRenderedCount = allRequests.length;
  } else if (lastRenderedCount < allRequests.length) {
    // Incremental render: Only add new requests at the beginning
    const newRequestCount = allRequests.length - lastRenderedCount;
    const fragment = document.createDocumentFragment();

    for (let i = newRequestCount - 1; i >= 0; i--) {
      const wrapper = createRequestWrapper(allRequests[i], i);
      fragment.appendChild(wrapper);
    }

    // Insert new requests at the beginning
    if (requestsList.firstChild) {
      requestsList.insertBefore(fragment, requestsList.firstChild);
    } else {
      requestsList.appendChild(fragment);
    }

    lastRenderedCount = allRequests.length;
  }
  // If lastRenderedCount === allRequests.length, no update needed (expansion handled separately)

  // Apply search filter after rendering
  if (searchQuery) {
    applySearchFilter();
  }
}

function createRequestWrapper(reqData, index) {
  const wrapper = document.createElement('div');
  wrapper.className = 'request-wrapper';
  wrapper.setAttribute('role', 'listitem');
  wrapper.setAttribute('data-timestamp', reqData.timestamp);

  // Create request item (the clickable header)
  const item = document.createElement('div');
  item.className = 'request-item';
  item.setAttribute('role', 'button');
  item.setAttribute('tabindex', '0');
  const isExpanded = expandedRequests.has(reqData.timestamp);
  if (isExpanded) {
    item.classList.add('expanded');
  }
  item.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  item.setAttribute('aria-label', `${reqData.method} ${getDisplayUrl(reqData.url)}, ${reqData.properties.length} properties`);

  // Expand indicator
  const expandIndicator = document.createElement('span');
  expandIndicator.className = 'request-expand-indicator';
  expandIndicator.textContent = '▶';
  expandIndicator.setAttribute('aria-hidden', 'true');

  const methodSpan = document.createElement('span');
  methodSpan.className = 'request-method';
  methodSpan.textContent = reqData.method;

  const urlSpan = document.createElement('span');
  urlSpan.className = 'request-url';
  urlSpan.textContent = getDisplayUrl(reqData.url);

  const countSpan = document.createElement('span');
  countSpan.className = 'request-count';
  const propertyLabel = reqData.properties.length === 1 ? t('property') : t('properties');
  countSpan.textContent = `(${reqData.properties.length} ${propertyLabel})`;

  const timestampSpan = document.createElement('span');
  timestampSpan.className = 'request-timestamp';
  timestampSpan.textContent = formatTimestamp(reqData.timestamp);

  item.appendChild(expandIndicator);
  item.appendChild(methodSpan);
  item.appendChild(urlSpan);
  item.appendChild(countSpan);
  item.appendChild(timestampSpan);

  // Create expanded content
  const expandedContent = document.createElement('div');
  expandedContent.className = 'request-expanded-content';
  if (isExpanded) {
    expandedContent.classList.add('visible');
    buildExpandedContent(reqData, expandedContent);
  }

  // Click handler to toggle expansion
  // Note: Using arrow function to avoid 'this' binding issues
  const clickHandler = () => {
    if (expandedRequests.has(reqData.timestamp)) {
      expandedRequests.delete(reqData.timestamp);
    } else {
      expandedRequests.set(reqData.timestamp, true);
    }
    updateUI(true); // Force full re-render when toggling expansion
  };

  item.addEventListener('click', clickHandler);

  // Keyboard navigation support
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      clickHandler();
    }
  });

  wrapper.appendChild(item);
  wrapper.appendChild(expandedContent);

  return wrapper;
}

function buildExpandedContent(reqData, container) {
  container.innerHTML = '';

  // Create header with method and URL
  const header = document.createElement('div');
  header.className = 'selected-request-header';
  header.textContent = `${reqData.method} ${reqData.url}`;

  // Add expand indicator for details
  const detailsIndicator = document.createElement('span');
  detailsIndicator.className = 'expand-indicator';
  detailsIndicator.textContent = '▶';
  header.appendChild(detailsIndicator);

  container.appendChild(header);

  // Create request details container
  const requestDetails = document.createElement('div');
  requestDetails.className = 'request-details';

  // Setup click handler for expanding/collapsing details
  let isDetailsExpanded = false;
  header.onclick = () => {
    isDetailsExpanded = !isDetailsExpanded;
    detailsIndicator.textContent = isDetailsExpanded ? '▼' : '▶';

    if (isDetailsExpanded) {
      requestDetails.className = 'request-details expanded';
      buildRequestDetails(reqData, requestDetails);
    } else {
      requestDetails.className = 'request-details';
    }
  };

  container.appendChild(requestDetails);

  // Create properties list
  const propertiesList = document.createElement('div');
  propertiesList.className = 'request-properties';

  reqData.properties.forEach(prop => {
    const item = createPropertyItem(prop);
    propertiesList.appendChild(item);
  });

  container.appendChild(propertiesList);
}

function createPropertyItem(prop) {
  const div = document.createElement('div');
  div.className = 'property-item';

  // Property path
  const pathDiv = document.createElement('div');
  pathDiv.className = 'property-path';
  pathDiv.textContent = prop.path;
  div.appendChild(pathDiv);

  // Preview
  const previewDiv = document.createElement('div');
  previewDiv.className = 'property-preview';
  previewDiv.textContent = truncate(prop.value, TRUNCATE_LENGTH);
  previewDiv.title = prop.value;
  div.appendChild(previewDiv);

  // Track formatting state
  let isFormatted = false;
  let formattedText = '';

  // Actions
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'property-actions';

  const formatBtn = document.createElement('button');
  formatBtn.className = 'format-btn';
  formatBtn.textContent = t('formatButton');
  formatBtn.setAttribute('aria-label', `Format JSON for ${prop.path}`);
  formatBtn.addEventListener('click', () => {
    if (isFormatted) {
      // Collapse
      previewDiv.className = 'property-preview';
      previewDiv.textContent = truncate(prop.value, TRUNCATE_LENGTH);
      formatBtn.textContent = t('formatButton');
      isFormatted = false;
    } else {
      // Format
      try {
        const parsed = JSON.parse(prop.value);
        formattedText = JSON.stringify(parsed, null, 2);
        previewDiv.className = 'property-preview formatted';
        previewDiv.innerHTML = syntaxHighlight(formattedText);
        formatBtn.textContent = t('collapseButton');
        isFormatted = true;
      } catch (e) {
        showNotification(t('parseError', { error: e.message }), true);
      }
    }
  });

  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.textContent = t('copyButton');
  copyBtn.setAttribute('aria-label', `Copy JSON from ${prop.path} to clipboard`);
  copyBtn.addEventListener('click', () => {
    const textToCopy = isFormatted ? formattedText : prop.value;
    copyToClipboard(textToCopy, prop.path);
  });

  actionsDiv.appendChild(formatBtn);
  actionsDiv.appendChild(copyBtn);
  div.appendChild(actionsDiv);

  return div;
}

async function copyToClipboard(text, path) {
  // Try modern Clipboard API first, fall back to execCommand for compatibility
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showNotification(t('copiedSuccess', { path: path }));
      console.log('Copied to clipboard using Clipboard API:', path);
    } else {
      // Fallback to execCommand for non-secure contexts or unsupported browsers
      copyToClipboardFallback(text, path);
    }
  } catch (err) {
    console.error('Clipboard API failed, using fallback:', err);
    // If modern API fails, try fallback
    copyToClipboardFallback(text, path);
  }
}

function copyToClipboardFallback(text, path) {
  // Use the older execCommand method as fallback
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showNotification(t('copiedSuccess', { path: path }));
      console.log('Copied to clipboard using execCommand fallback:', path);
    } else {
      showNotification(t('copyFailed'), true);
      console.error('execCommand copy failed for:', path);
    }
  } catch (err) {
    console.error('Failed to copy:', err);
    showNotification(t('copyFailed'), true);
  } finally {
    document.body.removeChild(textarea);
  }
}

function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.className = `notification ${isError ? 'error' : 'success'}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto-remove after timeout
  const timeoutId = setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, NOTIFICATION_TIMEOUT_MS);

  // Clean up timeout if notification is removed manually
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === notification) {
          clearTimeout(timeoutId);
          observer.disconnect();
        }
      });
    });
  });

  observer.observe(document.body, { childList: true });
}

function getDisplayUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch (e) {
    return url;
  }
}

function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

function buildRequestDetails(reqData, container) {
  container.innerHTML = '';
  const request = reqData.request;

  // Helper function to create a headers section
  const createHeadersSection = (title, headers) => {
    const section = document.createElement('div');
    section.className = 'details-section';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'details-section-title';
    titleDiv.textContent = title;
    section.appendChild(titleDiv);

    if (headers && headers.length > 0) {
      headers.forEach(header => {
        const headerItem = document.createElement('div');
        headerItem.className = 'header-item';
        headerItem.innerHTML = `<span class="header-name">${escapeHtml(header.name)}</span>: <span class="header-value">${escapeHtml(header.value)}</span>`;
        section.appendChild(headerItem);
      });
    } else {
      const noHeaders = document.createElement('div');
      noHeaders.className = 'header-item';
      noHeaders.style.color = '#858585';
      noHeaders.textContent = t('noHeaders');
      section.appendChild(noHeaders);
    }

    return section;
  };

  // Request Headers
  container.appendChild(createHeadersSection(t('requestHeaders'), request.request.headers));

  // Request Payload (if present and not empty)
  if (request.request.postData && request.request.postData.text) {
    const payloadSection = document.createElement('div');
    payloadSection.className = 'details-section';

    const payloadTitle = document.createElement('div');
    payloadTitle.className = 'details-section-title';
    payloadTitle.textContent = t('requestPayload');
    payloadSection.appendChild(payloadTitle);

    const payloadContent = document.createElement('div');
    payloadContent.className = 'payload-content';
    payloadContent.style.whiteSpace = 'pre-wrap';
    payloadContent.textContent = request.request.postData.text;
    payloadSection.appendChild(payloadContent);

    container.appendChild(payloadSection);
  }

  // Response Headers
  container.appendChild(createHeadersSection(t('responseHeaders'), request.response.headers));
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();

  // Check if timestamp is from today
  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;

  if (isToday) {
    return timeString;
  } else {
    // Include date if not today
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day} ${timeString}`;
  }
}
