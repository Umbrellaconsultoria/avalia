'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const { isAuthenticated, isInitialized, login, register, user, logout } = useLocalAuth();
  const router = useRouter();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-neutral-500 font-medium">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        await register({ email, password, name, cpf });
        setIsRegistering(false);
        setError('Cadastro realizado! Agora você pode entrar.');
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-sm border border-neutral-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            {isRegistering ? 'Nova Conta' : 'Acesso Plataforma'}
          </h1>
          <p className="text-neutral-500 mb-8 text-center text-sm">
            {isRegistering 
              ? 'Preencha os dados abaixo para se cadastrar no sistema.' 
              : 'Entre com suas credenciais para gerenciar eventos e cursos.'}
          </p>

          <form onSubmit={handleAuth} className="w-full space-y-4">
            {isRegistering && (
              <>
                <input
                  type="text"
                  placeholder="Nome Completo"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <input
                  type="text"
                  placeholder="CPF (Apenas números)"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </>
            )}
            
            <input
              type="email"
              placeholder="E-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            
            <input
              type="password"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />

            {error && (
              <p className={`text-xs text-center ${error.includes('sucesso') || error.includes('Cadastro realizado') ? 'text-emerald-600' : 'text-red-500'}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-200 shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
            </button>
          </form>

          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="mt-6 text-sm text-neutral-500 hover:text-blue-600 transition-colors"
          >
            {isRegistering ? 'Já tem uma conta? Entre' : 'Não tem conta? Cadastre-se'}
          </button>

          {/* Autenticação Gov.br preservada no código mas inativa na UI final */}
          {/* 
          <div className="w-full border-t border-neutral-100 mt-8 pt-8">
            <button
              onClick={login}
              className="w-full bg-neutral-900 hover:bg-black text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              Entrar com Gov.br
            </button>
          </div>
          */}
        </div>
      </main>
    );
  }

  // Role resolution
  const internalRole = user?.internalRole || 'PARTICIPANT';
  const isAdmin = internalRole === 'ADMIN';
  const isCompany = internalRole === 'COMPANY_USER';

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 pb-12">
      <header className="bg-white border-b border-neutral-100 px-6 py-6 sticky top-0 z-10 shadow-sm shadow-neutral-200/20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-800">Assiduidade Digital</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Olá, {user?.name?.split(' ')[0] || 'Cidadão'}</p>
          </div>
          <button 
            onClick={logout}
            className="text-sm font-medium text-neutral-500 hover:text-red-600 transition-colors bg-neutral-50 hover:bg-red-50 px-4 py-2 rounded-lg"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 mt-10">
        <h2 className="text-2xl font-semibold mb-8 text-neutral-800">O que você precisa fazer hoje?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internalRole === 'PARTICIPANT' && (
            <>
              <button 
                onClick={() => router.push('/avaliar-evento')}
                className="text-left group bg-white border border-neutral-200 rounded-3xl p-8 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">Avaliar Evento Hoje</h3>
                <p className="text-neutral-500 line-clamp-2">Confirme sua presença avaliando as atividades do seu curso ou evento diário.</p>
              </button>

              <button className="text-left group bg-white border border-neutral-200 rounded-3xl p-8 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors">Cursos Anteriores</h3>
                <p className="text-neutral-500 line-clamp-2">Visualize seu histórico de participações e emita seus certificados aprovados.</p>
              </button>

              <button 
                onClick={() => router.push('/certificados')}
                className="text-left group bg-white border border-neutral-200 rounded-3xl p-8 hover:border-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">Meus Certificados</h3>
                <p className="text-neutral-500">Acesse e emita os certificados dos eventos que você já concluiu.</p>
              </button>
            </>
          )}

          {(isAdmin || isCompany) && (
            <button 
              onClick={() => router.push('/avaliacoes')}
              className="text-left group bg-white border border-neutral-200 rounded-3xl p-8 hover:border-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">Feedback & Avaliações</h3>
              <p className="text-neutral-500 line-clamp-2">Visualize o que os participantes estão achando dos cursos e eventos.</p>
            </button>
          )}

          {isAdmin && (
            <button 
              onClick={() => router.push('/gerenciar-certificados')}
              className="text-left group bg-white border border-neutral-200 rounded-3xl p-8 hover:border-indigo-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors">Certificados por Curso</h3>
              <p className="text-neutral-500 line-clamp-2">Emita certificados de qualquer participante por curso/evento.</p>
            </button>
          )}

          {(isAdmin || isCompany) && (
             <div className="md:col-span-2 lg:col-span-3 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => router.push('/gerenciar-eventos')}
                  className="text-left group bg-white border border-neutral-200 rounded-3xl p-8 hover:border-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">Manter Eventos</h3>
                  <p className="text-neutral-500">{isAdmin ? 'Gerencie todos os cursos e eventos do sistema.' : 'Gerencie e crie cursos e eventos da sua empresa.'}</p>
                </button>

                {isAdmin && (
                  <button 
                    onClick={() => router.push('/gerenciar-empresas')}
                    className="text-left group bg-white border border-neutral-200 rounded-3xl p-8 hover:border-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">Manter Empresas</h3>
                    <p className="text-neutral-500">Gerencie a lista de empresas parceiras e seus dados.</p>
                  </button>
                )}
                {isAdmin && (
                  <button 
                    onClick={() => router.push('/gerenciar-usuarios')}
                    className="text-left group bg-white border border-neutral-200 rounded-3xl p-8 hover:border-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">Gestão de Usuários</h3>
                    <p className="text-neutral-500">Controle de acesso e níveis de permissão dos parceiros.</p>
                  </button>
                )}
             </div>
          )}
        </div>
      </div>
    </main>
  );
}
