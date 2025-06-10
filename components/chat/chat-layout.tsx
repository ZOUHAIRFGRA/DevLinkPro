'use client';

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import NewChatDialog from './new-chat-dialog';

interface Conversation {
  _id: string;
  type: 'project_group' | 'private_chat';
  participants: Array<{
    _id: string;
    name: string;
    image?: string;
  }>;
  projectId?: {
    _id: string;
    title: string;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  lastActivity: string;
}

interface ChatLayoutProps {
  children: React.ReactNode;
  activeConversationId?: string;
}

export default function ChatLayout({ children, activeConversationId }: ChatLayoutProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'project_group') {
      return conversation.projectId?.title || 'Project Chat';
    } else {
      // For private chat, show the other person's name
      return conversation.participants[0]?.name || 'Private Chat';
    }
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'project_group') {
      return null; // Project icon or first participant
    } else {
      return conversation.participants[0]?.image;
    }
  };

  const handleConversationCreated = (conversationId: string) => {
    // Refresh conversations list and navigate
    fetchConversations();
    window.location.href = `/chats/${conversationId}`;
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Chats</h2>
          <p className="text-sm text-muted-foreground">
            {conversations.length} conversations
          </p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-xs mt-2">
                  Start by creating a new chat below
                </p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <a
                  key={conversation._id}
                  href={`/chats/${conversation._id}`}
                  className={`block p-3 rounded-lg hover:bg-muted transition-colors mb-2 ${
                    activeConversationId === conversation._id ? 'bg-muted border' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={getConversationAvatar(conversation) || undefined} />
                        <AvatarFallback>
                          {conversation.type === 'project_group' ? (
                            <Users className="h-6 w-6" />
                          ) : (
                            <User className="h-6 w-6" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.type === 'project_group' && (
                        <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                          <Users className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {getConversationName(conversation)}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Badge variant="secondary" className="text-xs">
                            {conversation.type === 'project_group' ? 'Group' : 'Private'}
                          </Badge>
                        </div>
                      </div>
                      
                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {conversation.participants.length} participant{conversation.participants.length > 1 ? 's' : ''}
                        </span>
                        {conversation.lastActivity && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </ScrollArea>
        
        {/* New Chat Button */}
        <div className="p-4 border-t">
          <NewChatDialog onConversationCreated={handleConversationCreated} />
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}