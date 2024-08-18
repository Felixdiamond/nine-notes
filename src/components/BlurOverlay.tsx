'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BlurOverlayProps {
  isVisible: boolean;
}

const BlurOverlay: React.FC<BlurOverlayProps> = ({ isVisible }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(5px)',
        zIndex: 9,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    />
  );
};

export default BlurOverlay;