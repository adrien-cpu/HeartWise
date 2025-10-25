"use client"
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, serverTimestamp, addDoc, updateDoc } from "firebase/firestore"; 
import { Loader2 } from 'lucide-react';

// Mock data for potential matches
// In a real app, this would come from a backend service
const getPotentialMatches = async (currentUserId: string) => {
  const usersRef = collection(firestore, "users");
  const q = query(usersRef, where("id", "!=", currentUserId));
  const querySnapshot = await getDocs(q);
  const users: any[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  return users;
};


export default function SpeedDatingPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchMatches = async () => {
      try {
        setLoading(true);
        const potentialMatches = await getPotentialMatches(currentUser.uid);
        setMatches(potentialMatches);
      } catch (err) {
        setError("Failed to load potential matches.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUser]);

  const startDatingSession = async (matchId: string) => {
    if (!currentUser) return;

    try {
      // Check for existing active session for simplicity
      // A real-world scenario would need more robust session management
      const newSessionRef = await addDoc(collection(firestore, "speedDatingSessions"), {
        participants: [currentUser.uid, matchId],
        status: 'active',
        createdAt: serverTimestamp(),
        expiresAt: serverTimestamp() // You'd calculate an expiry time
      });

      const matchDoc = await getDoc(doc(firestore, "users", matchId));
      if(matchDoc.exists()) {
          setCurrentMatch({id: matchDoc.id, ...matchDoc.data()});
      }
      
      setSession({ id: newSessionRef.id });

    } catch (err) {
      setError("Could not start dating session.");
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (session && currentMatch) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Speed Dating with {currentMatch.name}</h1>
        <div className="border rounded-lg p-4 bg-gray-50">
          {/* Video call UI would go here */}
          <p>Video call interface placeholder.</p>
          <p>Time remaining: 5:00</p>
          <button onClick={() => setSession(null)} className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            End Call
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Find a Speed Date</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => (
          <div key={match.id} className="border rounded-lg p-4 text-center shadow-lg">
            <img src={match.profilePicture || 'https://via.placeholder.com/150'} alt={match.name} className="w-24 h-24 rounded-full mx-auto mb-2" />
            <h2 className="text-lg font-semibold">{match.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{match.bio?.substring(0, 50)}...</p>
            <button onClick={() => startDatingSession(match.id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Start 5-min Date
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
