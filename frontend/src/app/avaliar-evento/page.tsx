'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AvaliarEventoPage() {
  const { isAuthenticated, isInitialized, token, user } = useLocalAuth();
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [selectedEventId, setSelectedEventId] = useState('');
  const [rating, setRating] = useState('5');
  const [feedback, setFeedback] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.internalRole !== 'PARTICIPANT')) {
      router.push('/');
      return;
    }
    if (isInitialized && isAuthenticated) {
        fetch('http://localhost:3001/api/events', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if(Array.isArray(data)) setEvents(data);
            setLoadingList(false);
        })
        .catch(() => setLoadingList(false));
    }
  }, [isAuthenticated, isInitialized, router, token]);

  if (!isInitialized || !isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedEventId) {
        alert("Selecione um evento!");
        return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          rating,
          feedback,
          department
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 2000);
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao avaliar evento.');
      }
    } catch (err) {
      alert('Erro na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="text-neutral-500 hover:text-neutral-900 mb-8 flex items-center gap-2 transition-colors font-medium"
        >
          &larr; Voltar ao Início
        </button>

        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Avaliação Diária</h1>
          <p className="text-neutral-500 mb-8">Confirme sua presença avaliando as atividades do curso de hoje.</p>

          {success ? (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Avaliação e presença registradas com sucesso!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Evento Ativo</label>
                <select 
                  required
                  disabled={loadingList}
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white disabled:opacity-50"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="" disabled>Selecione um curso/evento em Andamento</option>
                  {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Setor / Departamento / Unidade</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ex: Secretaria de Saúde, TI, Administrativo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Nota Geral (1 a 5)</label>
                <div className="flex gap-4">
                  {[1,2,3,4,5].map(num => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num.toString())}
                        className={`flex-1 py-3 rounded-xl border transition-all font-medium text-lg ${
                            rating === num.toString() 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-blue-300'
                        }`}
                    >
                        {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Comentários (Opcional)</label>
                <textarea 
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Sugestões ou apontamentos sobre o conteúdo passado hoje..."
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading || loadingList}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-70"
                >
                  {loading ? 'Processando...' : 'Enviar Avaliação e Presença'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
