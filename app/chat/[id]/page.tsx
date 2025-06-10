import { Suspense } from 'react';
import ChatLayout from '@/components/chat/chat-layout';
import ConversationChat from '@/components/chat/conversation-chat';

interface ChatConversationPageProps {
  params: {
    id: string;
  };
}

export default function ChatConversationPage({ params }: ChatConversationPageProps) {
  return (
    <div className="h-screen">
      <Suspense fallback={<div>Loading chat...</div>}>
        <ChatLayout activeConversationId={params.id}>
          <ConversationChat conversationId={params.id} />
        </ChatLayout>
      </Suspense>
    </div>
  );
}
