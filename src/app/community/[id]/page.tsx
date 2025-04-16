import { Suspense } from "react";
import { Metadata } from "next";
import CommunityDetailClient from "./client";
import { Loader2 } from "lucide-react";

interface CommunityDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: CommunityDetailPageProps): Promise<Metadata> {
  return {
    title: `커뮤니티 게시글 | 육아톡`,
    description: "다른 부모님들과 육아 경험을 나눠보세요",
  };
}

export default async function CommunityDetailPage({ params }: { params: { id: string } }) {
  // params를 await 처리
  const { id } = await params;
  
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }>
        <CommunityDetailClient postId={id} />
      </Suspense>
    </main>
  );
} 