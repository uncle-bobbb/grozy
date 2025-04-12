"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { User, ThumbsUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// 임시 댓글 타입
interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    role: string;
  };
  createdAt: string;
  likeCount: number;
  liked: boolean;
}

interface CommentSectionProps {
  postId: string;
  postType: "column" | "community";
  commentCount: number;
}

export default function CommentSection({ postId, postType, commentCount }: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        // 실제 구현 시에는 API 호출
        // const response = await fetch(`/api/comments?postId=${postId}&postType=${postType}`);
        // const data = await response.json();
        
        // 임시 데이터
        const mockComments: Comment[] = [
          {
            id: "1",
            content: "정말 유익한 칼럼이네요. 아이와 함께 블록 쌓기 놀이를 해봐야겠어요!",
            author: {
              id: "user1",
              name: "이서연",
              image: "https://picsum.photos/seed/user1/200/200",
              role: "일반회원"
            },
            createdAt: "2023-11-20T10:30:00Z",
            likeCount: 5,
            liked: false
          },
          {
            id: "2",
            content: "역할 놀이가 아이들의 사회성 발달에 정말 중요하다는 걸 새삼 깨닫게 되었습니다. 자연 탐험에 대한 내용도 특히 인상적이었어요.",
            author: {
              id: "user2",
              name: "박준호",
              image: null,
              role: "일반회원"
            },
            createdAt: "2023-11-20T14:15:00Z",
            likeCount: 2,
            liked: true
          },
          {
            id: "3",
            content: "보드게임 추천해주실 만한 것이 있을까요? 4살 아이와 함께하기 좋은 간단한 게임을 찾고 있습니다.",
            author: {
              id: "user3",
              name: "최지혜",
              image: "https://picsum.photos/seed/user3/200/200",
              role: "일반회원"
            },
            createdAt: "2023-11-21T08:45:00Z",
            likeCount: 0,
            liked: false
          }
        ];
        
        setComments(mockComments);
        setIsLoading(false);
      } catch (error) {
        console.error("댓글을 불러오는 중 오류가 발생했습니다:", error);
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId, postType]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (!commentText.trim()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 실제 구현 시에는 API 호출
      // const response = await fetch("/api/comments", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     content: commentText,
      //     postId,
      //     postType
      //   })
      // });
      // const newComment = await response.json();
      
      // 임시 데이터
      const newComment: Comment = {
        id: `temp-${Date.now()}`,
        content: commentText,
        author: {
          id: session?.user?.id || "unknown",
          name: session?.user?.name || "사용자",
          image: session?.user?.image || null,
          role: "일반회원"
        },
        createdAt: new Date().toISOString(),
        likeCount: 0,
        liked: false
      };
      
      setComments([...comments, newComment]);
      setCommentText("");
      setIsSubmitting(false);
    } catch (error) {
      console.error("댓글 작성 중 오류가 발생했습니다:", error);
      setIsSubmitting(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }
    
    try {
      // 실제 구현 시에는 API 호출
      // await fetch(`/api/comments/${commentId}/like`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      // });
      
      // 임시 처리 - 좋아요 상태 업데이트
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked: !comment.liked,
            likeCount: comment.liked ? comment.likeCount - 1 : comment.likeCount + 1
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error("댓글 좋아요 처리 중 오류가 발생했습니다:", error);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">댓글 {commentCount}</h2>
      
      {/* 댓글 작성 폼 */}
      <form onSubmit={handleCommentSubmit} className="mb-10">
        <Textarea
          placeholder="댓글을 남겨보세요."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="mb-3 min-h-[100px]"
          disabled={!session || isSubmitting}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!session || isSubmitting || !commentText.trim()}
            className="bg-primary hover:bg-secondary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                등록 중...
              </>
            ) : "댓글 등록"}
          </Button>
        </div>
      </form>
      
      {/* 댓글 목록 */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.author.image || ""} alt={comment.author.name} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{comment.author.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {comment.author.role}
                    </Badge>
                    <span className="text-xs text-neutral-content">
                      {format(new Date(comment.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                    </span>
                  </div>
                  <p className="text-neutral-content whitespace-pre-line">{comment.content}</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCommentLike(comment.id)}
                  className="flex items-center text-sm text-neutral-content"
                >
                  <ThumbsUp className={`h-4 w-4 mr-1 ${comment.liked ? 'fill-current text-primary' : ''}`} />
                  <span>{comment.likeCount}</span>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-neutral-content">
            <p>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
          </div>
        )}
      </div>
    </section>
  );
} 