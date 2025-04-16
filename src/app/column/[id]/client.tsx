"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, User, ArrowLeft, Loader2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import CommentSection from "@/components/common/CommentSection";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ColumnDetailClientProps {
  columnId: string;
}

interface ColumnDetail {
  id: string;
  title: string;
  content: string;
  image_url: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    name: string;
    image: string;
    role: string;
    expertise: string;
  };
  liked: boolean;
}

export default function ColumnDetailClient({ columnId }: ColumnDetailClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [column, setColumn] = useState<ColumnDetail | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // 로그인 체크
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // 데이터 로드
    const fetchColumnDetail = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/columns/${columnId}`);
        
        if (!response.ok) {
          throw new Error("칼럼을 불러오는데 실패했습니다.");
        }
        
        const data = await response.json();
        
        setColumn(data);
        setIsLiked(data.liked);
        setLikeCount(data.like_count);
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
      const response = await fetch(`/api/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: columnId,
          postType: "column"
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 좋아요 상태 토글
        setIsLiked(!isLiked);
        setLikeCount(data.likeCount);
      } else {
        console.error("좋아요 처리 중 오류:", data.error);
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다:", error);
    }
  };

  const handleGoBack = () => {
    router.push("/column");
  };

  // 작성자 또는 관리자인지 확인하는 함수
  const isAuthorOrAdmin = () => {
    if (!session || !column) return false;
    return session.user.id === column.users.id || session.user.role === "admin";
  };
  
  // 수정 페이지로 이동
  const handleEdit = () => {
    router.push(`/column/edit/${columnId}`);
  };
  
  // 칼럼 삭제 처리
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/columns/${columnId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "칼럼 삭제에 실패했습니다.");
      }
      
      // 삭제 성공 시 칼럼 목록 페이지로 이동
      router.push("/column");
    } catch (error: any) {
      console.error("칼럼 삭제 중 오류가 발생했습니다:", error);
      alert(error.message || "칼럼 삭제 중 오류가 발생했습니다.");
    }
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
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">칼럼을 찾을 수 없습니다</h2>
        <Button onClick={handleGoBack}>돌아가기</Button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* 상단 네비게이션 */}
      <div className="mb-8 flex justify-between">
        <Button variant="ghost" onClick={handleGoBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>돌아가기</span>
        </Button>
        
        {/* 수정/삭제 버튼 (작성자나 관리자만 표시) */}
        {isAuthorOrAdmin() && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleEdit} 
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              <span>수정</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span>삭제</span>
            </Button>
          </div>
        )}
      </div>

      <section className="mb-8">
        {/* 제목 */}
        <h1 className="text-3xl font-bold mb-6">{column.title}</h1>

        {/* 작성자, 날짜, 조회수 등 메타 정보 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* 작성자 정보 */}
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={column.users.image} alt={column.users.name} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <span className="font-medium mr-2">{column.users.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {column.users.role}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{column.users.expertise}</p>
            </div>
          </div>
          
          {/* 메타 정보 */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div>작성일: {format(new Date(column.created_at), 'yyyy년 MM월 dd일', { locale: ko })}</div>
            <div>조회 {column.view_count}회</div>
          </div>
        </div>
      </section>

      {/* 칼럼 내용 */}
      <section className="mb-12">
        <div 
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: column.content }}
        />
      </section>

      {/* 좋아요 버튼 */}
      <section className="flex justify-center mb-12">
        <Button
          onClick={handleLike}
          variant="outline"
          size="lg"
          className={`flex items-center gap-2 px-8 py-6 rounded-full transition-colors ${
            isLiked ? "text-red-500 border-red-200 hover:bg-red-50" : ""
          }`}
        >
          <Heart className={`h-6 w-6 ${isLiked ? "fill-red-500" : ""}`} />
          <span className="text-lg">좋아요 {likeCount}</span>
        </Button>
      </section>

      {/* 댓글 섹션 */}
      <CommentSection
        postId={columnId}
        postType="column"
        commentCount={column.comment_count}
      />

      {/* 삭제 확인 대화상자 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100 text-xl font-bold">
              칼럼 삭제 확인
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
              이 칼럼을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
} 