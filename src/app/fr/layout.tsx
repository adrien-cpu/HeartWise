import { ReactNode } from 'react';
import { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function FrLayout({ children }: { children: ReactNode }) {
  return children;
}