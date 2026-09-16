import React, { useState } from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center text-sm font-medium text-gray-500">
        Your safety. Your circle. Your control.
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="relative !p-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d81b60] rounded-full"></span>
        </Button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'Loading...'}</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <button 
            onClick={handleLogout}
            className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
