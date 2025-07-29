# 🚀 Quick Start Guide - No More Hanging!

## ✅ **Fixed Commands (No More Hanging!)**

### **📊 Check Analysis Results (Quick & Safe)**
```bash
# Quick check - shows latest 3 analyses
npm run check

# View all analysis results
npm run db:query analyze

# View pending analyses
npm run db:query pending

# View recent analyses (last 7 days)
npm run db:query recent
```

### **🔬 Process New PDFs**
```bash
# Single PDF analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "your_report.pdf",
    "clientEmail": "client@example.com",
    "clientFirstName": "John",
    "clientLastName": "Doe"
  }'

# Batch process multiple PDFs
npm run process-pdfs client@example.com "John" "Doe"
```

### **🗄️ Interactive Database Mode (When You Need It)**
```bash
# Start interactive mode explicitly
npm run db:interactive

# Then use commands: analyze, pending, recent, clients, reports
# Type 'exit' to quit
```

## ❌ **Avoid These Commands (They Cause Hanging)**
```bash
# DON'T run this without a command - it hangs!
npm run db:query

# Instead, always specify a command:
npm run db:query analyze
npm run db:query pending
npm run db:query recent
```

## 🧪 **Test Your System**

### **1. Quick System Check**
```bash
# Test database connection
npm run db:query test

# Check latest analyses
npm run check
```

### **2. Test with Real PDF**
```bash
# 1. Copy your NutriQ PDF to uploads/pdfs/
# 2. Run analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "your_nutriq.pdf",
    "clientEmail": "test@example.com",
    "clientFirstName": "John",
    "clientLastName": "Doe"
  }'

# 3. Check results
npm run check
```

## 📋 **Daily Workflow**

### **Morning Check**
```bash
# Check pending analyses
npm run db:query pending

# View recent results
npm run check
```

### **Process New Reports**
```bash
# Upload PDFs to uploads/pdfs/
# Then batch process
npm run process-pdfs client@example.com "First" "Last"
```

### **Review Results**
```bash
# Quick overview
npm run check

# Detailed view
npm run db:query analyze
```

## 🔧 **If System Hangs**

### **Kill Hanging Processes**
```bash
# Kill all Node processes
killall node

# Or kill specific process
pkill -f "query-runner"
```

### **Restart Development Server**
```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

## 🎯 **Key Commands Summary**

| Command | Purpose | Safe? |
|---------|---------|-------|
| `npm run check` | Quick results overview | ✅ Yes |
| `npm run db:query analyze` | View all analyses | ✅ Yes |
| `npm run db:query pending` | View pending analyses | ✅ Yes |
| `npm run db:query recent` | View recent analyses | ✅ Yes |
| `npm run db:interactive` | Interactive mode | ✅ Yes |
| `npm run db:query` | **Hangs!** | ❌ No |
| `npm run process-pdfs` | Batch processing | ✅ Yes |

## 🚨 **Emergency Exit**

If you get stuck in interactive mode:
1. Press `Ctrl+C` multiple times
2. If that doesn't work: `killall node`
3. Restart with: `npm run dev`

## 📞 **Need Help?**

- **System hanging?** Use `npm run check` instead of `npm run db:query`
- **Want interactive mode?** Use `npm run db:interactive`
- **Processing PDFs?** Use the curl command or batch script
- **Viewing results?** Use `npm run check` for quick overview

The system is now **hanging-free** and ready for your daily use! 🎉 