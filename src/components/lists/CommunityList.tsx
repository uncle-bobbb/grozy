import Link from "next/link";
import Image from "next/image";

// 임시 데이터
const posts = [
  {
    id: 1,
    title: "첫 돌 준비, 어떻게 하셨나요?",
    content: "곧 아이가 첫 돌을 맞이하는데, 어떻게 준비하는 것이 좋을지 조언 부탁드립니다. 장소 예약부터 준비물까지 경험을 나눠주세요.",
    author: "행복한맘",
    date: "2025-01-15",
    thumbnail: "https://picsum.photos/seed/post1/600/400",
    likes: 48,
    comments: 23
  },
  {
    id: 2,
    title: "두돌 아이 장난감 추천해주세요",
    content: "두돌 아이를 위한 발달에 좋은 장난감 추천 부탁드립니다. 요즘 탐색놀이에 관심이 많아졌어요.",
    author: "아기아빠",
    date: "2025-01-14",
    thumbnail: "https://picsum.photos/seed/post2/600/400",
    likes: 36,
    comments: 41
  },
  {
    id: 3,
    title: "이유식 거부하는 아이, 어떻게 하면 좋을까요?",
    content: "8개월 아기인데 이유식을 거부합니다. 처음엔 잘 먹었는데 갑자기 거부하네요. 비슷한 경험 있으신 분들 조언 부탁드립니다.",
    author: "초보맘",
    date: "2025-01-13",
    thumbnail: "https://picsum.photos/seed/post3/600/400", 
    likes: 52,
    comments: 38
  },
  {
    id: 4,
    title: "어린이집 적응기간, 부모님들은 어떻게 대처하셨나요?",
    content: "첫 어린이집 등원을 시작했는데 아이가 많이 울어요. 적응 기간동안 어떻게 대처하셨는지 경험담을 나눠주세요.",
    author: "걱정맘",
    date: "2025-01-12",
    thumbnail: "https://picsum.photos/seed/post4/600/400",
    likes: 45,
    comments: 31
  }
];

interface CommunityListProps {
  limit?: number;
  title?: string;
}

export default function CommunityList({ limit = 4, title = "인기 게시글" }: CommunityListProps) {
  return (
    <section className="py-12 bg-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">{title}</h2>
          <p className="mt-2 text-neutral-content">다른 부모님들과 육아 경험을 나눠보세요</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.slice(0, limit).map((post) => (
            <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border flex flex-col md:flex-row">
              <Link href={`/community/${post.id}`} className="md:w-1/3 h-48 md:h-auto relative">
                <Image 
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform hover:scale-105 duration-300"
                />
              </Link>
              <div className="p-4 md:w-2/3">
                <Link href={`/community/${post.id}`}>
                  <h3 className="font-semibold text-lg text-neutral-content mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-neutral-content mb-4 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex justify-between items-center text-xs text-neutral-content">
                    <span>{post.author}</span>
                    <div className="flex space-x-3">
                      <span>❤ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link
            href="/community"
            className="inline-flex items-center px-4 py-2 border border-primary rounded-md bg-white text-neutral-content hover:bg-neutral transition-colors"
          >
            커뮤니티 더 보기
          </Link>
        </div>
      </div>
    </section>
  );
} 