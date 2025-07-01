"use client";

import { Heart, MessageCircle, Users, Trophy, Gamepad2, Zap, LocateFixed, Smile, EyeOff } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-bold text-pink-600 mb-4">
                        HeartWise
                    </h1>
                    <p className="text-2xl text-gray-700 mb-8">
                        Trouvez votre âme sœur
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-pink-200">
                        <Gamepad2 className="w-12 h-12 text-pink-500 mb-4" />
                        <h3 className="text-xl font-semibold text-pink-600 mb-2">Jeux</h3>
                        <p className="text-gray-600 mb-4">Jouez à des jeux amusants pour vous connecter avec d'autres.</p>
                        <Link href="/game" className="inline-block bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors">
                            Jouer
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-orange-200">
                        <Zap className="w-12 h-12 text-orange-500 mb-4" />
                        <h3 className="text-xl font-semibold text-orange-600 mb-2">Speed Dating</h3>
                        <p className="text-gray-600 mb-4">Sessions de speed dating virtuelles rapides et basées sur les intérêts.</p>
                        <Link href="/speed-dating" className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                            Participer
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-200">
                        <LocateFixed className="w-12 h-12 text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold text-green-600 mb-2">Rencontres Géolocalisées</h3>
                        <p className="text-gray-600 mb-4">Découvrez des personnes dans des lieux publics près de chez vous.</p>
                        <Link href="/geolocation-meeting" className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                            Découvrir
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-200">
                        <Smile className="w-12 h-12 text-purple-500 mb-4" />
                        <h3 className="text-xl font-semibold text-purple-600 mb-2">Analyse Faciale</h3>
                        <p className="text-gray-600 mb-4">L'IA suggère des correspondances basées sur la compatibilité faciale.</p>
                        <Link href="/facial-analysis-matching" className="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                            Analyser
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-200">
                        <MessageCircle className="w-12 h-12 text-blue-500 mb-4" />
                        <h3 className="text-xl font-semibold text-blue-600 mb-2">Coach IA</h3>
                        <p className="text-gray-600 mb-4">Obtenez des conseils alimentés par l'IA pour améliorer vos conversations.</p>
                        <Link href="/ai-conversation-coach" className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            Conseils
                        </Link>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200">
                        <EyeOff className="w-12 h-12 text-gray-500 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Mode Échange Aveugle</h3>
                        <p className="text-gray-600 mb-4">Connectez-vous sans voir les photos ou profils initialement.</p>
                        <Link href="/blind-exchange-mode" className="inline-block bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                            Essayer
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}