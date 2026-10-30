import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactButtons from "@/components/ContactButtons";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Leading Light Educational Services | B.Tech & Agriculture Admission Guidance, Hyderabad",
  description:
    "Find colleges that fit your EAPCET rank using verified historical cutoffs, and get counselling from our Hyderabad team.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ContactButtons />
      </body>
    </html>
  );
}
