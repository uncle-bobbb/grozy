"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2 } from "lucide-react";
import TiptapEditor from "@/components/editor/TiptapEditor";

export const columnFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  image_url: z.string().optional(),
});

interface EditColumnClientProps {
  columnId: string;
}

export default function EditColumnClient({ columnId }: EditColumnClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // 폼 설정
  const form = useForm<z.infer<typeof columnFormSchema>>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      title: "",
      content: "",
      image_url: "",
    },
  });
  
  // 칼럼 데이터 로드
  useEffect(() => {
    // 권한 체크
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    const fetchColumnData = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/columns/${columnId}`);
        
        if (!response.ok) {
          throw new Error("칼럼을 불러오는데 실패했습니다.");
        }
        
        const data = await response.json();
        
        // 권한 체크: 작성자나 관리자만 수정 가능
        if (session?.user.id !== data.users.id && session?.user.role !== "admin") {
          router.push(`/column/${columnId}`);
          return;
        }
        
        // 폼 초기값 설정
        form.reset({
          title: data.title,
          content: data.content,
          image_url: data.image_url || "",
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("칼럼 데이터를 불러오는 중 오류가 발생했습니다:", error);
        setError("칼럼 정보를 불러오는데 실패했습니다.");
        setIsLoading(false);
      }
    };
    
    if (status === "authenticated") {
      fetchColumnData();
    }
  }, [columnId, status, session, router, form]);

  // 폼 제출 처리
  const onSubmit = async (values: z.infer<typeof columnFormSchema>) => {
    try {
      const response = await fetch(`/api/columns/${columnId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("칼럼 수정에 실패했습니다");
      }

      router.push(`/column/${columnId}`);
    } catch (err) {
      setError("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  // 뒤로가기 처리
  const handleGoBack = () => {
    router.push(`/column/${columnId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* 상단 네비게이션 */}
      <div className="mb-8">
        <Button variant="ghost" onClick={handleGoBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>돌아가기</span>
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
                  <Input placeholder="칼럼 제목을 입력하세요" {...field} />
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
                    onChange={field.onChange} 
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
                <FormLabel>썸네일 이미지 URL (선택사항)</FormLabel>
                <FormControl>
                  <Input placeholder="이미지 URL을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleGoBack}>
              취소
            </Button>
            <Button type="submit">저장하기</Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 