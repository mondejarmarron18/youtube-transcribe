import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const metadataDetails = {
  title: "YouTube Transcribe",
  description: "A simple YouTube video transcriber",
  image: "/og.jpg",
};

export const metadata: Metadata = {
  title: metadataDetails.title,
  description: metadataDetails.description,
  openGraph: {
    title: metadataDetails.title,
    description: metadataDetails.description,
    images: [
      {
        url: metadataDetails.image,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: metadataDetails.title,
    description: metadataDetails.description,
    images: [metadataDetails.image],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased dark`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
