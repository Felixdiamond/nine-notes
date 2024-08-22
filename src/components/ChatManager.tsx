'use client';

import { useState, useEffect } from 'react';
import ChatBtn from './ChatBtn';
import AIChatBox from './AIChatBox';
import BlurOverlay from './BlurOverlay';
import { useToast } from './ui/use-toast';

export default function ChatManager() {
  const { toast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [haveShownBefore, setHaveShownBefore] = useState(false);
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    // Only execute this code on the client side
    if (typeof window !== 'undefined') {
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        setLocation(JSON.parse(storedLocation));
        console.log('Location fetched from local storage:', storedLocation);
      } else {
        // Fetch location data if not available in local storage
        const fetchLocation = async () => {
          try {
            const response = await fetch('/api/location');
            const data = await response.json();
            const country = data.country;
            setLocation(country);
            // Store location in local storage
            localStorage.setItem('userLocation', JSON.stringify(country));
          } catch (error) {
            console.error('Error fetching location:', error);
          }
        };

        fetchLocation();
      }
    }
  }, []);

  useEffect(() => {
    if (isChatOpen && !haveShownBefore && location === 'NG') {
      toast({
        title: "Notice",
        description: "The AI service isn't available in Nigeria. Please use a VPN then log in again.",
      });
      setHaveShownBefore(true);
    }
  }, [isChatOpen, haveShownBefore, location, toast]);

  return (
    <>
      <BlurOverlay isVisible={isChatOpen} />
      <ChatBtn onOpenChange={setIsChatOpen} />
      <AIChatBox open={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}