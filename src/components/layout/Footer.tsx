export default function Footer() {
  return (
    <footer className="bg-white border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Grozy</h3>
            <p className="text-sm text-neutral-content/80">
              과학적·논리적 육아 정보를 한 곳에 모았습니다.
              자녀의 건강한 성장을 Grozy와 함께해 보세요.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-sm text-neutral-content/80 hover:text-accent transition-colors">
                  소개
                </a>
              </li>
              <li>
                <a href="/column" className="text-sm text-neutral-content/80 hover:text-accent transition-colors">
                  전문가 칼럼
                </a>
              </li>
              <li>
                <a href="/community" className="text-sm text-neutral-content/80 hover:text-accent transition-colors">
                  커뮤니티
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">정책</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-neutral-content/80 hover:text-accent transition-colors">
                  개인정보처리방침
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-content/80 hover:text-accent transition-colors">
                  이용약관
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border text-center">
          <p className="text-sm text-neutral-content/70">
            © 2025 Grozy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 