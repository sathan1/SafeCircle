import React from 'react';

const Card = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {!noPadding ? (
        <div className="p-6">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default Card;
