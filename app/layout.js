import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "레라픽 - 실용적인 IT 정보 블로그",
  description: "윈도우, 스마트폰, 컴퓨터 활용 팁과 문제 해결 방법을 쉽고 정확하게 안내합니다. 일상에서 바로 써먹을 수 있는 실용적인 IT 정보를 제공합니다.",
  metadataBase: new URL('https://www.lerapick.com'),
  keywords: ['IT 블로그', '윈도우', '스마트폰', '컴퓨터 팁', '기술 블로그', '문제 해결', '실용 정보'],
  authors: [{ name: '레라픽' }],
  openGraph: {
    title: '레라픽 - 실용적인 IT 정보 블로그',
    description: '윈도우, 스마트폰, 컴퓨터 활용 팁과 문제 해결 방법을 쉽고 정확하게 안내합니다.',
    url: 'https://www.lerapick.com',
    siteName: '레라픽',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '레라픽 - 실용적인 IT 정보 블로그',
    description: '윈도우, 스마트폰, 컴퓨터 활용 팁과 문제 해결 방법을 쉽고 정확하게 안내합니다.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    // 네이버, 다음 등 다른 검색엔진 인증 코드 추가 가능
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
