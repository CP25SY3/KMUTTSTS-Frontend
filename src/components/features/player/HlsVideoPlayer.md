# HLS Video Player

A comprehensive React component for playing HLS (HTTP Live Streaming) videos with adaptive bitrate streaming support. Built with TypeScript, hls.js, and designed to integrate seamlessly with the project's design system.

## Features

### Core Functionality
- ✅ **HLS Support**: Plays HLS streams (.m3u8) with CMAF (.m4s) segments
- ✅ **Adaptive Bitrate (ABR)**: Automatically adjusts quality based on network conditions
- ✅ **Manual Quality Selection**: Switch between Auto and specific resolutions
- ✅ **Native Safari Support**: Uses native HLS on Safari/iOS for optimal performance
- ✅ **Cross-Browser Compatibility**: Works on all modern browsers via hls.js

### User Experience
- ✅ **Custom Controls**: Clean, accessible video controls that match the design system
- ✅ **Keyboard Shortcuts**: Full keyboard navigation support
- ✅ **Fullscreen Support**: Enter/exit fullscreen mode
- ✅ **Volume Control**: Mute/unmute and volume adjustment
- ✅ **Seek Bar**: Click to seek to specific time positions
- ✅ **Caption Support**: Multiple subtitle tracks with language selection

### Technical
- ✅ **TypeScript**: Fully typed with strict TypeScript support
- ✅ **Performance Optimized**: Minimal re-renders, efficient memory usage
- ✅ **Error Handling**: Graceful error recovery and user feedback
- ✅ **Accessibility**: WCAG AA compliant with proper ARIA labels
- ✅ **Design System Integration**: Uses existing utility classes and design tokens

## Installation

The component requires `hls.js` as a dependency:

```bash
npm install hls.js @types/hls.js
```

## Usage

### Basic Usage

```tsx
import HlsVideoPlayer from '@/components/HlsVideoPlayer';

export default function VideoPage() {
  return (
    <HlsVideoPlayer
      src="https://example.com/stream/master.m3u8"
      poster="/poster.jpg"
      className="rounded-lg shadow-md"
      videoClassName="w-full aspect-video"
    />
  );
}
```

### Advanced Usage with Captions and Quality Control

```tsx
import { useRef } from 'react';
import HlsVideoPlayer, { HlsVideoPlayerHandle } from '@/components/HlsVideoPlayer';

export default function AdvancedVideoPage() {
  const playerRef = useRef<HlsVideoPlayerHandle>(null);

  const captions = [
    { src: '/subs/en.vtt', srclang: 'en', label: 'English', default: true },
    { src: '/subs/th.vtt', srclang: 'th', label: 'ภาษาไทย' }
  ];

  const handleQualityChange = (quality) => {
    console.log('Quality changed:', quality);
  };

  return (
    <HlsVideoPlayer
      ref={playerRef}
      src="https://example.com/stream/master.m3u8"
      poster="/poster.jpg"
      captions={captions}
      initialQuality="auto"
      autoPlay={false}
      muted={false}
      capLevelToPlayerSize={true}
      onQualityChanged={handleQualityChange}
      onError={(error) => console.error('Player error:', error)}
      className="rounded-2xl shadow-lg bg-black"
      videoClassName="w-full aspect-video"
      controlsClassName="p-4"
    />
  );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `src` | `string` | HLS master .m3u8 URL |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `poster` | `string` | - | Poster image URL |
| `captions` | `CaptionTrack[]` | `[]` | Array of subtitle tracks |
| `autoPlay` | `boolean` | `false` | Auto-play video |
| `muted` | `boolean` | `false` | Start muted |
| `playsInline` | `boolean` | `true` | Play inline on mobile |
| `preload` | `'none' \| 'metadata' \| 'auto'` | `'metadata'` | Preload behavior |
| `initialQuality` | `QualityPreference` | `'auto'` | Initial quality setting |
| `className` | `string` | - | Wrapper CSS classes |
| `videoClassName` | `string` | - | Video element CSS classes |
| `controlsClassName` | `string` | - | Controls container CSS classes |
| `capLevelToPlayerSize` | `boolean` | `true` | Cap quality to player size |
| `startLevel` | `number` | `-1` | Initial quality level (-1 for auto) |
| `lowLatencyMode` | `boolean` | `false` | Enable low-latency mode |

### Event Handlers

| Prop | Type | Description |
|------|------|-------------|
| `onReady` | `() => void` | Called when player is ready |
| `onPlay` | `() => void` | Called when playback starts |
| `onPause` | `() => void` | Called when playback pauses |
| `onEnded` | `() => void` | Called when playback ends |
| `onError` | `(error: unknown) => void` | Called on errors |
| `onQualityChanged` | `(payload) => void` | Called when quality changes |
| `onStats` | `(payload) => void` | Called with playback stats |

## Types

### CaptionTrack

```typescript
type CaptionTrack = {
  src: string;           // Caption file URL (.vtt)
  srclang: string;       // Language code (e.g., 'en', 'th')
  label: string;         // Display label
  default?: boolean;     // Default track
};
```

### QualityPreference

```typescript
type QualityPreference =
  | 'auto'                    // Automatic quality selection
  | { levelIndex: number }    // Specific level index
  | { height: number };       // Specific height (e.g., 1080, 720)
```

## Imperative API

The component exposes an imperative handle via `forwardRef`:

```typescript
type HlsVideoPlayerHandle = {
  play: () => Promise<void>;
  pause: () => void;
  toggleMute: () => void;
  setQuality: (pref: QualityPreference) => void;
  getCurrentLevel: () => number;
  getLevels: () => Array<{ index: number; height?: number; bitrateKbps?: number }>;
  getVideoElement: () => HTMLVideoElement | null;
};
```

### Example Usage

```tsx
const playerRef = useRef<HlsVideoPlayerHandle>(null);

// Control playback
const handlePlay = () => playerRef.current?.play();
const handlePause = () => playerRef.current?.pause();
const handleMute = () => playerRef.current?.toggleMute();

// Quality control
const setAutoQuality = () => playerRef.current?.setQuality('auto');
const set1080p = () => playerRef.current?.setQuality({ height: 1080 });

// Get player info
const getCurrentQuality = () => playerRef.current?.getCurrentLevel();
const getAvailableQualities = () => playerRef.current?.getLevels();
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` or `K` | Play/Pause |
| `M` | Mute/Unmute |
| `F` | Toggle Fullscreen |
| `←` | Seek backward 5s |
| `→` | Seek forward 5s |
| `↑` | Increase volume 10% |
| `↓` | Decrease volume 10% |

## Video Interaction

- **Click on video**: Play/Pause toggle (doesn't affect seek position)
- **Click on controls**: Normal control behavior
- **Progress bar**: Visual representation with primary color for progress and muted color for buffering

## Browser Support

### Native HLS Support
- Safari (macOS/iOS)
- Chrome on Android (limited)

### hls.js Support
- Chrome/Chromium 27+
- Firefox 30+
- Edge 12+
- Safari 10+ (fallback)

## Performance Considerations

- **Memory Management**: Component automatically destroys hls.js instances on unmount
- **Event Cleanup**: All event listeners are properly removed
- **Optimized Rendering**: Uses `useCallback` and `useMemo` to prevent unnecessary re-renders
- **Background Processes**: Stats reporting can be disabled to reduce CPU usage

## Error Handling

The component includes comprehensive error handling:

1. **Media Errors**: Automatic recovery attempts
2. **Network Errors**: User-friendly error messages
3. **Fatal Errors**: Graceful degradation with error UI
4. **Timeout Handling**: Configurable timeout for network requests

## Accessibility Features

- **ARIA Labels**: All controls have proper labels
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus indicators
- **Screen Reader Support**: Compatible with assistive technologies
- **Color Contrast**: Meets WCAG AA standards using design tokens

## Testing

Visit `/player` to test the component with:

1. **Example Streams**: Pre-configured test streams
2. **Custom Streams**: Input any HLS URL
3. **Quality Controls**: Test manual quality switching
4. **Keyboard Shortcuts**: Test all keyboard interactions
5. **Error Scenarios**: Test with invalid URLs

## Live Demo

The player page (`/player`) includes:

- Multiple test streams
- Custom URL input
- Quality control buttons
- Player statistics display
- Feature documentation
- Real-time console logging

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure HLS server includes proper CORS headers
2. **Quality Not Switching**: Check if stream has multiple bitrates
3. **Safari Issues**: Verify stream compatibility with native HLS
4. **Performance**: Disable stats reporting for better performance

### Debug Information

Enable debug logging by checking the browser console for:
- Quality changes
- Bandwidth estimates
- Buffer levels
- Error details

## Contributing

When modifying the component:

1. Maintain TypeScript strict mode compliance
2. Update prop types and documentation
3. Test across different browsers
4. Verify accessibility standards
5. Check memory leak scenarios

## License

Part of the KMUTTSTS-Frontend project.
