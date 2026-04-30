import { useEffect, useState } from 'react';

interface ScrollingBannerProps {
  messages: string[];
  speed?: number;
}

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
}: ScrollingBannerProps) {
  const [shuffledMessages, setShuffledMessages] = useState<string[]>([]);

  useEffect(() => {
    setShuffledMessages(shuffleArray(messages));
  }, [messages]);

  useEffect(() => {
    const animationDuration = `${Math.max(8, shuffledMessages.length * 0.8)}s`;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .scroll-animation {
        animation: scroll ${animationDuration} linear infinite;
      }
      .scrolling-banner {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.98) 100%);
        border-top: 1px solid rgba(203, 213, 225, 0.5);
        box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(0, 0, 0, 0.03);
      }
      .scrolling-banner .edge-mask {
        background: linear-gradient(to right, 
          rgba(255, 255, 255, 0.98) 0%, 
          transparent 10%, 
          transparent 90%, 
          rgba(255, 255, 255, 0.98) 100%
        );
      }
      .scrolling-banner .message-item {
        color: #334155;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      .scrolling-banner .message-dot {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }
      
      @media (prefers-color-scheme: dark) {
        .scrolling-banner {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
          border-top: 1px solid rgba(100, 116, 139, 0.3);
          box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        .scrolling-banner .edge-mask {
          background: linear-gradient(to right, 
            rgba(15, 23, 42, 0.98) 0%, 
            transparent 10%, 
            transparent 90%, 
            rgba(15, 23, 42, 0.98) 100%
          );
        }
        .scrolling-banner .message-item {
          color: #e2e8f0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        .scrolling-banner .message-dot {
          background: rgba(59, 130, 246, 0.2);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [shuffledMessages]);

  return (
    <div
      className="scrolling-banner fixed bottom-0 left-0 right-0 z-50 overflow-hidden py-3"
      style={{ backdropFilter: 'blur(20px)' }}
    >
      <div className="edge-mask absolute inset-0 pointer-events-none" />
      
      <div className="scroll-content scroll-animation flex whitespace-nowrap">
        {[...shuffledMessages, ...shuffledMessages].map((message, index) => (
          <span
            key={index}
            className="message-item inline-flex items-center px-8 text-sm md:text-base font-medium"
            style={{ transition: 'transform 0.2s ease, opacity 0.2s ease' }}
          >
            <span 
              className="message-dot hidden md:inline mr-2"
              style={{ borderRadius: '50%', width: '8px', height: '8px' }}
            />
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
