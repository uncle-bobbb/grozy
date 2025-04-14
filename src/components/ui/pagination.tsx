"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // 페이지 범위 계산
  const renderPageButtons = () => {
    // 항상 표시할 최대 페이지 버튼 수
    const maxVisibleButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    // 보이는 버튼 수가 maxVisibleButtons보다 작으면 startPage 조정
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    const pages = [];
    
    // 첫 페이지 링크
    if (startPage > 1) {
      pages.push(
        <Button
          key="first"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
        >
          1
        </Button>
      );
      
      // 첫 페이지와 시작 페이지 사이에 간격이 있으면 '...' 표시
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="flex items-center justify-center w-8">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        );
      }
    }
    
    // 페이지 버튼 생성
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      );
    }
    
    // 마지막 페이지 링크
    if (endPage < totalPages) {
      // 마지막 페이지와 끝 페이지 사이에 간격이 있으면 '...' 표시
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="flex items-center justify-center w-8">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        );
      }
      
      pages.push(
        <Button
          key="last"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }
    
    return pages;
  };

  return (
    <div className="flex items-center gap-1">
      {/* 이전 페이지 버튼 */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">이전 페이지</span>
      </Button>
      
      {/* 페이지 버튼 */}
      {renderPageButtons()}
      
      {/* 다음 페이지 버튼 */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">다음 페이지</span>
      </Button>
    </div>
  );
} 