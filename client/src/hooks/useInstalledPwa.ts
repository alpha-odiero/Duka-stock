import { useEffect, useState } from 'react';

// True when the app is running as an installed/standalone PWA (launched from
// the home screen) as opposed to a normal browser tab. Installed desktop PWA
// windows also report standalone — viewport detection handles the layout
// distinction elsewhere (sidebar on desktop, bottom nav on small screens).
export function useIsInstalledPwa(): boolean {
  const getIsStandalone = () =>
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      (window.matchMedia('(display-mode: fullscreen)').matches &&
        typeof (window.navigator as unknown as { standalone?: boolean }).standalone === 'boolean'));

  const [installed, setInstalled] = useState<boolean>(() => getIsStandalone());

  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)');
    const update = () => setInstalled(getIsStandalone());
    update();
    mql.addEventListener('change', update);
    window.addEventListener('appinstalled', update);
    return () => {
      mql.removeEventListener('change', update);
      window.removeEventListener('appinstalled', update);
    };
  }, []);

  return installed;
}
