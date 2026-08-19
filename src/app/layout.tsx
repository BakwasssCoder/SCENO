import type { Metadata } from "next";
import { Space_Grotesk, Inter, Bangers } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const bangers = Bangers({
  variable: "--font-comic",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "SCENO — Discover the scene. Join it. Build your own.",
    template: "%s · SCENO",
  },
  description:
    "Find what's happening tonight in your city, get entry to the best parties and club nights, or build your own event from scratch. Starting in Kolkata.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${bangers.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
