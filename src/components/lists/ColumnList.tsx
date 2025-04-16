"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, MessageSquare, Eye } from "lucide-react";
import { ColumnModel } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ColumnListProps {
  columns?: ColumnModel[];
  limit?: number;
}

export default function ColumnList({ columns = [], limit }: ColumnListProps) {
  // 칼럼 수 제한 적용
  const displayColumns = limit ? columns.slice(0, limit) : columns;

  // 기본 썸네일 이미지 경로 (public 폴더 내 이미지로 가정)
  const defaultThumbnail = "/grozy-default-thumbnail.png";

  // 칼럼이 없는 경우를 위한 UI 추가
  if (columns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>아직 등록된 칼럼이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {displayColumns.map((column) => (
        <Link 
          key={column.id} 
          href={`/column/${column.id}`}
          className="group"
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-primary/20 h-full flex flex-col">
            {/* 썸네일 이미지 */}
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={column.image_url || defaultThumbnail}
                alt={column.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            
            {/* 내용 컨테이너 */}
            <div className="p-4 flex flex-col flex-grow">
              {/* 제목 */}
              <h3 className="text-lg font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {column.title}
              </h3>
              
              {/* 작성자 정보 */}
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={column.users?.image} alt={column.users?.name || "작성자"} />
                  <AvatarFallback>
                    {column.users?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{column.users?.name || "전문가"}</span>
                {column.users?.expertise && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    {column.users.expertise}
                  </Badge>
                )}
              </div>
              
              {/* 날짜 및 통계 - 하단에 고정되도록 margin-top: auto 추가 */}
              <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                <span>
                  {format(new Date(column.created_at), "yyyy.MM.dd", { locale: ko })}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{column.view_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{column.like_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{column.comment_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 