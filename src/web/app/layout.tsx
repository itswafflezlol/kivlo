import type { Metadata } from "next";
import localFont from "next/font/local";
import { Anton, Archivo_Black, Bangers, Bebas_Neue, JetBrains_Mono, Manrope, Oswald, Permanent_Marker, Poppins } from "next/font/google";
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

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo-black" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-poppins" });
const bangers = Bangers({ subsets: ["latin"], weight: "400", variable: "--font-bangers" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker" });

export const metadata: Metadata = {
  title: "Kivlo — Turn long streams into clips worth posting",
  description:
    "Paste a YouTube or Twitch link. Kivlo finds the best moments, crops them to vertical, and adds captions. Fix anything in KivloWorkspace, then post.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('kivlo.theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d&&/(?:^|\\/)(app|admin)(?=\\/|$)/.test(location.pathname))document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${clash.variable} ${manrope.variable} ${jetbrains.variable} ${bebas.variable} ${anton.variable} ${archivoBlack.variable} ${oswald.variable} ${poppins.variable} ${bangers.variable} ${marker.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
