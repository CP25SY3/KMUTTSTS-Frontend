# Video Upload Components

This directory contains the comprehensive video upload system for the KMUTTSTS Frontend, designed to work with Strapi v5 backend for HLS/CMAF video processing workflow.

## Components

### 1. VideoUploadForm (`VideoUploadForm.tsx`)
The main upload component with comprehensive features:
- **Drag & Drop Interface**: Native HTML5 drag-drop with visual feedback
- **File Validation**: Type checking (MP4, MOV, MKV, WebM) and size limits (default 2GB)
- **Form Validation**: Title, description, tags with proper error handling
- **Upload Progress**: Real-time progress tracking with XMLHttpRequest
- **Strapi Integration**: Direct API integration for file upload and video creation
- **Status Polling**: Automatic polling for processing status updates
- **Error Handling**: Comprehensive error states with retry functionality

### 2. UploadProgressCard (`UploadProgressCard.tsx`)
Status display component showing:
- **Phase Indicators**: Idle, Uploading, Processing, Ready, Failed states
- **Progress Bars**: Visual progress for upload and processing phases
- **Action Buttons**: Retry for failed uploads, View for completed videos
- **Accessibility**: ARIA labels, live regions, and keyboard navigation

## Page

### Upload Page (`/upload`)
Complete upload experience with:
- **Form Integration**: Uses VideoUploadForm component
- **Navigation Protection**: Warns before leaving during upload
- **Success Handling**: Automatic redirect to video watch page
- **Help Documentation**: Upload guidelines and feature descriptions

## Types

### Core Types (`/types/video-upload.ts`)
- **StrapiFile**: File upload response structure
- **VideoMetadata**: Video content-type attributes
- **StrapiVideoResponse**: API response formats
- **Component Props**: All component prop interfaces
- **Constants**: Validation limits and configuration

## Features

### File Handling
- **Drag & Drop**: Visual feedback, multiple file handling
- **File Validation**: MIME type checking, size limits
- **Preview**: Selected file information display
- **Remove**: Clear selection functionality

### Form Validation
- **Title**: Required, 1-120 characters
- **Description**: Optional, max 2000 characters
- **Tags**: Comma-separated, max 10 tags, 1-32 chars each
- **Visibility**: Public, Unlisted, Private options

### Upload Process
1. **File Selection**: Drag-drop or file picker
2. **Metadata Entry**: Title, description, tags, visibility
3. **Upload**: Progress tracking with cancellation support
4. **Processing**: Status polling with timeout handling
5. **Completion**: Success/error handling with actions

### API Integration

#### Upload Endpoint
```
POST /api/upload
Content-Type: multipart/form-data
Body: files (binary)
Response: StrapiFile[]
```

#### Video Creation
```
POST /api/videos
Content-Type: application/json
Body: { data: VideoMetadata }
Response: StrapiVideoResponse
```

#### Status Polling
```
GET /api/videos/:id?populate=*
Response: StrapiVideoResponse with status
```

### Error Handling
- **Upload Errors**: Network issues, server errors
- **Validation Errors**: Client-side form validation
- **Processing Errors**: Backend processing failures
- **Timeout Handling**: 10-minute polling timeout
- **User Feedback**: Clear error messages with retry options

## Usage Example

```tsx
import { VideoUploadForm } from '@/components/upload';

export default function MyUploadPage() {
  return (
    <VideoUploadForm
      strapiBaseUrl={process.env.NEXT_PUBLIC_STRAPI_URL!}
      authToken={userToken} // Optional for authenticated uploads
      maxSizeBytes={2 * 1024 * 1024 * 1024} // 2GB
      defaultVisibility="unlisted"
      onSuccess={({ id, slug }) => {
        console.log('Upload completed!', { id, slug });
        router.push(`/watch/${slug}`);
      }}
      onError={(error) => {
        console.error('Upload failed:', error);
        toast({ title: 'Upload failed', description: error });
      }}
      className="max-w-2xl mx-auto"
    />
  );
}
```

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### Strapi Configuration Required
- Upload plugin enabled
- CORS configured for frontend origin
- Video content-type with proper fields
- Processing workflow (FFmpeg/CMAF)

## Accessibility

### ARIA Support
- Form labels and descriptions
- Progress bars with live updates
- Error announcements
- Keyboard navigation

### Keyboard Controls
- Tab navigation through form
- Enter/Space for drag-drop activation
- Form submission with Enter

### Screen Reader Support
- Descriptive labels for all controls
- Live regions for status updates
- Error state announcements

## Performance

### Optimizations
- File validation before upload
- Progress tracking without UI blocking
- Efficient polling with intervals
- Memory cleanup on unmount

### Bundle Size
- Tree-shakable exports
- Lazy loading of heavy components
- Minimal dependencies

## Security

### Client-Side
- File type validation
- Size limit enforcement
- XSS prevention in user inputs
- CSRF protection (when using cookies)

### API Integration
- Bearer token authentication
- Proper error handling
- No sensitive data exposure

## Testing

### Manual Testing Checklist
- [ ] Drag & drop file selection
- [ ] File picker functionality
- [ ] Form validation messages
- [ ] Upload progress display
- [ ] Processing status updates
- [ ] Error state handling
- [ ] Success flow completion
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

### Error Scenarios
- [ ] Invalid file types
- [ ] Oversized files
- [ ] Network failures
- [ ] Server errors
- [ ] Processing timeouts
- [ ] Authentication failures

## Browser Support

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support
- iOS Safari (file selection from Photos)
- Chrome Mobile
- Samsung Internet

## Dependencies

### Production
- `@radix-ui/react-progress`: Progress bars
- `@radix-ui/react-select`: Dropdown components
- `lucide-react`: Icons

### Development
- TypeScript strict mode
- ESLint configuration
- Next.js App Router

## Known Limitations

1. **File Size**: Limited by browser memory and server configuration
2. **Concurrent Uploads**: One upload at a time per component instance
3. **Resume**: No upload resumption on connection failure
4. **Preview**: No video preview before upload

## Future Enhancements

1. **Chunked Upload**: Large file support with resumption
2. **Multiple Files**: Batch upload functionality
3. **Preview**: Video thumbnail generation
4. **Advanced Validation**: Content analysis
5. **Progress Persistence**: Cross-tab upload status
6. **Drag & Drop Enhancements**: Folder upload support