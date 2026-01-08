// ==========================================================================
// PANDA AI Phone Number Generator
// ==========================================================================

// Global Variables
let generatedNumbersToday = new Set();
let userSessionId = null;
let totalGeneratedCount = 0;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Remove loading screen
    setTimeout(() => {
        document.querySelector('.loading-screen').style.opacity = '0';
        document.querySelector('.loading-screen').style.visibility = 'hidden';
    }, 1500);
    
    // Generate unique session ID for this user
    userSessionId = generateSessionId();
    
    // Load previously generated numbers
    loadGeneratedNumbers();
    
    // Initialize UI components
    initializeUI();
    
    // Initialize theme
    initializeTheme();
    
    // Update statistics
    updateStats();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification(`Welcome to PANDA AI! Session: ${userSessionId.slice(-8)}`, 'success');
    }, 2000);
    
    // Start periodic updates
    startPeriodicUpdates();
});

// Generate Session ID
function generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `panda_${timestamp}_${random}`;
}

// Load Generated Numbers from localStorage
function loadGeneratedNumbers() {
    try {
        const saved = localStorage.getItem('pandaAI_generatedNumbers');
        const date = localStorage.getItem('pandaAI_generationDate');
        const today = new Date().toDateString();
        
        if (saved && date === today) {
            const numbers = JSON.parse(saved);
            numbers.forEach(num => generatedNumbersToday.add(num));
            totalGeneratedCount = numbers.length;
        } else {
            // Clear old data if it's from a different day
            localStorage.removeItem('pandaAI_generatedNumbers');
            localStorage.removeItem('pandaAI_generationDate');
        }
    } catch (error) {
        console.error('Error loading generated numbers:', error);
        generatedNumbersToday.clear();
    }
}

// Save Generated Numbers to localStorage
function saveGeneratedNumbers() {
    try {
        localStorage.setItem('pandaAI_generatedNumbers', JSON.stringify(Array.from(generatedNumbersToday)));
        localStorage.setItem('pandaAI_generationDate', new Date().toDateString());
    } catch (error) {
        console.error('Error saving generated numbers:', error);
    }
}

// Initialize UI Components
function initializeUI() {
    // Quantity slider
    const quantityRange = document.getElementById('quantityRange');
    const quantityValue = document.getElementById('quantityValue');
    
    quantityRange.addEventListener('input', function() {
        quantityValue.textContent = this.value;
    });
    
    // Format options
    const formatOptions = document.querySelectorAll('.format-option input');
    formatOptions.forEach(option => {
        option.addEventListener('change', function() {
            formatOptions.forEach(opt => {
                opt.parentElement.classList.remove('active');
            });
            this.parentElement.classList.add('active');
        });
    });
    
    // Generate button
    document.getElementById('generateBtn').addEventListener('click', generatePhoneNumbers);
    
    // Copy all button
    document.getElementById('copyBtn').addEventListener('click', copyAllPhoneNumbers);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetForm);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Area code input - allow only numbers
    document.getElementById('areaCode').addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 3) {
            this.value = this.value.slice(0, 3);
        }
    });
    
    // Auto-generate on page load
    setTimeout(() => {
        const emptyState = document.querySelector('.empty-state');
        if (emptyState && emptyState.parentElement === document.getElementById('resultsContainer')) {
            generatePhoneNumbers();
        }
    }, 1000);
}

// Initialize Theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('pandaAI_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Toggle Theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pandaAI_theme', newTheme);
    updateThemeIcon(newTheme);
    
    showNotification(`Switched to ${newTheme} theme`, 'info');
}

// Update Theme Icon
function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Phone Number Generation Functions
function getRandomDigit() {
    return Math.floor(Math.random() * 10);
}

function getRandomAreaCode() {
    const areaCodes = [
        '201', '202', '203', '205', '206', '207', '208', '209',
        '210', '212', '213', '214', '215', '216', '217', '218',
        '219', '224', '225', '228', '229', '231', '234', '239',
        '240', '248', '251', '252', '253', '254', '256', '260',
        '262', '267', '269', '270', '272', '276', '281', '301',
        '302', '303', '304', '305', '307', '308', '309', '310',
        '312', '313', '314', '315', '316', '317', '318', '319',
        '320', '321', '323', '325', '330', '331', '332', '334',
        '336', '337', '339', '346', '347', '351', '352', '360',
        '361', '385', '386', '401', '402', '404', '405', '406',
        '407', '408', '409', '410', '412', '413', '414', '415',
        '417', '419', '423', '424', '425', '430', '432', '434',
        '435', '440', '442', '443', '445', '447', '458', '463',
        '469', '470', '475', '478', '479', '480', '484', '501',
        '502', '503', '504', '505', '507', '508', '509', '510',
        '512', '513', '515', '516', '517', '518', '520', '530',
        '531', '534', '539', '540', '541', '551', '559', '561',
        '562', '563', '570', '571', '573', '574', '575', '580',
        '585', '586', '601', '602', '603', '605', '606', '607',
        '608', '609', '610', '612', '614', '615', '616', '617',
        '618', '619', '620', '623', '626', '628', '629', '630',
        '631', '636', '641', '646', '650', '651', '657', '660',
        '661', '662', '667', '669', '678', '680', '681', '682',
        '701', '702', '703', '704', '706', '707', '708', '712',
        '713', '714', '715', '716', '717', '718', '719', '720',
        '724', '725', '727', '730', '731', '732', '734', '737',
        '740', '743', '747', '754', '757', '760', '762', '763',
        '765', '769', '770', '772', '773', '774', '775', '779',
        '781', '785', '786', '801', '802', '803', '804', '805',
        '806', '808', '810', '812', '813', '814', '815', '816',
        '817', '818', '828', '830', '831', '832', '843', '845',
        '847', '848', '850', '856', '857', '858', '859', '860',
        '862', '863', '864', '865', '870', '872', '878', '901',
        '903', '904', '906', '907', '908', '909', '910', '912',
        '913', '914', '915', '916', '917', '918', '919', '920',
        '925', '928', '929', '930', '931', '934', '936', '937',
        '938', '940', '941', '947', '949', '951', '952', '954',
        '956', '970', '971', '972', '973', '978', '979', '980',
        '984', '985', '989'
    ];
    return areaCodes[Math.floor(Math.random() * areaCodes.length)];
}

function getRandomExchangeCode() {
    let firstDigit;
    do {
        firstDigit = getRandomDigit();
    } while (firstDigit < 2);
    
    return `${firstDigit}${getRandomDigit()}${getRandomDigit()}`;
}

function getRandomLineNumber() {
    return `${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}`;
}

function formatPhoneNumber(areaCode, exchangeCode, lineNumber, format) {
    switch(format) {
        case 'standard': return `(${areaCode}) ${exchangeCode}-${lineNumber}`;
        case 'dashes': return `${areaCode}-${exchangeCode}-${lineNumber}`;
        case 'spaces': return `${areaCode} ${exchangeCode} ${lineNumber}`;
        case 'plain': return `${areaCode}${exchangeCode}${lineNumber}`;
        default: return `(${areaCode}) ${exchangeCode}-${lineNumber}`;
    }
}

function validateAreaCode(code) {
    if (!code) return true;
    const areaCodeRegex = /^[2-9][0-9]{2}$/;
    return areaCodeRegex.test(code);
}

// Generate Unique Phone Number
function generateUniquePhoneNumber(areaCode, format) {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
        const usedAreaCode = areaCode || getRandomAreaCode();
        const exchangeCode = getRandomExchangeCode();
        const lineNumber = getRandomLineNumber();
        const formattedNumber = formatPhoneNumber(usedAreaCode, exchangeCode, lineNumber, format);
        
        // Check if this number has been generated today
        if (!generatedNumbersToday.has(formattedNumber)) {
            generatedNumbersToday.add(formattedNumber);
            totalGeneratedCount++;
            return {
                number: formattedNumber,
                areaCode: usedAreaCode,
                exchangeCode: exchangeCode,
                lineNumber: lineNumber
            };
        }
        
        attempts++;
    }
    
    // If we can't find a unique number, generate with timestamp
    const usedAreaCode = areaCode || getRandomAreaCode();
    const exchangeCode = getRandomExchangeCode();
    const timestamp = Date.now().toString().slice(-4);
    const uniqueNumber = formatPhoneNumber(usedAreaCode, exchangeCode, timestamp, format);
    generatedNumbersToday.add(uniqueNumber);
    totalGeneratedCount++;
    
    return {
        number: uniqueNumber,
        areaCode: usedAreaCode,
        exchangeCode: exchangeCode,
        lineNumber: timestamp
    };
}

// Generate Phone Numbers
function generatePhoneNumbers() {
    const quantity = parseInt(document.getElementById('quantityRange').value);
    const areaCode = document.getElementById('areaCode').value.trim();
    const format = document.querySelector('input[name="format"]:checked').value;
    
    // Validation
    if (quantity < 1 || quantity > 50) {
        showNotification('Please select between 1 and 50 numbers', 'error');
        return;
    }
    
    if (areaCode && !validateAreaCode(areaCode)) {
        showNotification('Invalid area code. Must be 3 digits, not starting with 0 or 1.', 'error');
        document.getElementById('areaCode').focus();
        return;
    }
    
    // Clear results container
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';
    
    // Generate numbers
    const numbers = [];
    const startTime = performance.now();
    
    for (let i = 0; i < quantity; i++) {
        const phoneData = generateUniquePhoneNumber(areaCode, format);
        numbers.push(phoneData);
        
        // Create number item
        const numberItem = document.createElement('div');
        numberItem.className = 'number-item';
        numberItem.innerHTML = `
            <div>
                <div class="number-text">${phoneData.number}</div>
                <div class="number-meta">
                    <i class="fas fa-hashtag"></i> ${i + 1} • 
                    <i class="fas fa-code"></i> ${phoneData.areaCode} • 
                    <i class="fas fa-user-secret"></i> ${userSessionId.slice(-6)}
                </div>
            </div>
            <button class="copy-btn" data-number="${phoneData.number}">
                <i class="far fa-copy"></i> Copy
            </button>
        `;
        
        resultsContainer.appendChild(numberItem);
        
        // Add animation delay for staggered effect
        numberItem.style.animationDelay = `${i * 0.1}s`;
    }
    
    const endTime = performance.now();
    const generationTime = ((endTime - startTime) / 1000).toFixed(3);
    
    // Update count
    document.getElementById('count').textContent = numbers.length;
    
    // Add event listeners to copy buttons
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const number = this.getAttribute('data-number');
            copyToClipboard(number);
            showNotification(`Copied: ${number}`, 'success');
        });
    });
    
    // Save to localStorage and update stats
    saveGeneratedNumbers();
    updateStats();
    
    // Update generation speed
    document.getElementById('generationSpeed').textContent = `${generationTime}s`;
    
    // Show success notification
    showNotification(`Generated ${quantity} unique phone numbers in ${generationTime}s`, 'success');
}

// Copy All Phone Numbers
function copyAllPhoneNumbers() {
    const numberElements = document.querySelectorAll('.number-text');
    if (numberElements.length === 0) {
        showNotification('No phone numbers to copy', 'error');
        return;
    }
    
    const phoneNumbers = Array.from(numberElements).map(el => el.textContent);
    const textToCopy = phoneNumbers.join('\n');
    
    copyToClipboard(textToCopy);
    showNotification(`Copied ${phoneNumbers.length} phone numbers to clipboard`, 'success');
}

// Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
}

// Reset Form
function resetForm() {
    // Reset quantity
    document.getElementById('quantityRange').value = 10;
    document.getElementById('quantityValue').textContent = '10';
    
    // Reset area code
    document.getElementById('areaCode').value = '';
    
    // Reset format
    document.querySelector('input[value="standard"]').checked = true;
    document.querySelectorAll('.format-option').forEach(opt => {
        opt.classList.remove('active');
    });
    document.querySelector('input[value="standard"]').parentElement.classList.add('active');
    
    // Clear results
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="fas fa-phone"></i>
            </div>
            <h4>No Numbers Generated Yet</h4>
            <p>Adjust the settings and click "Generate Numbers" to create unique phone numbers.</p>
        </div>
    `;
    
    document.getElementById('count').textContent = '0';
    
    showNotification('Form has been reset', 'info');
}

// Update Statistics
function updateStats() {
    // Update total generated
    document.getElementById('totalGenerated').textContent = 
        formatNumber(5234789 + totalGeneratedCount);
    
    // Update unique today
    document.getElementById('uniqueToday').textContent = 
        formatNumber(generatedNumbersToday.size);
    
    // Update today's users (simulated)
    const todayUsers = Math.floor(Math.random() * 50) + 1240;
    document.getElementById('todayUsers').textContent = formatNumber(todayUsers);
    
    // Update active now (simulated)
    const activeNow = Math.floor(Math.random() * 30) + 135;
    document.getElementById('activeNow').textContent = formatNumber(activeNow);
}

// Format Number with Commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    const notificationIcon = document.querySelector('.notification-icon');
    
    // Set message
    notificationText.textContent = message;
    
    // Set type-based styling
    notification.style.borderLeftColor = getNotificationColor(type);
    notificationIcon.style.background = getNotificationGradient(type);
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Get Notification Color by Type
function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        case 'info':
        default: return '#6366f1';
    }
}

// Get Notification Gradient by Type
function getNotificationGradient(type) {
    switch(type) {
        case 'success': return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
        case 'error': return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
        case 'warning': return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
        case 'info':
        default: return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
    }
}

// Start Periodic Updates
function startPeriodicUpdates() {
    // Update stats every 30 seconds
    setInterval(updateStats, 30000);
    
    // Rotate active users every 10 seconds
    setInterval(() => {
        const activeNow = parseInt(document.getElementById('activeNow').textContent.replace(/,/g, ''));
        const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
        const newActive = Math.max(100, activeNow + change);
        document.getElementById('activeNow').textContent = formatNumber(newActive);
    }, 10000);
}

// Add some sample numbers for demonstration
function addSampleNumber() {
    const sampleNumbers = [
        '(212) 555-1234',
        '(310) 987-6543',
        '(415) 234-5678',
        '(305) 876-5432',
        '(312) 345-6789'
    ];
    
    sampleNumbers.forEach((num, index) => {
        setTimeout(() => {
            if (!generatedNumbersToday.has(num)) {
                generatedNumbersToday.add(num);
                totalGeneratedCount++;
            }
        }, index * 100);
    });
}

// Call sample numbers function on load
setTimeout(addSampleNumber, 500);