# Technology Stack & Languages

This document outlines the core technologies, languages, and libraries used to build the **Interactive Periodic Table** application.

## Core Technologies

### Frontend Framework
*   **[React](https://react.dev/) (v19)**: A JavaScript library for building user interfaces. The application uses functional components and modern hooks (useState, useEffect, useMemo) for state management and side effects.
*   **JSX**: Syntax extension for JavaScript, allowing HTML-like code within JavaScript files.

### Language
*   **[JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) (ES6+)**: The primary programming language used for logic and interactivity.

### Build Tooling
*   **[Vite](https://vitejs.dev/)**: A fast build tool and development server that provides Hot Module Replacement (HMR) and optimized production builds.

### Styling
*   **[Tailwind CSS](https://tailwindcss.com/) (v4)**: A utility-first CSS framework for rapid UI development.
*   **PostCSS & Autoprefixer**: Used for processing CSS and ensuring cross-browser compatibility.

## Mobile Development

*   **[Capacitor](https://capacitorjs.com/) (v6)**: A cross-platform runtime that allows the web app to run natively on iOS and Android.
    *   `@capacitor/core`: Core runtime.
    *   `@capacitor/ios`: iOS platform support.
    *   `@capacitor/android`: Android platform support.
    *   `@capacitor/status-bar`: Plugin to control the native status bar.
    *   `@capacitor/screen-orientation`: Plugin to handle screen orientation locks.

## 3D Visualization

The application features 3D models of atoms (Bohr model) and crystal structures.

*   **[Three.js](https://threejs.org/)**: A low-level 3D graphics library.
*   **[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)**: A React renderer for Three.js, allowing declarative 3D scenes.
*   **[@react-three/drei](https://github.com/pmndrs/drei)**: A collection of useful helpers and abstractions for React Three Fiber (e.g., `OrbitControls`, `Html`).

## Icons & Assets

*   **[Lucide React](https://lucide.dev/)**: A clean and consistent icon library used for UI elements (Search, Close, Volume, etc.).

## Deployment & Infrastructure

*   **GitHub Actions**: CI/CD pipelines for automated building and deployment.
*   **AWS EC2**: Hosting server for the production application.
*   **Nginx**: Web server and reverse proxy used to serve the static assets on the EC2 instance.
*   **PM2**: Process manager (though primarily for Node.js apps, likely used here for serving static files via a simple server or ensuring uptime if a backend exists).

## Key Libraries

| Library | Purpose |
| :--- | :--- |
| `react` | UI Component/View Layer |
| `react-dom` | DOM rendering and Portals |
| `vite` | Bundler & Dev Server |
| `tailwindcss` | Styling |
| `@capacitor/core` | Native Mobile Bridge |
| `@react-three/fiber` | 3D Rendering in React |
| `lucide-react` | Icons |

## Development Setup

The project uses `npm` for dependency management.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for web
npm run build

# Build for mobile
npm run build:mobile
```
