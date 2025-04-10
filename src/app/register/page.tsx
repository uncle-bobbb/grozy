import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import RegisterForm from '@/components/forms/RegisterForm'

export const metadata: Metadata = {
  title: '회원가입 | Grozy',
  description: 'Grozy 서비스 회원가입 페이지입니다.',
}

export default function RegisterPage() {
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
          <h2 className="mb-6 text-center text-2xl font-semibold text-neutral-content">회원가입</h2>
          <RegisterForm />
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-medium text-accent hover:text-secondary">
              로그인
            </Link>
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-primary opacity-10 z-0"></div>
    </div>
  )
} 