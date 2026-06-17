import type { Metadata } from "next";
import { Inter, Poppins, Yeseva_One, Playfair_Display } from "next/font/google";
import "./globals.css";

// Inter for all body text, UI, and standard elements
const inter = Inter({ 
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"], 
  variable: "--font-inter" 
});

// Poppins for headers, titles, and logos
const poppins = Poppins({ 
  weight: ["700", "800"],
  subsets: ["latin"], 
  variable: "--font-poppins" 
});

// Yeseva One for the Hero Agency Name
const yeseva = Yeseva_One({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-roca" 
});

// Playfair Display for the Hero Tagline
const playfair = Playfair_Display({ 
  weight: ["700"],
  subsets: ["latin"], 
  style: "italic",
  variable: "--font-creative" 
});

export const metadata: Metadata = {
  title: "Claim Fame | Agency",
  description: "The real fame story starts here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${yeseva.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}