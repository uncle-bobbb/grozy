import Link from "next/link";
import Image from "next/image";

// 임시 데이터
const columns = [
  {
    id: 1,
    title: "아이의 창의력을 키워주는 방법",
    summary: "창의력은 미래 사회에서 가장 중요한 능력 중 하나입니다. 이 글에서는 일상에서 아이의 창의력을 키워주는 방법에 대해 알아봅니다.",
    author: "김창의 교육전문가",
    date: "2025-01-15",
    thumbnail: "https://picsum.photos/seed/column1/600/400",
    likes: 42,
    comments: 8
  },
  {
    id: 2,
    title: "영유아기 언어발달 촉진하는 놀이 방법",
    summary: "언어 발달은 영유아기에 가장 중요한 발달 과업입니다. 이 글에서는 놀이를 통해 언어 발달을 촉진할 수 있는 방법을 소개합니다.",
    author: "이언어 언어치료사",
    date: "2025-01-14",
    thumbnail: "https://picsum.photos/seed/column2/600/400",
    likes: 38,
    comments: 12
  },
  {
    id: 3,
    title: "아이와 함께하는 건강한 식습관 형성",
    summary: "올바른 식습관은 어린 시절부터 형성됩니다. 이 글에서는 부모가 아이와 함께 건강한 식습관을 형성하는 방법에 대해 다룹니다.",
    author: "박영양 영양학전문가",
    date: "2025-01-13",
    thumbnail: "https://picsum.photos/seed/column3/600/400",
    likes: 56,
    comments: 15
  },
  {
    id: 4,
    title: "양육 스트레스 관리와 자기 돌봄의 중요성",
    summary: "부모의 정신 건강은 아이의 건강한 성장에 큰 영향을 미칩니다. 이 글에서는 양육 스트레스를 관리하는 방법을 알아봅니다.",
    author: "최마음 심리상담사",
    date: "2025-01-12",
    thumbnail: "https://picsum.photos/seed/column4/600/400",
    likes: 62,
    comments: 21
  }
];

interface ColumnListProps {
  limit?: number;
  title?: string;
}

export default function ColumnList({ limit = 4, title = "전문가들이 전하는 육아 칼럼" }: ColumnListProps) {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">{title}</h2>
          <p className="mt-2 text-neutral-content">과학적이고 전문적인 육아 정보를 만나보세요</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.slice(0, limit).map((column) => (
            <div key={column.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">
              <Link href={`/column/${column.id}`}>
                <div className="relative h-48 w-full">
                  <Image 
                    src={column.thumbnail}
                    alt={column.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform hover:scale-105 duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-neutral-content mb-2 line-clamp-2">
                    {column.title}
                  </h3>
                  <p className="text-sm text-neutral-content mb-3 line-clamp-3">
                    {column.summary}
                  </p>
                  <div className="flex justify-between items-center text-xs text-neutral-content">
                    <span>{column.author}</span>
                    <div className="flex space-x-2">
                      <span>❤ {column.likes}</span>
                      <span>💬 {column.comments}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link
            href="/column"
            className="inline-flex items-center px-4 py-2 border border-primary rounded-md bg-white text-neutral-content hover:bg-neutral transition-colors"
          >
            더 많은 칼럼 보기
          </Link>
        </div>
      </div>
    </section>
  );
} 