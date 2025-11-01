// ===== State Management =====
let colors = ['#1B3CFF', '#3BA6FF', '#8B5CF6'];
let gradientType = 'linear';
let gradientAngle = 90;

// Panel state
let panelState = {
    isDetached: false,
    isMinimized: false,
    position: { x: 20, y: 20 },
    size: { width: 380, height: null }
};

// ===== Preset Palettes =====
const presets = {
    current: {
        name: 'Current Brand',
        colors: ['#1B3CFF', '#3BA6FF', '#8B5CF6']
    },
    recommended: {
        name: 'Recommended',
        colors: ['#1B3A6B', '#FF7A59', '#6B5DD3']
    },
    warm: {
        name: 'Warm Palette',
        colors: ['#FF6B6B', '#FFA07A', '#FFD700']
    },
    cool: {
        name: 'Cool Palette',
        colors: ['#4A90E2', '#50C9CE', '#6C5CE7']
    },
    monochrome: {
        name: 'Monochrome',
        colors: ['#1a1a1a', '#6c757d', '#dee2e6']
    }
};

// ===== Profiles Management =====
let profiles = {};

// Load profiles from localStorage
function loadProfiles() {
    const saved = localStorage.getItem('gradient-tester-profiles');
    if (saved) {
        try {
            profiles = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load profiles:', e);
            profiles = {};
        }
    }
}

// Save profiles to localStorage
function saveProfiles() {
    localStorage.setItem('gradient-tester-profiles', JSON.stringify(profiles));
}

// ===== DOM Elements =====
const colorList = document.getElementById('colorList');
const addColorBtn = document.getElementById('addColorBtn');
const gradientTypeSelect = document.getElementById('gradientType');
const gradientAngleInput = document.getElementById('gradientAngle');
const angleValueSpan = document.getElementById('angleValue');
const angleControl = document.getElementById('angleControl');
const cssOutput = document.getElementById('cssOutput');
const copyCssBtn = document.getElementById('copyCssBtn');
const copyHexBtn = document.getElementById('copyHexBtn');
const presetButtons = document.querySelectorAll('.preset-btn');
const viewButtons = document.querySelectorAll('.view-btn');
const componentsView = document.getElementById('componentsView');
const fullpageView = document.getElementById('fullpageView');
const profileNameInput = document.getElementById('profileName');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const profileList = document.getElementById('profileList');

// Panel elements
const controlPanel = document.getElementById('controlPanel');
const toggleDetachBtn = document.getElementById('toggleDetachBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const container = document.querySelector('.container');

// ===== Initialization =====
function init() {
    loadProfiles();
    loadPanelState();
    renderColorInputs();
    renderProfileList();
    updateGradient();
    attachEventListeners();
    setupCollapsibleSections();
}

// ===== Render Color Inputs =====
function renderColorInputs() {
    colorList.innerHTML = '';

    colors.forEach((color, index) => {
        const colorItem = document.createElement('div');
        colorItem.className = 'color-item';

        colorItem.innerHTML = `
            <div class="color-picker-wrapper">
                <input
                    type="color"
                    class="color-picker"
                    value="${color}"
                    data-index="${index}"
                >
            </div>
            <input
                type="text"
                class="color-input"
                value="${color}"
                data-index="${index}"
                maxlength="7"
                pattern="^#[0-9A-Fa-f]{6}$"
            >
            ${colors.length > 1 ? `
                <button class="btn-icon remove" data-index="${index}" title="Remove color">
                    ×
                </button>
            ` : ''}
        `;

        colorList.appendChild(colorItem);
    });

    // Attach event listeners to new elements
    attachColorInputListeners();
}

// ===== Attach Event Listeners to Color Inputs =====
function attachColorInputListeners() {
    // Color pickers
    const colorPickers = document.querySelectorAll('.color-picker');
    colorPickers.forEach(picker => {
        picker.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            colors[index] = e.target.value.toUpperCase();
            updateTextInput(index);
            updateGradient();
        });
    });

    // Text inputs
    const colorInputs = document.querySelectorAll('.color-input');
    colorInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase();

            // Auto-add # if missing
            if (value.length > 0 && !value.startsWith('#')) {
                value = '#' + value;
                e.target.value = value;
            }

            // Validate and update if valid hex
            if (isValidHex(value)) {
                const index = parseInt(e.target.dataset.index);
                colors[index] = value;
                updateColorPicker(index);
                updateGradient();
                e.target.style.borderColor = '';
            } else {
                e.target.style.borderColor = '#dc3545';
            }
        });

        // Reset border on focus
        input.addEventListener('focus', (e) => {
            e.target.style.borderColor = '';
        });
    });

    // Remove buttons
    const removeButtons = document.querySelectorAll('.btn-icon.remove');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            removeColor(index);
        });
    });
}

// ===== Update Text Input =====
function updateTextInput(index) {
    const textInput = document.querySelector(`.color-input[data-index="${index}"]`);
    if (textInput) {
        textInput.value = colors[index];
    }
}

// ===== Update Color Picker =====
function updateColorPicker(index) {
    const colorPicker = document.querySelector(`.color-picker[data-index="${index}"]`);
    if (colorPicker) {
        colorPicker.value = colors[index];
    }
}

// ===== Add Color =====
function addColor() {
    // Default to last color or a neutral gray
    const newColor = colors.length > 0 ? colors[colors.length - 1] : '#888888';
    colors.push(newColor);
    renderColorInputs();
    updateGradient();
}

// ===== Remove Color =====
function removeColor(index) {
    if (colors.length > 1) {
        colors.splice(index, 1);
        renderColorInputs();
        updateGradient();
    }
}

// ===== Validate Hex Color =====
function isValidHex(hex) {
    return /^#[0-9A-F]{6}$/i.test(hex);
}

// ===== Generate Gradient CSS =====
function generateGradient() {
    if (colors.length === 1) {
        // Single color - no gradient
        return colors[0];
    }

    // Calculate color stops evenly
    const stops = colors.map((color, index) => {
        const percentage = (index / (colors.length - 1)) * 100;
        return `${color} ${percentage}%`;
    }).join(', ');

    switch (gradientType) {
        case 'linear':
            return `linear-gradient(${gradientAngle}deg, ${stops})`;
        case 'radial':
            return `radial-gradient(circle, ${stops})`;
        case 'conic':
            return `conic-gradient(from ${gradientAngle}deg, ${stops})`;
        default:
            return `linear-gradient(${gradientAngle}deg, ${stops})`;
    }
}

// ===== Update Gradient =====
function updateGradient() {
    const gradient = generateGradient();

    // Update CSS variables
    colors.forEach((color, index) => {
        document.documentElement.style.setProperty(`--color-${index + 1}`, color);
    });
    document.documentElement.style.setProperty('--gradient', gradient);

    // Update CSS output
    updateCSSOutput();
}

// ===== Update CSS Output =====
function updateCSSOutput() {
    const gradient = generateGradient();

    let css = ':root {\n';

    // Individual colors
    colors.forEach((color, index) => {
        css += `  --color-${index + 1}: ${color};\n`;
    });

    // Gradient
    css += `\n  /* Gradient */\n`;
    css += `  --gradient: ${gradient};\n`;
    css += '}\n\n';

    // Usage examples
    css += '/* Usage Examples */\n';
    css += '.gradient-background {\n';
    css += '  background: var(--gradient);\n';
    css += '}\n\n';

    css += '.primary-color {\n';
    css += '  color: var(--color-1);\n';
    css += '}';

    cssOutput.value = css;
}

// ===== Copy to Clipboard =====
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

// ===== Show Feedback =====
function showFeedback(button, message) {
    const originalText = button.textContent;
    button.textContent = message;
    button.style.background = '#d4edda';
    button.style.color = '#155724';

    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
        button.style.color = '';
    }, 2000);
}

// ===== Copy CSS =====
async function copyCss() {
    const success = await copyToClipboard(cssOutput.value);
    if (success) {
        showFeedback(copyCssBtn, '✓ Copied!');
    }
}

// ===== Copy Hex Codes =====
async function copyHex() {
    const hexString = colors.join(', ');
    const success = await copyToClipboard(hexString);
    if (success) {
        showFeedback(copyHexBtn, '✓ Copied!');
    }
}

// ===== Load Preset =====
function loadPreset(presetKey) {
    const preset = presets[presetKey];
    if (preset) {
        colors = [...preset.colors];
        renderColorInputs();
        updateGradient();
    }
}

// ===== Update Gradient Type =====
function updateGradientType() {
    gradientType = gradientTypeSelect.value;

    // Show/hide angle control based on type
    if (gradientType === 'radial') {
        angleControl.style.display = 'none';
    } else {
        angleControl.style.display = 'block';
        if (gradientType === 'conic') {
            angleControl.querySelector('label').textContent = `Rotation: ${gradientAngle}°`;
        } else {
            angleControl.querySelector('label').textContent = `Angle: ${gradientAngle}°`;
        }
    }

    updateGradient();
}

// ===== Update Gradient Angle =====
function updateGradientAngle() {
    gradientAngle = parseInt(gradientAngleInput.value);
    angleValueSpan.textContent = gradientAngle;
    updateGradient();
}

// ===== Switch View =====
function switchView(view) {
    // Update button states
    viewButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });

    // Switch views
    if (view === 'components') {
        componentsView.style.display = 'block';
        fullpageView.style.display = 'none';
    } else {
        componentsView.style.display = 'none';
        fullpageView.style.display = 'block';
    }
}

// ===== Profile Management Functions =====

// Render profile list
function renderProfileList() {
    const profileIds = Object.keys(profiles);

    if (profileIds.length === 0) {
        profileList.innerHTML = '<p class="empty-message">No saved profiles yet</p>';
        return;
    }

    profileList.innerHTML = '';

    // Sort by last modified date (newest first)
    profileIds.sort((a, b) => {
        return new Date(profiles[b].timestamp) - new Date(profiles[a].timestamp);
    });

    profileIds.forEach(id => {
        const profile = profiles[id];
        const profileItem = document.createElement('div');
        profileItem.className = 'profile-item';

        // Format date
        const date = new Date(profile.timestamp);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Color dots
        const colorDots = profile.colors.map(color =>
            `<div class="profile-color-dot" style="background: ${color}"></div>`
        ).join('');

        profileItem.innerHTML = `
            <div class="profile-colors">
                ${colorDots}
            </div>
            <div class="profile-info">
                <div class="profile-name" title="${profile.name}">${profile.name}</div>
                <div class="profile-meta">
                    <span>${profile.colors.length} colors</span>
                    <span>•</span>
                    <span>${formattedDate} ${formattedTime}</span>
                </div>
            </div>
            <div class="profile-actions">
                <button class="profile-btn load" data-id="${id}" title="Load this profile">
                    ↻
                </button>
                <button class="profile-btn delete" data-id="${id}" title="Delete this profile">
                    ×
                </button>
            </div>
        `;

        profileList.appendChild(profileItem);
    });

    // Attach event listeners to profile buttons
    attachProfileListeners();
}

// Attach event listeners to profile buttons
function attachProfileListeners() {
    // Load buttons
    const loadButtons = profileList.querySelectorAll('.profile-btn.load');
    loadButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            loadProfile(id);
        });
    });

    // Delete buttons
    const deleteButtons = profileList.querySelectorAll('.profile-btn.delete');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            deleteProfile(id);
        });
    });
}

// Save current state as profile
function saveProfile() {
    const name = profileNameInput.value.trim();

    if (!name) {
        alert('Please enter a profile name');
        profileNameInput.focus();
        return;
    }

    // Create unique ID
    const id = Date.now().toString();

    // Create profile
    const profile = {
        id,
        name,
        colors: [...colors],
        gradientType,
        gradientAngle,
        timestamp: new Date().toISOString()
    };

    // Save to profiles
    profiles[id] = profile;
    saveProfiles();

    // Re-render list
    renderProfileList();

    // Clear input and show feedback
    profileNameInput.value = '';
    showFeedback(saveProfileBtn, '✓ Saved!');

    console.log('Profile saved:', profile);
}

// Load profile
function loadProfile(id) {
    const profile = profiles[id];

    if (!profile) {
        console.error('Profile not found:', id);
        return;
    }

    // Update state
    colors = [...profile.colors];
    gradientType = profile.gradientType;
    gradientAngle = profile.gradientAngle;

    // Update UI
    gradientTypeSelect.value = gradientType;
    gradientAngleInput.value = gradientAngle;
    angleValueSpan.textContent = gradientAngle;

    // Re-render
    renderColorInputs();
    updateGradientType();
    updateGradient();

    console.log('Profile loaded:', profile);
}

// Delete profile
function deleteProfile(id) {
    const profile = profiles[id];

    if (!profile) {
        console.error('Profile not found:', id);
        return;
    }

    // Confirm deletion
    const confirmed = confirm(`Delete profile "${profile.name}"?`);

    if (confirmed) {
        delete profiles[id];
        saveProfiles();
        renderProfileList();
        console.log('Profile deleted:', profile);
    }
}

// ===== Panel Management =====

// Toggle detach/attach
function toggleDetach() {
    panelState.isDetached = !panelState.isDetached;

    if (panelState.isDetached) {
        controlPanel.classList.add('detached');
        container.classList.add('panel-detached');
        minimizeBtn.style.display = 'flex';
        toggleDetachBtn.title = 'Attach panel';

        // Apply saved position
        controlPanel.style.left = panelState.position.x + 'px';
        controlPanel.style.top = panelState.position.y + 'px';

        if (panelState.size.width) {
            controlPanel.style.width = panelState.size.width + 'px';
        }

        setupDragging();
    } else {
        controlPanel.classList.remove('detached');
        container.classList.remove('panel-detached');
        minimizeBtn.style.display = 'none';
        toggleDetachBtn.title = 'Detach panel';

        // Reset styles
        controlPanel.style.left = '';
        controlPanel.style.top = '';
        controlPanel.style.width = '';
        controlPanel.style.height = '';

        removeDragging();
    }

    savePanelState();
}

// Toggle minimize
function toggleMinimize() {
    panelState.isMinimized = !panelState.isMinimized;

    if (panelState.isMinimized) {
        controlPanel.classList.add('minimized');
        minimizeBtn.title = 'Maximize panel';
    } else {
        controlPanel.classList.remove('minimized');
        minimizeBtn.title = 'Minimize panel';
    }

    savePanelState();
}

// Dragging functionality
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

function setupDragging() {
    const panelHeader = controlPanel.querySelector('.panel-header');

    panelHeader.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
}

function removeDragging() {
    const panelHeader = controlPanel.querySelector('.panel-header');

    panelHeader.removeEventListener('mousedown', startDragging);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
}

function startDragging(e) {
    // Don't start dragging if clicking on buttons
    if (e.target.closest('button')) return;

    isDragging = true;
    const rect = controlPanel.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    controlPanel.style.cursor = 'grabbing';
}

function drag(e) {
    if (!isDragging) return;

    e.preventDefault();

    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    // Keep panel within viewport
    const rect = controlPanel.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    controlPanel.style.left = newX + 'px';
    controlPanel.style.top = newY + 'px';

    panelState.position.x = newX;
    panelState.position.y = newY;
}

function stopDragging() {
    if (isDragging) {
        isDragging = false;
        controlPanel.style.cursor = '';
        savePanelState();
    }
}

// Save panel state to localStorage
function savePanelState() {
    localStorage.setItem('gradient-tester-panel-state', JSON.stringify(panelState));
}

// Load panel state from localStorage
function loadPanelState() {
    const saved = localStorage.getItem('gradient-tester-panel-state');
    if (saved) {
        try {
            const savedState = JSON.parse(saved);
            panelState = { ...panelState, ...savedState };

            // Apply saved state
            if (panelState.isDetached) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    toggleDetach();
                    if (panelState.isMinimized) {
                        toggleMinimize();
                    }
                }, 0);
            }
        } catch (e) {
            console.error('Failed to load panel state:', e);
        }
    }
}

// Setup collapsible sections
function setupCollapsibleSections() {
    const sections = document.querySelectorAll('.control-panel section');

    sections.forEach(section => {
        const toggle = section.querySelector('.section-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const isCollapsed = section.classList.contains('section-collapsed');

                if (isCollapsed) {
                    section.classList.remove('section-collapsed');
                    section.classList.add('section-expanded');
                } else {
                    section.classList.remove('section-expanded');
                    section.classList.add('section-collapsed');
                }
            });
        }
    });
}

// ===== Attach Event Listeners =====
function attachEventListeners() {
    // Panel controls
    toggleDetachBtn.addEventListener('click', toggleDetach);
    minimizeBtn.addEventListener('click', toggleMinimize);

    // Add color button
    addColorBtn.addEventListener('click', addColor);

    // Gradient type
    gradientTypeSelect.addEventListener('change', updateGradientType);

    // Gradient angle
    gradientAngleInput.addEventListener('input', updateGradientAngle);

    // Copy buttons
    copyCssBtn.addEventListener('click', copyCss);
    copyHexBtn.addEventListener('click', copyHex);

    // Profile save button
    saveProfileBtn.addEventListener('click', saveProfile);

    // Enter key in profile name input
    profileNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveProfile();
        }
    });

    // Preset buttons
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            loadPreset(preset);
        });
    });

    // View toggle buttons
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to add color
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            addColor();
        }

        // Ctrl/Cmd + C when CSS output is focused
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === cssOutput) {
            copyCss();
        }

        // Ctrl/Cmd + S to save profile (focus on profile name input)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            profileNameInput.focus();
            profileNameInput.select();
        }
    });
}

// ===== Export Current State =====
function exportState() {
    return {
        colors: [...colors],
        gradientType,
        gradientAngle,
        timestamp: new Date().toISOString()
    };
}

// ===== Import State =====
function importState(state) {
    if (state.colors && Array.isArray(state.colors)) {
        colors = state.colors.filter(c => isValidHex(c));
        if (colors.length === 0) {
            colors = ['#888888'];
        }
    }

    if (state.gradientType) {
        gradientType = state.gradientType;
        gradientTypeSelect.value = gradientType;
    }

    if (state.gradientAngle !== undefined) {
        gradientAngle = state.gradientAngle;
        gradientAngleInput.value = gradientAngle;
        angleValueSpan.textContent = gradientAngle;
    }

    renderColorInputs();
    updateGradientType();
    updateGradient();
}

// ===== Save to LocalStorage =====
function saveToLocalStorage() {
    const state = exportState();
    localStorage.setItem('gradient-tester-state', JSON.stringify(state));
}

// ===== Load from LocalStorage =====
function loadFromLocalStorage() {
    const saved = localStorage.getItem('gradient-tester-state');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            importState(state);
        } catch (e) {
            console.error('Failed to load saved state:', e);
        }
    }
}

// ===== Auto-save on changes =====
function setupAutoSave() {
    // Save state whenever colors change
    const observer = new MutationObserver(() => {
        saveToLocalStorage();
    });

    // Simple debounced save
    let saveTimeout;
    window.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveToLocalStorage, 500);
    });
}

// ===== Initialize on Load =====
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    init();
    setupAutoSave();

    console.log('🎨 Gradient Tester loaded!');
    console.log('💡 Tip: Press Ctrl/Cmd + K to quickly add a new color');
});

// ===== Export for debugging =====
window.gradientTester = {
    exportState,
    importState,
    colors: () => colors,
    gradient: () => generateGradient()
};
