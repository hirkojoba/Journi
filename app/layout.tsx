import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Journi - AI Travel Planner",
  description: "Plan your perfect trip with AI-powered multimodal travel planning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
