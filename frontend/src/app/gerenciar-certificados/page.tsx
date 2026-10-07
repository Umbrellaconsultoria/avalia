'use client';

import { useEffect, useState } from 'react';
import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter } from 'next/navigation';

export default function GerenciarCertificadosPage() {
  const { user, token } = useLocalAuth();
  const router = useRouter();
  
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    if (user?.internalRole !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchEvents();
  }, [user]);

  useEffect(() => {
    if (selectedEventId) {
      fetchParticipants(selectedEventId);
    } else {
      setParticipants([]);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId: string) => {
    setLoadingParticipants(true);
    try {
      const res = await fetch(`http://localhost:3001/api/evaluations?eventId=${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Agrupar avaliações por participante para contar presenças
      const grouped = data.reduce((acc: any, ev: any) => {
        const id = ev.userEmail; // Chave única é o e-mail
        if (!acc[id]) {
          acc[id] = {
            name: ev.userName,
            email: ev.userEmail,
            identifier: ev.user?.cpf || ev.userEmail, // Usa CPF se houver, senão e-mail
            presences: 0
          };
        }
        acc[id].presences += 1;
        return acc;
      }, {});

      setParticipants(Object.values(grouped));
    } catch (err) {
      console.error('Erro ao carregar participantes:', err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const emitCertificate = (identifier: string) => {
    // Abre em nova aba a rota de geração de PDF do Admin
    const url = `http://localhost:3001/api/certificates/admin/${selectedEventId}/${identifier}?token=${token}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="p-10 text-center">Carregando painel...</div>;

  return (
    <main className="min-h-screen bg-neutral-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Certificados por Curso</h1>
            <p className="text-neutral-500 mt-1">Gerencie e emita certificados de qualquer participante.</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="bg-white border border-neutral-200 px-5 py-2.5 rounded-xl font-semibold text-neutral-600 hover:bg-neutral-50 transition-all"
          >
            Voltar
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna de Seleção de Evento */}
          <div className="md:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-2">1. Selecione o Evento</h2>
            <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full text-left p-5 border-b border-neutral-50 transition-all last:border-0 ${
                    selectedEventId === event.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="font-bold">{event.title}</div>
                  <div className={`text-xs mt-1 ${selectedEventId === event.id ? 'text-blue-100' : 'text-neutral-400'}`}>
                    {new Date(event.startDate).toLocaleDateString('pt-BR')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Coluna de Participantes */}
          <div className="md:col-span-2 space-y-4">
             <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-2">2. Participantes & Emissão</h2>
             
             {!selectedEventId ? (
                <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center shadow-sm">
                   <div className="w-16 h-16 bg-neutral-50 text-neutral-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                   </div>
                   <p className="text-neutral-500 font-medium">Escolha um evento ao lado para listar os participantes.</p>
                </div>
             ) : loadingParticipants ? (
                <div className="text-center p-10 text-neutral-400">Carregando participantes...</div>
             ) : participants.length === 0 ? (
                <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center shadow-sm text-neutral-500">
                   Nenhum participante encontado com avaliações para este evento.
                </div>
             ) : (
                <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-neutral-50 text-neutral-500 text-[11px] uppercase tracking-wider">
                            <th className="px-6 py-4 font-bold">Participante</th>
                            <th className="px-6 py-4 font-bold">Identificador</th>
                            <th className="px-6 py-4 font-bold text-center">Presenças</th>
                            <th className="px-6 py-4 font-bold text-right">Ação</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50">
                         {participants.map((p) => (
                            <tr key={p.email} className="hover:bg-neutral-50/50 transition-colors">
                               <td className="px-6 py-4">
                                  <div className="font-bold text-neutral-800">{p.name}</div>
                                  <div className="text-xs text-neutral-400">{p.email}</div>
                               </td>
                               <td className="px-6 py-4 text-sm text-neutral-600 font-mono">{p.identifier}</td>
                               <td className="px-6 py-4 text-center">
                                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                                     {p.presences}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <button 
                                     onClick={() => emitCertificate(p.identifier)}
                                     className="bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition-all shadow-sm"
                                  >
                                     Emitir
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
        </div>
      </div>
    </main>
  );
}
