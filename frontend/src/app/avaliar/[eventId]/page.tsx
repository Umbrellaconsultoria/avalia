'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { validateEmail } from '@/utils/masks';

export default function AvaliacaoPublicaPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<any>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [rating, setRating] = useState('5');
  const [feedback, setFeedback] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/events/p/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      } else {
        setError('Evento não encontrado ou link inválido.');
      }
    } catch (err) {
      setError('Erro ao carregar informações do evento.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!validateEmail(participantEmail)) {
      setError('Por favor, informe um e-mail válido.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/evaluations/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          participantName,
          participantEmail,
          rating,
          feedback,
          department
        })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao enviar avaliação.');
      }
    } catch (err) {
      setError('Erro na conexão com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-neutral-500">Carregando...</div>;

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Ops!</h2>
          <p className="text-neutral-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-6 flex flex-col items-center py-12">
      <div className="max-w-xl w-full">
        {/* Header Aesthetic */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Avaliação de Atividade</h1>
          <p className="text-blue-600 font-medium">{event?.title}</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-neutral-100">
          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Obrigado!</h2>
              <p className="text-neutral-500 mb-2">Sua avaliação e presença foram registradas.</p>
              <p className="text-neutral-400 text-sm">Você já pode fechar esta página.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Seu Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Como deseja ser identificado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">E-mail</label>
                  <input 
                    type="email" 
                    required
                    className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
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
                <label className="block text-sm font-semibold text-neutral-700 mb-3 text-center">O que achou da atividade de hoje?</label>
                <div className="flex justify-between gap-3">
                  {[1,2,3,4,5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num.toString())}
                      className={`flex-1 aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                        rating === num.toString() 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105' 
                        : 'bg-white text-neutral-400 border-neutral-100 hover:border-blue-200 hover:text-blue-500'
                      }`}
                    >
                      <span className="text-xl font-bold">{num}</span>
                      <span className="text-[10px] font-medium uppercase tracking-tighter">
                        {num === 1 ? 'Ruim' : num === 5 ? 'Excelente' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-3">Comentários Adicionais (Opcional)</label>
                <textarea 
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-[120px] resize-none"
                  placeholder="O que funcionou bem? O que pode melhorar?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 animate-shake">
                  {error}
                </div>
              )}

              <button 
                type="submit" disabled={submitting}
                className="w-full bg-neutral-900 hover:bg-black text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-neutral-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'Enviando...' : 'Confirmar Avaliação'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-neutral-400 text-sm">
          Sua presença será confirmada automaticamente ao enviar este formulário.
        </p>
      </div>
      
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </main>
  );
}
