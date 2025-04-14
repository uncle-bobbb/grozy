import { Suspense } from "react";
import EditColumnClient from "./client";
import { Loader2 } from "lucide-react";

interface EditColumnPageProps {
  params: {
    id: string;
  };
}

export default async function EditColumnPage({ params }: EditColumnPageProps) {
  // params를 await 처리
  const { id } = await params;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }>
        <EditColumnClient columnId={id} />
      </Suspense>
    </div>
  );
} 