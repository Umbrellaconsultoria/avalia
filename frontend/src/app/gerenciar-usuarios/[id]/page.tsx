'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { maskCPF, unmaskCPF, validateEmail } from '@/utils/masks';

export default function EditarUsuarioPage() {
  const { isAuthenticated, isInitialized, token, user: currentUser } = useLocalAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    phone: '',
    role: '',
    companyId: ''
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || currentUser?.internalRole !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (isInitialized && isAuthenticated && id) {
      Promise.all([fetchUser(), fetchCompanies()]);
    }
  }, [isAuthenticated, isInitialized, id, router, currentUser]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({
          name: data.name,
          email: data.email,
          password: '', // Não carrega senha
          cpf: maskCPF(data.cpf),
          phone: data.phone || '',
          role: data.role,
          companyId: data.companyId || ''
        });
      } else {
        alert(data.error || 'Erro ao carregar usuário.');
        router.push('/gerenciar-usuarios');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setCompanies(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!validateEmail(formData.email)) {
        alert('E-mail inválido. Por favor, verifique.');
        setSaving(false);
        return;
      }

      // Se a senha estiver vazia, não envia para não sobrescrever
      const payload = { 
        ...formData,
        cpf: unmaskCPF(formData.cpf)
      };
      if (!payload.password) delete (payload as any).password;

      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Usuário atualizado com sucesso!');
        router.push('/gerenciar-usuarios');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao atualizar usuário.');
      }
    } catch (err) {
      alert('Erro na conexão com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized || !isAuthenticated || loading) {
    return <div className="p-6 text-center text-neutral-500">Carregando...</div>;
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.push('/gerenciar-usuarios')}
          className="text-neutral-500 hover:text-neutral-900 mb-8 flex items-center gap-2 transition-colors font-medium"
        >
          &larr; Voltar para Gestão
        </button>

        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
          <h1 className="text-2xl font-semibold mb-2">Editar Usuário</h1>
          <p className="text-neutral-500 mb-8">Atualize as informações de perfil e permissões.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Nome Completo</label>
                <input 
                  type="text" required
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">CPF</label>
                <input 
                  type="text" required disabled
                  className="w-full border border-neutral-300 rounded-xl p-3.5 bg-neutral-50 text-neutral-400 outline-none cursor-not-allowed"
                  value={formData.cpf}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">E-mail</label>
              <input 
                type="email" required
                className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Nova Senha (Deixe em branco para manter)</label>
              <input 
                type="password"
                className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Opcional"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Papel / Nível de Acesso</label>
                <select 
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value, companyId: e.target.value === 'ADMIN' ? '' : formData.companyId})}
                >
                  <option value="ADMIN">Gestor Global (ADMIN)</option>
                  <option value="COMPANY_USER">Responsável por Empresa</option>
                  <option value="PARTICIPANT">Participante (Aluno)</option>
                </select>
              </div>

              {formData.role !== 'ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Vincular à Empresa</label>
                  <select 
                    className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.companyId}
                    onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                  >
                    <option value="">Nenhuma (Independente)</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={() => router.push('/gerenciar-usuarios')}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium py-3.5 px-6 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" disabled={saving}
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
