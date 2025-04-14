import { Suspense } from "react";
import { Metadata } from "next";
import ColumnDetailClient from "./client";
import { Loader2 } from "lucide-react";

interface ColumnDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ColumnDetailPageProps): Promise<Metadata> {
  return {
    title: `칼럼 상세 | 육아톡`,
    description: "전문가의 육아 관련 칼럼을 읽어보세요",
  };
}

export default async function ColumnDetailPage({ params }: { params: { id: string } }) {
  // params를 await 처리
  const { id } = await params;
  
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }>
        <ColumnDetailClient columnId={id} />
      </Suspense>
    </main>
  );
} 