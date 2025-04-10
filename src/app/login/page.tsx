import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import LoginForm from '@/components/forms/LoginForm'

export const metadata: Metadata = {
  title: '로그인 | Grozy',
  description: 'Grozy 서비스 로그인 페이지입니다.',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral p-4">
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-neutral-content">Grozy</h1>
          </Link>
          <p className="mt-2 text-sm text-gray-600">과학적 육아 정보의 연결고리</p>
        </div>
        
        <div className="mt-8 rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-center text-2xl font-semibold text-neutral-content">로그인</h2>
          <LoginForm />
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            아직 계정이 없으신가요?{' '}
            <Link href="/register" className="font-medium text-accent hover:text-secondary">
              회원가입
            </Link>
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-primary opacity-10 z-0"></div>
    </div>
  )
} 