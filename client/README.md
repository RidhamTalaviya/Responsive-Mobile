# Responsive Mobile Simulator

A web-based responsive design testing tool built with React and Vite. Test how your websites look on different devices without leaving your browser.

## Features

- 🎯 **Multiple Device Presets** - iPhone, iPad, Samsung Galaxy, Desktop sizes, and more
- 📱 **Custom Device Sizes** - Create custom dimensions for any screen size
- 🔄 **Routing Support** - Properly handles website navigation and redirects
- 🎨 **Modern UI** - Beautiful dark theme interface
- ⚡ **Fast & Lightweight** - Built with Vite for instant hot module replacement
- 📐 **Auto-scaling** - Automatically scales devices to fit your viewport

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Enter a URL** - Type any website URL in the input field at the top (e.g., `example.com` or `https://example.com`)
2. **Select a Device** - Choose from the preset devices in the left panel
3. **Custom Size** - Or create a custom device size by entering width and height
4. **View Your Site** - The website will load in the selected device frame

## Device Presets

- **Mobile**: iPhone 14 Pro, iPhone 14 Pro Max, iPhone 12 Pro, iPhone SE, Samsung Galaxy S21
- **Tablet**: iPad Pro, iPad Air
- **Desktop**: 1920x1080, 1440x900, 1280x720

## Technical Details

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: CSS3 with modern features
- **Iframe Sandbox**: Configured to allow necessary features while maintaining security

## Notes

- Some websites may block iframe embedding (X-Frame-Options). In such cases, the website won't load in the simulator.
- The iframe uses sandbox attributes for security, which may limit some features on certain websites.
- Routing and redirects work within the iframe, so you can navigate through the website normally.

## License

MIT

