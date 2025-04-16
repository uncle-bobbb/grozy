"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2 } from "lucide-react";
import TiptapEditor from "@/components/editor/TiptapEditor";

// 칼럼 수정 폼 스키마 정의
export const columnFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  image_url: z.string().optional(),
});

type ColumnFormValues = z.infer<typeof columnFormSchema>;

interface EditColumnClientProps {
  initialColumn: {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    author_id: string;
  };
}

export default function EditColumnClient({ initialColumn }: EditColumnClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 초기화
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      title: initialColumn.title,
      content: initialColumn.content,
      image_url: initialColumn.image_url || "",
    },
  });

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
    if (!form.getValues("image_url")) {
      const imageUrl = extractFirstImageUrl(content);
      if (imageUrl) {
        form.setValue("image_url", imageUrl);
      }
    }
  };

  // 폼 제출 처리
  const onSubmit = async (values: ColumnFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/columns/${initialColumn.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "칼럼 수정 중 오류가 발생했습니다.");
      }

      router.push(`/column/${initialColumn.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "칼럼 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          뒤로
        </Button>
      </div>
        
      <h1 className="text-2xl font-bold mb-6">칼럼 수정</h1>

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
            name="image_url"
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 