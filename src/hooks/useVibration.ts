export const useVibration = () => {
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const vibrateSuccess = () => vibrate(50);
  const vibrateError = () => vibrate([100, 50, 100]);
  const vibrateWarning = () => vibrate([50, 100, 50]);
  const vibrateClick = () => vibrate(10);

  return {
    vibrate,
    vibrateSuccess,
    vibrateError,
    vibrateWarning,
    vibrateClick
  };
};
