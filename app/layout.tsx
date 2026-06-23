import type { Metadata } from "next";
import { Dancing_Script, Nunito } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/lib/posthog";

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Signs by Sophia | Custom Hand-Painted Banners",
  description:
    "Custom hand-painted banners on brown kraft paper for any occasion — birthdays, graduations, bachelorettes & more. Based in Norman, OK. US shipping available.",
  openGraph: {
    title: "Signs by Sophia",
    description: "Custom hand-painted banners for every celebration.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dancingScript.variable} ${nunito.variable}`}>
      <body className="min-h-screen bg-cream antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
