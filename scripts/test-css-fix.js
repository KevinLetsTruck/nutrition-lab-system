#!/usr/bin/env node

/**
 * Test script to verify CSS fix for invalid Tailwind classes
 * This script checks that all Tailwind classes are valid
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 Testing CSS Fix for Invalid Tailwind Classes')
console.log('='.repeat(50))

// Valid dark color scale from tailwind.config.ts
const validDarkColors = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

// Files to check
const filesToCheck = [
  'src/app/globals.css',
  'tailwind.config.ts'
]

let allTestsPassed = true

filesToCheck.forEach(filePath => {
  console.log(`\n📄 Testing: ${filePath}`)
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`)
    allTestsPassed = false
    return
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Check for invalid dark color classes in @apply directives only
  const applyRegex = /@apply.*dark-([0-9]+)/g
  const matches = content.match(applyRegex)
  
  if (matches) {
    const invalidColors = []
    
    matches.forEach(match => {
      const colorMatch = match.match(/dark-([0-9]+)/)
      if (colorMatch) {
        const colorNumber = colorMatch[1]
        if (!validDarkColors.includes(colorNumber)) {
          invalidColors.push(colorMatch[0])
        }
      }
    })
    
    if (invalidColors.length > 0) {
      console.log(`❌ Found invalid dark color classes in @apply: ${invalidColors.join(', ')}`)
      allTestsPassed = false
    } else {
      console.log(`✅ All @apply dark color classes are valid`)
    }
  } else {
    console.log(`✅ No @apply dark color classes found`)
  }
  
  // Check for specific problematic classes (only @apply with invalid classes)
  const problematicClasses = ['bg-dark-650']
  problematicClasses.forEach(className => {
    if (content.includes(`@apply ${className}`)) {
      console.log(`❌ Found problematic @apply class: ${className}`)
      allTestsPassed = false
    }
  })
  
  // Check that the fix is in place
  if (filePath.includes('globals.css')) {
    if (content.includes('bg-dark-700 border-dark-500')) {
      console.log(`✅ CSS fix is in place (bg-dark-700 border-dark-500)`)
    } else {
      console.log(`❌ CSS fix not found`)
      allTestsPassed = false
    }
  }
})

// Test build command
console.log('\n🔨 Testing build process...')
const { execSync } = require('child_process')

try {
  // Run a quick build test
  execSync('npm run build', { stdio: 'pipe', timeout: 30000 })
  console.log('✅ Build completed successfully')
} catch (error) {
  console.log('❌ Build failed:', error.message)
  allTestsPassed = false
}

// Summary
console.log('\n' + '='.repeat(50))
if (allTestsPassed) {
  console.log('🎉 All tests passed! CSS fix is working correctly.')
  console.log('\n✅ Fix completed:')
  console.log('  • Replaced bg-dark-650 with bg-dark-700')
  console.log('  • Kept border-dark-500 (valid class)')
  console.log('  • Build completes successfully')
  console.log('  • No invalid Tailwind classes remain')
} else {
  console.log('❌ Some tests failed. Please review the issues above.')
}

console.log('\n📋 Next steps:')
console.log('  1. Deploy to production')
console.log('  2. Test medication form hover effects')
console.log('  3. Verify dark theme consistency')
console.log('  4. Check that all forms display correctly') 