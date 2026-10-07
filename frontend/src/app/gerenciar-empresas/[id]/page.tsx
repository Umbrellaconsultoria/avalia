'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { maskCNPJ, unmaskCNPJ } from '@/utils/masks';

export default function EditarEmpresaPage() {
  const { isAuthenticated, isInitialized, token } = useLocalAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    type: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isInitialized && isAuthenticated && id) {
      fetchCompany();
    }
  }, [isAuthenticated, isInitialized, id, router]);

  const fetchCompany = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/companies/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({
          name: data.name,
          cnpj: maskCNPJ(data.cnpj),
          type: data.type
        });
      } else {
        alert(data.error || 'Erro ao carregar empresa.');
        router.push('/gerenciar-empresas');
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
      const res = await fetch(`http://localhost:3001/api/companies/${id}`, {
        method: 'PATCH',
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
        alert('Empresa atualizada com sucesso!');
        router.push('/gerenciar-empresas');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao atualizar empresa.');
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
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.push('/gerenciar-empresas')}
          className="text-neutral-500 hover:text-neutral-900 mb-8 flex items-center gap-2 transition-colors font-medium"
        >
          &larr; Voltar para Gestão
        </button>

        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
          <h1 className="text-2xl font-semibold mb-2">Editar Empresa</h1>
          <p className="text-neutral-500 mb-8">Atualize os dados cadastrais da empresa parceira.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Nome / Razão Social</label>
              <input 
                type="text" 
                required
                className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">CNPJ</label>
              <input 
                type="text" 
                required
                className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.cnpj}
                onChange={(e) => setFormData({...formData, cnpj: maskCNPJ(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo de Atuação</label>
              <select 
                className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="MINISTRANTE">Empresa Ministrante (Cursos/Aulas)</option>
                <option value="SUPORTE">Empresa de Suporte (Alimentação/Limpeza/...)</option>
              </select>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={() => router.push('/gerenciar-empresas')}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium py-3.5 px-6 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-sm disabled:opacity-70"
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
