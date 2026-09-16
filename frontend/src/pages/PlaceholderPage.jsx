import React from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description="This section is currently under construction for Phase 2." />
      <Card>
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-500 max-w-md">
            The {title} functionality will be implemented in an upcoming development phase.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
