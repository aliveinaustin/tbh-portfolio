import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SkipLink from "@/components/ui/SkipLink";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thomas Brandon Hays — HTML Email, Salesforce Marketing Cloud & Front-End Developer",
  description:
    "Developer working across HTML email, Salesforce Marketing Cloud, HTML5 animated display, and front-end web.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SkipLink />
        {/* <Header /> */}
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
