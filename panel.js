// Panel logic for JSON Viewer Chrome DevTools extension
let allRequests = []; // Store all requests with escaped JSON
let isRecording = true; // Start recording by default
let expandedRequests = new Map(); // Track which requests are expanded (using timestamp as key)
let requestLimit = 20; // Default limit for stored requests

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeI18n();
  setupRecordingToggle();
  setupClearButton();
  setupRequestLimitSelect();
  listenToNetworkRequests();
});

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
    updateUI();
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

      updateUI();
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
        processRequest(request, content);
      }
    });
  });
}

function processRequest(request, content) {
  // Skip processing if recording is paused
  if (!isRecording) {
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
    }

    updateUI();
  } catch (e) {
    // Not valid JSON or parsing error, ignore
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

function updateUI() {
  const emptyState = document.getElementById('emptyState');
  const mainContent = document.getElementById('mainContent');
  const requestsList = document.getElementById('requestsList');

  if (allRequests.length === 0) {
    emptyState.style.display = 'block';
    mainContent.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  mainContent.style.display = 'block';

  // Update requests list
  requestsList.innerHTML = '';
  allRequests.forEach((reqData, index) => {
    const wrapper = createRequestWrapper(reqData, index);
    requestsList.appendChild(wrapper);
  });
}

function createRequestWrapper(reqData, index) {
  const wrapper = document.createElement('div');
  wrapper.className = 'request-wrapper';

  // Create request item (the clickable header)
  const item = document.createElement('div');
  item.className = 'request-item';
  const isExpanded = expandedRequests.has(reqData.timestamp);
  if (isExpanded) {
    item.classList.add('expanded');
  }

  // Expand indicator
  const expandIndicator = document.createElement('span');
  expandIndicator.className = 'request-expand-indicator';
  expandIndicator.textContent = '▶';

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
    updateUI();
  };

  item.addEventListener('click', clickHandler);

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
  previewDiv.textContent = truncate(prop.value, 200);
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
  formatBtn.addEventListener('click', () => {
    if (isFormatted) {
      // Collapse
      previewDiv.className = 'property-preview';
      previewDiv.textContent = truncate(prop.value, 200);
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
  copyBtn.addEventListener('click', () => {
    const textToCopy = isFormatted ? formattedText : prop.value;
    copyToClipboard(textToCopy, prop.path);
  });

  actionsDiv.appendChild(formatBtn);
  actionsDiv.appendChild(copyBtn);
  div.appendChild(actionsDiv);

  return div;
}

function copyToClipboard(text, path) {
  // Use the older execCommand method which works better in extension contexts
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
    } else {
      showNotification(t('copyFailed'), true);
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

  // Store timeout ID for potential cleanup
  const timeoutId = setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);

  // Clean up if notification is removed early
  notification.dataset.timeoutId = timeoutId;
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
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}
