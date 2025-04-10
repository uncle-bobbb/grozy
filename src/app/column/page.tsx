"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import ColumnList from "@/components/lists/ColumnList";
import { Search } from "lucide-react";

export default function ColumnPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  
  // 전문가 유형인지 확인 (실제로는 세션 정보에서 가져와야 함)
  const isExpert = session?.user?.role === "expert";
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색 로직 구현
    console.log("검색어:", searchTerm);
    // 실제 구현 시에는 API 호출 또는 필터링 로직을 추가합니다
  };
  
  const handleWriteClick = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (isExpert) {
      router.push("/column/write");
    } else {
      // 전문가가 아닌 경우 안내 메시지
      alert("전문가만 칼럼을 작성할 수 있습니다.");
    }
  };
  
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">전문가 칼럼</h1>
            <p className="text-neutral-content text-sm md:text-base">
              아동발달 및 교육 전문가들이 작성한 과학적 근거의 칼럼을 만나보세요.
            </p>
          </div>
          
          {/* 전문가인 경우에만 칼럼 작성 버튼 표시 */}
          {isExpert && (
            <Button 
              onClick={handleWriteClick}
              className="mt-4 md:mt-0 bg-primary hover:bg-secondary text-white"
            >
              칼럼 작성하기
            </Button>
          )}
        </div>
        
        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="칼럼 제목 또는 내용을 검색하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border"
            />
          </div>
          <Button type="submit" className="bg-primary hover:bg-secondary">
            검색
          </Button>
        </form>
      </section>
      
      {/* 칼럼 목록 컴포넌트 */}
      <ColumnList />
      
      {/* 페이지네이션 */}
      <div className="mt-8 flex justify-center">
        <Pagination count={10} page={1} onChange={(page) => console.log("페이지 변경:", page)} />
      </div>
    </main>
  );
} 