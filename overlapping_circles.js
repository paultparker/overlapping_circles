// Configuration constants
const CONFIG = {
    DEFAULT_RADIUS: 125,
    CIRCLE_ALPHA: 0.3,
    COLORS: [
        { name: 'Forest Green', rgb: [0, 255, 0] },
        { name: 'Royal Blue', rgb: [0, 100, 255] },
        { name: 'Deep Blue-Purple', rgb: [120, 0, 255] }
    ],
    BLEND_MODE: 'screen',
    NORMAL_BLEND_MODE: 'source-over'
};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const currentColorSpan = document.getElementById('current-color');
const currentSizeSpan = document.getElementById('current-size');
const sizeSelect = document.getElementById('size-select');

// Set canvas size to window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Circle properties
let circleRadius = CONFIG.DEFAULT_RADIUS;

let currentColorIndex = 0;
let circles = [];
let darkBackground = true;

// Update current color display
function updateColorDisplay() {
    currentColorSpan.textContent = CONFIG.COLORS[currentColorIndex].name;
}

// Update size when selector changes
function updateSize() {
    circleRadius = parseInt(sizeSelect.value);
    currentSizeSpan.textContent = circleRadius;
}

// Clear canvas
function clearCanvas() {
    circles = [];
    redrawAll();
}

// Undo last circle
function undoLastCircle() {
    if (circles.length > 0) {
        circles.pop();
        // Also need to go back to the previous color
        currentColorIndex = (currentColorIndex - 1 + CONFIG.COLORS.length) % CONFIG.COLORS.length;
        updateColorDisplay();
        redrawAll();
    }
}

// Toggle background color
function toggleBackground() {
    darkBackground = !darkBackground;
    document.body.style.background = darkBackground ? '#000' : '#fff';
    redrawAll();
}

// Redraw all circles
function redrawAll() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set blend mode for additive blending
    ctx.globalCompositeOperation = CONFIG.BLEND_MODE;
    
    // Draw all circles
    circles.forEach(circle => {
        drawCircle(circle.x, circle.y, circle.color, circle.radius);
    });
    
    // Reset blend mode
    ctx.globalCompositeOperation = CONFIG.NORMAL_BLEND_MODE;
}

// Draw a single circle
function drawCircle(x, y, color, radius = circleRadius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]}, ${CONFIG.CIRCLE_ALPHA})`;
    ctx.fill();
}

// Handle canvas clicks
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add circle to array
    circles.push({
        x: x,
        y: y,
        color: CONFIG.COLORS[currentColorIndex],
        radius: circleRadius
    });
    
    // Cycle to next color
    currentColorIndex = (currentColorIndex + 1) % CONFIG.COLORS.length;
    updateColorDisplay();
    
    // Redraw all circles
    redrawAll();
});

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawAll();
});

// Initialize
updateColorDisplay();