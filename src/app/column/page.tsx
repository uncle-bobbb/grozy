import { Suspense } from "react";
import { Metadata } from "next";
import ColumnListClient from "./client";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "전문가 칼럼 | 육아톡",
  description: "전문가들이 제공하는 육아 관련 유용한 칼럼 모음",
};

export default function ColumnListPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">전문가 칼럼</h1>
      
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }>
        <ColumnListClient />
      </Suspense>
    </main>
  );
} 