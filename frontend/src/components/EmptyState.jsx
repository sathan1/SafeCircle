import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-gray-100 h-full min-h-[300px]">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
