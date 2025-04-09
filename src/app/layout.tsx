import { Inter } from "next/font/google"
import { getServerSession } from "next-auth/next"
import { AuthProvider } from "@/components/auth/auth-provider"
import Topbar from "@/components/layout/Topbar"
import Footer from "@/components/layout/Footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Grozy - 과학적 육아 정보 플랫폼",
  description: "과학적·논리적 육아 정보를 한 곳에 모았습니다. 자녀의 건강한 성장을 Grozy와 함께해 보세요.",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider session={session}>
          <div className="flex flex-col min-h-screen bg-neutral">
            <Topbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
