import React from 'react';

const Input = ({ label, id, type = 'text', className = '', error, ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f48fb1] focus:border-transparent transition-all ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Input;
