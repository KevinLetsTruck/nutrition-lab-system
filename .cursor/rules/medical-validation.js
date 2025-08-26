// Custom Bugbot rules for FNTP Medical System
module.exports = {
  rules: {
    // Detect database table mismatches
    'prisma-table-mismatch': {
      pattern: /prisma\.medicalDocument\./g,
      message: 'Using medicalDocument table - should this be document table?',
      severity: 'high',
      suggestion: 'Consider using prisma.document instead'
    },
    
    // Detect unsafe array operations
    'unsafe-array-find': {
      pattern: /(\w+)\.find\(/g,
      check: (match, variable) => {
        // Check if there's a null check before the find
        return !match.includes(`${variable} &&`) && !match.includes(`${variable}?.`);
      },
      message: 'Array operation without null check',
      severity: 'medium',
      suggestion: 'Add null check: if (array && Array.isArray(array))'
    },
    
    // Detect lab value access patterns
    'lab-value-access': {
      pattern: /document\.labValues/g,
      message: 'Accessing labValues field - should this be LabValue?',
      severity: 'high',
      suggestion: 'Use document.LabValue instead of document.labValues'
    },
    
    // Detect missing error handling in medical APIs
    'missing-medical-error-handling': {
      pattern: /async function.*medical.*\{[\s\S]*?\}/g,
      check: (match) => {
        return !match.includes('try') && !match.includes('catch');
      },
      message: 'Medical API function missing error handling',
      severity: 'critical',
      suggestion: 'Add try-catch block for medical data safety'
    },
    
    // Detect supplement dosage validation
    'supplement-dosage-validation': {
      pattern: /dosage.*=.*\d+/g,
      message: 'Supplement dosage assignment - ensure validation',
      severity: 'medium',
      suggestion: 'Validate dosage is within safe ranges'
    },
    
    // Detect missing HIPAA logging
    'missing-hipaa-audit': {
      pattern: /prisma\.(client|document|labValue)\..*\(/g,
      check: (match) => {
        return !match.includes('auditLog');
      },
      message: 'Medical data access without audit logging',
      severity: 'high',
      suggestion: 'Add audit logging for HIPAA compliance'
    }
  }
};

