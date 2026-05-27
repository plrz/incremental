"use client";

import React from 'react';

interface TwemojiProps {
  emoji: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Twemoji({ emoji, className, style }: TwemojiProps) {
  if (!emoji) return null;

  // Convert emoji to its Unicode hex codes
  const codePoints = Array.from(emoji)
    .map(char => char.codePointAt(0)!.toString(16))
    .filter(hex => hex !== 'fe0f'); // Remove variation selector (standard twemoji parsing)
  
  const src = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@14.1.2/assets/svg/${codePoints.join('-')}.svg`;

  return (
    <img
      src={src}
      alt={emoji}
      className={className}
      style={{
        width: '1em',
        height: '1em',
        display: 'inline-block',
        verticalAlign: '-0.1em',
        ...style,
      }}
      draggable={false}
    />
  );
}
