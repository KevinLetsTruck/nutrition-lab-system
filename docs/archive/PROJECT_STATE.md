# Functional Medicine Assessment System - Project Management Framework

## **🎯 Purpose & Context Preservation**

This document serves as the **master project context** that persists across Claude chat sessions, context switches, and development cycles. It prevents the recurring issues of lost progress, repeated mistakes, and context degradation.

## **📋 Project Overview**

### **Mission Statement**
Build the ultimate functional medicine assessment system that exceeds NutriQ's clinical capabilities by combining your decade of clinical experience with cutting-edge AI technology.

### **Core Objectives**
- **Clinical Excellence**: 90%+ diagnostic accuracy, 85%+ treatment protocol accuracy
- **Pattern Extraction**: Analyze thousands of NutriQ results for diagnostic insights
- **Practitioner Focused**: Built by practitioners, for practitioners
- **Technical Robustness**: Prevent recurring technical failures through proper architecture

### **Success Metrics**
- ✅ **Diagnostic Accuracy**: 90%+ correlation with practitioner clinical assessment
- ✅ **Treatment Efficacy**: 85%+ accuracy in predicting successful protocols
- ✅ **Completion Rate**: 90%+ of started assessments completed
- ✅ **Technical Reliability**: 99.9% assessment completion (no lost progress)
- ✅ **Speed**: <2 seconds response time for all operations

## **🏗️ System Architecture Foundation**

### **Current Infrastructure (VERIFIED OPERATIONAL)**
```yaml
Database: PostgreSQL with 18 tables, 4 active assessments
API: Next.js with Claude integration, HIPAA compliant
Storage: Multi-provider (S3, Cloudinary, Local)
Queue: Redis/BullMQ for background processing
Real-time: WebSocket system operational
Security: JWT auth, audit logging, encryption
MCP Servers: Terminal, Database, Git, Sentry, Linear, Data-Analysis
```

### **Target Conditions (15 Priority Conditions)**
1. **Digestive Dysfunction** (Priority 1 - Start Here)
2. Adrenal Fatigue/HPA Axis Dysfunction
3. Thyroid Dysfunction
4. Blood Sugar Dysregulation
5. Chronic Inflammation
6. Detoxification Impairment
7. Hormonal Imbalances
8. Cardiovascular Dysfunction
9. Immune System Dysfunction
10. Neurotransmitter Imbalances
11. Mitochondrial Dysfunction
12. Food Sensitivities/Allergies
13. Heavy Metal Toxicity
14. Gut Microbiome Imbalances
15. Chronic Stress Response

## **📅 Development Timeline (12 Weeks)**

### **Phase 1: Foundation & Analysis (Week 1-2) [CURRENT PHASE]**
- [🔄 IN PROGRESS] NutriQ Data Analysis Pipeline
- [⏳ PENDING] Pattern Extraction & Correlation Analysis
- [⏳ PENDING] Mathematical Scoring System Development
- [⏳ PENDING] Core Condition Definitions

### **Phase 2: Assessment Engine (Week 3-4)**
- [⏳ PENDING] Adaptive Assessment System
- [⏳ PENDING] Question Architecture & Branching Logic
- [⏳ PENDING] Real-time Scoring Implementation
- [⏳ PENDING] Session Management & Recovery

### **Phase 3: Analytics & Integration (Week 5-6)**
- [⏳ PENDING] Practitioner Analytics Dashboard
- [⏳ PENDING] Lab Integration & Correlation
- [⏳ PENDING] Protocol Recommendation Engine

### **Phase 4: AI Enhancement (Week 7-8)**
- [⏳ PENDING] Claude-Powered Analysis Integration
- [⏳ PENDING] Clinical Validation System
- [⏳ PENDING] Outcome Tracking & Learning Loops

### **Phase 5: Production Optimization (Week 9-12)**
- [⏳ PENDING] Performance Architecture & Caching
- [⏳ PENDING] Advanced Features & Integrations
- [⏳ PENDING] Comprehensive Testing & Deployment

## **🛡️ Context Preservation System**

### **Memory System Integration**
- **Project State**: Stored in Claude's memory system with relationships
- **Technical Decisions**: Documented with rationale and alternatives
- **Progress Tracking**: Automated status updates via MCP servers
- **Issue Resolution**: Pattern recognition for recurring problems

### **State Persistence Mechanisms**
1. **Database State**: Real-time via MCP database server
2. **Code State**: Git commits with semantic versioning
3. **Configuration State**: Environment snapshots
4. **Documentation State**: Auto-generated from code and progress

### **Context Restoration Protocol**
```markdown
## New Chat Initialization Checklist
1. Read PROJECT_STATE.md (this file)
2. Query memory system: search_nodes("Functional Medicine Assessment")
3. Check database state: database:query current schemas and data
4. Verify system status: terminal:run_command health checks
5. Review git status: git:git_status and recent commits
6. Load current phase objectives and progress
```

## **⚡ Handoff Procedures**

### **End-of-Chat Checklist**
Before ending any development chat:

1. **Update Project State**
   ```bash
   # Update progress in this file
   # Commit all changes with descriptive messages
   # Update memory system with new insights
   ```

2. **Create Rollback Point**
   ```bash
   git add -A
   git commit -m "CHECKPOINT: [Phase X.Y] - [Brief Description]"
   git tag "checkpoint-$(date +%Y%m%d-%H%M)"
   ```

3. **Document Current Context**
   ```markdown
   ## Last Session Summary
   - **Completed**: [List completed tasks]
   - **In Progress**: [Current task status]
   - **Next Steps**: [Immediate next actions]
   - **Blockers**: [Any issues or dependencies]
   - **Context Notes**: [Important decisions or insights]
   ```

### **New-Chat Initialization**
When starting a new development chat:

1. **System Health Check**
   ```bash
   npm run dev  # Verify system runs
   npm run db:studio  # Check database connectivity
   git status  # Review uncommitted changes
   ```

2. **Context Loading**
   - Review this PROJECT_STATE.md file
   - Check memory system for recent insights
   - Review last 3 git commits for recent changes
   - Verify environment configuration

3. **Progress Validation**
   - Run existing tests to confirm system stability
   - Check current phase objectives
   - Identify next highest-priority task

## **🔧 Development Standards & Guardrails**

### **Critical Technical Rules**
1. **UI Visibility**: ALWAYS use explicit text colors with dark mode support
   ```css
   /* REQUIRED for all text elements */
   className="text-gray-900 dark:text-gray-100"
   ```

2. **Error Prevention**
   - NEVER overwrite .env files
   - ALWAYS backup before major changes
   - VALIDATE database connections before operations
   - TEST in both light and dark modes

3. **Code Quality**
   - TypeScript strict mode enabled
   - Comprehensive error handling
   - Input validation on all APIs
   - Proper loading and error states

### **Architecture Decisions Record**
- **Database**: PostgreSQL chosen for complex relationships and ACID compliance
- **Frontend**: Next.js for SSR, API routes, and development speed
- **AI Integration**: Claude Sonnet 4 for cost-effectiveness and speed
- **Queue System**: Redis/BullMQ for reliable background processing
- **Authentication**: JWT with secure practices

## **📊 Progress Tracking System**

### **Automated Progress Updates**
```typescript
interface ProjectProgress {
  currentPhase: string;
  tasksCompleted: number;
  tasksTotal: number;
  lastUpdated: Date;
  healthScore: number; // 0-100 system health
  blockers: string[];
  nextMilestone: string;
}
```

### **Health Monitoring**
- **System Health**: Automated checks via MCP servers
- **Database Health**: Connection, performance, integrity checks
- **API Health**: Response times, error rates
- **Build Health**: Compilation, test results

## **🚨 Problem Prevention System**

### **Common Failure Patterns & Solutions**
1. **Response Saving Errors**
   - **Solution**: Robust database transactions, connection pooling
   - **Prevention**: Validate connections before operations

2. **AI Integration Issues**
   - **Solution**: Proper error handling, fallback mechanisms
   - **Prevention**: Test Claude API connectivity and rate limits

3. **Session Management Failures**
   - **Solution**: Complete state recovery, auto-save functionality
   - **Prevention**: Regular state snapshots, transaction logs

4. **Performance Degradation**
   - **Solution**: Query optimization, proper indexing, caching
   - **Prevention**: Performance monitoring, load testing

### **Validation Framework**
```bash
# Pre-development validation
npm run test:medical:verbose
npm run check-types
npm run lint

# Mid-development validation
npm run dev  # Verify system starts
curl http://localhost:3000/api/health  # API health check

# Post-development validation
npm run build  # Production build test
npm run test:integration  # Full system test
```

## **🎯 Current Status & Next Actions**

### **Current Phase**: Foundation & Analysis (Week 1-2)
**Active Task**: NutriQ Data Analysis Pipeline Implementation

### **Immediate Next Steps** (Priority Order)
1. **Create NutriQ Data Ingestion System**
   - Database schema for historical assessments
   - CSV upload and parsing functionality
   - Data validation and cleansing

2. **Build Pattern Analysis Engine**
   - Claude API integration for pattern recognition
   - Statistical correlation analysis
   - Diagnostic value calculation

3. **Establish Scoring System**
   - Mathematical algorithms for condition scoring
   - Question weighting based on diagnostic value
   - Threshold definitions for severity levels

### **Success Criteria for Current Phase**
- [ ] NutriQ data successfully imported and parsed
- [ ] Pattern analysis identifies top 20 diagnostic questions per condition
- [ ] Scoring algorithms validated against known outcomes
- [ ] Database schema supports adaptive assessment logic

### **Blocker Check**
- ✅ Database connectivity confirmed
- ✅ Claude API access verified
- ✅ MCP servers operational
- ✅ Development environment stable
- ❓ NutriQ data format needs confirmation

## **💾 Backup & Recovery**

### **Automated Backups**
- **Code**: Git with tagged checkpoints every major milestone
- **Database**: Daily automated backups with 30-day retention
- **Configuration**: Environment snapshots before changes
- **Documentation**: Version-controlled with code

### **Recovery Procedures**
```bash
# Rollback to last checkpoint
git checkout checkpoint-[latest]

# Restore database from backup
# (Specific commands in DATABASE_RECOVERY.md)

# Reset to known good state
npm run reset:dev-environment
```

## **📚 Documentation Structure**

### **Living Documentation**
- **PROJECT_STATE.md**: This master context file (always current)
- **TECHNICAL_DECISIONS.md**: Architecture and technology choices
- **API_DOCUMENTATION.md**: Complete API reference
- **DEPLOYMENT_GUIDE.md**: Production deployment procedures
- **TROUBLESHOOTING.md**: Common issues and solutions

### **Auto-Generated Documentation**
- **TypeScript Interfaces**: Automatically documented from code
- **Database Schema**: Generated from Prisma schema
- **API Endpoints**: Documented from route handlers
- **Test Coverage**: Updated with each test run

---

## **🔄 Context Restoration Command**

When starting a new chat, run this mental checklist:
1. ✅ Read this PROJECT_STATE.md file completely
2. ✅ Query memory system for recent insights
3. ✅ Check database connectivity and current data state
4. ✅ Review git log for recent changes
5. ✅ Verify system health and environment
6. ✅ Identify current phase and next priority task
7. ✅ Load context for any active development work

**This system ensures continuity, prevents regression, and maintains momentum across development sessions.**
