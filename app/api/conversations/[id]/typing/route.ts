import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;
    const { isTyping } = await request.json();

    // Trigger typing indicator via Pusher
    const channelName = `conversation-${conversationId}`;
    await pusherServer.trigger(channelName, 'typing', {
      userId: session.user.id,
      userName: session.user.name,
      isTyping: Boolean(isTyping)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling typing indicator:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
