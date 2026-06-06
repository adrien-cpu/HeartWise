"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Icons } from '@/components/icons';

export function Sidebar() {
    const t = useTranslations('Home');

    return (
        <aside className="w-64 bg-card border-r h-screen p-4">
            <div className="mb-8">
                <Link href="/" className="text-xl font-bold">
                    HeartWise
                </Link>
            </div>
            <nav>
                <ul className="space-y-2">
                    <li>
                        <Link href="/dashboard" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                            <Icons.home className="h-5 w-5" />
                            <span>{t('dashboard')}</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/game" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                            <Icons.gamepad className="h-5 w-5" />
                            <span>{t('game')}</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/speed-dating" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                            <Icons.zap className="h-5 w-5" />
                            <span>{t('speedDating')}</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/chat" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                            <Icons.messageCircle className="h-5 w-5" />
                            <span>{t('chat')}</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
} 