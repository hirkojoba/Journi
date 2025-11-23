import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {title && (
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}
