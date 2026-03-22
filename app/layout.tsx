import './globals.css';
import type { Metadata, Viewport } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const siteUrl = 'https://lessup.github.io/graph-viewer/';
const iconUrl = isGitHubPages ? '/graph-viewer/favicon.svg' : '/favicon.svg';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'GraphViewer',
  description: '支持 Mermaid、Graphviz、PlantUML 等多种语法的图表可视化工具',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GraphViewer',
    description: '支持 Mermaid、Graphviz、PlantUML 等多种语法的图表可视化工具',
    url: siteUrl,
    siteName: 'GraphViewer',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'GraphViewer',
    description: '支持 Mermaid、Graphviz、PlantUML 等多种语法的图表可视化工具',
  },
  icons: { icon: iconUrl },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen text-gray-900 antialiased">{children}</body>
    </html>
  );
}
