'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GerenciarEventosPage() {
  const { isAuthenticated, isInitialized, token } = useLocalAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isInitialized && isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated, isInitialized, router]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) setEvents(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este evento? Todos os registros de presença e avaliações vinculados serão perdidos.')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao excluir evento.');
      }
    } catch (err) {
      alert('Erro na conexão com o servidor.');
    }
  };

  if (!isInitialized || !isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="text-neutral-500 hover:text-neutral-900 mb-8 flex items-center gap-2 transition-colors font-medium"
        >
          &larr; Voltar ao Início
        </button>

        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Gerenciar Cursos e Eventos</h1>
              <p className="text-neutral-500">Gerencie a agenda de capacitações e eventos.</p>
            </div>
            <button 
              onClick={() => router.push('/cadastrar-evento')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm"
            >
              Novo Curso
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="pb-4 font-semibold text-neutral-700">Título</th>
                  <th className="pb-4 font-semibold text-neutral-700">Início</th>
                  <th className="pb-4 font-semibold text-neutral-700">Fim</th>
                  <th className="pb-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-8 text-center text-neutral-400">Carregando...</td></tr>
                ) : events.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-neutral-400">Nenhum evento encontrado.</td></tr>
                ) : events.map(event => (
                  <tr key={event.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 font-medium text-neutral-800">{event.title}</td>
                    <td className="py-4 text-neutral-500">{new Date(event.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                    <td className="py-4 text-neutral-500">{new Date(event.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                    <td className="py-4 text-right space-x-2">
                      <button 
                        onClick={() => router.push(`/avaliacoes?eventId=${event.id}`)}
                        className="text-neutral-500 hover:text-blue-600 font-medium text-[12px] transition-colors"
                      >
                        Avaliações
                      </button>
                      <button 
                        onClick={() => {
                          const link = `http://localhost:3000/avaliar/${event.id}`;
                          navigator.clipboard.writeText(link);
                          alert('Link de avaliação copiado para a área de transferência!');
                        }}
                        className="text-neutral-500 hover:text-emerald-600 font-medium text-[12px] transition-colors"
                      >
                        Copiar Link
                      </button>
                      <button 
                        onClick={() => router.push(`/gerenciar-eventos/${event.id}`)}
                        className="text-neutral-500 hover:text-amber-600 font-medium text-sm transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="text-neutral-300 hover:text-red-600 font-medium text-sm transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
