import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((fn) => fn());
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    promptListeners.forEach((fn) => fn());
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => globalDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        if (localStorage.getItem('banglabazar_pwa_installed') === 'true') return true;
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
        if ((window.navigator as unknown as { standalone?: boolean })?.standalone === true) return true;
        if (document.referrer.includes('android-app://')) return true;
      }
    } catch (_) {}
    return false;
  });
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed)
    let isStandalone = false;
    try {
      if (typeof window !== 'undefined') {
        if (localStorage.getItem('banglabazar_pwa_installed') === 'true') {
          isStandalone = true;
        } else if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
          isStandalone = true;
          localStorage.setItem('banglabazar_pwa_installed', 'true');
        } else if ((window.navigator as unknown as { standalone?: boolean })?.standalone === true) {
          isStandalone = true;
          localStorage.setItem('banglabazar_pwa_installed', 'true');
        } else if (document.referrer.includes('android-app://')) {
          isStandalone = true;
          localStorage.setItem('banglabazar_pwa_installed', 'true');
        }
      }
    } catch (_) {}
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect iOS devices
    let isIOSDevice = false;
    try {
      const userAgent = (window.navigator?.userAgent || '').toLowerCase();
      isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    } catch (_) {}
    setIsIOS(isIOSDevice);

    const updatePrompt = () => {
      setDeferredPrompt(globalDeferredPrompt);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      try {
        localStorage.setItem('banglabazar_pwa_installed', 'true');
      } catch (_) {}
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    promptListeners.add(updatePrompt);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
      promptListeners.delete(updatePrompt);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (globalDeferredPrompt) {
      try {
        await globalDeferredPrompt.prompt();
        const { outcome } = await globalDeferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          try {
            localStorage.setItem('banglabazar_pwa_installed', 'true');
          } catch (_) {}
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          promptListeners.forEach((fn) => fn());
          return true;
        }
      } catch (err) {
        console.error('PWA prompt error:', err);
      }
    }
    return false;
  }, []);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}
