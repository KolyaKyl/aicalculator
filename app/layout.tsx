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
  title: "AI Calculator — Ask Anything, Calculate Instantly",
  description:
    "Free AI calculator for mortgage payments, salary after tax, currency conversion, percentages, tip, BMI, and everyday math. Just ask naturally — get instant answers with explanations.",
  metadataBase: new URL("https://aicalculator.cloud"),
  keywords: [
    "ai calculator",
    "mortgage calculator",
    "salary calculator",
    "currency converter",
    "tip calculator",
    "percentage calculator",
    "bmi calculator",
    "voice calculator",
    "math solver",
    "calorie calculator",
    "loan calculator",
    "tax calculator",
  ],
  authors: [{ name: "F_one", url: "https://aicalculator.cloud" }],
  creator: "F_one",
  publisher: "AI Calculator",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "AI Calculator — Ask Anything, Calculate Instantly",
    description:
      "Free AI calculator for mortgage payments, salary after tax, currency conversion, percentages, tip, BMI, and everyday math. Just ask naturally — get instant answers with explanations.",
    url: "https://aicalculator.cloud",
    siteName: "AI Calculator",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "AI Calculator — ask anything, calculate instantly",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Calculator — Ask Anything, Calculate Instantly",
    description:
      "Mortgage, salary, currency, tips, percentages – get answers in seconds. Just ask naturally.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon.png",
    },
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://aicalculator.cloud",
  },
  category: "calculator",
  classification: "online calculator tool",
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