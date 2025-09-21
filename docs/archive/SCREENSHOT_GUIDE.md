# Screenshot Feature Guide for Issue Tracking

## 🎯 Quick Start

The issue tracking system now supports screenshots for better visual documentation of issues!

## 📸 How to Add Screenshots

### Method 1: Paste from Clipboard (Fastest!)
1. Take a screenshot:
   - **Windows**: Win+Shift+S (Snipping Tool)
   - **Mac**: Cmd+Shift+4 (Selection) or Cmd+Shift+3 (Full screen)
2. Open the issue form
3. Press **Ctrl+V** to paste - the screenshot will appear instantly!

### Method 2: Upload Files
1. Click the upload area in the issue form
2. Select one or multiple image files
3. Images will appear as thumbnails

### Method 3: Quick Screenshot Reminder
- Press **Ctrl+Shift+S** anywhere in the app
- Shows a helpful tooltip with screenshot instructions

## 🖼️ Managing Screenshots

### In the Issue Form:
- **Preview**: Click any thumbnail to open full size in new tab
- **Remove**: Hover over thumbnail and click the red X
- **Expand**: Click the blue expand icon for full view
- **Multiple**: Add as many screenshots as needed

### In the Issue List:
- Thumbnails show next to issue details
- Shows first 3 images plus count if more
- Click any thumbnail to view full size

## 📤 Exporting Issues with Screenshots

1. Click "Export for Claude" button
2. Report is:
   - Downloaded as markdown file
   - Copied to clipboard automatically
3. Screenshots are referenced in the export as:
   ```
   - **Screenshots**: 3 attached
     - ![Screenshot 1](screenshot-issue-123-1.png)
     - ![Screenshot 2](screenshot-issue-123-2.png)
   ```

## 💡 Pro Tips

### Best Practices:
1. **Annotate First**: Use snipping tool to add arrows/highlights before capturing
2. **Multiple Angles**: Capture console, UI, and error messages separately
3. **Quick Paste**: Ctrl+V is fastest - no need to save files

### Keyboard Shortcuts:
- **Ctrl+Shift+I**: Open quick issue form
- **Ctrl+Shift+S**: Show screenshot help
- **Ctrl+V**: Paste screenshot from clipboard

### Screenshot Tips:
- **Console Errors**: Always screenshot the full console
- **UI Issues**: Include surrounding context
- **Before/After**: Show both states for comparison
- **Annotations**: Use red boxes/arrows to highlight issues

## 🔧 Technical Details

- Screenshots are stored as base64 data URLs
- Saved to localStorage with the issue
- No file uploads to server required
- Works offline!

## 🎨 Visual Workflow

1. **See Issue** → Win+Shift+S
2. **Select Area** → Draw rectangle
3. **Open Tracker** → Ctrl+Shift+I
4. **Paste Image** → Ctrl+V
5. **Add Details** → Type description
6. **Submit** → Issue logged with visual proof!

## ⚡ Quick Reference

| Action | Windows | Mac |
|--------|---------|-----|
| Screenshot area | Win+Shift+S | Cmd+Shift+4 |
| Screenshot full | Print Screen | Cmd+Shift+3 |
| Paste in form | Ctrl+V | Cmd+V |
| Quick issue | Ctrl+Shift+I | Ctrl+Shift+I |
| Screenshot help | Ctrl+Shift+S | Ctrl+Shift+S |

## 🚀 Sharing with Claude

When exporting issues:
1. Screenshots are referenced in markdown
2. Full report is copied to clipboard
3. Paste directly into Claude chat
4. Describe which screenshots show what
5. Claude can understand the context from descriptions

Remember: A picture is worth a thousand words - especially for UI bugs!
