import React from 'react';
import Feeed from '../Feeed';

function SocialMediaPost({ showCreatePost, groupID }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-[#0A3A4C] to-[#174873] p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6 mx-2 sm:mx-0 mt-2 sm:mt-0 rounded-lg sm:rounded-t-2xl">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">Social Feed</h1>
        <p className="text-white/80 text-xs sm:text-sm">Stay connected with your community</p>
      </div>
      
      {/* Feed Container */}
      <div className="px-2 sm:px-4">
        <Feeed 
          entityType='posts' 
          showCreatePost={showCreatePost} 
          showDeleteButton={true} 
          groupID={groupID}
        />
      </div>
    </div>
  );
}

export default SocialMediaPost;
