import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="text-xl font-bold text-neutral-content">
              Grozy
            </Link>
            <p className="mt-2 text-sm text-neutral-content">
              과학적 육아 정보를 한 곳에 모았습니다.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-content uppercase tracking-wider">서비스</h3>
              <div className="space-y-2">
                <Link href="/about" className="text-sm text-neutral-content hover:text-accent block">
                  소개
                </Link>
                <Link href="/column" className="text-sm text-neutral-content hover:text-accent block">
                  전문가 칼럼
                </Link>
                <Link href="/community" className="text-sm text-neutral-content hover:text-accent block">
                  커뮤니티
                </Link>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-content uppercase tracking-wider">법적 정보</h3>
              <div className="space-y-2">
                <Link href="#" className="text-sm text-neutral-content hover:text-accent block">
                  개인정보 처리방침
                </Link>
                <Link href="#" className="text-sm text-neutral-content hover:text-accent block">
                  이용약관
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-sm text-neutral-content text-center">
            © 2025 Grozy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 