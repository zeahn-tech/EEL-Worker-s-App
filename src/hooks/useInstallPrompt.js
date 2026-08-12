import { useState, useEffect } from 'react';

// Shared install-prompt state so both the pre-login screen and the main app header
// can surface "Install App" — the visitor shouldn't have to log in first to see it.
export const useInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showIosInstallHint, setShowIosInstallHint] = useState(false);

  useEffect(() => {
    const onInstallPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', onInstallPrompt);

    // iOS Safari never fires `beforeinstallprompt` — there's no programmatic install
    // API there at all, so we detect it directly and show manual instructions instead.
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isIos && !isInStandaloneMode) setShowIosInstallHint(true);

    return () => window.removeEventListener('beforeinstallprompt', onInstallPrompt);
  }, []);

  const promptInstall = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then(() => setInstallPrompt(null));
  };

  return { installPrompt, showIosInstallHint, promptInstall };
};
