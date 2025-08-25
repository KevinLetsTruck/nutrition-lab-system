#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const stats = require('simple-statistics');
const _ = require('lodash');
const { Matrix } = require('ml-matrix');

class DataAnalysisServer {
  constructor() {
    this.server = new Server(
      {
        name: 'data-analysis-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'parse_csv',
          description: 'Parse CSV file and return structured data',
          inputSchema: {
            type: 'object',
            properties: {
              filepath: {
                type: 'string',
                description: 'Path to CSV file'
              },
              delimiter: {
                type: 'string',
                description: 'CSV delimiter (default: ",")',
                default: ','
              }
            },
            required: ['filepath']
          }
        },
        {
          name: 'analyze_correlations',
          description: 'Calculate correlations between variables',
          inputSchema: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                description: 'Array of data objects'
              },
              variables: {
                type: 'array',
                description: 'Variable names to analyze',
                items: { type: 'string' }
              }
            },
            required: ['data', 'variables']
          }
        },
        {
          name: 'extract_patterns',
          description: 'Extract patterns and insights from NutriQ-style data',
          inputSchema: {
            type: 'object',
            properties: {
              assessmentData: {
                type: 'array',
                description: 'Array of assessment records'
              },
              outcomeField: {
                type: 'string',
                description: 'Name of the outcome field to predict'
              }
            },
            required: ['assessmentData']
          }
        },
        {
          name: 'generate_scoring_weights',
          description: 'Generate question scoring weights based on outcome correlations',
          inputSchema: {
            type: 'object',
            properties: {
              correlationData: {
                type: 'object',
                description: 'Correlation analysis results'
              },
              conditionName: {
                type: 'string',
                description: 'Name of the condition being analyzed'
              }
            },
            required: ['correlationData', 'conditionName']
          }
        },
        {
          name: 'cluster_symptoms',
          description: 'Group similar symptoms into clusters',
          inputSchema: {
            type: 'object',
            properties: {
              symptoms: {
                type: 'array',
                description: 'Array of symptom data with scores'
              },
              numClusters: {
                type: 'number',
                description: 'Number of clusters to create',
                default: 5
              }
            },
            required: ['symptoms']
          }
        },
        {
          name: 'validate_diagnostic_accuracy',
          description: 'Calculate diagnostic accuracy metrics',
          inputSchema: {
            type: 'object',
            properties: {
              predictions: {
                type: 'array',
                description: 'Array of predicted outcomes'
              },
              actual: {
                type: 'array',
                description: 'Array of actual outcomes'
              }
            },
            required: ['predictions', 'actual']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'parse_csv':
            return await this.parseCSV(args);
          case 'analyze_correlations':
            return await this.analyzeCorrelations(args);
          case 'extract_patterns':
            return await this.extractPatterns(args);
          case 'generate_scoring_weights':
            return await this.generateScoringWeights(args);
          case 'cluster_symptoms':
            return await this.clusterSymptoms(args);
          case 'validate_diagnostic_accuracy':
            return await this.validateDiagnosticAccuracy(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`
          }],
          isError: true
        };
      }
    });
  }

  async parseCSV({ filepath, delimiter = ',' }) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      
      fs.createReadStream(filepath)
        .pipe(csv({ separator: delimiter }))
        .on('data', (data) => {
          // Clean and normalize data
          const cleanData = {};
          Object.keys(data).forEach(key => {
            const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
            cleanData[cleanKey] = data[key].trim();
          });
          results.push(cleanData);
        })
        .on('error', (error) => {
          errors.push(error.message);
        })
        .on('end', () => {
          if (errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${errors.join(', ')}`));
          } else {
            resolve({
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  rowCount: results.length,
                  columns: Object.keys(results[0] || {}),
                  data: results.slice(0, 10), // First 10 rows for preview
                  sample: results.length > 10 ? `Showing first 10 of ${results.length} rows` : 'All rows shown'
                }, null, 2)
              }]
            });
          }
        });
    });
  }

  async analyzeCorrelations({ data, variables }) {
    const correlationMatrix = {};
    const insights = [];
    
    // Calculate Pearson correlations between all variable pairs
    for (let i = 0; i < variables.length; i++) {
      correlationMatrix[variables[i]] = {};
      
      for (let j = 0; j < variables.length; j++) {
        const var1Values = data.map(row => parseFloat(row[variables[i]])).filter(v => !isNaN(v));
        const var2Values = data.map(row => parseFloat(row[variables[j]])).filter(v => !isNaN(v));
        
        if (var1Values.length === var2Values.length && var1Values.length > 1) {
          const correlation = stats.sampleCorrelation(var1Values, var2Values);
          correlationMatrix[variables[i]][variables[j]] = correlation;
          
          // Generate insights for strong correlations
          if (Math.abs(correlation) > 0.5 && variables[i] !== variables[j]) {
            insights.push({
              var1: variables[i],
              var2: variables[j],
              correlation: correlation,
              strength: Math.abs(correlation) > 0.7 ? 'strong' : 'moderate',
              direction: correlation > 0 ? 'positive' : 'negative',
              interpretation: this.interpretCorrelation(variables[i], variables[j], correlation)
            });
          }
        }
      }
    }

    // Sort insights by correlation strength
    insights.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          correlationMatrix,
          strongCorrelations: insights,
          summary: {
            totalVariables: variables.length,
            strongCorrelations: insights.filter(i => Math.abs(i.correlation) > 0.7).length,
            moderateCorrelations: insights.filter(i => Math.abs(i.correlation) > 0.5 && Math.abs(i.correlation) <= 0.7).length
          }
        }, null, 2)
      }]
    };
  }

  interpretCorrelation(var1, var2, correlation) {
    if (Math.abs(correlation) > 0.7) {
      if (correlation > 0) {
        return `Strong positive relationship: As ${var1} increases, ${var2} tends to increase significantly`;
      } else {
        return `Strong negative relationship: As ${var1} increases, ${var2} tends to decrease significantly`;
      }
    } else {
      if (correlation > 0) {
        return `Moderate positive relationship: As ${var1} increases, ${var2} tends to increase moderately`;
      } else {
        return `Moderate negative relationship: As ${var1} increases, ${var2} tends to decrease moderately`;
      }
    }
  }

  async extractPatterns({ assessmentData, outcomeField }) {
    const patterns = {
      conditionPatterns: {},
      symptomClusters: {},
      riskFactors: {},
      demographics: {}
    };

    // Group data by outcomes
    const grouped = _.groupBy(assessmentData, outcomeField);
    
    Object.keys(grouped).forEach(outcome => {
      const groupData = grouped[outcome];
      patterns.conditionPatterns[outcome] = {
        count: groupData.length,
        percentage: (groupData.length / assessmentData.length * 100).toFixed(2),
        commonSymptoms: this.findCommonSymptoms(groupData),
        avgSymptomScores: this.calculateAvgSymptomScores(groupData),
        demographics: this.analyzeDemographics(groupData)
      };
    });

    // Identify high-value diagnostic questions
    const diagnosticValue = this.calculateDiagnosticValue(assessmentData, outcomeField);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          patterns,
          diagnosticQuestions: diagnosticValue.slice(0, 20), // Top 20 questions
          insights: this.generateInsights(patterns),
          recommendations: this.generateRecommendations(patterns, diagnosticValue)
        }, null, 2)
      }]
    };
  }

  findCommonSymptoms(data) {
    const symptomCounts = {};
    
    data.forEach(record => {
      Object.keys(record).forEach(key => {
        if (key.includes('symptom') || key.includes('question')) {
          const score = parseInt(record[key]);
          if (score >= 4) { // High symptom score
            symptomCounts[key] = (symptomCounts[key] || 0) + 1;
          }
        }
      });
    });

    return Object.entries(symptomCounts)
      .map(([symptom, count]) => ({
        symptom,
        count,
        percentage: (count / data.length * 100).toFixed(2)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  calculateAvgSymptomScores(data) {
    const symptomScores = {};
    
    data.forEach(record => {
      Object.keys(record).forEach(key => {
        if (key.includes('symptom') || key.includes('question')) {
          const score = parseFloat(record[key]);
          if (!isNaN(score)) {
            if (!symptomScores[key]) symptomScores[key] = [];
            symptomScores[key].push(score);
          }
        }
      });
    });

    const avgScores = {};
    Object.keys(symptomScores).forEach(symptom => {
      avgScores[symptom] = {
        average: stats.mean(symptomScores[symptom]).toFixed(2),
        median: stats.median(symptomScores[symptom]).toFixed(2),
        stdDev: stats.standardDeviation(symptomScores[symptom]).toFixed(2)
      };
    });

    return avgScores;
  }

  analyzeDemographics(data) {
    const demographics = {
      ageGroups: {},
      genderDistribution: {},
      otherFactors: {}
    };

    data.forEach(record => {
      // Age analysis
      const age = parseInt(record.age);
      if (!isNaN(age)) {
        const ageGroup = this.getAgeGroup(age);
        demographics.ageGroups[ageGroup] = (demographics.ageGroups[ageGroup] || 0) + 1;
      }

      // Gender analysis
      if (record.gender) {
        demographics.genderDistribution[record.gender] = (demographics.genderDistribution[record.gender] || 0) + 1;
      }
    });

    return demographics;
  }

  getAgeGroup(age) {
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    if (age < 65) return '55-64';
    return '65+';
  }

  calculateDiagnosticValue(data, outcomeField) {
    const questions = {};
    
    // Find all question columns
    const questionColumns = Object.keys(data[0] || {}).filter(key => 
      key.includes('question') || key.includes('symptom') || key.includes('q_')
    );

    questionColumns.forEach(question => {
      const outcomes = {};
      let totalVariance = 0;
      
      // Group by outcome and calculate variance
      const grouped = _.groupBy(data, outcomeField);
      Object.keys(grouped).forEach(outcome => {
        const scores = grouped[outcome]
          .map(row => parseFloat(row[question]))
          .filter(score => !isNaN(score));
        
        if (scores.length > 0) {
          outcomes[outcome] = {
            mean: stats.mean(scores),
            variance: stats.variance(scores),
            count: scores.length
          };
          totalVariance += stats.variance(scores);
        }
      });

      // Calculate diagnostic value based on separation between groups
      const means = Object.values(outcomes).map(o => o.mean);
      const betweenGroupVariance = means.length > 1 ? stats.variance(means) : 0;
      const diagnosticValue = betweenGroupVariance / (totalVariance + 1); // +1 to avoid division by zero

      questions[question] = {
        diagnosticValue,
        outcomes,
        discrimination: betweenGroupVariance
      };
    });

    return Object.entries(questions)
      .map(([question, data]) => ({ question, ...data }))
      .sort((a, b) => b.diagnosticValue - a.diagnosticValue);
  }

  generateInsights(patterns) {
    const insights = [];
    
    Object.keys(patterns.conditionPatterns).forEach(condition => {
      const pattern = patterns.conditionPatterns[condition];
      
      if (pattern.percentage > 20) {
        insights.push(`${condition} appears in ${pattern.percentage}% of cases - consider as primary screening condition`);
      }
      
      if (pattern.commonSymptoms.length > 0) {
        insights.push(`Top symptom for ${condition}: ${pattern.commonSymptoms[0].symptom} (${pattern.commonSymptoms[0].percentage}% prevalence)`);
      }
    });

    return insights;
  }

  generateRecommendations(patterns, diagnosticQuestions) {
    const recommendations = [];
    
    // Recommend most valuable diagnostic questions
    const topQuestions = diagnosticQuestions.slice(0, 5);
    recommendations.push({
      category: 'assessment',
      recommendation: `Prioritize these high-value diagnostic questions: ${topQuestions.map(q => q.question).join(', ')}`
    });

    // Recommend condition-specific focus areas
    const majorConditions = Object.entries(patterns.conditionPatterns)
      .filter(([_, data]) => parseFloat(data.percentage) > 15)
      .sort((a, b) => parseFloat(b[1].percentage) - parseFloat(a[1].percentage));

    if (majorConditions.length > 0) {
      recommendations.push({
        category: 'conditions',
        recommendation: `Focus assessment development on: ${majorConditions.map(([condition, _]) => condition).join(', ')}`
      });
    }

    return recommendations;
  }

  async generateScoringWeights({ correlationData, conditionName }) {
    const weights = {};
    const strongCorrelations = correlationData.strongCorrelations || [];
    
    strongCorrelations.forEach(correlation => {
      if (correlation.var2.includes(conditionName.toLowerCase()) || 
          correlation.var1.includes(conditionName.toLowerCase())) {
        
        const questionVar = correlation.var1.includes(conditionName.toLowerCase()) ? 
          correlation.var2 : correlation.var1;
        
        // Weight based on correlation strength
        const baseWeight = Math.abs(correlation.correlation);
        const adjustedWeight = baseWeight * (correlation.strength === 'strong' ? 2.5 : 1.5);
        
        weights[questionVar] = {
          weight: Math.min(adjustedWeight, 3.0), // Cap at 3.0
          correlation: correlation.correlation,
          rationale: correlation.interpretation
        };
      }
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          condition: conditionName,
          weightedQuestions: weights,
          summary: {
            totalWeightedQuestions: Object.keys(weights).length,
            avgWeight: Object.values(weights).reduce((sum, w) => sum + w.weight, 0) / Object.keys(weights).length,
            strongIndicators: Object.entries(weights).filter(([_, w]) => w.weight > 2.0).length
          }
        }, null, 2)
      }]
    };
  }

  async clusterSymptoms({ symptoms, numClusters = 5 }) {
    // Simple clustering based on symptom scores and categories
    const clusters = {};
    
    // Group symptoms by category if available
    const categorized = _.groupBy(symptoms, 'category');
    
    Object.keys(categorized).forEach((category, index) => {
      const clusterIndex = index % numClusters;
      if (!clusters[`cluster_${clusterIndex}`]) {
        clusters[`cluster_${clusterIndex}`] = {
          symptoms: [],
          avgScore: 0,
          category: category
        };
      }
      
      clusters[`cluster_${clusterIndex}`].symptoms.push(...categorized[category]);
    });

    // Calculate cluster statistics
    Object.keys(clusters).forEach(clusterKey => {
      const cluster = clusters[clusterKey];
      const scores = cluster.symptoms.map(s => s.score).filter(s => !isNaN(s));
      cluster.avgScore = scores.length > 0 ? stats.mean(scores) : 0;
      cluster.symptomCount = cluster.symptoms.length;
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          clusters,
          summary: {
            totalClusters: Object.keys(clusters).length,
            totalSymptoms: symptoms.length,
            avgSymptomsPerCluster: symptoms.length / Object.keys(clusters).length
          }
        }, null, 2)
      }]
    };
  }

  async validateDiagnosticAccuracy({ predictions, actual }) {
    if (predictions.length !== actual.length) {
      throw new Error('Predictions and actual arrays must have the same length');
    }

    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i];
      const act = actual[i];

      if (pred === true && act === true) truePositives++;
      else if (pred === true && act === false) falsePositives++;
      else if (pred === false && act === false) trueNegatives++;
      else if (pred === false && act === true) falseNegatives++;
    }

    const accuracy = (truePositives + trueNegatives) / predictions.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
    const specificity = trueNegatives / (trueNegatives + falsePositives) || 0;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          confusionMatrix: {
            truePositives,
            falsePositives,
            trueNegatives,
            falseNegatives
          },
          metrics: {
            accuracy: accuracy.toFixed(4),
            precision: precision.toFixed(4),
            recall: recall.toFixed(4),
            f1Score: f1Score.toFixed(4),
            specificity: specificity.toFixed(4)
          },
          interpretation: {
            accuracy: this.interpretAccuracy(accuracy),
            precision: this.interpretPrecision(precision),
            recall: this.interpretRecall(recall)
          }
        }, null, 2)
      }]
    };
  }

  interpretAccuracy(accuracy) {
    if (accuracy > 0.9) return 'Excellent diagnostic accuracy';
    if (accuracy > 0.8) return 'Good diagnostic accuracy';
    if (accuracy > 0.7) return 'Fair diagnostic accuracy';
    return 'Poor diagnostic accuracy - needs improvement';
  }

  interpretPrecision(precision) {
    if (precision > 0.9) return 'Excellent precision - very few false positives';
    if (precision > 0.8) return 'Good precision - low false positive rate';
    if (precision > 0.7) return 'Fair precision - moderate false positive rate';
    return 'Poor precision - high false positive rate';
  }

  interpretRecall(recall) {
    if (recall > 0.9) return 'Excellent recall - catches nearly all positive cases';
    if (recall > 0.8) return 'Good recall - catches most positive cases';
    if (recall > 0.7) return 'Fair recall - misses some positive cases';
    return 'Poor recall - misses many positive cases';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Data Analysis Server running on stdio');
  }
}

const server = new DataAnalysisServer();
server.run().catch(console.error);
