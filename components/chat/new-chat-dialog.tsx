'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  githubData?: {
    username: string;
  };
  bio?: string;
  location?: string;
}

interface NewChatDialogProps {
  onConversationCreated?: (conversationId: string) => void;
}

export default function NewChatDialog({ onConversationCreated }: NewChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  // Debounced search
  const searchUsers = useCallback(async () => {
    if (searchQuery.length < 2) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users);
      } else {
        toast.error('Failed to search users');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeout = setTimeout(() => {
        searchUsers();
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchUsers]);

  const createPrivateChat = async (userId: string) => {
    setCreating(true);
    try {
      const response = await fetch('/api/conversations/private', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        const conversationId = data.conversation._id;
        
        toast.success('Chat created successfully!');
        setOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        
        if (onConversationCreated) {
          onConversationCreated(conversationId);
        } else {
          router.push(`/chat/${conversationId}`);
        }
      } else {
        toast.error('Failed to create chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search users by name, email, or username..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="h-64">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => createPrivateChat(user._id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium truncate">{user.name}</p>
                        {user.githubData?.username && (
                          <span className="text-xs text-muted-foreground">
                            @{user.githubData.username}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.bio || user.email}
                      </p>
                      {user.location && (
                        <p className="text-xs text-muted-foreground">
                          📍 {user.location}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={creating}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Search for users to start chatting</p>
                <p className="text-xs mt-1">Type at least 2 characters</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}