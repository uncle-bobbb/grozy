'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Github, Copy, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import Image from "next/image";
import Link from "next/link";
import NoticeBanner from "@/components/common/NoticeBanner";
import ColumnList from "@/components/lists/ColumnList";
import CommunityList from "@/components/lists/CommunityList";

const PACKAGE_NAME = '@easynext/cli';
const CURRENT_VERSION = 'v0.1.35';

function latestVersion(packageName: string) {
  return axios
    .get('https://registry.npmjs.org/' + packageName + '/latest')
    .then((res) => res.data.version);
}

export default function Home() {
  const { toast } = useToast();
  const [latest, setLatest] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestVersion = async () => {
      try {
        const version = await latestVersion(PACKAGE_NAME);
        setLatest(`v${version}`);
      } catch (error) {
        console.error('Failed to fetch version info:', error);
      }
    };
    fetchLatestVersion();
  }, []);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(`npm install -g ${PACKAGE_NAME}@latest`);
    toast({
      description: 'Update command copied to clipboard',
    });
  };

  const needsUpdate = latest && latest !== CURRENT_VERSION;

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/seed/root-hero/1600/800"
            alt="Grozy 메인 이미지"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center md:items-start">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 text-center md:text-left max-w-2xl">
            과학적·논리적 육아 정보를 한 곳에 모았습니다
          </h1>
          <p className="text-xl text-white mb-8 text-center md:text-left max-w-xl">
            자녀의 건강한 성장을 Grozy와 함께해 보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/column"
              className="px-6 py-3 rounded-md bg-primary hover:bg-secondary text-neutral-content font-semibold transition-colors"
            >
              전문가 칼럼 보기
            </Link>
            <Link
              href="/community"
              className="px-6 py-3 rounded-md bg-white hover:bg-gray-100 text-neutral-content font-semibold transition-colors"
            >
              커뮤니티 참여하기
            </Link>
          </div>
        </div>
      </section>

      {/* 공지사항 배너 */}
      <NoticeBanner />

      {/* 최신 칼럼 섹션 */}
      <ColumnList />

      {/* 인기 게시글 섹션 */}
      <CommunityList />

      {/* 서비스 소개 섹션 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content mb-4">
                왜 Grozy를 선택해야 할까요?
              </h2>
              <p className="text-neutral-content mb-6">
                Grozy는 전문가들이 검증한 과학적인 육아 정보를 제공합니다. 불확실한 정보에 혼란스러워하지 마세요. 전문가의 칼럼과 다양한 부모님들의 경험을 통해 더 나은 육아 여정을 시작하세요.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>전문가가 검증한 과학적 육아 정보</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>다양한 부모님들의 실제 경험 공유</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>아이의 발달 단계별 맞춤형 정보</span>
                </li>
              </ul>
              <Link
                href="/about"
                className="inline-flex items-center mt-6 px-4 py-2 border border-primary rounded-md bg-white text-neutral-content hover:bg-neutral transition-colors"
              >
                더 알아보기
              </Link>
            </div>
            <div className="md:w-1/2 mt-6 md:mt-0">
              <div className="relative h-[350px] w-full overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="https://picsum.photos/seed/about-section/800/600"
                  alt="Grozy 소개 이미지"
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform hover:scale-105 duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 가입 유도 섹션 */}
      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content mb-4">
            지금 바로 Grozy와 함께하세요
          </h2>
          <p className="text-neutral-content mb-8 max-w-2xl mx-auto">
            회원가입을 통해 더 많은 육아 정보를 얻고, 다른 부모님들과 경험을 나눠보세요.
            Grozy는 여러분의 육아 여정을 더욱 풍요롭게 만들어 드립니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3 rounded-md bg-white text-neutral-content font-semibold hover:bg-gray-100 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 rounded-md bg-secondary text-white font-semibold hover:bg-accent transition-colors"
            >
              회원가입
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section() {
  const items = [
    { href: 'https://nextjs.org/', label: 'Next.js' },
    { href: 'https://ui.shadcn.com/', label: 'shadcn/ui' },
    { href: 'https://tailwindcss.com/', label: 'Tailwind CSS' },
    { href: 'https://www.framer.com/motion/', label: 'framer-motion' },
    { href: 'https://zod.dev/', label: 'zod' },
    { href: 'https://date-fns.org/', label: 'date-fns' },
    { href: 'https://ts-pattern.dev/', label: 'ts-pattern' },
    { href: 'https://es-toolkit.dev/', label: 'es-toolkit' },
    { href: 'https://zustand.docs.pmnd.rs/', label: 'zustand' },
    { href: 'https://supabase.com/', label: 'supabase' },
    { href: 'https://react-hook-form.com/', label: 'react-hook-form' },
  ];

  return (
    <div className="flex flex-col py-5 md:py-8 space-y-2 opacity-75">
      <p className="font-semibold">What&apos;s Included</p>

      <div className="flex flex-col space-y-1 text-muted-foreground">
        {items.map((item) => (
          <SectionItem key={item.href} href={item.href}>
            {item.label}
          </SectionItem>
        ))}
      </div>
    </div>
  );
}

function SectionItem({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 underline"
      target="_blank"
    >
      <CheckCircle className="w-4 h-4" />
      <p>{children}</p>
    </a>
  );
}
