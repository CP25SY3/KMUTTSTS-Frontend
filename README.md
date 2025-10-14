This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# KMUTTSTS-Frontend
Frontend for KMUTT Station project - Next.js video streaming platform

## 🎥 Video Features

### HLS Video Player (`/player`)
Professional video player with advanced streaming capabilities:
- **HLS/CMAF Streaming**: Adaptive bitrate streaming with hls.js
- **Manual Quality Control**: User-selectable video quality levels
- **Custom Controls**: Volume, progress, fullscreen, picture-in-picture
- **Accessibility**: Keyboard navigation, ARIA labels, focus management
- **Mobile Responsive**: Touch-friendly controls for all devices

### Video Upload System (`/upload`)
Comprehensive video upload and processing workflow:
- **Drag & Drop Interface**: Native HTML5 with visual feedback
- **File Validation**: Type checking (MP4, MOV, MKV, WebM) and size limits
- **Metadata Forms**: Title, description, tags, visibility settings
- **Real-time Progress**: Upload and processing status tracking
- **Strapi v5 Integration**: Direct API integration for video management
- **Error Handling**: Retry functionality and comprehensive error states

### Video Processing Pipeline
Backend integration for professional video delivery:
- **CMAF/HLS Conversion**: Automated video processing workflow
- **Multiple Resolutions**: 1080p, 720p, 480p adaptive streaming
- **Status Polling**: Real-time processing status updates
- **Thumbnail Generation**: Automatic video preview creation

## 🛠 Tech Stack

### Frontend Framework
- **Next.js 15.4.5**: App Router with TypeScript
- **React 18+**: Modern component patterns and hooks
- **TypeScript**: Strict type checking for reliability

### UI & Styling
- **shadcn/ui**: Modern component library
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling system
- **Lucide React**: Beautiful icon library

### Video Technology
- **hls.js**: HLS streaming library for modern browsers
- **XMLHttpRequest**: Upload progress tracking
- **Media Session API**: Background playback controls

### Backend Integration
- **Strapi v5**: Headless CMS with Upload plugin
- **RESTful API**: Video metadata and file management
- **CORS Configuration**: Cross-origin request handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Strapi v5 backend (optional for development)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/KMUTTSTS-Frontend.git
cd KMUTTSTS-Frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Strapi URL

# Run development server
npm run dev
```

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:1337
```

### Development Workflow
```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes group
│   │   └── login/         # Login page
│   ├── player/            # Video player page
│   ├── upload/            # Video upload page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── features/          # Feature-specific components
│   │   └── streaming/     # Video streaming components
│   ├── shared/            # Shared UI components
│   ├── ui/                # shadcn/ui components
│   └── upload/            # Video upload components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## 🎬 Video Components

### HlsVideoPlayer
```tsx
import { HlsVideoPlayer } from '@/components/features/streaming';

<HlsVideoPlayer
  src="https://example.com/video.m3u8"
  poster="https://example.com/poster.jpg"
  title="My Video"
  className="w-full aspect-video"
/>
```

### VideoUploadForm
```tsx
import { VideoUploadForm } from '@/components/upload';

<VideoUploadForm
  strapiBaseUrl={process.env.NEXT_PUBLIC_STRAPI_URL!}
  onSuccess={({ id, slug }) => router.push(`/watch/${slug}`)}
  onError={(error) => toast({ title: 'Upload failed', description: error })}
/>
```

## 🔧 Configuration

### Strapi Backend Setup
1. Install Strapi v5 with Upload plugin
2. Configure CORS for your frontend domain
3. Create video content-type with required fields
4. Set up FFmpeg for video processing

### Required Strapi Fields
- `title` (Text, required)
- `description` (Rich Text, optional)
- `tags` (Text, optional)
- `visibility` (Enumeration: public, unlisted, private)
- `slug` (UID, auto-generated)
- `videoFile` (Media, single file)
- `status` (Enumeration: uploaded, processing, ready, failed)

## 🎨 Design System

### Color Palette
- Primary: HSL-based for theme consistency
- Secondary: Muted tones for UI elements
- Accent: Destructive/success state colors

### Typography
- Geist font family for modern aesthetics
- Responsive font scaling
- Accessible contrast ratios

### Components
- Consistent spacing with Tailwind utilities
- Accessible by default (WCAG 2.1 AA)
- Mobile-first responsive design

## ♿ Accessibility

### Video Player
- Keyboard navigation (Space, Arrow keys, M, F)
- Screen reader announcements
- Focus management in fullscreen
- High contrast controls

### Upload System
- Form field labels and descriptions
- Progress announcements
- Error state handling
- Drag-drop keyboard alternative

## 🧪 Testing

### Manual Testing
- [ ] Video playback in multiple browsers
- [ ] Upload progress tracking
- [ ] Form validation
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Mobile responsiveness

### Error Scenarios
- [ ] Network failures during upload
- [ ] Invalid file types
- [ ] Processing timeouts
- [ ] API errors

## 🚀 Performance

### Optimizations
- Tree-shaking for minimal bundle size
- Lazy loading of heavy components
- Efficient video streaming with hls.js
- Optimized images and fonts

### Metrics
- Initial page load: < 2s
- Video start time: < 3s
- Upload progress: Real-time updates
- Bundle size: Optimized chunks

## 🌐 Browser Support

### Desktop
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

## 📱 Mobile Features

### Video Player
- Touch-friendly controls
- Swipe gestures for seeking
- Native fullscreen support
- Picture-in-picture mode

### Upload
- Camera roll access
- Progress notifications
- Background upload support

## 🔐 Security

### Client-Side
- Input validation and sanitization
- XSS prevention
- File type verification
- Size limit enforcement

### API Integration
- Bearer token authentication
- CSRF protection
- Secure file uploads
- Error message sanitization

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint configuration
- Test accessibility features
- Document component props

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit PR with description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For questions and support:
- Create an issue on GitHub
- Check component documentation
- Review API integration guides
