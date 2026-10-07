'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GerenciarUsuariosPage() {
  const { isAuthenticated, isInitialized, token, user } = useLocalAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.internalRole !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (isInitialized && isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, isInitialized, router, user]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === user?.id) {
      alert('Você não pode excluir a si mesmo.');
      return;
    }
    if (!confirm('Deseja realmente excluir este usuário?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao excluir usuário.');
      }
    } catch (err) {
      alert('Erro na conexão com o servidor.');
    }
  };

  if (!isInitialized || !isAuthenticated || loading) {
    return <div className="p-6 text-center text-neutral-500">Carregando usuários...</div>;
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="text-neutral-500 hover:text-neutral-900 mb-8 flex items-center gap-2 transition-colors font-medium"
        >
          &larr; Voltar ao Início
        </button>

        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Gestão de Usuários</h1>
              <p className="text-neutral-500 text-sm">Controle de acessos de gestores e empresas.</p>
            </div>
            <button 
              onClick={() => router.push('/gerenciar-usuarios/novo')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm"
            >
              Novo Usuário
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 text-sm uppercase tracking-wider">
                  <th className="pb-4 font-semibold px-4">Nome</th>
                  <th className="pb-4 font-semibold px-4">E-mail / CPF</th>
                  <th className="pb-4 font-semibold px-4">Papel</th>
                  <th className="pb-4 font-semibold px-4">Empresa</th>
                  <th className="pb-4 text-right px-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-neutral-400 text-sm">Nenhum usuário cadastrado.</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="py-4 px-4 font-medium text-neutral-800">{u.name}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-neutral-600">{u.email}</div>
                      <div className="text-[11px] text-neutral-400">{u.cpf}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'COMPANY_USER' ? 'bg-blue-100 text-blue-700' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {u.company ? (
                        <div className="text-sm text-neutral-600">{u.company.name}</div>
                      ) : (
                        <span className="text-xs text-neutral-300">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => router.push(`/gerenciar-usuarios/${u.id}`)}
                        className="text-neutral-400 hover:text-blue-600 text-sm font-medium transition-colors"
                      >
                        Editar
                      </button>
                      {u.id !== user?.id && (
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="text-neutral-400 hover:text-red-500 text-sm font-medium transition-colors"
                        >
                          Excluir
                        </button>
                      )}
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
