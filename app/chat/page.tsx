import { Suspense } from 'react';
import ChatLayout from '@/components/chat/chat-layout';

export default function ChatPage() {
  return (
    <div className="h-screen">
      <Suspense fallback={<div>Loading chat...</div>}>
        <ChatLayout>
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">Select a conversation to start chatting</p>
              <p className="text-sm">Or create a new private chat using the button in the sidebar</p>
            </div>
          </div>
        </ChatLayout>
      </Suspense>
    </div>
  );
}
