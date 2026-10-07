'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GerenciarEmpresasPage() {
  const { isAuthenticated, isInitialized, token } = useLocalAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isInitialized && isAuthenticated) {
      fetchCompanies();
    }
  }, [isAuthenticated, isInitialized, router]);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/companies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) setCompanies(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta empresa?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/companies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setCompanies(companies.filter(c => c.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao excluir empresa.');
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
              <h1 className="text-2xl font-semibold text-neutral-900">Gerenciar Empresas</h1>
              <p className="text-neutral-500">Visualize e gerencie todos os parceiros cadastrados.</p>
            </div>
            <button 
              onClick={() => router.push('/cadastrar-empresa')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm"
            >
              Nova Empresa
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="pb-4 font-semibold text-neutral-700">Empresa</th>
                  <th className="pb-4 font-semibold text-neutral-700">CNPJ</th>
                  <th className="pb-4 font-semibold text-neutral-700">Tipo</th>
                  <th className="pb-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-8 text-center text-neutral-400">Carregando...</td></tr>
                ) : companies.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-neutral-400">Nenhuma empresa encontrada.</td></tr>
                ) : companies.map(company => (
                  <tr key={company.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 font-medium text-neutral-800">{company.name}</td>
                    <td className="py-4 text-neutral-500">{company.cnpj}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        company.type === 'MINISTRANTE' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {company.type}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button 
                        onClick={() => router.push(`/gerenciar-empresas/${company.id}`)}
                        className="text-neutral-500 hover:text-blue-600 font-medium text-sm transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(company.id)}
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
