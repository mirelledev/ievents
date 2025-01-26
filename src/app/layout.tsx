import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "iEvents",
  description: "Manage your events in the best way!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-900`}
        >
          {children}
        </body>
      </html>
    </SessionWrapper>
  );
}
