import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactButtons from "@/components/ContactButtons";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap" });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Leading Light Educational Services | Your +2 journey, guided",
  description:
    "From choosing the right course to finding a college that fits your goals, we help B.Tech and Agriculture students across Andhra Pradesh and Telangana understand their options and take the next step with confidence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="skip-link">Skip to main content</a>
        <Suspense fallback={<div className="site-header sticky top-0 z-30 h-16" aria-hidden="true" />}>
          <Header />
        </Suspense>
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <ContactButtons />
      </body>
    </html>
  );
}
