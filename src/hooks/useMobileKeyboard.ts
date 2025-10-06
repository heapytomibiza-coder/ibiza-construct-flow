import { useState, useEffect } from 'react';

export const useMobileKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      // Visual viewport API is the most reliable way to detect keyboard
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const difference = windowHeight - viewportHeight;

        if (difference > 150) {
          setIsKeyboardVisible(true);
          setKeyboardHeight(difference);
        } else {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return {
    isKeyboardVisible,
    keyboardHeight
  };
};
