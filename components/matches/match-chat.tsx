'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Send, ArrowLeft, User, Github, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { pusherClient } from '@/lib/pusher';
import Link from 'next/link';

interface Message {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    name: string;
    image?: string;
  };
  messageType: 'text' | 'system';
  createdAt: string;
}

interface Match {
  _id: string;
  userId: string;
  targetId: string;
  targetType: 'project' | 'user';
  targetData: {
    _id: string;
    name?: string;
    title?: string;
    image?: string;
    githubData?: {
      username: string;
    };
    owner?: {
      name: string;
      image?: string;
      githubData?: {
        username: string;
      };
    };
  };
}

export default function MatchChat() {
  const params = useParams();
  const matchId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages?matchId=${matchId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setMatch(data.match);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          matchId,
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        setNewMessage('');
        // Message will be added via Pusher real-time update
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchMessages();
      
      // Subscribe to real-time updates
      const channelName = `match-${matchId}`;
      const channel = pusherClient.subscribe(channelName);
      
      channel.bind('new-message', (data: { message: Message; matchId: string }) => {
        if (data.matchId === matchId) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg._id === data.message._id);
            if (!exists) {
              return [...prev, data.message];
            }
            return prev;
          });
        }
      });
      
      return () => {
        channel.unbind('new-message');
        pusherClient.unsubscribe(channelName);
      };
    }
  }, [matchId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading match...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Match not found</div>
      </div>
    );
  }

  if (!match.targetData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading match details...</div>
      </div>
    );
  }

  const isProject = match.targetType === 'project';
  const targetName = isProject ? match.targetData.title : match.targetData.name;
  const targetImage = isProject ? match.targetData.owner?.image : match.targetData.image;
  const githubUsername = isProject ? match.targetData.owner?.githubData?.username : match.targetData.githubData?.username;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        
        {/* Match Info Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Link href="/matches">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <CardTitle className="text-lg">Match Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3">
                  <AvatarImage src={targetImage} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{targetName}</h3>
                {githubUsername && (
                  <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mt-1">
                    <Github className="h-4 w-4" />
                    <span>@{githubUsername}</span>
                  </div>
                )}
                <Badge variant="default" className="mt-2">
                  {isProject ? 'Project Match' : 'Developer Match'}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Next Steps</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Start conversation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Discuss project details</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Set up collaboration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Start working together</span>
                  </div>
                </div>
              </div>

              {isProject && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Collaboration Tools</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Github className="h-4 w-4 mr-2" />
                        Set up GitHub access
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Create Discord server
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">
                Chat with {targetName}
              </CardTitle>
            </CardHeader>
            
            {/* Messages */}
            <CardContent className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 pb-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Start the conversation!</p>
                      <p className="text-sm mt-2">
                        {isProject ? 
                          "Discuss project requirements, timeline, and how you can contribute." :
                          "Talk about potential collaboration opportunities."
                        }
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message._id} className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.senderId.image} />
                          <AvatarFallback>
                            {message.senderId.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {message.senderId.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          <div className="bg-muted rounded-lg p-3 text-sm">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="flex items-center space-x-2 pt-4 border-t">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  maxLength={2000}
                />
                <Button type="submit" disabled={!newMessage.trim() || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
