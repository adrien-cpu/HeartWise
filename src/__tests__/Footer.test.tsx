import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';
import { NextIntlClientProvider } from 'next-intl';
import { describe, it, expect } from 'vitest';

// Mock messages for next-intl
const messages = {
  Footer: {
    tagline: 'Find your soulmate.',
    features: 'Features',
    matchmaking: 'Matchmaking',
    speedDating: 'Speed Dating',
    chat: 'Chat',
    rewards: 'Rewards',
    resources: 'Resources',
    about: 'About Us',
    faq: 'FAQ',
    contact: 'Contact',
    legal: 'Legal',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    cookies: 'Cookie Policy',
    rights: 'All rights reserved.',
  },
};

describe('Footer Component', () => {
  it('renders the copyright notice', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Footer />
      </NextIntlClientProvider>
    );
    const copyrightElement = screen.getByText(/© \d{4} HeartWise. All rights reserved./i);
    expect(copyrightElement).toBeInTheDocument();
  });
});
