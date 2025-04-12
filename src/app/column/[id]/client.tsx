"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, User, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import CommentSection from "@/components/common/CommentSection";

// 임시 칼럼 데이터 타입
interface ColumnDetail {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    image: string;
    role: string;
    expertise: string;
  };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  thumbnailUrl: string;
}

interface ColumnDetailClientProps {
  columnId: string;
}

export default function ColumnDetailClient({ columnId }: ColumnDetailClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [column, setColumn] = useState<ColumnDetail | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로그인 체크
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // 데이터 로드 (실제로는 API 호출)
    const fetchColumnDetail = async () => {
      try {
        setIsLoading(true);
        // 실제 구현 시에는 API 호출
        // const response = await fetch(`/api/columns/${columnId}`);
        // const data = await response.json();

        // 임시 데이터
        const mockData: ColumnDetail = {
          id: columnId,
          title: "아이의 인지 발달을 도와주는 놀이 활동 5가지",
          content: `
          <div>
            <p>아이들의 인지 발달은 단순히 학습지나 문제집을 통해서만 이루어지는 것이 아닙니다. 다양한 놀이 활동을 통해 아이들의 사고력, 문제 해결 능력, 기억력 등을 향상시킬 수 있습니다.</p>
            
            <h2>1. 블록 쌓기 놀이</h2>
            <p>블록 쌓기는 공간 지각력과 문제 해결 능력을 키워줍니다. 다양한 크기와 모양의 블록을 사용하여 아이가 자유롭게 구조물을 만들도록 격려해보세요.</p>
            
            <h2>2. 역할 놀이</h2>
            <p>의사, 요리사, 교사 등 다양한 직업을 흉내 내는 역할 놀이는 상상력과 사회성 발달에 도움이 됩니다. 간단한 소품을 활용하여 더욱 풍부한 놀이 환경을 조성할 수 있습니다.</p>
            
            <img src="https://picsum.photos/seed/column-detail/800/400" alt="아이들의 역할놀이" />
            
            <h2>3. 보드게임</h2>
            <p>간단한 보드게임은 규칙을 이해하고 순서를 기다리는 능력을 길러줍니다. 또한 승패를 경험하면서 감정 조절 능력도 자연스럽게 습득할 수 있습니다.</p>
            
            <h2>4. 그림 그리기 및 만들기</h2>
            <p>미술 활동은 창의력과 소근육 발달에 도움이 됩니다. 다양한 재료를 사용하여 자유롭게 표현할 수 있는 기회를 제공해보세요.</p>
            
            <h2>5. 자연 탐험하기</h2>
            <p>공원이나 숲에서 나뭇잎, 돌, 꽃 등을 관찰하는 활동은 아이의 호기심을 자극하고 과학적 사고를 발달시킵니다.</p>
            
            <p>위의 활동들은 단순히 즐거운 놀이를 넘어 아이들의 인지 발달에 중요한 역할을 합니다. 부모님께서는 아이와 함께하는 놀이 시간을 통해 아이의 성장을 도울 수 있습니다.</p>
          </div>
          `,
          author: {
            name: "김지원",
            image: "https://picsum.photos/seed/expert1/200/200",
            role: "전문가",
            expertise: "아동발달심리학 박사"
          },
          createdAt: "2023-11-20T09:00:00Z",
          updatedAt: "2023-11-20T09:00:00Z",
          viewCount: 325,
          likeCount: 42,
          commentCount: 8,
          liked: false,
          thumbnailUrl: "https://picsum.photos/seed/column-thumb/600/400"
        };

        setColumn(mockData);
        setIsLiked(mockData.liked);
        setLikeCount(mockData.likeCount);
        setIsLoading(false);
      } catch (error) {
        console.error("칼럼 상세 정보를 불러오는 중 오류가 발생했습니다:", error);
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchColumnDetail();
    }
  }, [columnId, router, status]);

  const handleLike = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      // 실제 구현 시에는 API 호출
      // await fetch(`/api/columns/${columnId}/like`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      // });

      // 좋아요 상태 토글
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다:", error);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!column) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">칼럼을 찾을 수 없습니다.</h1>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> 뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleGoBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> 칼럼 목록으로
        </Button>
      </div>

      {/* 칼럼 헤더 */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{column.title}</h1>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* 작성자 정보 */}
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={column.author.image} alt={column.author.name} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <span className="font-medium mr-2">{column.author.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {column.author.role}
                </Badge>
              </div>
              <p className="text-sm text-neutral-content">{column.author.expertise}</p>
            </div>
          </div>
          
          {/* 메타 정보 */}
          <div className="flex flex-wrap gap-4 text-sm text-neutral-content">
            <div>작성일: {format(new Date(column.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}</div>
            <div>조회 {column.viewCount}회</div>
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" /> {column.commentCount}
            </div>
          </div>
        </div>

        {/* 썸네일 이미지 */}
        {column.thumbnailUrl && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image 
              src={column.thumbnailUrl}
              alt={column.title}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        )}
      </section>

      {/* 칼럼 내용 */}
      <section className="mb-12">
        <div 
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: column.content }}
        />
      </section>

      {/* 좋아요 */}
      <section className="mb-8 flex justify-center">
        <Button
          onClick={handleLike}
          variant={isLiked ? "default" : "outline"}
          className={`flex items-center gap-2 px-6 py-4 ${isLiked ? 'bg-primary text-white' : 'border-primary text-primary'}`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="font-medium">좋아요 {likeCount}</span>
        </Button>
      </section>

      {/* 구분선 */}
      <div className="border-t border-border my-12"></div>

      {/* 댓글 섹션 */}
      <CommentSection postId={columnId} postType="column" commentCount={column.commentCount} />
    </main>
  );
} 