// Simple test framework
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    assert(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }

    assertEqual(actual, expected, message = `Expected ${expected}, got ${actual}`) {
        if (actual !== expected) {
            throw new Error(message);
        }
    }

    assertTrue(value, message = `Expected true, got ${value}`) {
        this.assertEqual(value, true, message);
    }

    assertFalse(value, message = `Expected false, got ${value}`) {
        this.assertEqual(value, false, message);
    }

    run() {
        const resultsDiv = document.getElementById('test-results');
        let html = '';

        this.tests.forEach(({ name, testFn }) => {
            try {
                testFn.call(this);
                this.passed++;
                html += `<div class="test-case pass">✓ ${name}</div>`;
            } catch (error) {
                this.failed++;
                html += `<div class="test-case fail">✗ ${name}: ${error.message}</div>`;
            }
        });

        const total = this.passed + this.failed;
        const summaryClass = this.failed === 0 ? 'test-pass' : 'test-fail';
        const summary = `<div class="test-summary ${summaryClass}">
            Tests: ${total} | Passed: ${this.passed} | Failed: ${this.failed}
        </div>`;

        resultsDiv.innerHTML = summary + html;
    }
}

// Create test runner
const runner = new TestRunner();

// Circle class tests
runner.test('Circle constructor sets properties correctly', function() {
    const color = { name: 'Red', rgb: [255, 0, 0] };
    const circle = new Circle(100, 150, color, 75);
    
    this.assertEqual(circle.x, 100);
    this.assertEqual(circle.y, 150);
    this.assertEqual(circle.color, color);
    this.assertEqual(circle.radius, 75);
});

runner.test('Circle constructor uses default radius', function() {
    const color = { name: 'Blue', rgb: [0, 0, 255] };
    const circle = new Circle(50, 60, color);
    
    this.assertEqual(circle.radius, CONFIG.DEFAULT_RADIUS);
});

runner.test('Circle.isValid returns true for valid circles', function() {
    const color = { name: 'Green', rgb: [0, 255, 0] };
    const circle = new Circle(100, 100, color, 50);
    
    this.assertTrue(circle.isValid());
});

runner.test('Circle.isValid returns false for negative coordinates', function() {
    const color = { name: 'Green', rgb: [0, 255, 0] };
    const circle1 = new Circle(-10, 100, color, 50);
    const circle2 = new Circle(100, -10, color, 50);
    
    this.assertFalse(circle1.isValid());
    this.assertFalse(circle2.isValid());
});

runner.test('Circle.isValid returns false for zero or negative radius', function() {
    const color = { name: 'Green', rgb: [0, 255, 0] };
    const circle1 = new Circle(100, 100, color, 0);
    const circle2 = new Circle(100, 100, color, -5);
    
    this.assertFalse(circle1.isValid());
    this.assertFalse(circle2.isValid());
});

runner.test('Circle.containsPoint returns true for points inside circle', function() {
    const color = { name: 'Red', rgb: [255, 0, 0] };
    const circle = new Circle(100, 100, color, 50);
    
    // Point at center
    this.assertTrue(circle.containsPoint(100, 100));
    
    // Point inside but not at center
    this.assertTrue(circle.containsPoint(120, 120));
    
    // Point on edge (radius = 50, distance = 50)
    this.assertTrue(circle.containsPoint(150, 100));
});

runner.test('Circle.containsPoint returns false for points outside circle', function() {
    const color = { name: 'Red', rgb: [255, 0, 0] };
    const circle = new Circle(100, 100, color, 50);
    
    // Point clearly outside
    this.assertFalse(circle.containsPoint(200, 200));
    
    // Point just outside edge
    this.assertFalse(circle.containsPoint(151, 100));
});

runner.test('Circle.containsPoint handles edge cases correctly', function() {
    const color = { name: 'Blue', rgb: [0, 0, 255] };
    const circle = new Circle(0, 0, color, 10);
    
    // Point at origin (circle center)
    this.assertTrue(circle.containsPoint(0, 0));
    
    // Point on edge
    this.assertTrue(circle.containsPoint(10, 0));
    this.assertTrue(circle.containsPoint(0, 10));
});

// Configuration tests
runner.test('CONFIG object has required properties', function() {
    this.assertTrue(typeof CONFIG.DEFAULT_RADIUS === 'number');
    this.assertTrue(typeof CONFIG.CIRCLE_ALPHA === 'number');
    this.assertTrue(Array.isArray(CONFIG.COLORS));
    this.assertTrue(typeof CONFIG.BLEND_MODE === 'string');
    this.assertTrue(typeof CONFIG.NORMAL_BLEND_MODE === 'string');
});

runner.test('CONFIG.COLORS has valid color objects', function() {
    this.assertTrue(CONFIG.COLORS.length > 0);
    
    CONFIG.COLORS.forEach(color => {
        this.assertTrue(typeof color.name === 'string');
        this.assertTrue(Array.isArray(color.rgb));
        this.assertEqual(color.rgb.length, 3);
        
        // Check RGB values are in valid range
        color.rgb.forEach(value => {
            this.assertTrue(value >= 0 && value <= 255);
        });
    });
});

runner.test('CONFIG values are reasonable', function() {
    this.assertTrue(CONFIG.DEFAULT_RADIUS > 0);
    this.assertTrue(CONFIG.CIRCLE_ALPHA > 0 && CONFIG.CIRCLE_ALPHA <= 1);
});

// Mock canvas context for draw method testing
class MockCanvasContext {
    constructor() {
        this.calls = [];
        this.fillStyle = null;
    }
    
    beginPath() { this.calls.push('beginPath'); }
    arc(x, y, radius, start, end) { 
        this.calls.push(['arc', x, y, radius, start, end]); 
    }
    fill() { this.calls.push('fill'); }
}

runner.test('Circle.draw calls correct canvas methods', function() {
    const color = { name: 'Red', rgb: [255, 0, 0] };
    const circle = new Circle(100, 150, color, 75);
    const mockCtx = new MockCanvasContext();
    
    circle.draw(mockCtx);
    
    this.assertEqual(mockCtx.calls.length, 3);
    this.assertEqual(mockCtx.calls[0], 'beginPath');
    this.assertEqual(mockCtx.calls[1][0], 'arc');
    this.assertEqual(mockCtx.calls[1][1], 100); // x
    this.assertEqual(mockCtx.calls[1][2], 150); // y
    this.assertEqual(mockCtx.calls[1][3], 75);  // radius
    this.assertEqual(mockCtx.calls[2], 'fill');
});

runner.test('Circle.draw sets correct fillStyle', function() {
    const color = { name: 'Blue', rgb: [0, 100, 255] };
    const circle = new Circle(50, 50, color, 25);
    const mockCtx = new MockCanvasContext();
    
    circle.draw(mockCtx);
    
    const expectedFillStyle = `rgba(0, 100, 255, ${CONFIG.CIRCLE_ALPHA})`;
    this.assertEqual(mockCtx.fillStyle, expectedFillStyle);
});

// Run all tests when page loads
window.addEventListener('load', () => {
    runner.run();
});