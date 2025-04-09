"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { LogOut } from "lucide-react"

export default function AuthButtons() {
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (session) {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 px-4 py-2 rounded-md bg-primary hover:bg-secondary text-neutral-content transition-colors"
      >
        <LogOut size={16} />
        로그아웃
      </button>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Link 
        href="/login"
        className="px-4 py-2 rounded-md bg-primary hover:bg-secondary text-neutral-content transition-colors"
      >
        로그인
      </Link>
      <Link 
        href="/register"
        className="px-4 py-2 rounded-md border border-primary hover:bg-neutral text-neutral-content transition-colors"
      >
        회원가입
      </Link>
    </div>
  )
} 