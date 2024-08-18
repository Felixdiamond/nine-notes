'use client';

import { useState } from 'react';
import ChatBtn from './ChatBtn';
import AIChatBox from './AIChatBox';
import BlurOverlay from './BlurOverlay';

export default function ChatManager() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <BlurOverlay isVisible={isChatOpen} />
      <ChatBtn onOpenChange={setIsChatOpen} />
      <AIChatBox open={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}