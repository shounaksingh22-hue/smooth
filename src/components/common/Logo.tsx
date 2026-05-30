import React from "react";

/*
  SSmooth mark: a single smooth monoline "S" (Shounak's initial and the
  "smooth" idea), finished with a small node at the top terminus so it reads
  like a tuned signal rather than a typeface letter. Inherits currentColor.
*/
export const Logo: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M16.4 7.7C16.4 5 12.7 4.4 10.3 5.6 7.4 7.1 8 10.5 11.6 11.7 15.2 12.9 16.6 16 14.2 18 11.8 20 7.8 19 7.5 16.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16.4" cy="7.7" r="1.2" fill="currentColor" />
  </svg>
);
