import { useState, useEffect } from 'react';

interface AnimatedHeadingProps {
  text: string;
}

export default function AnimatedHeading({ text }: AnimatedHeadingProps) {
  const [animate, setAnimate] = useState(false);
  const charDelay = 30; // 30ms
  const initialDelay = 200; // 200ms initial delay

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, initialDelay);
    return () => clearTimeout(timer);
  }, []);

  const lines = text.split('\n');

  return (
    <h1
      className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4 leading-none select-none text-white"
      style={{ letterSpacing: '-0.04em' }}
    >
      {lines.map((line, lineIndex) => {
        const chars = Array.from(line);
        const lineLength = line.length;

        return (
          <span key={lineIndex} className="block">
            {chars.map((char, charIndex) => {
              const delay = (lineIndex * lineLength * charDelay) + (charIndex * charDelay);
              const displayChar = char === ' ' ? '\u00A0' : char;

              return (
                <span
                  key={charIndex}
                  className="inline-block transition-all duration-[500ms]"
                  style={{
                    opacity: animate ? 1 : 0,
                    transform: animate ? 'translateX(0)' : 'translateX(-18px)',
                    transitionProperty: 'opacity, transform',
                    transitionDelay: `${delay}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {displayChar}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}
