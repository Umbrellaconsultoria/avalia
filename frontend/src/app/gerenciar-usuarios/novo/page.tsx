'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { maskCPF, unmaskCPF, validateEmail } from '@/utils/masks';

export default function NovoUsuarioPage() {
  const { isAuthenticated, isInitialized, token, user: currentUser } = useLocalAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    phone: '',
    role: 'COMPANY_USER',
    companyId: ''
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || currentUser?.internalRole !== 'ADMIN')) {
      router.push('/');
      return;
    }
    fetchCompanies();
  }, [isAuthenticated, isInitialized, router, currentUser]);

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
    setLoading(true);

    if (!validateEmail(formData.email)) {
      alert('E-mail inválido. Por favor, verifique.');
      setLoading(false);
      return;
    }

    try {
      const payload = { 
        ...formData,
        cpf: unmaskCPF(formData.cpf)
      };

      const res = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Usuário criado com sucesso!');
        router.push('/gerenciar-usuarios');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao criar usuário.');
      }
    } catch (err) {
      alert('Erro na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized || !isAuthenticated) return null;

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
          <h1 className="text-2xl font-semibold mb-2">Criar Novo Usuário</h1>
          <p className="text-neutral-500 mb-8">Defina as credenciais e o papel do novo usuário no sistema.</p>

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
                <label className="block text-sm font-medium text-neutral-700 mb-2">CPF (Apenas números)</label>
                <input 
                  type="text" required
                  placeholder="000.000.000-00"
                  className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: maskCPF(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">E-mail Acadêmico / Profissional</label>
              <input 
                type="email" required
                className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Senha Inicial</label>
              <input 
                type="password" required
                className="w-full border border-neutral-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Pelo menos 6 caracteres"
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

            <div className="pt-4">
              <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-sm disabled:opacity-70"
              >
                {loading ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
