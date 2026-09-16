import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  icon: Icon,
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    secondary: 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-sm focus:ring-rose-300',
    outline: 'bg-transparent text-rose-700 border border-rose-200 hover:bg-rose-50/60 focus:ring-rose-300',
    soft: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 focus:ring-rose-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
    ghost: 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 focus:ring-stone-300'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  const classes = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button className={classes} disabled={disabled} {...props}>
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
