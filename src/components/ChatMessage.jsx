import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ChatMessage = ({ message, isDoctor }) => {
  const isCurrentUser = message.sender === (isDoctor ? 'doctor' : 'patient');
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser 
            ? 'bg-red-600 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <div className="text-sm">{message.text}</div>
        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-red-200' : 'text-gray-500'}`}>
          {message.createdAt && formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
