import { useEffect, useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Prompts the user to install DukaStock as a PWA using the browser's real
// installation flow. After installation the state flips to "installed".
export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-700">
        <CheckCircle2 className="h-4 w-4" /> DukaStock installed
      </span>
    );
  }

  if (!deferredPrompt) return null;

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
      setInstalling(false);
    }
  };

  return (
    <Button onClick={handleInstall} disabled={installing} variant="outline">
      {installing ? 'Installing...' : 'Install DukaStock'}
      <Download className="ml-1.5 h-4 w-4" />
    </Button>
  );
}
