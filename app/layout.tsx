import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "ARCHZZ · Professional 3D Models", description: "Interactive product prototype for ArchZZ model discovery and commerce." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
