'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { signIn } from "next-auth/react";
import { KakaoIcon } from "../icons/KakaoIcon";
import GoogleIcon from "@/components/icons/GoogleIcon";

// 회원가입 유효성 검사를 위한 스키마
const registerSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.').max(20, '이름은 20자 이하여야 합니다.'),
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다.').max(20, '닉네임은 20자 이하여야 합니다.'),
  email: z.string().email('유효한 이메일 주소를 입력해 주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: '서비스 이용약관에 동의해 주세요.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
})

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [isNicknameChecked, setIsNicknameChecked] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const inputValue = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: inputValue }))
    
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // 닉네임 중복 확인 함수
  const checkNicknameDuplicate = async () => {
    if (!formData.nickname || formData.nickname.length < 2) {
      setErrors(prev => ({ ...prev, nickname: '닉네임은 2자 이상이어야 합니다.' }));
      return;
    }
    
    setIsChecking(true);
    
    try {
      const response = await fetch(`/api/auth/check-nickname?nickname=${encodeURIComponent(formData.nickname)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '닉네임 중복 확인 중 오류가 발생했습니다.');
      }
      
      if (data.exists) {
        setErrors(prev => ({ ...prev, nickname: '이미 사용 중인 닉네임입니다.' }));
        setIsNicknameChecked(false);
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.nickname;
          return newErrors;
        });
        setIsNicknameChecked(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrors(prev => ({ ...prev, nickname: error.message }));
      } else {
        setErrors(prev => ({ ...prev, nickname: '닉네임 중복 확인 중 오류가 발생했습니다.' }));
      }
      setIsNicknameChecked(false);
    } finally {
      setIsChecking(false);
    }
  };

  // 닉네임 변경 시 중복 확인 상태 리셋
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsNicknameChecked(false);
    handleChange(e);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setRegisterError('')
    
    // 닉네임이 변경되었거나 중복 확인이 안된 경우
    if (!isNicknameChecked) {
      setErrors(prev => ({ ...prev, nickname: '닉네임 중복 확인이 필요합니다.' }));
      return;
    }
    
    try {
      // 폼 유효성 검사
      registerSchema.parse(formData)
      
      setIsLoading(true)
      
      // 닉네임이 중복 확인된 후 변경되었는지 재확인
      const response = await fetch(`/api/auth/check-nickname?nickname=${encodeURIComponent(formData.nickname)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const nicknameCheck = await response.json();
      
      if (!response.ok) {
        throw new Error(nicknameCheck.message || '닉네임 중복 확인 중 오류가 발생했습니다.');
      }
      
      if (nicknameCheck.exists) {
        setErrors(prev => ({ ...prev, nickname: '이미 사용 중인 닉네임입니다.' }));
        setIsLoading(false);
        setIsNicknameChecked(false);
        return;
      }
      
      // 회원가입 API 호출 - 이름과 닉네임 필드 모두 전송
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          nickname: formData.nickname,
          email: formData.email,
          password: formData.password,
        }),
      })

      // 응답 처리
      const data = await registerResponse.json()
      console.log('회원가입 응답:', data) // 디버깅용 로그

      if (!registerResponse.ok) {
        throw new Error(data.message || '회원가입 중 오류가 발생했습니다.')
      }

      // 회원가입 성공 후 로그인 페이지로 이동
      router.push('/login?registered=true')
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      } else if (error instanceof Error) {
        setRegisterError(error.message)
      } else {
        setRegisterError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      }
      console.error('회원가입 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 카카오 로그인 처리 함수 추가
  const handleKakaoSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("kakao", { callbackUrl: "/" });
    } catch (error) {
      console.error("카카오 로그인 오류:", error);
      setRegisterError("카카오 로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-content">
          이름
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.name ? 'border-red-500' : 'border-border'
          } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          placeholder="실명을 입력하세요 (2-20자)"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-neutral-content">
          닉네임
        </label>
        <div className="flex">
          <input
            id="nickname"
            name="nickname"
            type="text"
            required
            value={formData.nickname}
            onChange={handleNicknameChange}
            className={`mt-1 block w-full rounded-l-md border-y border-l ${
              errors.nickname ? 'border-red-500' : 'border-border'
            } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
            placeholder="닉네임을 입력하세요 (2-20자)"
          />
          <button
            type="button"
            onClick={checkNicknameDuplicate}
            disabled={isChecking || isLoading || !formData.nickname || formData.nickname.length < 2}
            className="mt-1 flex items-center justify-center whitespace-nowrap rounded-r-md border border-l-0 border-border bg-neutral px-3 py-2 text-sm font-medium text-neutral-content shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-70"
          >
            {isChecking ? "확인 중" : isNicknameChecked ? "확인 완료" : "중복 확인"}
          </button>
        </div>
        {errors.nickname && <p className="mt-1 text-xs text-red-500">{errors.nickname}</p>}
        {isNicknameChecked && !errors.nickname && (
          <p className="mt-1 text-xs text-green-500">사용 가능한 닉네임입니다.</p>
        )}
      </div>

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
          placeholder="비밀번호를 입력하세요 (6자 이상)"
        />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-content">
          비밀번호 확인
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.confirmPassword ? 'border-red-500' : 'border-border'
          } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          placeholder="비밀번호를 다시 입력하세요"
        />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
      </div>

      <div className="flex items-center">
        <input
          id="agreeTerms"
          name="agreeTerms"
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-600">
          <span>Grozy의 </span>
          <a href="#" className="font-medium text-accent hover:text-secondary">
            서비스 이용약관
          </a>
          <span> 및 </span>
          <a href="#" className="font-medium text-accent hover:text-secondary">
            개인정보 처리방침
          </a>
          <span>에 동의합니다.</span>
        </label>
      </div>
      {errors.agreeTerms && <p className="mt-1 text-xs text-red-500">{errors.agreeTerms}</p>}

      {registerError && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-500">{registerError}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-neutral-content shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-70"
        >
          {isLoading ? '처리 중...' : '회원가입'}
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
          onClick={() => signIn("google", { callbackUrl: "/" })}
          disabled={isLoading}
        >
          {isLoading ? (
            "처리 중..."
          ) : (
            <>
              <GoogleIcon className="mr-2 h-4 w-4" />
              구글로 가입하기
            </>
          )}
        </button>
        <button
          type="button"
          className="flex items-center justify-center rounded-md border border-[#FEE500] bg-[#FEE500] px-4 py-2 text-sm font-medium text-[#000000] shadow-sm hover:bg-[#FFDD00]"
          onClick={handleKakaoSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            "처리 중..."
          ) : (
            <>
              <KakaoIcon className="mr-2 h-4 w-4" />
              카카오로 가입하기
            </>
          )}
        </button>
      </div>
    </form>
  )
} 