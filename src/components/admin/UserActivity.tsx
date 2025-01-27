import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity } from 'lucide-react';
import type { User } from '../types/auth';

interface UserActivityProps {
  users: User[];
}

export function UserActivity({ users }: UserActivityProps) {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    // Sort users by creation date and get the 5 most recent
    const sorted = [...users].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5);
    
    setRecentUsers(sorted);
  }, [users]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      
      {recentUsers.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No recent activity</p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium text-sm sm:text-base">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{user.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-11 sm:ml-0">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}