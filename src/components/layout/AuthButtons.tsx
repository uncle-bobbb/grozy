"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthButtons() {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button
        variant="outline"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-neutral-content hover:text-accent border-primary hover:bg-primary/10 transition-colors"
      >
        로그아웃
      </Button>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href="/login">
        <Button
          variant="outline"
          className="text-neutral-content hover:text-accent border-primary hover:bg-primary/10 transition-colors"
        >
          로그인
        </Button>
      </Link>
      <Link href="/register">
        <Button
          className="bg-primary hover:bg-secondary text-neutral-content transition-colors"
        >
          회원가입
        </Button>
      </Link>
    </div>
  )
} 