import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Reply } from 'lucide-react';

const Comment = ({ c, ownerEmail, onReply }) => (
  <div className="space-y-2">
    <div className="flex gap-2">
      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <p className={`text-sm ${c.authorEmail===ownerEmail?'mb-2':''}`}>
          <span className={`font-semibold ${c.authorEmail===ownerEmail?'bg-[#0A3A4C] text-white px-2 py-1 rounded-xl':''}`}>
            {c.authorName}
          </span>{' '}
          • <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(c.createdAt))} ago</span>
        </p>
        <p className="text-gray-700 text-sm mb-1">{c.text}</p>
        <button onClick={onReply} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#0A3A4C]">
          <Reply size={12}/> Reply
        </button>
      </div>
    </div>
    {c.replies && c.replies.length>0 && (
      <div className="ml-10 space-y-4">
        {c.replies.map(r => <Comment key={r._id} c={r} ownerEmail={ownerEmail} onReply={() => onReply(r._id)} />)}
      </div>
    )}
  </div>
);

export const CommentThread = ({ ownerEmail, comments, onAdd }) => {
  const [text,setText]=useState('');
  return (
    <div id="comments" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base font-semibold mb-4">Comments</h3>
      <textarea value={text} onChange={e=>setText(e.target.value)}
        placeholder="Write a comment…" rows={3}
        className="w-full border rounded-lg p-3 text-sm mb-3" />
      <button onClick={()=>{onAdd(text);setText('')}} disabled={!text.trim()}
        className="px-4 py-2 bg-[#0A3A4C] text-white rounded-lg text-sm">Post</button>

      <div className="mt-6 space-y-6">
        {comments.map(c=>(
          <Comment key={c._id} c={c} ownerEmail={ownerEmail}
                   onReply={(parentId)=>onAdd('',parentId)} />
        ))}
      </div>
    </div>
  );
};
