"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Heart, MessageCircle, Users, Trophy } from "lucide-react";

export default function LocaleHomePage() {
    const t = useTranslations("Home");

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">{t("welcome")}</h1>
                <p className="text-xl text-muted-foreground">{t("description")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-primary" />
                            {t("features.matchmaking.title")}
                        </CardTitle>
                        <CardDescription>{t("features.matchmaking.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/facial-analysis-matching">
                            <Button className="w-full">{t("features.matchmaking.cta")}</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            {t("features.chat.title")}
                        </CardTitle>
                        <CardDescription>{t("features.chat.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/chat">
                            <Button className="w-full">{t("features.chat.cta")}</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            {t("features.speedDating.title")}
                        </CardTitle>
                        <CardDescription>{t("features.speedDating.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/speed-dating">
                            <Button className="w-full">{t("features.speedDating.cta")}</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            {t("features.rewards.title")}
                        </CardTitle>
                        <CardDescription>{t("features.rewards.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/rewards">
                            <Button className="w-full">{t("features.rewards.cta")}</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
} 