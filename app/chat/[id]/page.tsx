import { Suspense } from 'react';
import ChatLayout from '@/components/chat/chat-layout';
import ConversationChat from '@/components/chat/conversation-chat';

interface ChatConversationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatConversationPage({ params }: ChatConversationPageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatLayout activeConversationId={id}>
        <ConversationChat conversationId={id} />
      </ChatLayout>
    </Suspense>
  );
}
