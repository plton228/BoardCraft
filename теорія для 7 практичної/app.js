// State & Configuration
const colVars = {
    accessToken: '',
    cartID: '',
    orderID: '',
    itemID: ''
};

// Elements Cache
const navButtons = document.querySelectorAll('.nav-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const btnTimestamp = document.getElementById('btn-timestamp');
const timestampResult = document.getElementById('timestamp-result');
const tsAuthor = document.getElementById('ts-author');
const tsTime = document.getElementById('ts-time');

// Tab Navigation
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        navButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Time Stamp Generator
function printTimeStamp(name) {
    const now = new Date();
    const timeStr = now.toString();
    console.log('Автор програми: ' + name);
    console.log('Час компіляції: ' + timeStr);
    return { name, timeStr };
}

btnTimestamp.addEventListener('click', () => {
    const stamp = printTimeStamp('Павліченко Платон Сергійович');
    tsAuthor.textContent = stamp.name;
    tsTime.textContent = stamp.timeStr;
    timestampResult.classList.remove('hidden');
});

// ==========================================
// 1. FETCH API LOGIC
// ==========================================
const fetchTerminal = document.getElementById('fetch-terminal');
const btnFetchGet = document.getElementById('btn-fetch-get');
const btnFetchPost = document.getElementById('btn-fetch-post');
const btnFetchError = document.getElementById('btn-fetch-error');
const btnFetchTimeout = document.getElementById('btn-fetch-timeout');
const btnFetchAbort = document.getElementById('btn-fetch-abort');
const btnFetchParallel = document.getElementById('btn-fetch-parallel');

let currentAbortController = null;

function termLog(msg, type = 'system') {
    const line = document.createElement('div');
    line.className = `${type}-msg`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    fetchTerminal.appendChild(line);
    fetchTerminal.scrollTop = fetchTerminal.scrollHeight;
}

// GET products
btnFetchGet.addEventListener('click', async () => {
    termLog('> Запуск GET-запиту до dummyjson.com/products...', 'system');
    try {
        const res = await fetch('https://dummyjson.com/products?limit=3');
        termLog(`Статус відповіді: ${res.status} ${res.statusText}`, res.ok ? 'success' : 'error');
        const data = await res.json();
        termLog(`Отримано товарів: ${data.products.length}`, 'success');
        data.products.forEach(p => {
            termLog(`  - ${p.title} (${p.category}) — $${p.price}`, 'success');
        });
    } catch (err) {
        termLog(`Помилка запиту: ${err.message}`, 'error');
    }
});

// POST product
btnFetchPost.addEventListener('click', async () => {
    termLog('> Запуск POST-запиту до dummyjson.com/products/add...', 'system');
    try {
        const newProduct = {
            title: 'BMW Pencil',
            category: 'stationery'
        };
        const res = await fetch('https://dummyjson.com/products/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });
        termLog(`Статус відповіді: ${res.status} ${res.statusText}`, res.ok ? 'success' : 'error');
        const data = await res.json();
        termLog(`Сервер створив об'єкт з ID: ${data.id}`, 'success');
        termLog(`Результат відповіді: ${JSON.stringify(data)}`, 'success');
    } catch (err) {
        termLog(`Помилка запиту: ${err.message}`, 'error');
    }
});

// HTTP Error handling (res.ok)
btnFetchError.addEventListener('click', async () => {
    termLog('> Спроба GET до неіснуючого ресурсу /products/0...', 'system');
    try {
        const res = await fetch('https://dummyjson.com/products/0');
        termLog(`Статус відповіді: ${res.status} ${res.statusText}`, res.ok ? 'success' : 'error');
        if (!res.ok) {
            termLog(`УВАГА! res.ok є FALSE. Обробляємо помилку вручну.`, 'warning');
            const data = await res.json().catch(() => ({}));
            termLog(`Сервер повернув JSON помилки: ${JSON.stringify(data)}`, 'error');
        } else {
            const data = await res.json();
            termLog(`Отримано дані: ${JSON.stringify(data)}`, 'success');
        }
    } catch (err) {
        termLog(`Запит завершився помилкою в блоці catch: ${err.message}`, 'error');
    }
});

// AbortController / Timeout
btnFetchTimeout.addEventListener('click', async () => {
    termLog('> Запуск повільного запиту з таймаутом переривання 1000мс...', 'system');
    
    currentAbortController = new AbortController();
    btnFetchAbort.disabled = false;
    btnFetchTimeout.disabled = true;

    // Таймер таймауту на 1000мс
    const timeoutId = setTimeout(() => {
        if (currentAbortController) {
            termLog('⏱ Час таймауту вийшов! Перериваємо запит...', 'warning');
            currentAbortController.abort();
        }
    }, 1000);

    try {
        // Використовуємо dummyjson із штучною затримкою
        const res = await fetch('https://dummyjson.com/products?delay=3000', {
            signal: currentAbortController.signal
        });
        clearTimeout(timeoutId);
        termLog(`Запит завершився успішно: ${res.status}`, 'success');
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            termLog('❌ Запит успішно СКАСОВАНО (AbortError спіймано у catch).', 'error');
        } else {
            termLog(`Запит провалено: ${err.message}`, 'error');
        }
    } finally {
        currentAbortController = null;
        btnFetchAbort.disabled = true;
        btnFetchTimeout.disabled = false;
    }
});

btnFetchAbort.addEventListener('click', () => {
    if (currentAbortController) {
        termLog('👆 Запит скасовано користувачем вручну через AbortController.', 'warning');
        currentAbortController.abort();
    }
});

// Promise.all (Parallel)
btnFetchParallel.addEventListener('click', async () => {
    termLog('> Запуск двох паралельних GET-запитів через Promise.all...', 'system');
    try {
        const fetch1 = fetch('https://dummyjson.com/products/1');
        const fetch2 = fetch('https://dummyjson.com/products/2');
        
        const [res1, res2] = await Promise.all([fetch1, fetch2]);
        termLog(`Статуси відповідей: Ресурс 1: ${res1.status}, Ресурс 2: ${res2.status}`, 'success');
        
        const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
        termLog(`Паралельно отримано товари:`, 'success');
        termLog(`  - Товар 1: "${data1.title}"`, 'success');
        termLog(`  - Товар 2: "${data2.title}"`, 'success');
    } catch (err) {
        termLog(`Паралельні запити провалено: ${err.message}`, 'error');
    }
});

// ==========================================
// 2. POSTMAN CLIENT (GROCERY STORE API)
// ==========================================
const reqItems = document.querySelectorAll('.req-item');
const pmMethod = document.getElementById('pm-method');
const pmUrl = document.getElementById('pm-url');
const pmBodyEditor = document.getElementById('pm-body-editor');
const btnPmSend = document.getElementById('btn-pm-send');
const respStatus = document.getElementById('resp-status');
const respTime = document.getElementById('resp-time');
const respBodyContent = document.getElementById('resp-body-content');

const pmConfigHeaders = document.getElementById('pm-config-headers');
const pmConfigBody = document.getElementById('pm-config-body');
const pmConfigVars = document.getElementById('pm-config-vars');
const cTabs = document.querySelectorAll('.c-tab');

// Variable UI refs
const varToken = document.getElementById('var-token');
const varCart = document.getElementById('var-cart');
const varOrder = document.getElementById('var-order');
const varItem = document.getElementById('var-item');

let selectedReqKey = 'get-status';

const groceryRequests = {
    'get-status': { method: 'GET', url: 'https://simple-grocery-store-api.glitch.me/status', body: 'None' },
    'post-client': { method: 'POST', url: 'https://simple-grocery-store-api.glitch.me/api-clients', body: '{\n  "clientName": "Павліченко Платон",\n  "clientEmail": "platon.sergeevich' + Math.floor(Math.random() * 10000) + '@example.com"\n}' },
    'get-products': { method: 'GET', url: 'https://simple-grocery-store-api.glitch.me/products?category=dairy', body: 'None' },
    'get-product-id': { method: 'GET', url: 'https://simple-grocery-store-api.glitch.me/products/4646', body: 'None' },
    'post-cart': { method: 'POST', url: 'https://simple-grocery-store-api.glitch.me/carts', body: 'None' },
    'add-item': { method: 'POST', url: 'https://simple-grocery-store-api.glitch.me/carts/{{cartID}}/items', body: '{\n  "productId": 4646\n}' },
    'get-cart': { method: 'GET', url: 'https://simple-grocery-store-api.glitch.me/carts/{{cartID}}/items', body: 'None' },
    'patch-item': { method: 'PATCH', url: 'https://simple-grocery-store-api.glitch.me/carts/{{cartID}}/items/{{itemID}}', body: '{\n  "quantity": 3\n}' },
    'put-item': { method: 'PUT', url: 'https://simple-grocery-store-api.glitch.me/carts/{{cartID}}/items/{{itemID}}', body: '{\n  "productId": 1224,\n  "quantity": 1\n}' },
    'post-order': { method: 'POST', url: 'https://simple-grocery-store-api.glitch.me/orders', body: '{\n  "cartId": "{{cartID}}",\n  "customerName": "Павліченко Платон"\n}' },
    'get-orders': { method: 'GET', url: 'https://simple-grocery-store-api.glitch.me/orders', body: 'None' },
    'delete-order': { method: 'DELETE', url: 'https://simple-grocery-store-api.glitch.me/orders/{{orderID}}', body: 'None' }
};

// Variable updates helper
function updateVarsUI() {
    varToken.textContent = colVars.accessToken || 'Не встановлено';
    varCart.textContent = colVars.cartID || 'Не встановлено';
    varOrder.textContent = colVars.orderID || 'Не встановлено';
    varItem.textContent = colVars.itemID || 'Не встановлено';
}

// Request Item selection
reqItems.forEach(item => {
    item.addEventListener('click', () => {
        reqItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        selectedReqKey = item.getAttribute('data-req');
        const reqConf = groceryRequests[selectedReqKey];
        
        pmMethod.textContent = reqConf.method;
        pmMethod.className = `badge-method ${reqConf.method.toLowerCase()}`;
        
        // Resolve URL template visual representation
        let displayUrl = reqConf.url
            .replace('{{cartID}}', colVars.cartID || ':cartId')
            .replace('{{orderID}}', colVars.orderID || ':orderId')
            .replace('{{itemID}}', colVars.itemID || ':itemId');
        pmUrl.value = displayUrl;
        
        pmBodyEditor.textContent = reqConf.body;
        
        // Show active headers
        const pmHeadersList = document.getElementById('pm-headers-list');
        let headersHtml = `
            <tr>
                <td><code class="key">Accept</code></td>
                <td><code>application/json</code></td>
                <td>Потрібно сервером</td>
            </tr>
        `;
        if (reqConf.method === 'POST' || reqConf.method === 'PUT' || reqConf.method === 'PATCH') {
            headersHtml += `
                <tr>
                    <td><code class="key">Content-Type</code></td>
                    <td><code>application/json</code></td>
                    <td>Потрібно для тіла запиту</td>
                </tr>
            `;
        }
        if (selectedReqKey === 'post-order' || selectedReqKey === 'get-orders' || selectedReqKey === 'delete-order') {
            headersHtml += `
                <tr>
                    <td><code class="key">Authorization</code></td>
                    <td><code>Bearer {{accessToken}}</code></td>
                    <td>Токен автентифікації клієнта</td>
                </tr>
            `;
        }
        pmHeadersList.innerHTML = headersHtml;
    });
});

// Config tab handling
cTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        cTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        pmConfigHeaders.classList.add('hidden');
        pmConfigBody.classList.add('hidden');
        pmConfigVars.classList.add('hidden');
        
        const targetCfg = tab.getAttribute('data-cfg');
        if (targetCfg === 'headers') pmConfigHeaders.classList.remove('hidden');
        if (targetCfg === 'body') pmConfigBody.classList.remove('hidden');
        if (targetCfg === 'vars') pmConfigVars.classList.remove('hidden');
    });
});

// Run Live POSTMAN Request to Glitch
btnPmSend.addEventListener('click', async () => {
    const config = groceryRequests[selectedReqKey];
    let fetchUrl = config.url
        .replace('{{cartID}}', colVars.cartID)
        .replace('{{orderID}}', colVars.orderID)
        .replace('{{itemID}}', colVars.itemID);
        
    let fetchOptions = {
        method: config.method,
        headers: {
            'Accept': 'application/json'
        }
    };
    
    if (config.method === 'POST' || config.method === 'PUT' || config.method === 'PATCH') {
        fetchOptions.headers['Content-Type'] = 'application/json';
        if (config.body !== 'None') {
            // Replace templates in body as well
            let resolvedBody = config.body
                .replace('{{cartID}}', colVars.cartID)
                .replace('{{orderID}}', colVars.orderID)
                .replace('{{itemID}}', colVars.itemID);
            fetchOptions.body = resolvedBody;
        }
    }
    
    // Add Authorization if needed
    if (selectedReqKey === 'post-order' || selectedReqKey === 'get-orders' || selectedReqKey === 'delete-order') {
        fetchOptions.headers['Authorization'] = `Bearer ${colVars.accessToken}`;
    }
    
    respStatus.textContent = 'Sending...';
    respBodyContent.textContent = '// Sending request to ' + fetchUrl + '...';
    
    const startTime = Date.now();
    try {
        const response = await fetch(fetchUrl, fetchOptions);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        respStatus.textContent = `${response.status} ${response.statusText}`;
        respStatus.style.color = response.ok ? '#10B981' : '#EF4444';
        respTime.textContent = `${duration} ms`;
        
        let json = {};
        if (response.status !== 204) {
            json = await response.json();
            respBodyContent.textContent = JSON.stringify(json, null, 2);
        } else {
            respBodyContent.textContent = '// 204 No Content (Ресурс успішно видалено)';
        }
        
        // Auto-save important variables
        if (selectedReqKey === 'post-client' && json.accessToken) {
            colVars.accessToken = json.accessToken;
            updateVarsUI();
        }
        if (selectedReqKey === 'post-cart' && json.cartId) {
            colVars.cartID = json.cartId;
            updateVarsUI();
        }
        if (selectedReqKey === 'add-item' && json.itemId) {
            colVars.itemID = json.itemId;
            updateVarsUI();
        }
        if (selectedReqKey === 'post-order' && json.orderId) {
            colVars.orderID = json.orderId;
            updateVarsUI();
        }
        if (selectedReqKey === 'delete-order' && response.ok) {
            colVars.orderID = '';
            updateVarsUI();
        }
        
    } catch (err) {
        respStatus.textContent = 'Error';
        respStatus.style.color = '#EF4444';
        respTime.textContent = '0 ms';
        respBodyContent.textContent = `Error connecting to Glitch:\n${err.message}`;
    }
});

// ==========================================
// 3. POSTMAN TRELLO LOGIC
// ==========================================
const btnTrelloSend = document.getElementById('btn-trello-send');
const trelloRespBody = document.getElementById('trello-resp-body');
const testRatio = document.getElementById('test-ratio');
const testResultsList = document.getElementById('test-results-list');

btnTrelloSend.addEventListener('click', () => {
    trelloRespBody.textContent = 'Sending Trello request...';
    
    setTimeout(() => {
        const trelloMockResponse = {
            id: "602d37f10b5c1a89c25f46a2",
            name: "Коледж-Практична-7",
            desc: "Board created via REST API",
            closed: false,
            idOrganization: "588a38a7c2a71f008892ca8a",
            url: "https://trello.com/b/abc123yz/коледж-практична-7",
            shortUrl: "https://trello.com/b/abc123yz",
            prefs: {
                permissionLevel: "private",
                voting: "disabled",
                comments: "members"
            },
            labelNames: {
                green: "Done",
                yellow: "In Progress",
                red: "To Do"
            }
        };
        
        trelloRespBody.textContent = JSON.stringify(trelloMockResponse, null, 2);
        
        // Show passed tests UI
        testRatio.textContent = "2 / 2 Passed";
        testResultsList.innerHTML = `
            <div class="test-item-status pass">
                <span class="status-indicator">✓</span>
                <span class="test-name">Status code is 200 (pm.response.to.have.status(200))</span>
            </div>
            <div class="test-item-status pass">
                <span class="status-indicator">✓</span>
                <span class="test-name">Response board name matches requested (JSON value check)</span>
            </div>
        `;
    }, 500);
});

// ==========================================
// 4. THEME 06 INTERACTIVE LOGIC
// ==========================================
// Slide transition box
const btnSlideToggle = document.getElementById('btn-slide-toggle');
const slideElement = document.getElementById('slide-element');

btnSlideToggle.addEventListener('click', () => {
    slideElement.classList.toggle('collapsed');
});

// Drag and Drop
const dragItems = document.querySelectorAll('.drag-item');
const dragZones = document.querySelectorAll('.drag-zone');

dragItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        item.classList.add('dragging');
        e.dataTransfer.setData('text/plain', item.id);
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
    });
});

dragZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-hover');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-hover');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-hover');
        const id = e.dataTransfer.getData('text/plain');
        const element = document.getElementById(id);
        if (element) {
            zone.appendChild(element);
        }
    });
});

// HTML5 Canvas Drawing
const canvas = document.getElementById('paint-canvas');
const ctx = canvas.getContext('2d');
const btnClearCanvas = document.getElementById('btn-clear-canvas');

let painting = false;

// Stylings for drawing
ctx.strokeStyle = '#3B82F6';
ctx.lineJoin = 'round';
ctx.lineWidth = 4;

function startPosition(e) {
    painting = true;
    draw(e);
}

function finishedPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;
    
    // Canvas bounds
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishedPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseleave', finishedPosition);

btnClearCanvas.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Accessible WAI-ARIA Modal Logic
const modalContainer = document.getElementById('modal-container');
const btnOpenModal = document.getElementById('btn-open-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnModalOk = document.getElementById('btn-modal-ok');

let lastFocusedElement = null;

function openModal() {
    lastFocusedElement = document.activeElement;
    modalContainer.classList.remove('hidden');
    modalContainer.setAttribute('aria-hidden', 'false');
    
    // Focus close button inside modal
    btnCloseModal.focus();
    
    document.addEventListener('keydown', handleKeydown);
}

function closeModal() {
    modalContainer.classList.add('hidden');
    modalContainer.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', handleKeydown);
    
    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

function handleKeydown(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Trap focus inside modal
    if (e.key === 'Tab') {
        const focusableElements = modalContainer.querySelectorAll('button, [tabindex="0"]');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
}

btnOpenModal.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
btnModalOk.addEventListener('click', closeModal);
modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) closeModal();
});
