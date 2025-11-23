import type { Metadata } from "next";
import { ReactNode } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuddyScript",
    template: "%s | BuddyScript",
  },
  description: "BuddyScript social experience rebuilt with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} ${poppins.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
