import "./globals.css";

export const metadata = {
  title: "Graph Viewer",
  description: "Diagram renderer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen text-gray-900 antialiased">{children}</body>
    </html>
  );
}
