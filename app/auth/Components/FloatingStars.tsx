'use client';

import React, { useEffect, useState } from 'react';
import '../styles/floating-stars.scss';

interface Star {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
}

export default function FloatingStars() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 20; i++) {
        newStars.push({
          id: Math.random(),
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: Math.random() * 2,
          duration: 3 + Math.random() * 2,
          size: 0.5 + Math.random() * 1.5,
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <>
      {stars.map((star) => (
        <div
          key={star.id}
          className="floating-star"
          style={
            {
              '--left': `${star.left}%`,
              '--top': `${star.top}%`,
              '--delay': `${star.delay}s`,
              '--duration': `${star.duration}s`,
              '--size': `${star.size}rem`,
            } as React.CSSProperties
          }
        >
          ✨
        </div>
      ))}
    </>
  );
}
