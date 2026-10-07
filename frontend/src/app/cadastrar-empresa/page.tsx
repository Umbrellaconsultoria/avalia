'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { maskCNPJ, unmaskCNPJ } from '@/utils/masks';

export default function CadastrarEmpresaPage() {
  const { isAuthenticated, isInitialized, token } = useLocalAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    type: 'MINISTRANTE'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized || !isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          cnpj: unmaskCNPJ(formData.cnpj)
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 2000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao cadastrar empresa.');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Cadastrar Nova Empresa</h1>
          <p className="text-neutral-500 mb-8">Registre empresas parceiras para ministrar ou dar suporte aos eventos e cursos.</p>

          {success ? (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Empresa cadastrada com sucesso! Redirecionando...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Nome / Razão Social</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: SENAI Piauí"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">CNPJ</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({...formData, cnpj: maskCNPJ(e.target.value)})}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo de Atuação</label>
                <select 
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="MINISTRANTE">Empresa Ministrante (Cursos/Aulas)</option>
                  <option value="SUPORTE">Empresa de Suporte (Alimentação/Limpeza/...)</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-70"
                >
                  {loading ? 'Salvando...' : 'Cadastrar Empresa'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
