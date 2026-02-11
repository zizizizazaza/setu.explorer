import React from 'react';

interface RollingNumberProps {
  value: number;
  suffix?: string;
}

export const RollingNumber = ({ value, suffix = '' }: RollingNumberProps) => {
  const digits = '0123456789'.split('');
  const displayString =
    suffix === 's'
      ? value.toFixed(1)
      : Math.floor(value).toLocaleString();

  return (
    <span className="inline-flex items-baseline tabular-nums">
      {displayString.split('').map((char, i) => {
        if (!Number.isNaN(parseInt(char, 10))) {
          const num = parseInt(char, 10);
          return (
            <span
              key={i}
              className="relative inline-block overflow-hidden h-[1.25em] leading-[1.25em]"
            >
              <span
                className="flex flex-col transition-transform duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)"
                style={{ transform: `translateY(-${num * 1.25}em)` }}
              >
                {digits.map((d) => (
                  <span
                    key={d}
                    className="h-[1.25em] flex items-center justify-center"
                  >
                    {d}
                  </span>
                ))}
              </span>
            </span>
          );
        }
        return <span key={i} className="inline-block">{char}</span>;
      })}
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </span>
  );
};
