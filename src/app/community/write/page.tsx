"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TiptapEditor from "@/components/editor/TiptapEditor";

// 커뮤니티 게시글 작성 폼 스키마 정의
const communityFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  imageUrl: z.string().optional(),
});

type CommunityFormValues = z.infer<typeof communityFormSchema>;

export default function WriteCommunityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인 상태 확인 및 리다이렉트 처리
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // 로딩 중일 때 처리
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <p>로딩 중...</p>
      </div>
    );
  }

  // 폼 초기화
  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communityFormSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
    },
  });

  // Tiptap 에디터 내용 변경 핸들러
  const handleContentChange = (html: string) => {
    form.setValue("content", html, { shouldValidate: true });
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: CommunityFormValues) => {
    if (!session?.user) {
      setError("로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          imageUrl: data.imageUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "게시글 작성 중 오류가 발생했습니다.");
      }

      const result = await response.json();
      router.push(`/community/${result.id}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("게시글 작성 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">커뮤니티 게시글 작성</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>제목</FormLabel>
                <FormControl>
                  <Input placeholder="게시글 제목을 입력해주세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>내용</FormLabel>
                <FormControl>
                  <TiptapEditor 
                    content={field.value} 
                    onChange={handleContentChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>대표 이미지 URL (선택)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="대표 이미지로 사용할 URL을 입력하세요" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/community")}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "등록"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 