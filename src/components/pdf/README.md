# PDF Viewer Components

A comprehensive, professional PDF document viewer built for the FNTP Nutrition System. This viewer handles various health-related documents including lab reports, protocols, assessments, and client intake forms.

## 🚀 Features

### Core Functionality

- **High-Quality PDF Rendering** - Using PDF.js for accurate document display
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Full-Screen Viewing** - Immersive document viewing experience
- **Multi-Format Support** - Handles all PDF types and sizes up to 50MB

### Navigation & Controls

- **Page Navigation** - Previous/next buttons, page input, keyboard shortcuts
- **Zoom Controls** - Zoom in/out, fit-to-width, fit-to-page, custom zoom levels
- **Thumbnail Sidebar** - Visual page overview with click navigation
- **Keyboard Shortcuts** - Arrow keys, +/-, Escape, Ctrl+S for search

### Search & Discovery

- **Full-Text Search** - Search across all pages with highlighted results
- **Search Results Navigation** - Click to jump to specific page matches
- **Case-Sensitive Options** - Flexible search capabilities

### Annotations System

- **Highlight Text** - Select and highlight important sections
- **Add Notes** - Click to add contextual notes anywhere on the page
- **Annotation Management** - View, edit, and delete annotations
- **Persistent Storage** - Annotations are saved and persist across sessions

### Document Management

- **Download PDF** - Original quality document download
- **Print Support** - Direct printing with browser print dialog
- **Document Information** - View metadata, upload date, file size
- **Status Tracking** - Processing status for uploaded documents

### Performance Optimizations

- **Page Caching** - Rendered pages cached for instant navigation
- **Lazy Loading** - Pages loaded on-demand for large documents
- **Preloading** - Smart preloading of adjacent pages
- **Memory Management** - Automatic cache cleanup and memory optimization

## 📱 Mobile Support

### Touch Interactions

- **Pinch to Zoom** - Natural touch gestures for zooming
- **Swipe Navigation** - Swipe left/right to navigate pages
- **Touch-Friendly UI** - Larger buttons and optimized layout
- **Mobile Sidebar** - Collapsible sidebar for small screens

### Responsive Design

- **Adaptive Layout** - UI adapts to screen size and orientation
- **Mobile Toolbar** - Simplified controls for mobile devices
- **Gesture Support** - Native touch gestures where appropriate

## 🏗️ Architecture

### Components

#### `PDFViewerModal`

Main component that orchestrates the entire PDF viewing experience.

```tsx
<PDFViewerModal
  document={document}
  onClose={() => setViewerOpen(false)}
  allowAnnotations={true}
  allowDownload={true}
  allowPrint={true}
/>
```

#### `PDFToolbar`

Navigation and action controls at the top of the viewer.

- Page navigation (prev/next/jump to page)
- Zoom controls (in/out/fit options)
- View toggles (sidebar, fullscreen)
- Action buttons (print, download, share)

#### `PDFSidebar`

Multi-tab sidebar with thumbnails, annotations, and search.

- **Thumbnails Tab**: Visual page overview
- **Annotations Tab**: List of all notes and highlights
- **Search Tab**: Full-text search with results

#### `PDFAnnotations`

Overlay system for adding and managing annotations.

- Click to add notes
- Select text to highlight
- Interactive annotation display

#### `ClientDocumentViewer`

Integration component for the client detail page.

- Document grid/list view
- Filtering and sorting
- Type categorization
- Status indicators

### Utilities

#### `PDFPerformanceOptimizer`

Singleton class managing performance optimizations.

```tsx
const optimizer = PDFPerformanceOptimizer.getInstance();
const pdf = await optimizer.loadPDF(url);
await optimizer.renderPage(pdf, pageNumber, scale, canvas);
```

#### `pdfUtils.ts`

Collection of utility functions for PDF operations.

- Text extraction
- Search functionality
- Metadata extraction
- File validation

## 🎨 Design System

### Dark Theme Integration

The PDF viewer follows the application's dark theme design system:

```css
/* Primary Colors */
--pdf-bg-primary: #0f172a     /* slate-900 */
--pdf-bg-secondary: #1e293b   /* slate-800 */
--pdf-border: #334155         /* slate-700 */
--pdf-text-primary: #f1f5f9   /* slate-100 */
--pdf-text-secondary: #94a3b8 /* slate-400 */
--pdf-accent: #4ade80         /* green-400 */
```

### Component Styling

- **Container**: `bg-slate-900 border border-slate-700 rounded-xl`
- **Toolbar**: `bg-slate-800 border-b border-slate-700`
- **Sidebar**: `bg-slate-800 border-r border-slate-700`
- **Buttons**: `hover:bg-slate-700 transition-all`
- **Active States**: `bg-green-500 text-slate-900`

## 📄 Document Types

The viewer supports categorized document types:

### Lab Reports (`lab_report`)

- **Icon**: FileText
- **Color**: Green (#4ade80)
- **Description**: Blood work, biomarkers, lab analysis
- **Examples**: NutriQ, KBMO, Dutch tests

### Protocols (`protocol`)

- **Icon**: ClipboardList
- **Color**: Blue (#60a5fa)
- **Description**: Treatment plans and recommendations

### Assessments (`assessment`)

- **Icon**: FileCheck
- **Color**: Orange (#fb923c)
- **Description**: Health assessments and evaluations

### Intake Forms (`intake`)

- **Icon**: UserCheck
- **Color**: Purple (#a78bfa)
- **Description**: Initial client information and history

## 🔧 Configuration

### PDF.js Setup

```javascript
// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// Load with options
const pdf = await pdfjsLib.getDocument({
  url: documentUrl,
  cMapUrl: "/cmaps/",
  cMapPacked: true,
});
```

### Performance Settings

```javascript
// Cache configuration
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const DOCUMENT_CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes
const MAX_PRELOAD_PAGES = 2; // Adjacent pages to preload
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] PDF loads and displays correctly
- [ ] Navigation between pages works
- [ ] Zoom functionality works smoothly
- [ ] Annotations save and persist
- [ ] Search finds text across all pages
- [ ] Download maintains original quality
- [ ] Print function works correctly
- [ ] Mobile responsive design works
- [ ] Keyboard shortcuts function
- [ ] Large PDFs (100+ pages) perform well
- [ ] Different PDF types render correctly

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile Testing

- ✅ iOS Safari
- ✅ Android Chrome
- ✅ iPad landscape/portrait
- ✅ Touch interactions

## 🚀 Performance Benchmarks

### Target Performance

- **Load Time**: < 2 seconds for average documents
- **Render Time**: < 500ms per page
- **Memory Usage**: < 100MB for typical documents
- **Cache Hit Rate**: > 80% for navigation

### Optimization Techniques

1. **Page Caching**: Rendered pages cached in memory
2. **Lazy Loading**: Pages loaded on-demand
3. **Preloading**: Smart adjacent page preloading
4. **Canvas Recycling**: Reuse canvas elements
5. **Memory Cleanup**: Automatic cache expiration

## 🔗 Integration Example

```tsx
import { ClientDocumentViewer } from "@/components/clients/ClientDocumentViewer";

function ClientDetailPage({ clientId, documents }) {
  return (
    <div className="client-detail">
      {/* Other client information */}

      <ClientDocumentViewer
        clientId={clientId}
        documents={documents}
        onRefresh={() => fetchDocuments()}
      />
    </div>
  );
}
```

## 🎯 Future Enhancements

### Planned Features

- [ ] OCR text extraction for scanned documents
- [ ] AI-powered document analysis integration
- [ ] Collaborative annotations with real-time sync
- [ ] Document comparison view
- [ ] Advanced search with filters
- [ ] Export annotations to PDF
- [ ] Voice notes support
- [ ] Document versioning

### Performance Improvements

- [ ] WebAssembly PDF rendering
- [ ] Service worker caching
- [ ] Virtual scrolling for large documents
- [ ] Progressive loading for thumbnails

## 📞 Support

For technical support or feature requests related to the PDF viewer:

1. Check the browser console for error messages
2. Verify PDF.js worker is loading correctly
3. Ensure document URLs are accessible
4. Test with different PDF types and sizes
5. Clear browser cache if experiencing issues

## 📚 Dependencies

```json
{
  "pdfjs-dist": "^3.11.174",
  "uuid": "^9.0.0",
  "lucide-react": "^0.294.0"
}
```

## 🏷️ Version History

### v1.0.0 (Current)

- Initial PDF viewer implementation
- Basic annotation system
- Search functionality
- Mobile responsive design
- Performance optimizations
- Integration with client document management
