import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass p-5 ${hoverable ? "glass-hover cursor-pointer transition-all duration-200" : ""} ${className}`}
    >
      {children}
    </div>
  );
};
