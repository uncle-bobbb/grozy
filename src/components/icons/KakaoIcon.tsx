import React from "react";

export function KakaoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M12 2.5C6.201 2.5 1.5 6.23 1.5 10.829C1.5 13.666 3.334 16.168 6.189 17.527C5.953 18.313 5.109 20.822 5.035 21.184C4.945 21.637 5.294 21.631 5.495 21.499C5.651 21.394 8.581 19.472 9.756 18.675C10.496 18.783 11.243 18.829 12 18.829C17.799 18.829 22.5 15.096 22.5 10.5C22.5 5.904 17.799 2.5 12 2.5Z"
      />
    </svg>
  );
} 