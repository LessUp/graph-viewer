import "./globals.css";
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "GraphViewer",
  description: "支持 Mermaid、Graphviz、PlantUML 等多种语法的图表可视化工具",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={jetbrainsMono.variable}>
      <body className="min-h-screen text-gray-900 antialiased">{children}</body>
    </html>
  );
}
