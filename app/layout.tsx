import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SkipLink from "@/components/ui/SkipLink";
import UtilityBar from "@/components/ui/UtilityBar";
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Thomas B. Hays — HTML Email & SFMC Developer",
    template: "%s — Thomas B. Hays",
  },
  description:
    "HTML email that holds up in Outlook, HTML5 banners that fit the file-size budget, and web front ends that load fast. 11 years of agency production.",
  metadataBase: new URL("https://thomasbrandonhays.com"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SkipLink />
        <UtilityBar />
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
