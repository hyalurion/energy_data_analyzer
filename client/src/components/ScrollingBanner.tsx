import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ScrollingBannerProps {
  messages: string[];
  speed?: number;
  pauseOnHover?: boolean;
}

// 随机排序数组的函数
const shuffleArray = (array: string[]): string[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function ScrollingBanner({
  messages,
  speed = 30,
  pauseOnHover = true
}: ScrollingBannerProps) {
  const { theme } = useTheme();
  const [shuffledMessages, setShuffledMessages] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    // 随机排序消息
    setShuffledMessages(shuffleArray(messages));
  }, [messages]);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    
    if (!container || !content || shuffledMessages.length === 0) return;

    // 强制重新计算布局
    const refreshLayout = () => {
      content.style.display = 'none';
      content.offsetHeight; // 触发重排
      content.style.display = 'flex';
    };

    // 初始化时刷新布局
    refreshLayout();

    // 监听窗口大小变化，重新计算布局
    window.addEventListener('resize', refreshLayout);

    const animate = () => {
      if (isPausedRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      positionRef.current -= 1;
      
      // 当内容完全滚动出容器时，重置位置
      if (positionRef.current < -content.offsetWidth / 2) {
        positionRef.current = 0;
      }
      
      content.style.transform = `translateX(${positionRef.current}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', refreshLayout);
    };
  }, [speed, shuffledMessages]);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      isPausedRef.current = true;
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      isPausedRef.current = false;
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden py-4 glass-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={contentRef}
        className="flex whitespace-nowrap"
        style={{
          display: 'flex',
          alignItems: 'center'
        } as React.CSSProperties}
      >
        {/* 原始消息 */}
        {shuffledMessages.map((message, index) => (
          <span
            key={index}
            className="inline-block px-8 text-sm md:text-base font-medium text-foreground"
          >
            {message}
          </span>
        ))}
        {/* 重复消息以实现无缝滚动 */}
        {shuffledMessages.map((message, index) => (
          <span
            key={`copy-${index}`}
            className="inline-block px-8 text-sm md:text-base font-medium text-foreground"
          >
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
