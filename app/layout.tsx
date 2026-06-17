import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import Footer from "@/components/Footer";
import MainWithQuotePadding from "@/components/MainWithQuotePadding";
import Navbar from "@/components/Navbar";
import QuoteSelectionSidebar from "@/components/QuoteSelectionSidebar";
import { QuoteSelectionProvider } from "@/lib/quote-selection";
import PageLoadingBar from "@/components/PageLoadingBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fica Tostadores | Maquinaria Industrial de Tostado",
  description:
    "Tostadores de café TLC, tostadores comerciales e industriales, molinos y equipos de procesamiento. Fabricación chilena, IX Región.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${oswald.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <QuoteSelectionProvider>
          <PageLoadingBar />
          <Navbar />
          <QuoteSelectionSidebar />
          <MainWithQuotePadding>{children}</MainWithQuotePadding>
          <Footer />
        </QuoteSelectionProvider>
      </body>
    </html>
  );
}
