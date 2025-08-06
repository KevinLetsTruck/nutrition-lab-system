# Upload Debug Instructions

## To see what's happening with your upload:

1. Open Chrome DevTools Console (F12)
2. Clear the console (Ctrl+L or Cmd+K)
3. Try uploading a file
4. Look for logs starting with `[UPLOAD]`

## Expected logs sequence:
- `[UPLOAD] === NEW UPLOAD REQUEST ===`
- `[UPLOAD] FormData received`
- `[UPLOAD] Parsed form data: {...}`
- `[UPLOAD] Processing files: 1`
- `[UPLOAD] Processing file: filename.pdf`
- `[UPLOAD] Validation result: {...}`

## If you see:
- `[UPLOAD] No files provided` → File isn't being sent
- `[UPLOAD] Missing client information` → Form data is incomplete
- `[UPLOAD] File validation failed` → File type/size issue
- `[UPLOAD] Error processing file` → Storage upload failed

## Quick Test:
Try uploading a small text file (< 1MB) first to rule out file size issues.