"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CommentModel } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, SendHorizontal, User, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface CommentSectionProps {
  postId: string;
  postType: "column" | "community";
  commentCount: number;
}

export default function CommentSection({ postId, postType, commentCount }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 댓글 목록 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/comments?postId=${postId}&postType=${postType}`);
        
        if (!response.ok) {
          throw new Error("댓글을 불러오는데 실패했습니다.");
        }
        
        const data = await response.json();
        console.log("API 응답 데이터:", data); // 디버깅용 로그
        
        // API가 배열을 직접 반환하므로 data 자체가 댓글 배열임
        setComments(data || []);
      } catch (error) {
        console.error("댓글을 불러오는 중 오류가 발생했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId, postType]);

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!session || !newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          postId,
          postType,
        }),
      });
      
      if (!response.ok) {
        throw new Error("댓글 작성에 실패했습니다.");
      }
      
      const data = await response.json();
      
      // 댓글 목록 업데이트 - 오류 수정: 가장 아래에 추가해야 함
      const newCommentData = data.comment || data;
      setComments((prevComments) => [...prevComments, newCommentData]);
      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 중 오류가 발생했습니다:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!session) return;
    
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("댓글 삭제에 실패했습니다.");
      }
      
      // 댓글 목록 업데이트
      setComments((prevComments) => 
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error("댓글 삭제 중 오류가 발생했습니다:", error);
    }
  };

  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold mb-6">댓글 {comments.length}</h2>
      
      {/* 댓글 작성 영역 */}
      {session && (
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "사용자"} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="댓글을 작성해주세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-24 mb-2"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment} 
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-4 w-4" />
                  )}
                  댓글 작성
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 댓글 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>첫 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.author?.image || ""} alt={comment.author?.name || "사용자"} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.author?.name || "사용자"}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                      </span>
                    </div>
                    {session?.user?.id === comment.author_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">삭제</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
} 