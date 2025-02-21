import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { persian } from "@/lib/persian";

const inter = Inter({ subsets: ["latin"] });
const vazirmatn = Vazirmatn({ subsets: ["arabic"], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] });

export const metadata = {
  title: persian["Planito"] || "Planito",
  description:
    persian["Plan with purpose, achieve with clarity - Your intelligent personal planning companion"] || "Plan with purpose, achieve with clarity - Your intelligent personal planning companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning dir="rtl">
      <body className={vazirmatn.className}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
