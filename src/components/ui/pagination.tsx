import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  count: number; // 전체 페이지 수
  page: number; // 현재 페이지
  onChange: (page: number) => void; // 페이지 변경 핸들러
}

export function Pagination({ count, page, onChange }: PaginationProps) {
  // 페이지 범위 계산 (현재 페이지 주변 5개 페이지만 표시)
  const getPageRange = () => {
    const range = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(count, page + 2);
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  };
  
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">이전 페이지</span>
      </Button>
      
      {getPageRange().map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(p)}
          className={`h-8 w-8 ${p === page ? 'bg-primary hover:bg-secondary' : ''}`}
        >
          {p}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(count, page + 1))}
        disabled={page === count}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">다음 페이지</span>
      </Button>
    </div>
  );
} 