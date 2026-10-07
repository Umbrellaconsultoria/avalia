'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CadastrarEventoPage() {
  const { isAuthenticated, isInitialized, token, user } = useLocalAuth();
  const router = useRouter();

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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fetchingCompanies, setFetchingCompanies] = useState(true);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isInitialized && isAuthenticated && user?.internalRole === 'ADMIN') {
      fetchCompanies();
    }
  }, [isAuthenticated, isInitialized, router, user]);

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

  if (!isInitialized || !isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 2000);
      } else {
        alert('Erro ao cadastrar evento.');
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
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Novo Curso ou Evento</h1>
          <p className="text-neutral-500 mb-8">Defina os parâmetros centrais (dados, horários e rotinas) da nova capacitação.</p>

          {success ? (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Evento criado com sucesso! Redirecionando...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Título do Evento</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Formação em Políticas Públicas II"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Descrição Curta</label>
                <textarea 
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Objetivos principais deste evento..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Data Inicial</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Data Final</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Horário de Início (Diário)</label>
                  <input 
                    type="time" 
                    required
                    className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Horário de Término (Diário)</label>
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

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-70"
                >
                  {loading ? 'Processando...' : 'Cadastrar Evento'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
