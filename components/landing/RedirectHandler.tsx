'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function RedirectHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (!redirect) return;

    const cleanPath = redirect.replace(/^\/+/, '');
    if (cleanPath) {
      router.replace(`/${cleanPath}`);
    }
  }, [searchParams, router]);

  return null;
}
