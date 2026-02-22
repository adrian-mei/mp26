import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../utils';

interface ButtonProps {
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const Button = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  children, 
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 active:scale-95",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/10",
    icon: "bg-transparent text-white hover:bg-white/10 active:scale-90 p-2",
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-5 py-2.5",
    lg: "text-lg px-8 py-3",
    xl: "p-4", // For big play buttons
    icon: "p-2", // For icon-only buttons
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      {...props}
    >
      {Icon && <Icon className={cn("w-5 h-5", children ? "mr-2" : "")} />}
      {children}
    </button>
  );
};
