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

// 칼럼 작성 폼 스키마 정의
const columnFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  thumbnailUrl: z.string().optional(),
});

type ColumnFormValues = z.infer<typeof columnFormSchema>;

export default function WriteColumnPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로딩 중 또는 인증되지 않은 상태 처리
  if (status === "loading") {
    return <div className="text-center py-10">로딩 중...</div>;
  }

  // 권한 검사 (전문가나 관리자만 접근 가능)
  if (status === "unauthenticated" || !session?.user) {
    router.push("/login?callbackUrl=/column/write");
    return null;
  }

  // 권한 검사 (전문가나 관리자만 접근 가능)
  if (session.user.role !== "expert" && session.user.role !== "admin") {
    router.push("/column");
    return null;
  }

  // 폼 초기화
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      title: "",
      content: "",
      thumbnailUrl: "",
    },
  });

  // 폼 제출 처리
  const onSubmit = async (values: ColumnFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/columns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          content: values.content,
          image_url: values.thumbnailUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "칼럼 작성 중 오류가 발생했습니다.");
      }

      router.push(`/column/${data.column.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "칼럼 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 에디터에서 이미지 URL 추출 (첫 번째 이미지를 썸네일로 사용)
  const extractFirstImageUrl = (content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const imgTag = doc.querySelector("img");
    return imgTag?.getAttribute("src") || "";
  };

  // 내용이 변경될 때 첫 번째 이미지를 썸네일로 설정
  const handleContentChange = (content: string) => {
    form.setValue("content", content);
    
    // 썸네일 URL이 아직 없는 경우, 첫 번째 이미지를 썸네일로 설정
    if (!form.getValues("thumbnailUrl")) {
      const thumbnailUrl = extractFirstImageUrl(content);
      if (thumbnailUrl) {
        form.setValue("thumbnailUrl", thumbnailUrl);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">전문가 칼럼 작성</h1>

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
                  <Input placeholder="칼럼 제목을 입력해주세요" {...field} />
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
            name="thumbnailUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>썸네일 이미지 URL (선택)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="썸네일로 사용할 이미지 URL을 입력하세요" 
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
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "처리 중..." : "등록"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 