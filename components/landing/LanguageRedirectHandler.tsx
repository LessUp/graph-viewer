'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const LANGUAGE_KEY = 'graphviewer-language';
const LANGUAGE_DETECTED_KEY = 'graphviewer-language-detected';

/**
 * Language redirect handler
 *
 * Automatically detects browser language and redirects to the appropriate page:
 * - Chinese (zh, zh-CN, zh-TW, zh-HK) → stays on / (Chinese page)
 * - Other languages → redirects to /en/
 *
 * User preference is stored in localStorage to avoid repeated redirects.
 * Language can be manually switched via UI links.
 */
export function LanguageRedirectHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip if already on English page or editor page
    if (pathname?.startsWith('/en/') || pathname?.startsWith('/editor')) {
      return;
    }

    // Check if we've already detected language in this session
    const alreadyDetected = sessionStorage.getItem(LANGUAGE_DETECTED_KEY);
    if (alreadyDetected) {
      return;
    }

    // Mark as detected to prevent repeated redirects
    sessionStorage.setItem(LANGUAGE_DETECTED_KEY, 'true');

    // Check user's saved preference
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      // User has a saved preference, respect it
      if (savedLanguage === 'en' && pathname === '/') {
        router.replace('/en/');
      }
      return;
    }

    // Detect browser language
    const browserLang =
      navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'en';

    // Check if browser language is Chinese
    const isChinese = browserLang.toLowerCase().startsWith('zh');

    if (!isChinese && pathname === '/') {
      // Non-Chinese browser, redirect to English page
      router.replace('/en/');
    }
  }, [router, pathname]);

  return null;
}
