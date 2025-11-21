import React, { useState } from 'react';
import { useAppState } from '../App';
import { useMessageStore } from '../stores/messageStore';
import { useUserStore } from '../stores/userStore';

export default function MessagesScreen() {
  const { dispatch } = useAppState();
  const messageStore = useMessageStore();
  const userStore = useUserStore();
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  
  const messages = messageStore.getAllMessages();
  const unreadCount = messageStore.getUnreadMessages().length;

  const handleMessageClick = (messageId: string) => {
    if (expandedMessageId === messageId) {
      setExpandedMessageId(null);
    } else {
      setExpandedMessageId(messageId);
      messageStore.markAsRead(messageId);
    }
  };

  const handleBack = () => {
    dispatch({ type: 'NAVIGATE_TO', payload: 'garden' });
  };

  return (
    <div 
      className="h-full w-full flex flex-col"
      style={{ backgroundColor: '#bd664a' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12 pb-4">
        <button
          onClick={handleBack}
          className="text-white hover:opacity-80 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white">Messages from {userStore.gnomeName}</h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-white text-lg mb-2">No messages yet</p>
            <p className="text-white/70 text-sm">Your gnome will send you messages here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isExpanded = expandedMessageId === message.id;
              const isUnread = !message.read;

              return (
                <div
                  key={message.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-200"
                  style={{
                    transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <button
                    onClick={() => handleMessageClick(message.id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-black text-base">
                            {message.title}
                          </h3>
                          {isUnread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        {isExpanded ? (
                          <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">
                            {message.content}
                          </p>
                        ) : (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {message.content}
                          </p>
                        )}
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(message.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}









