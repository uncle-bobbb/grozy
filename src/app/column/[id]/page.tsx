// 서버 컴포넌트
import ColumnDetailClient from './client';

// async 함수로 변경하고 params를 await
export default async function ColumnDetailPage({ params }: { params: { id: string } }) {
  // params를 await로 처리
  const { id } = await params;
  
  return <ColumnDetailClient columnId={id} />;
} 