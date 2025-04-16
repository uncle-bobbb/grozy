"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 임시 데이터 (실제로는 서버에서 가져올 것입니다)
const posts = [
  {
    id: 1,
    title: "첫 돌 준비, 어떻게 하셨나요?",
    content: "곧 아이가 첫 돌을 맞이하는데, 어떻게 준비하는 것이 좋을지 조언 부탁드립니다. 장소 예약부터 준비물까지 경험을 나눠주세요.",
    author: "행복한맘",
    date: "2024-06-15",
    thumbnail: "https://picsum.photos/seed/communitylist/400/300",
    likes: 48,
    comments: 23
  },
  {
    id: 2,
    title: "두돌 아이 장난감 추천해주세요",
    content: "두돌 아이를 위한 발달에 좋은 장난감 추천 부탁드립니다. 요즘 탐색놀이에 관심이 많아졌어요.",
    author: "아기아빠",
    date: "2024-06-14",
    thumbnail: "https://picsum.photos/seed/communitylist2/400/300",
    likes: 36,
    comments: 41
  },
  {
    id: 3,
    title: "이유식 거부하는 아이, 어떻게 하면 좋을까요?",
    content: "8개월 아기인데 이유식을 거부합니다. 처음엔 잘 먹었는데 갑자기 거부하네요. 비슷한 경험 있으신 분들 조언 부탁드립니다.",
    author: "초보맘",
    date: "2024-06-13",
    thumbnail: "https://picsum.photos/seed/communitylist3/400/300", 
    likes: 52,
    comments: 38
  },
  {
    id: 4,
    title: "어린이집 적응기간, 부모님들은 어떻게 대처하셨나요?",
    content: "첫 어린이집 등원을 시작했는데 아이가 많이 울어요. 적응 기간동안 어떻게 대처하셨는지 경험담을 나눠주세요.",
    author: "걱정맘",
    date: "2024-06-12",
    thumbnail: "https://picsum.photos/seed/communitylist4/400/300",
    likes: 45,
    comments: 31
  },
  {
    id: 5,
    title: "아이와 함께하는 주말 나들이 장소 추천해주세요",
    content: "이번 주말에 날씨가 좋을 것 같은데, 4살 아이와 함께 가기 좋은 서울 근교 나들이 장소 추천 부탁드립니다.",
    author: "주말아빠",
    date: "2024-06-11",
    thumbnail: "https://picsum.photos/seed/communitylist5/400/300",
    likes: 67,
    comments: 42
  },
  {
    id: 6,
    title: "아이 감기약, 어떤 것을 사용하시나요?",
    content: "3살 아이가 감기에 걸렸는데, 소아과 처방약 외에 집에서 상비약으로 두시는 감기약이 있으신가요?",
    author: "건강맘",
    date: "2024-06-10",
    thumbnail: "https://picsum.photos/seed/communitylist6/400/300",
    likes: 39,
    comments: 28
  },
  {
    id: 7,
    title: "유치원 선택 기준이 궁금합니다",
    content: "내년에 아이를 유치원에 보내려고 하는데, 어떤 기준으로 유치원을 선택하셨는지 궁금합니다. 교육 방침? 거리? 비용?",
    author: "예비유치원맘",
    date: "2024-06-09",
    thumbnail: "https://picsum.photos/seed/communitylist7/400/300",
    likes: 54,
    comments: 36
  },
  {
    id: 8,
    title: "아이 자존감 높이는 방법 공유해주세요",
    content: "5살 아이의 자존감을 높이기 위해 어떤 방법들을 사용하시나요? 좋은 방법이 있다면 공유해주세요.",
    author: "사랑맘",
    date: "2024-06-08",
    thumbnail: "https://picsum.photos/seed/communitylist8/400/300",
    likes: 61,
    comments: 33
  }
];

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // 검색 기능
  const filteredPosts = posts.filter(
    post => post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-content">커뮤니티</h1>
          <p className="mt-2 text-neutral-content">육아 경험을 함께 나누세요.</p>
        </div>

        {/* 검색 및 글쓰기 버튼 */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <Input
              type="text"
              placeholder="검색어를 입력하세요"
              className="pl-10 pr-4 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <Link href="/community/write">
            <Button className="bg-primary hover:bg-secondary text-white w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              글쓰기
            </Button>
          </Link>
        </div>

        {/* 게시글 목록 테이블 */}
        <div className="overflow-hidden border border-border bg-white rounded-lg mb-8">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-neutral">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-content uppercase tracking-wider w-9/12">제목</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-content uppercase tracking-wider hidden sm:table-cell">작성자</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-content uppercase tracking-wider hidden md:table-cell">날짜</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-content uppercase tracking-wider hidden sm:table-cell">반응</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-neutral transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/community/${post.id}`} className="block">
                      <div className="flex items-center">
                        <div className="hidden sm:block flex-shrink-0 h-10 w-16 mr-4">
                          <Image
                            src={post.thumbnail}
                            alt={post.title}
                            width={64}
                            height={40}
                            className="rounded object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-content truncate">{post.title}</p>
                          <p className="text-xs text-gray-500 truncate mt-1 hidden md:block">{post.content.substring(0, 80)}...</p>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-content hidden sm:table-cell">{post.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-content hidden md:table-cell">{post.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-content hidden sm:table-cell">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center">❤ {post.likes}</span>
                      <span className="flex items-center">💬 {post.comments}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 모바일용 카드 뷰 (작은 화면에서만 보임) */}
        <div className="sm:hidden space-y-4 mb-8">
          {filteredPosts.map((post) => (
            <Link href={`/community/${post.id}`} key={post.id} className="block">
              <div className="border border-border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
                <div className="p-4">
                  <h3 className="font-medium text-neutral-content truncate">{post.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-neutral-content">
                    <span>{post.author}</span>
                    <div className="flex space-x-2">
                      <span>❤ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <Button variant="outline" className="text-sm">
              이전
            </Button>
            <Button variant="outline" className="text-sm bg-primary text-white">
              1
            </Button>
            <Button variant="outline" className="text-sm">
              2
            </Button>
            <Button variant="outline" className="text-sm">
              3
            </Button>
            <Button variant="outline" className="text-sm">
              다음
            </Button>
          </nav>
        </div>
      </div>
    </main>
  );
} 