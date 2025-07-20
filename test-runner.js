#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class HeadlessTestRunner {
    constructor(options = {}) {
        this.headless = options.headless !== false;
        this.verbose = options.verbose || false;
        this.testFile = path.join(__dirname, 'test.html');
    }

    async run() {
        // Check if test file exists
        if (!fs.existsSync(this.testFile)) {
            console.error('❌ Test file not found: test.html');
            process.exit(1);
        }

        const browser = await puppeteer.launch({ 
            headless: this.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // For CI environments
        });

        try {
            const page = await browser.newPage();
            
            // Enable console logging if verbose
            if (this.verbose) {
                page.on('console', msg => {
                    console.log('Browser console:', msg.text());
                });
            }

            // Handle page errors
            page.on('pageerror', error => {
                console.error('❌ Page error:', error.message);
            });

            // Load the test page
            const testUrl = `file://${this.testFile}`;
            if (this.verbose) {
                console.log(`Loading tests from: ${testUrl}`);
            }

            await page.goto(testUrl, { waitUntil: 'networkidle0' });

            // Wait for tests to complete
            await page.waitForFunction(() => {
                const resultsDiv = document.getElementById('test-results');
                return resultsDiv && resultsDiv.innerHTML.includes('Tests:');
            }, { timeout: 10000 });

            // Extract test results
            const results = await page.evaluate(() => {
                const resultsDiv = document.getElementById('test-results');
                const summaryDiv = resultsDiv.querySelector('.test-summary');
                const testCases = Array.from(resultsDiv.querySelectorAll('.test-case'));

                // Parse summary
                const summaryText = summaryDiv.textContent;
                const totalMatch = summaryText.match(/Tests: (\d+)/);
                const passedMatch = summaryText.match(/Passed: (\d+)/);
                const failedMatch = summaryText.match(/Failed: (\d+)/);

                const total = totalMatch ? parseInt(totalMatch[1]) : 0;
                const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
                const failed = failedMatch ? parseInt(failedMatch[1]) : 0;

                // Get individual test results
                const tests = testCases.map(testCase => ({
                    name: testCase.textContent.replace(/^[✓✗]\s*/, '').replace(/:\s*.+$/, ''),
                    passed: testCase.classList.contains('pass'),
                    message: testCase.textContent
                }));

                return { total, passed, failed, tests, success: failed === 0 };
            });

            // Display results
            this.displayResults(results);

            await browser.close();

            // Exit with appropriate code
            process.exit(results.success ? 0 : 1);

        } catch (error) {
            console.error('❌ Test runner error:', error.message);
            await browser.close();
            process.exit(1);
        }
    }

    displayResults(results) {
        console.log('\n' + '='.repeat(60));
        console.log('🧪 OVERLAPPING CIRCLES - TEST RESULTS');
        console.log('='.repeat(60));

        if (results.success) {
            console.log(`✅ All tests passed! (${results.passed}/${results.total})`);
        } else {
            console.log(`❌ Tests failed! (${results.passed}/${results.total} passed)`);
        }

        console.log('');

        // Show individual test results
        results.tests.forEach(test => {
            const icon = test.passed ? '✅' : '❌';
            console.log(`${icon} ${test.name}`);
            if (!test.passed && this.verbose) {
                console.log(`   ${test.message}`);
            }
        });

        console.log('\n' + '='.repeat(60));
        
        if (results.success) {
            console.log('🎉 Ready to commit!');
        } else {
            console.log('🚫 Fix failing tests before committing.');
        }
        console.log('='.repeat(60) + '\n');
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    headless: !args.includes('--no-headless'),
    verbose: args.includes('--verbose') || args.includes('-v')
};

// Run tests
const runner = new HeadlessTestRunner(options);
runner.run().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});