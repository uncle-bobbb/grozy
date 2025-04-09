"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import AuthButtons from "./AuthButtons"

export default function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isAdmin = session?.user?.role === "admin"

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="text-xl font-semibold text-neutral-content">
            Grozy
          </Link>

          {/* 햄버거 메뉴 (모바일) */}
          <button
            className="md:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/about" className="text-neutral-content hover:text-accent transition-colors">
              소개
            </Link>
            <Link href="/column" className="text-neutral-content hover:text-accent transition-colors">
              전문가 칼럼
            </Link>
            <Link href="/community" className="text-neutral-content hover:text-accent transition-colors">
              커뮤니티
            </Link>
            {session && (
              <Link href="/mypage" className="text-neutral-content hover:text-accent transition-colors">
                마이페이지
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-neutral-content hover:text-accent transition-colors">
                관리자
              </Link>
            )}
          </nav>

          {/* 인증 버튼 */}
          <div className="hidden md:block">
            <AuthButtons />
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-white border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/about" 
                className="text-neutral-content hover:text-accent transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                소개
              </Link>
              <Link 
                href="/column" 
                className="text-neutral-content hover:text-accent transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                전문가 칼럼
              </Link>
              <Link 
                href="/community" 
                className="text-neutral-content hover:text-accent transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                커뮤니티
              </Link>
              {session && (
                <Link 
                  href="/mypage" 
                  className="text-neutral-content hover:text-accent transition-colors px-2 py-1"
                  onClick={toggleMenu}
                >
                  마이페이지
                </Link>
              )}
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="text-neutral-content hover:text-accent transition-colors px-2 py-1"
                  onClick={toggleMenu}
                >
                  관리자
                </Link>
              )}
              <div className="pt-2 border-t border-border">
                <AuthButtons />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 