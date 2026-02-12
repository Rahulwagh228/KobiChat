'use client';

import React, { useEffect, useState } from 'react';

interface Heart {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const generateHearts = () => {
      const newHearts: Heart[] = [];
      for (let i = 0; i < 5; i++) {
        newHearts.push({
          id: Math.random(),
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 3 + Math.random() * 2,
        });
      }
      setHearts(newHearts);
    };

    generateHearts();

    const interval = setInterval(generateHearts, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="floating-heart"
          style={
            {
              '--left': `${heart.left}%`,
              '--delay': `${heart.delay}s`,
              '--duration': `${heart.duration}s`,
            } as React.CSSProperties
          }
        >
          ❤️
        </div>
      ))}
    </>
  );
}
