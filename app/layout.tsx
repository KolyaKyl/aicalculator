import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Calculator",
  description:
    "AI-powered calculator for mortgage, salary, tip, BMI, currency conversion, percentages and more. Just ask in plain language — get the answer instantly.",
  metadataBase: new URL("https://aicalculator.cloud"),
  openGraph: {
    title: "Ask Anything, Calculate Instantly",
    description:
      "AI-powered calculator for mortgage, salary, tip, BMI, currency conversion and more. Just ask in plain language.",
    url: "https://aicalculator.cloud",
    siteName: "AI Calculator",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Ask Anything, Calculate Instantly",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask Anything, Calculate Instantly",
    description:
      "AI-powered calculator for mortgage, salary, tip, BMI, currency and more.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}