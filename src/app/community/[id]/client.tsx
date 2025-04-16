"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// 임시 데이터 - 실제로는 서버에서 ID에 맞는 게시글을 가져옵니다
const posts = [
  {
    id: 1,
    title: "첫 돌 준비, 어떻게 하셨나요?",
    content: `곧 아이가 첫 돌을 맞이하는데, 어떻게 준비하는 것이 좋을지 조언 부탁드립니다. 장소 예약부터 준비물까지 경험을 나눠주세요.

첫 돌이라 준비해야 할 것들이 많아 고민이 됩니다. 돌 상에는 어떤 것들을 올려야 하는지, 돌잡이 물건은 어떻게 준비하면 좋을지 궁금합니다.

또한 가족들만 모실지, 지인들도 초대할지 규모도 고민입니다. 코로나 이후로 돌잔치 문화가 많이 변했다고 하던데, 최근 트렌드도 알려주시면 감사하겠습니다.`,
    author: "행복한맘",
    authorImage: "https://picsum.photos/seed/author1/100/100",
    date: "2024-06-15",
    thumbnail: "https://picsum.photos/seed/communitylist/800/500",
    likes: 48,
    comments: 23,
    isLiked: false,
    views: 152
  },
  {
    id: 2,
    title: "두돌 아이 장난감 추천해주세요",
    content: "두돌 아이를 위한 발달에 좋은 장난감 추천 부탁드립니다. 요즘 탐색놀이에 관심이 많아졌어요.",
    author: "아기아빠",
    authorImage: "https://picsum.photos/seed/author2/100/100",
    date: "2024-06-14",
    thumbnail: "https://picsum.photos/seed/communitylist2/800/500",
    likes: 36,
    comments: 41,
    isLiked: false,
    views: 124
  }
];

// 임시 댓글 데이터
const commentsData = [
  {
    id: 1,
    postId: 1,
    author: "베이비맘",
    authorImage: "https://picsum.photos/seed/comment1/100/100",
    content: "저희는 작년에 첫 아이 돌잔치를 했는데요, 요즘은 호텔 뷔페나 레스토랑 대관보다 스튜디오 대관이 인기더라고요. 사진 촬영하고 가족들만 모시는 미니 돌잔치로 진행했어요.",
    date: "2024-06-15",
    likes: 12
  },
  {
    id: 2,
    postId: 1,
    author: "두아이맘",
    authorImage: "https://picsum.photos/seed/comment2/100/100",
    content: "돌잡이 물건은 전통적인 것도 좋지만 요즘은 아이의 미래 희망과 관련된 귀여운 소품들을 많이 준비해요. 저는 의사 청진기, 카메라, 마이크, 크레파스 등을 준비했어요. 인스타그램에 '돌잡이소품'으로 검색하면 대여 업체도 많이 나와요!",
    date: "2024-06-15",
    likes: 8
  },
  {
    id: 3,
    postId: 1,
    author: "셋째육아중",
    authorImage: "https://picsum.photos/seed/comment3/100/100",
    content: "코로나 이후로 가족들만 모시는 소규모 돌잔치가 대세예요. 저희는 집에서 케이터링 업체 불러서 했는데 만족도 높았어요. 비용도 절약되고 아이도 편안한 환경이라 좋았답니다.",
    date: "2024-06-16",
    likes: 15
  }
];

interface CommunityDetailClientProps {
  postId: string;
}

export default function CommunityDetailClient({ postId }: CommunityDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const postIdNum = parseInt(postId);
  
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  
  // 게시글 데이터 가져오기 (실제로는 API 호출)
  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    const timer = setTimeout(() => {
      const foundPost = posts.find(p => p.id === postIdNum);
      
      if (foundPost) {
        setPost(foundPost);
        setIsLiked(foundPost.isLiked);
        
        // 해당 게시글의 댓글만 필터링
        const postComments = commentsData.filter(c => c.postId === postIdNum);
        setComments(postComments);
      } else {
        // 게시글이 없을 경우 - 실제 구현에서는 404 페이지로 리디렉션
        toast({
          title: "게시글을 찾을 수 없습니다.",
          description: "요청하신 게시글이 존재하지 않습니다.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [postIdNum, toast]);
  
  // 좋아요 토글 함수
  const toggleLike = () => {
    // 실제로는 API 호출하여 서버에 좋아요 상태 업데이트
    setIsLiked(prev => !prev);
    
    if (!isLiked) {
      // 좋아요 수 증가
      setPost(prev => ({...prev, likes: prev.likes + 1}));
      toast({
        title: "좋아요를 눌렀습니다.",
        duration: 1500
      });
    } else {
      // 좋아요 수 감소
      setPost(prev => ({...prev, likes: prev.likes - 1}));
    }
  };
  
  // 댓글 작성 함수
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast({
        title: "댓글 내용을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    // 실제로는 API 호출하여 서버에 댓글 저장
    const newComment = {
      id: comments.length + 1,
      postId: postIdNum,
      author: "현재사용자", // 실제로는 로그인한 사용자 정보
      authorImage: "https://picsum.photos/seed/currentuser/100/100",
      content: commentText,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };
    
    setComments(prev => [newComment, ...prev]);
    setCommentText("");
    setPost(prev => ({...prev, comments: prev.comments + 1}));
    
    toast({
      title: "댓글이 등록되었습니다.",
      duration: 1500
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen bg-neutral flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다</h1>
          <p className="mb-6">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
          <Button onClick={() => router.push('/community')}>
            커뮤니티로 돌아가기
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-neutral">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 이전 페이지로 버튼 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/community')}
            className="flex items-center text-neutral-content hover:text-accent transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </div>
        
        {/* 게시글 헤더 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-border mb-6">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-neutral-content mb-4">{post.title}</h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.authorImage} alt={post.author} />
                  <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-content">{post.author}</p>
                  <p className="text-xs text-gray-500">{post.date} · 조회 {post.views}</p>
                </div>
              </div>
              
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
            
            {/* 썸네일 이미지 (있는 경우) */}
            {post.thumbnail && (
              <div className="mb-6 relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden">
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            {/* 게시글 본문 */}
            <div className="prose max-w-none text-neutral-content mb-8">
              {post.content.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {/* 게시글 액션 버튼 */}
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <div className="flex space-x-4">
                <Button 
                  variant="ghost" 
                  className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                  onClick={toggleLike}
                >
                  <Heart className={`mr-1 h-5 w-5 ${isLiked ? 'fill-red-500' : ''}`} />
                  좋아요 {post.likes}
                </Button>
                <Button variant="ghost" className="flex items-center text-gray-500">
                  <MessageSquare className="mr-1 h-5 w-5" />
                  댓글 {post.comments}
                </Button>
              </div>
              
              <Button variant="ghost" className="flex items-center text-gray-500">
                <Share2 className="mr-1 h-5 w-5" />
                공유하기
              </Button>
            </div>
          </div>
        </div>
        
        {/* 댓글 섹션 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-content mb-6">댓글 {comments.length}개</h2>
            
            {/* 댓글 작성 폼 */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <Textarea
                placeholder="댓글을 작성해주세요."
                className="mb-3 min-h-24"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit" className="bg-primary hover:bg-secondary text-white">
                  댓글 등록
                </Button>
              </div>
            </form>
            
            <Separator className="mb-6" />
            
            {/* 댓글 목록 */}
            {comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={comment.authorImage} alt={comment.author} />
                      <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-neutral-content">{comment.author}</p>
                        <p className="text-xs text-gray-500">{comment.date}</p>
                      </div>
                      <p className="mt-1 text-neutral-content text-sm">{comment.content}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <button className="text-xs text-gray-500 hover:text-accent">좋아요 {comment.likes}</button>
                        <button className="text-xs text-gray-500 hover:text-accent">답글 달기</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 