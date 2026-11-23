import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";

const clash = localFont({
  src: [
    { path: "./fonts/ClashDisplay-Semibold.woff2", weight: "600" },
    { path: "./fonts/ClashDisplay-Bold.woff2", weight: "700" },
  ],
  variable: "--font-clash",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Kivlo — Turn long streams into clips worth posting",
  description:
    "Paste a YouTube or Twitch link. Kivlo finds the best moments, crops them to vertical, and adds captions. Fix anything in KivloWorkspace, then post.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${clash.variable} ${manrope.variable} ${jetbrains.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
