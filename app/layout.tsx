import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const viewport: Viewport = {
  themeColor: "#0b0205",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://365motivos.com"),
  title: "365 Motivos para Te Amar - Cultive o Amor Diariamente",
  description: "Um ano inteiro de mensagens personalizadas de carinho, cumplicidade e amor-próprio. Descubra motivos para amar todos os dias e fortaleça sua conexão.",
  keywords: [
    "365 motivos para te amar",
    "motivos para te amar",
    "mensagens de amor",
    "amor próprio",
    "mensagens românticas",
    "cultivar o amor",
    "casal apaixonado",
    "pwa de amor",
    "mensagens diárias"
  ],
  authors: [{ name: "365 Motivos" }],
  creator: "365 Motivos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "365 Motivos",
  },
  icons: {
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" }
    ]
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://365motivos.com",
    title: "365 Motivos para Te Amar - Cultive o Amor Diariamente",
    description: "Um ano inteiro de mensagens personalizadas de carinho, cumplicidade e amor-próprio. Descubra motivos para amar todos os dias.",
    siteName: "365 Motivos",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Logo 365 Motivos para Te Amar",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "365 Motivos para Te Amar",
    description: "Um ano inteiro de mensagens de carinho e amor-próprio diariamente.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
