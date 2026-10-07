'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditarEventoPage() {
  const { isAuthenticated, isInitialized, token, user } = useLocalAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    companyIds: [] as string[]
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingCompanies, setFetchingCompanies] = useState(true);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isInitialized && isAuthenticated && id) {
      if (user?.internalRole === 'ADMIN') {
        Promise.all([fetchEvent(), fetchCompanies()]);
      } else {
        fetchEvent();
      }
    }
  }, [isAuthenticated, isInitialized, id, router, user]);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/companies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) setCompanies(data);
    } catch (err) {
      console.error('Erro ao buscar empresas:', err);
    } finally {
      setFetchingCompanies(false);
    }
  };

  const fetchEvent = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({
          title: data.title,
          description: data.description || '',
          startDate: new Date(data.startDate).toISOString().split('T')[0],
          endDate: new Date(data.endDate).toISOString().split('T')[0],
          startTime: data.startTime,
          endTime: data.endTime,
          companyIds: data.companies?.map((c: any) => c.companyId) || []
        });
      } else {
        alert(data.error || 'Erro ao carregar evento.');
        router.push('/gerenciar-eventos');
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`http://localhost:3001/api/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Evento atualizado com sucesso!');
        router.push('/gerenciar-eventos');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao atualizar evento.');
      }
    } catch (err) {
      alert('Erro na conexão com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized || !isAuthenticated || loading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.push('/gerenciar-eventos')}
          className="text-neutral-500 hover:text-neutral-900 mb-8 flex items-center gap-2 transition-colors font-medium"
        >
          &larr; Voltar para Gestão
        </button>

        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
          <h1 className="text-2xl font-semibold mb-2">Editar Evento / Curso</h1>
          <p className="text-neutral-500 mb-8">Atualize as informações de data, horário e descrição do evento.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Título do Evento</label>
              <input 
                type="text" 
                required
                className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Descrição</label>
              <textarea 
                className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Data de Início</label>
                <input 
                  type="date" 
                  required
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Data de Término</label>
                <input 
                  type="date" 
                  required
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Horário de Início</label>
                <input 
                  type="time" 
                  required
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Horário de Término</label>
                <input 
                  type="time" 
                  required
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            {user?.internalRole === 'ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-4 flex items-center gap-2">
                  Empresas Responsáveis / Parceiras
                  <span className="text-xs font-normal text-neutral-400">(Selecione pelo menos uma)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-4 border border-neutral-200 rounded-2xl bg-neutral-50/50">
                  {fetchingCompanies ? (
                    <div className="col-span-2 text-center py-4 text-neutral-400 text-sm">Carregando empresas...</div>
                  ) : companies.length === 0 ? (
                    <div className="col-span-2 text-center py-4 text-neutral-400 text-sm">Nenhuma empresa cadastrada.</div>
                  ) : companies.map(company => (
                    <label key={company.id} className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl cursor-pointer hover:border-amber-500 transition-all">
                      <input 
                        type="checkbox"
                        className="w-5 h-5 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                        checked={formData.companyIds.includes(company.id)}
                        onChange={(e) => {
                          const ids = e.target.checked 
                            ? [...formData.companyIds, company.id]
                            : formData.companyIds.filter(id => id !== company.id);
                          setFormData({...formData, companyIds: ids});
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-800">{company.name}</span>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider">{company.type}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={() => router.push('/gerenciar-eventos')}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium py-3.5 px-6 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-sm disabled:opacity-70"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
