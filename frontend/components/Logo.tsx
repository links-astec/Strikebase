export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="18" fill="#0d0b2b"/>
      {/* depth shadow */}
      <text x="9" y="63" fontFamily="'Space Grotesk','Arial Black',sans-serif" fontWeight="900" fontSize="54" fill="#0a5a9e">S</text>
      <text x="42" y="63" fontFamily="'Space Grotesk','Arial Black',sans-serif" fontWeight="900" fontSize="54" fill="#0a5a9e">B</text>
      {/* main letters */}
      <text x="6" y="60" fontFamily="'Space Grotesk','Arial Black',sans-serif" fontWeight="900" fontSize="54" fill="#1EAEFF">S</text>
      <text x="39" y="60" fontFamily="'Space Grotesk','Arial Black',sans-serif" fontWeight="900" fontSize="54" fill="#1EAEFF">B</text>
      {/* lightning bolt — diagonal slash */}
      <path d="M55 7 L39 44 L48 44 L30 73 L63 34 L53 34 Z" fill="white"/>
    </svg>
  );
}

export function LogoIconSmall({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="18" fill="#0d0b2b"/>
      <text x="9" y="63" fontFamily="'Space Grotesk','Arial Black',sans-serif" fontWeight="900" fontSize="54" fill="#0a5a9e">S</text>
      <text x="42" y="63" fontFamily="'Space Grotesk','Arial Black',sans-serif" fontWeight="900" fontSize="54" fill="#0a5a9e">B</text>
      <text x="6" y="60" fontFamily="'Space Grotesk','Arial Black',sans-serif" fontWeight="900" fontSize="54" fill="#1EAEFF">S</text>
      <text x="39" y="60" fontFamily="'Space Grotesk','Arial Black',sans-serif" fontWeight="900" fontSize="54" fill="#1EAEFF">B</text>
      <path d="M55 7 L39 44 L48 44 L30 73 L63 34 L53 34 Z" fill="white"/>
    </svg>
  );
}
