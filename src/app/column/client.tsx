"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ColumnModel } from "@/types";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import ColumnList from "@/components/lists/ColumnList";
import { Loader2, PenSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ColumnListClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 현재 페이지 번호
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  // 검색어 파라미터 추가
  const searchQuery = searchParams.get("q") || "";
  
  const [columns, setColumns] = useState<ColumnModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: currentPage,
    limit: 9, // 기본값
    totalItems: 0,
    totalPages: 0,
  });
  
  // 검색어 상태 추가
  const [searchInput, setSearchInput] = useState(searchQuery);
  
  // 정렬 상태
  const [sortBy, setSortBy] = useState("created_at");
  const [orderBy, setOrderBy] = useState("desc");
  
  // 현재 화면 크기
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  
  // 화면 크기에 따라 페이지 크기 계산
  const getPageSizeForScreenWidth = (width: number): number => {
    if (width >= 1024) { // lg 사이즈 (3열)
      return 9; // 3x3 그리드
    } else if (width >= 768) { // md 사이즈 (2열)
      return 8; // 2x4 그리드 (짝수로 설정하여 마지막 행이 완전히 채워지도록)
    } else { // sm 사이즈 (1열)
      return 5; // 1x5 그리드
    }
  };
  
  // 현재 페이지 크기
  const pageSize = getPageSizeForScreenWidth(screenWidth);
  
  // 브라우저 크기 변경 감지
  useEffect(() => {
    // 초기 화면 크기 설정
    if (typeof window !== 'undefined') {
      setScreenWidth(window.innerWidth);
    }
    
    // 리사이즈 이벤트 리스너
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);
  
  // 데이터 가져오기
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        setLoading(true);
        
        const currentLimit = getPageSizeForScreenWidth(screenWidth);
        
        // URL 파라미터 설정
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("limit", currentLimit.toString());
        params.set("sort", sortBy);
        params.set("order", orderBy);
        // 검색어 파라미터 추가
        if (searchQuery) {
          params.set("q", searchQuery);
        }
        
        console.log(`페이지 크기: ${currentLimit}, 페이지: ${currentPage}, 검색어: ${searchQuery}`); // 디버깅용
        
        const response = await fetch(`/api/columns?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("칼럼 목록을 불러오는데 실패했습니다.");
        }
        
        const data = await response.json();
        
        setColumns(data.columns || []);
        setPagination({
          page: data.pagination.page || 1,
          limit: data.pagination.limit || currentLimit,
          totalItems: data.pagination.totalItems || 0,
          totalPages: data.pagination.totalPages || 0,
        });
      } catch (err: any) {
        console.error("칼럼 목록 불러오기 오류:", err);
        setError(err.message || "칼럼 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchColumns();
  }, [currentPage, screenWidth, sortBy, orderBy, searchQuery]);
  
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/column?${params.toString()}`);
  };
  
  const handleWriteClick = () => {
    router.push("/column/write");
  };
  
  const isExpertOrAdmin = session?.user?.role === "expert" || session?.user?.role === "admin";
  
  // 검색 함수 추가
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 검색어가 있을 때만 처리
    if (searchInput.trim()) {
      // 새 URL 파라미터 구성 (페이지는 검색 시 1로 리셋)
      const params = new URLSearchParams();
      params.set("q", searchInput.trim());
      params.set("page", "1");
      params.set("sort", sortBy);
      params.set("order", orderBy);
      
      // URL 업데이트로 페이지 이동 트리거
      router.push(`/column?${params.toString()}`);
    } else {
      // 검색어가 비어있으면 검색 파라미터 제거
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("sort", sortBy);
      params.set("order", orderBy);
      
      router.push(`/column?${params.toString()}`);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          다시 시도
        </Button>
      </div>
    );
  }
  
  console.log(`현재 화면 너비: ${screenWidth}, 페이지 크기: ${pageSize}, 컬럼 수: ${columns.length}`); // 디버깅용
  
  return (
    <div>
      {/* 상단 작성 버튼과 검색 영역 */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        {/* 검색 폼 추가 - 스타일 수정 */}
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="제목, 내용으로 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-4 pr-12 py-2 rounded-md focus:ring-primary focus:border-primary"
            />
            <Button 
              type="submit" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              variant="ghost"
              size="icon"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
        {isExpertOrAdmin && (
          <Button onClick={handleWriteClick} className="gap-2 w-full sm:w-auto">
            <PenSquare className="h-4 w-4" />
            칼럼 작성
          </Button>
        )}
      </div>
      
      {/* 검색 결과 정보 추가 */}
      {searchQuery && (
        <div className="mb-4 text-neutral-content">
          <p>
            <span className="font-bold">"{searchQuery}"</span>에 대한 검색 결과 
            {pagination.totalItems > 0 ? ` (${pagination.totalItems}개)` : ''}
          </p>
        </div>
      )}
      
      {/* 칼럼 목록 */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : columns.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? (
            <div>
              <p>검색 결과가 없습니다.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchInput("");
                  router.push("/column");
                }}
                className="mt-2"
              >
                전체 칼럼 보기
              </Button>
            </div>
          ) : (
            <p>아직 등록된 칼럼이 없습니다.</p>
          )}
        </div>
      ) : (
        <ColumnList columns={columns} />
      )}
      
      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
} 