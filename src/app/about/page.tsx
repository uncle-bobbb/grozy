'use client'

import React from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* 히어로 섹션 */}
      <section className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
        <Image
          src="https://picsum.photos/seed/about-hero/1200/500"
          alt="Grozy 소개 배너 이미지"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-center">
            과학적 육아 정보의 중심, Grozy
          </h1>
          <p className="text-lg md:text-xl max-w-3xl text-center">
            전 세계의 검증된 육아 정보를 한 곳에 모아 부모님들의 올바른 선택을 돕습니다
          </p>
        </div>
      </section>

      {/* 비전 및 소개 섹션 */}
      <section className="py-12 md:py-16 lg:py-20 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
              Grozy의 비전
            </h2>
            <p className="text-gray-700 mb-4">
              Grozy는 전 세계의 과학적 육아 정보를 연결하는 플랫폼입니다. 육아는 과학적인 근거와 검증된 방법으로
              접근해야 합니다. 하지만 현실에서는 수많은 정보가 혼재되어 있어 어떤 방법이 올바른지 판단하기 어렵습니다.
            </p>
            <p className="text-gray-700 mb-4">
              저희는 전문가 네트워크를 통해 부모님이 안심하고 믿을 수 있는 정보를 제공하고, 사용자들이 자신의 경험을
              나누며 함께 성장할 수 있는 커뮤니티를 만들고자 합니다.
            </p>
            <p className="text-gray-700">
              Grozy와 함께라면 육아의 불확실성을 줄이고, 아이의 건강한 성장을 이끌어 나갈 수 있습니다.
            </p>
          </div>
          <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://picsum.photos/seed/vision/600/800"
              alt="Grozy 비전 이미지"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 핵심 가치 섹션 */}
      <section className="py-12 bg-primary-50 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-800">
            Grozy의 핵심 가치
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">과학적 검증</h3>
              <p className="text-gray-700">
                모든 정보는 과학적 연구와 검증된 데이터를 기반으로 제공합니다. 전문가들의 리뷰를 거쳐 신뢰할 수 있는
                콘텐츠만을 전달합니다.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">공동체 지혜</h3>
              <p className="text-gray-700">
                육아의 경험은 모두에게 다릅니다. 다양한 부모님들의 경험과 지혜를 모아 더 풍부한 정보를 나눕니다.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">접근성</h3>
              <p className="text-gray-700">
                누구나 쉽게 접근하고 이해할 수 있는 정보를 제공합니다. 복잡한 연구 결과도 이해하기 쉽게 전달합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 전문가 소개 섹션 */}
      <section className="py-12 md:py-16 lg:py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-800">
          Grozy의 전문가 그룹
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experts.map((expert, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src={expert.image}
                  alt={`${expert.name} 전문가 프로필`}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1 text-gray-800">{expert.name}</h3>
              <p className="text-primary-600 mb-3">{expert.role}</p>
              <p className="text-gray-700 mb-4 text-sm">{expert.description}</p>
              <a
                href={expert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                프로필 더보기 <ExternalLink className="ml-1 w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-12 bg-primary-100 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
            Grozy와 함께 시작하세요
          </h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            과학적 근거를 바탕으로 한 육아 정보, 다른 부모님들과의 경험 공유, 전문가의 조언까지 - 모두 Grozy에서
            만나보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              회원가입하기
            </a>
            <a
              href="/column"
              className="px-6 py-3 border border-primary-500 text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
            >
              전문가 칼럼 보기
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

// 샘플 전문가 데이터
const experts = [
  {
    name: '김민지 교수',
    role: '아동발달 전문가',
    image: 'https://picsum.photos/seed/expert1/200/200',
    description: '서울대학교 아동발달학과 교수. 20년 이상의 연구 경력을 바탕으로 아동의 인지 및 정서 발달에 관한 전문 지식을 제공합니다.',
    link: '#',
  },
  {
    name: '이준호 박사',
    role: '육아 심리학자',
    image: 'https://picsum.photos/seed/expert2/200/200',
    description: '영유아 심리 전문의. 부모-자녀 관계 형성과 아이의 건강한 정서 발달을 위한 실질적인 조언을 제공합니다.',
    link: '#',
  },
  {
    name: '최서연 소장',
    role: '부모교육 전문가',
    image: 'https://picsum.photos/seed/expert3/200/200',
    description: '육아종합지원센터 소장. 다양한 부모교육 프로그램을 개발하고 부모의 역할과 자녀 양육에 관한 전문적인 가이드를 제공합니다.',
    link: '#',
  },
] 