import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  fullWidth = false,
  icon: Icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#d81b60] text-white hover:bg-[#ad1457] shadow-sm focus:ring-[#d81b60]",
    secondary: "bg-white text-[#2d3748] border border-gray-200 hover:border-[#f48fb1] hover:bg-gray-50 focus:ring-[#f48fb1]",
    danger: "bg-[#ef4444] text-white hover:bg-red-700 shadow-sm focus:ring-red-500",
    ghost: "text-gray-600 hover:text-[#d81b60] hover:bg-gray-100 focus:ring-gray-200",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  );
};

export default Button;
