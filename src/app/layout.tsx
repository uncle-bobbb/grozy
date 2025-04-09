import { Inter } from "next/font/google"
import "./globals.css"
import Topbar from "@/components/layout/Topbar"
import Footer from "@/components/layout/Footer"
import AuthProvider from "@/components/auth/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Grozy - 과학적 육아 정보 플랫폼",
  description: "과학적이고 논리적인 육아 정보를 한 곳에 모았습니다. 자녀의 건강한 성장을 Grozy와 함께하세요.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <Topbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
