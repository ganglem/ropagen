'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Don't render footer on docs pages
  if (pathname?.includes('/docs')) {
    return null;
  }

  return (
    <footer className="py-0">
      <Footer/>
    </footer>
  );
}
