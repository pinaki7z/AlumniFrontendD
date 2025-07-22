import React from 'react';
import Feeed from '../Feeed';

function SocialMediaPost({ showCreatePost, groupID }) {
  return (
    <div className="min-h-screen mx-auto max-w-2xl">
      {/* Feed Container - Now works with window scroll */}
      <div className="flex flex-col items-center px-2 pb-8">
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
