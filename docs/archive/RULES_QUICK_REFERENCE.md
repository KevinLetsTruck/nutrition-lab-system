# FNTP System Rules - Quick Reference Guide

## 📋 Which Rules Document to Follow?

### Use PROJECT_RULES.md for:
- General development workflow
- Automation preferences
- Environment variable handling
- File operations (create/edit/delete)
- Terminal command execution
- Error resolution approaches

**Key Principle**: Maximum automation, build aggressively, don't ask permission

### Use ASSESSMENT_SYSTEM_RULES.md for:
- Assessment feature development
- AI integration patterns
- Code quality standards
- Testing requirements
- Documentation standards
- Performance benchmarks
- Security implementation

**Key Principle**: AI-first development, data integrity, production-ready code

## 🚀 Quick Decision Guide

### When Building Features:
1. ✅ Follow naming conventions from ASSESSMENT_SYSTEM_RULES
2. ✅ Use automation approach from PROJECT_RULES
3. ✅ Apply TypeScript standards from ASSESSMENT_SYSTEM_RULES
4. ✅ Make technical decisions without asking (PROJECT_RULES)

### When Handling Errors:
1. ✅ Use error handling patterns from ASSESSMENT_SYSTEM_RULES
2. ✅ Apply retry/debug flow from PROJECT_RULES
3. ✅ Log appropriately (no PHI) per ASSESSMENT_SYSTEM_RULES

### When Working with AI:
1. ✅ Follow AI integration rules from ASSESSMENT_SYSTEM_RULES
2. ✅ Implement without asking permission (PROJECT_RULES)
3. ✅ Store AI reasoning for audits (ASSESSMENT_SYSTEM_RULES)

### When Managing Data:
1. ✅ Never lose data - autosave (ASSESSMENT_SYSTEM_RULES)
2. ✅ Use immutable records (ASSESSMENT_SYSTEM_RULES)
3. ✅ Execute database operations directly (PROJECT_RULES)

## 🎯 Key Takeaways

**From PROJECT_RULES.md:**
- Build first, ask questions later
- Automate everything possible
- Make reasonable defaults
- Only stop for credentials or business logic

**From ASSESSMENT_SYSTEM_RULES.md:**
- Code quality matters
- Test as you build
- Document complex logic
- Performance standards are non-negotiable

## 📝 Commit Message Format
```bash
feat(assessment): add dynamic question selection
fix(ai): handle Claude API timeout
docs(rules): update quick reference guide
```

## ⚡ In Case of Conflict

If the two documents seem to conflict:
1. **Technical standards**: ASSESSMENT_SYSTEM_RULES takes precedence
2. **Workflow approach**: PROJECT_RULES takes precedence
3. **When in doubt**: Choose the approach that maintains data integrity and code quality while maximizing development speed

---

**Remember**: These rules work together. PROJECT_RULES tells you HOW to work (fast, automated), while ASSESSMENT_SYSTEM_RULES tells you WHAT standards to maintain (quality, security, performance).
