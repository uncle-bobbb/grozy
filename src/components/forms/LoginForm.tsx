'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { z } from 'zod'

// 로그인 유효성 검사를 위한 스키마
const loginSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해 주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
})

export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginError('')
    
    try {
      // 폼 유효성 검사
      loginSchema.parse(formData)
      
      setIsLoading(true)
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.error) {
        setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.')
        setIsLoading(false)
        return
      }

      // 로그인 성공 후 홈페이지로 이동
      router.push('/')
      router.refresh()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        setLoginError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      }
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-content">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.email ? 'border-red-500' : 'border-border'
          } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          placeholder="이메일 주소를 입력하세요"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-content">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.password ? 'border-red-500' : 'border-border'
          } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          placeholder="비밀번호를 입력하세요"
        />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
            로그인 상태 유지
          </label>
        </div>

        <div className="text-sm">
          <a href="#" className="font-medium text-accent hover:text-secondary">
            비밀번호를 잊으셨나요?
          </a>
        </div>
      </div>

      {loginError && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-500">{loginError}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-neutral-content shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-70"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">또는</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-neutral-content shadow-sm hover:bg-neutral"
        >
          구글로 계속하기
        </button>
        <button
          type="button"
          className="flex items-center justify-center rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-neutral-content shadow-sm hover:bg-neutral"
        >
          카카오로 계속하기
        </button>
      </div>
    </form>
  )
} 