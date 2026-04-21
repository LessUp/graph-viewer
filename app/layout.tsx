import './globals.css';
import type { Metadata, Viewport } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const siteUrl = 'https://lessup.github.io/graph-viewer/';
const iconUrl = isGitHubPages ? '/graph-viewer/favicon.svg' : '/favicon.svg';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GraphViewer - Diagram Visualization Tool',
    template: '%s | GraphViewer',
  },
  description: 'All-in-One Diagram Viewer with 16+ Engines. Mermaid, PlantUML, Graphviz, D2 & More.',
  keywords: ['diagram', 'mermaid', 'plantuml', 'graphviz', 'visualization', 'flowchart', 'uml'],
  authors: [{ name: 'GraphViewer Team' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GraphViewer - Diagram Visualization Tool',
    description: 'All-in-One Diagram Viewer with 16+ Engines. Mermaid, PlantUML, Graphviz, D2 & More.',
    url: siteUrl,
    siteName: 'GraphViewer',
    type: 'website',
    images: [
      {
        url: isGitHubPages ? '/graph-viewer/og-image.png' : '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GraphViewer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GraphViewer - Diagram Visualization Tool',
    description: 'All-in-One Diagram Viewer with 16+ Engines',
    images: [isGitHubPages ? '/graph-viewer/og-image.png' : '/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: { icon: iconUrl },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-gray-900 antialiased">{children}</body>
    </html>
  );
}
