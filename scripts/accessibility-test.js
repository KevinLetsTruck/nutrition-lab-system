#!/usr/bin/env node

/**
 * Accessibility Testing Script for DestinationHealth
 * Tests color contrast, keyboard navigation, and ARIA compliance
 */

const fs = require('fs');
const path = require('path');

// Color values from the design system
const COLORS = {
  background: { h: 220, s: 26, l: 8 },      // #0F1419
  backgroundSecondary: { h: 220, s: 20, l: 12 }, // #1A1F2E
  foreground: { h: 0, s: 0, l: 98 },        // White text
  foregroundSecondary: { h: 0, s: 0, l: 80 }, // Gray text
  foregroundMuted: { h: 0, s: 0, l: 60 },   // Muted text
  primary: { h: 160, s: 84, l: 39 },        // #10B981
  accent: { h: 217, s: 91, l: 60 },         // #3B82F6
  accentOrange: { h: 25, s: 95, l: 53 },    // #FB923C
};

// Convert HSL to RGB
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return { r: f(0), g: f(8), b: f(4) };
}

// Calculate relative luminance
function getLuminance(rgb) {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;
  
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(hslToRgb(color1.h, color1.s, color1.l));
  const lum2 = getLuminance(hslToRgb(color2.h, color2.s, color2.l));
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Check if contrast meets WCAG standards
function checkWCAG(ratio, isLargeText = false) {
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;
  
  return {
    ratio: ratio.toFixed(2),
    aa: ratio >= aaThreshold,
    aaa: ratio >= aaaThreshold,
    recommendation: ratio >= aaThreshold ? 'PASS' : 'FAIL',
  };
}

// Test color combinations
function testColorContrast() {
  console.log('\n🎨 Color Contrast Testing (WCAG 2.1)\n');
  console.log('=' .repeat(60));
  
  const tests = [
    {
      name: 'Primary text on dark background',
      foreground: COLORS.foreground,
      background: COLORS.background,
      isLargeText: false,
    },
    {
      name: 'Secondary text on dark background',
      foreground: COLORS.foregroundSecondary,
      background: COLORS.background,
      isLargeText: false,
    },
    {
      name: 'Muted text on dark background',
      foreground: COLORS.foregroundMuted,
      background: COLORS.background,
      isLargeText: false,
    },
    {
      name: 'Primary green on dark background',
      foreground: COLORS.primary,
      background: COLORS.background,
      isLargeText: false,
    },
    {
      name: 'Accent blue on dark background',
      foreground: COLORS.accent,
      background: COLORS.background,
      isLargeText: false,
    },
    {
      name: 'White text on primary green',
      foreground: COLORS.foreground,
      background: COLORS.primary,
      isLargeText: false,
    },
    {
      name: 'White text on secondary background',
      foreground: COLORS.foreground,
      background: COLORS.backgroundSecondary,
      isLargeText: false,
    },
  ];
  
  let passCount = 0;
  const results = [];
  
  tests.forEach(test => {
    const ratio = getContrastRatio(test.foreground, test.background);
    const wcag = checkWCAG(ratio, test.isLargeText);
    
    results.push({
      ...test,
      ...wcag,
    });
    
    if (wcag.aa) passCount++;
    
    console.log(`\n${wcag.aa ? '✅' : '❌'} ${test.name}`);
    console.log(`   Contrast ratio: ${wcag.ratio}:1`);
    console.log(`   WCAG AA: ${wcag.aa ? 'PASS' : 'FAIL'} (requires ${test.isLargeText ? '3:1' : '4.5:1'})`);
    console.log(`   WCAG AAA: ${wcag.aaa ? 'PASS' : 'FAIL'} (requires ${test.isLargeText ? '4.5:1' : '7:1'})`);
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log(`Summary: ${passCount}/${tests.length} color combinations pass WCAG AA`);
  
  return results;
}

// Test keyboard navigation requirements
function testKeyboardNavigation() {
  console.log('\n\n⌨️  Keyboard Navigation Requirements\n');
  console.log('=' .repeat(60));
  
  const requirements = [
    {
      component: 'Buttons',
      requirements: [
        'Tab key navigates to button',
        'Enter/Space activates button',
        'Focus ring visible (2px minimum)',
        'Focus trap in modals',
      ],
    },
    {
      component: 'Forms',
      requirements: [
        'Tab navigates between fields',
        'Shift+Tab navigates backwards',
        'Enter submits form (when appropriate)',
        'Escape cancels/closes modals',
        'Arrow keys in select dropdowns',
      ],
    },
    {
      component: 'Navigation',
      requirements: [
        'Tab through all nav items',
        'Enter activates links',
        'Skip link to main content',
        'Logical tab order',
      ],
    },
    {
      component: 'Assessment Flow',
      requirements: [
        'Navigate questions with Tab',
        'Select answers with Space/Enter',
        'Previous/Next with arrow keys (optional)',
        'Progress indicator updates',
      ],
    },
  ];
  
  requirements.forEach(req => {
    console.log(`\n📋 ${req.component}:`);
    req.requirements.forEach(r => {
      console.log(`   ☐ ${r}`);
    });
  });
  
  return requirements;
}

// Test ARIA requirements
function testARIACompliance() {
  console.log('\n\n♿ ARIA & Semantic HTML Requirements\n');
  console.log('=' .repeat(60));
  
  const ariaChecks = [
    {
      category: 'Landmarks',
      checks: [
        'header role="banner"',
        'nav role="navigation"',
        'main role="main"',
        'footer role="contentinfo"',
      ],
    },
    {
      category: 'Headings',
      checks: [
        'One H1 per page',
        'Logical heading hierarchy (H1→H2→H3)',
        'No skipped heading levels',
        'Descriptive heading text',
      ],
    },
    {
      category: 'Forms',
      checks: [
        'All inputs have labels',
        'Required fields marked with aria-required',
        'Error messages with aria-describedby',
        'Form validation announces errors',
        'Progress indicators have aria-valuenow',
      ],
    },
    {
      category: 'Interactive Elements',
      checks: [
        'Buttons have descriptive text',
        'Links have meaningful text (no "click here")',
        'Icons have aria-label or sr-only text',
        'Loading states announced',
        'Success/error messages announced',
      ],
    },
    {
      category: 'Images & Media',
      checks: [
        'All images have alt text',
        'Decorative images have empty alt=""',
        'Complex images have long descriptions',
        'Charts/graphs have text alternatives',
      ],
    },
  ];
  
  ariaChecks.forEach(check => {
    console.log(`\n🏷️  ${check.category}:`);
    check.checks.forEach(c => {
      console.log(`   ☐ ${c}`);
    });
  });
  
  return ariaChecks;
}

// Generate accessibility report
function generateReport(contrastResults) {
  const report = {
    timestamp: new Date().toISOString(),
    colorContrast: {
      results: contrastResults,
      summary: {
        total: contrastResults.length,
        passed: contrastResults.filter(r => r.aa).length,
        failed: contrastResults.filter(r => !r.aa).length,
      },
    },
    recommendations: [
      'Install axe DevTools browser extension for detailed testing',
      'Test with actual screen readers (NVDA, JAWS, VoiceOver)',
      'Validate HTML structure with W3C validator',
      'Run Lighthouse accessibility audit',
      'Test with keyboard-only navigation',
      'Check for focus indicators on all interactive elements',
      'Ensure all forms are properly labeled',
      'Add skip navigation links',
      'Test with browser zoom at 200%',
      'Verify color is not the only indicator of meaning',
    ],
    truckDriverSpecific: [
      'Ensure touch targets are at least 44x44px for gloved hands',
      'Test in bright sunlight conditions (high contrast mode)',
      'Verify one-handed mobile operation',
      'Keep forms short and simple',
      'Use clear, non-technical language',
      'Provide audio alternatives where possible',
    ],
  };
  
  fs.writeFileSync(
    'accessibility-test-results.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n\n📊 Accessibility Report\n');
  console.log('=' .repeat(60));
  console.log('✅ Report saved to: accessibility-test-results.json');
  
  return report;
}

// Run all tests
function runAccessibilityTests() {
  console.log('🔍 DestinationHealth Accessibility Testing\n');
  
  // Run color contrast tests
  const contrastResults = testColorContrast();
  
  // Show keyboard navigation requirements
  testKeyboardNavigation();
  
  // Show ARIA compliance checklist
  testARIACompliance();
  
  // Generate report
  const report = generateReport(contrastResults);
  
  // Final recommendations
  console.log('\n\n🚀 Next Steps:\n');
  console.log('1. Open the app in Chrome/Firefox');
  console.log('2. Install axe DevTools extension');
  console.log('3. Run automated accessibility scan');
  console.log('4. Test keyboard navigation manually');
  console.log('5. Use ChromeVox or NVDA for screen reader testing');
  console.log('6. Run Lighthouse audit (target score: 95+)');
  
  console.log('\n✨ Accessibility testing complete!\n');
}

// Run tests
runAccessibilityTests();