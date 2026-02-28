import React from 'react';
import { User, Sparkles } from 'lucide-react';

const ChatMessage = ({ role, content, children }) => {
    const isUser = role === 'user';

    return (
        <div className={`px-4 sm:px-6 py-6 sm:py-8 ${isUser ? 'bg-white' : 'bg-surface border-y border-gray-100'}`}>
            <div className="flex gap-4 max-w-4xl mx-auto">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${isUser ? 'bg-gray-100 border border-gray-200 text-gray-600' : 'bg-primary text-white'}`}>
                    {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div className="flex-1 space-y-4">
                    {content && (
                        <div className="text-text leading-relaxed prose prose-slate">
                            {content}
                        </div>
                    )}
                    {children && <div className="mt-4">{children}</div>}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
