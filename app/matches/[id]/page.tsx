import { Suspense } from 'react';
import MatchChat from '@/components/matches/match-chat';

export default function MatchDetailPage() {
  return (
    <Suspense fallback={<div>Loading match...</div>}>
      <MatchChat />
    </Suspense>
  );
}
