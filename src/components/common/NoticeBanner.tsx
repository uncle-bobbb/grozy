import Link from "next/link";

// 임시 데이터
const notices = [
  {
    id: 1,
    title: "Grozy 서비스 오픈 안내",
    date: "2025-01-15",
  },
  {
    id: 2,
    title: "첫 회원가입 이벤트 안내",
    date: "2025-01-16",
  },
  {
    id: 3,
    title: "전문가 칼럼 등록 방법 안내",
    date: "2025-01-17",
  }
];

export default function NoticeBanner() {
  return (
    <div className="bg-neutral py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-content mb-2 sm:mb-0">공지사항</h2>
          <div className="space-y-1 sm:space-y-0 w-full sm:w-auto">
            {notices.slice(0, 2).map((notice) => (
              <div key={notice.id} className="flex justify-between items-center sm:ml-8 group">
                <Link href="#" className="text-sm text-neutral-content hover:text-accent group-hover:text-accent truncate max-w-xs sm:max-w-md">
                  {notice.title}
                </Link>
                <span className="text-xs text-neutral-content ml-4">{notice.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 