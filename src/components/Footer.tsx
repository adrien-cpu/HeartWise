import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from 'next-intl';
import { Icons } from "@/components/icons";

export default function Footer() {
    const t = useTranslations('Footer');

    return (
        <footer className="bg-card border-t border-border pt-12 pb-6 mt-12 w-full overflow-x-hidden">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 flex-wrap">
                    {/* Logo & baseline */}
                    <div className="mb-8 md:mb-0 min-w-[220px] max-w-xs flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-primary text-primary-foreground font-bold rounded-lg px-3 py-1.5 text-lg">HW</div>
                            <span className="text-2xl font-bold text-primary">HeartWise</span>
                        </div>
                        <p className="text-muted-foreground">{t('tagline')}</p>
                    </div>
                    {/* Liens */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-w-0">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">{t('features')}</h3>
                            <ul className="space-y-3 text-muted-foreground">
                                <li><Link href="/matchmaking" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <Icons.users className="h-4 w-4" />
                                    {t('matchmaking')}
                                </Link></li>
                                <li><Link href="/speed-dating" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <Icons.zap className="h-4 w-4" />
                                    {t('speedDating')}
                                </Link></li>
                                <li><Link href="/chat" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <Icons.messageCircle className="h-4 w-4" />
                                    {t('chat')}
                                </Link></li>
                                <li><Link href="/rewards" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <Icons.award className="h-4 w-4" />
                                    {t('rewards')}
                                </Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">{t('resources')}</h3>
                            <ul className="space-y-3 text-muted-foreground">
                                <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <Icons.helpCircle className="h-4 w-4" />
                                    {t('about')}
                                </Link></li>
                                <li><Link href="/faq" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <Icons.helpCircle className="h-4 w-4" />
                                    {t('faq')}
                                </Link></li>
                                <li><Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <Icons.mail className="h-4 w-4" />
                                    {t('contact')}
                                </Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">{t('legal')}</h3>
                            <ul className="space-y-3 text-muted-foreground">
                                <li><Link href="/terms" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <Icons.fileText className="h-4 w-4" />
                                    {t('terms')}
                                </Link></li>
                                <li><Link href="/privacy" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <Icons.shield className="h-4 w-4" />
                                    {t('privacy')}
                                </Link></li>
                                <li><Link href="/cookies" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <Icons.cookie className="h-4 w-4" />
                                    {t('cookies')}
                                </Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <Separator className="my-8" />
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground flex-wrap">
                    <span className="truncate">© {new Date().getFullYear()} HeartWise. {t('rights')}</span>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
                            <Icons.instagram className="h-5 w-5" />
                        </a>
                        <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
                            <Icons.twitter className="h-5 w-5" />
                        </a>
                        <a href="#" className="hover:text-primary transition-colors" aria-label="Facebook">
                            <Icons.facebook className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
} 