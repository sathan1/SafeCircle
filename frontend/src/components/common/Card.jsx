import React from 'react';

const Card = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-sm transition-shadow duration-150 ${className}`}
      {...props}
    >
      {!noPadding ? (
        <div className="p-6">{children}</div>
      ) : (
        children
      )}
    </div>
  );
};

export default Card;
