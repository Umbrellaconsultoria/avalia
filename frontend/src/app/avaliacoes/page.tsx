'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AvaliacoesPage() {
  const { isAuthenticated, isInitialized, token, user } = useLocalAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || (user?.internalRole !== 'ADMIN' && user?.internalRole !== 'COMPANY_USER'))) {
      router.push('/');
      return;
    }
    if (isInitialized && isAuthenticated) {
      fetchEvaluations();
    }
  }, [isAuthenticated, isInitialized, router, user, eventId]);

  const fetchEvaluations = async () => {
    try {
      let url = 'http://localhost:3001/api/evaluations';
      if (eventId) {
        url += `?eventId=${eventId}`;
      }
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) setEvaluations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = () => {
    if (evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / evaluations.length).toFixed(1);
  };

  if (!isInitialized || !isAuthenticated || loading) {
    return <div className="p-6 text-center text-neutral-500">Carregando avaliações...</div>;
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="text-neutral-500 hover:text-neutral-900 mb-8 flex items-center gap-2 transition-colors font-medium"
        >
          &larr; Voltar
        </button>

        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Feedback dos Participantes</h1>
              <p className="text-neutral-500 text-sm">Visualize as avaliações e comentários recebidos.</p>
            </div>
            <div className="bg-blue-50 px-6 py-3 rounded-2xl flex flex-col items-center border border-blue-100">
              <span className="text-3xl font-bold text-blue-600">{calculateAverage()}</span>
              <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">Média Geral</span>
            </div>
          </div>

          <div className="space-y-6">
            {evaluations.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 italic">
                Ainda não há avaliações registradas para este critério.
              </div>
            ) : evaluations.map(ev => (
              <div key={ev.id} className="border border-neutral-100 rounded-2xl p-6 hover:bg-neutral-50/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg 
                          key={star}
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-4 w-4 ${star <= ev.rating ? 'text-yellow-400' : 'text-neutral-200'}`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm font-semibold text-neutral-800">{ev.userName}</div>
                    <div className="text-[11px] text-neutral-400">{ev.event?.title} • {ev.department} ({ev.userEmail})</div>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {new Date(ev.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                {ev.feedback && (
                  <p className="text-sm text-neutral-600 leading-relaxed italic">
                    "{ev.feedback}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
