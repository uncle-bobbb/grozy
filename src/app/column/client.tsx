"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ColumnModel } from "@/types";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import ColumnList from "@/components/lists/ColumnList";
import { Loader2, PenSquare } from "lucide-react";

export default function ColumnListClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [columns, setColumns] = useState<ColumnModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  });
  
  // 현재 페이지 가져오기
  const currentPage = parseInt(searchParams.get("page") || "1");
  const sortBy = searchParams.get("sort") || "created_at";
  const orderBy = searchParams.get("order") || "desc";
  
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        setLoading(true);
        
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "9", // 한 페이지에 9개 항목
          sort: sortBy,
          order: orderBy,
        });
        
        // 타임아웃 설정으로 fetch 요청 안정성 향상
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
        
        try {
          const response = await fetch(`/api/columns?${queryParams.toString()}`, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "칼럼을 불러오는데 실패했습니다.");
          }
          
          const data = await response.json();
          
          // 데이터 타입 검증
          if (!data.columns || !Array.isArray(data.columns)) {
            throw new Error("서버에서 유효하지 않은 데이터 형식이 반환되었습니다.");
          }
          
          setColumns(data.columns);
          setPagination({
            page: data.pagination?.page || 1,
            totalPages: data.pagination?.totalPages || 1,
            totalItems: data.pagination?.totalItems || 0,
          });
          
          setError(null);
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError') {
            throw new Error("요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.");
          }
          throw fetchError;
        }
      } catch (err: any) {
        console.error("칼럼 목록 불러오기 오류:", err);
        setError(err.message || "칼럼 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchColumns();
  }, [currentPage, sortBy, orderBy]);
  
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/column?${params.toString()}`);
  };
  
  const handleWriteClick = () => {
    router.push("/column/write");
  };
  
  const isExpertOrAdmin = session?.user?.role === "expert" || session?.user?.role === "admin";
  
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
  
  return (
    <div>
      {/* 상단 작성 버튼 */}
      <div className="flex justify-end mb-6">
        {isExpertOrAdmin && (
          <Button onClick={handleWriteClick} className="gap-2">
            <PenSquare className="h-4 w-4" />
            칼럼 작성
          </Button>
        )}
      </div>
      
      {/* 칼럼 목록 */}
      {columns.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>아직 등록된 칼럼이 없습니다.</p>
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