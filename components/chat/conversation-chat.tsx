'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pusherClient } from '@/lib/pusher';
import { toast } from 'sonner';

interface Message {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    name: string;
    image?: string;
  };
  conversationId?: string;
  matchId?: string; // Legacy support
  messageType: 'text' | 'image' | 'file' | 'system';
  reactions: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;
  createdAt: string;
}

interface ConversationChatProps {
  conversationId: string;
}

export default function ConversationChat({ conversationId }: ConversationChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mark message as read
  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action: 'markRead' })
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, [conversationId]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
    try {
      await fetch(`/api/conversations/${conversationId}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTyping })
      });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [conversationId]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        } else {
          toast.error('Failed to load messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  // Real-time messaging setup
  useEffect(() => {
    if (!conversationId) return;

    const channelName = `conversation-${conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    // New message handler
    const handleNewMessage = (message: Message) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
      
      // Mark as read if not sent by current user
      if (session?.user?.id && message.senderId._id !== session.user.id) {
        markMessageAsRead(message._id);
      }
    };

    // Typing indicator handler
    const handleTyping = (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (data.userId === session?.user?.id) return;
      
      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.includes(data.userName) ? prev : [...prev, data.userName];
        } else {
          return prev.filter(name => name !== data.userName);
        }
      });
    };

    // Reaction handler
    const handleReaction = (data: { messageId: string; emoji: string; userId: string; userName: string; action: 'add' | 'remove' }) => {
      setMessages(prev => prev.map(message => {
        if (message._id === data.messageId) {
          let updatedReactions = [...message.reactions];
          
          if (data.action === 'add') {
            // Remove existing reaction from this user
            updatedReactions = updatedReactions.filter(r => r.userId !== data.userId);
            // Add new reaction
            updatedReactions.push({
              emoji: data.emoji,
              userId: data.userId,
              userName: data.userName
            });
          } else {
            // Remove reaction
            updatedReactions = updatedReactions.filter(r => !(r.userId === data.userId && r.emoji === data.emoji));
          }
          
          return {
            ...message,
            reactions: updatedReactions
          };
        }
        return message;
      }));
    };

    channel.bind('new-message', handleNewMessage);
    channel.bind('typing', handleTyping);
    channel.bind('reaction', handleReaction);

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [conversationId, session?.user?.id, markMessageAsRead]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() })
      });

      if (response.ok) {
        setNewMessage('');
        // Stop typing indicator
        sendTypingIndicator(false);
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!session?.user?.id) return;
    
    sendTypingIndicator(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000);
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action: 'addReaction', emoji })
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex items-start gap-3 ${
                message.senderId._id === session?.user?.id ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={message.senderId.image} />
                <AvatarFallback>
                  {message.senderId.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex flex-col ${message.senderId._id === session?.user?.id ? 'items-end' : ''}`}>
                <Card className={`max-w-xs sm:max-w-md ${message.senderId._id === session?.user?.id ? 'bg-primary text-primary-foreground' : ''}`}>
                  <CardContent className="p-3">
                    <p className="text-sm break-words">{message.content}</p>
                    
                    {/* Reactions */}
                    {message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.reactions.reduce((acc, reaction) => {
                          const existing = acc.find(r => r.emoji === reaction.emoji);
                          if (existing) {
                            existing.count++;
                            existing.users.push(reaction.userName);
                          } else {
                            acc.push({
                              emoji: reaction.emoji,
                              count: 1,
                              users: [reaction.userName]
                            });
                          }
                          return acc;
                        }, [] as Array<{ emoji: string; count: number; users: string[] }>).map((reaction) => (
                          <Badge
                            key={reaction.emoji}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-secondary/80"
                            onClick={() => addReaction(message._id, reaction.emoji)}
                            title={reaction.users.join(', ')}
                          >
                            {reaction.emoji} {reaction.count}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {message.senderId._id !== session?.user?.id ? message.senderId.name : 'You'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                  
                  {/* Quick reaction button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => addReaction(message._id, '👍')}
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200"></div>
              </div>
              <span>
                {typingUsers.length === 1 
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.join(', ')} are typing...`
                }
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
