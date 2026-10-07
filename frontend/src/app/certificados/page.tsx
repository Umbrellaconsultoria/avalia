'use client';

import { useLocalAuth } from '@/providers/LocalAuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EmitirCertificadoPage() {
  const { isAuthenticated, isInitialized, token } = useLocalAuth();
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isInitialized && isAuthenticated) {
        // Num cenário real, buscaríamos apenas os eventos que o Participante frequentou
        fetch('http://localhost:3001/api/events', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if(Array.isArray(data)) setEvents(data);
            setLoadingList(false);
        })
        .catch(() => setLoadingList(false));
    }
  }, [isAuthenticated, isInitialized, router, token]);

  if (!isInitialized || !isAuthenticated) return null;

  const handleDownload = async (eventId: string) => {
    setLoadingPdf(true);
    try {
      const res = await fetch(`http://localhost:3001/api/certificates/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificado_GovBr.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao gerar o PDF. Você atingiu a presença necessária?');
      }
    } catch (err) {
      alert('Erro na conexão com o servidor de PDFs.');
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="text-neutral-500 hover:text-neutral-900 mb-8 flex items-center gap-2 transition-colors font-medium"
        >
          &larr; Voltar ao Início
        </button>

        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Meus Certificados</h1>
          <p className="text-neutral-500 mb-8">Baixe os certificados dos cursos concluídos por você com a devida validação Gov.br.</p>

          <div className="space-y-4 pt-4">
              {loadingList && <p className="text-neutral-400">Carregando seus cursos ativos/concluídos...</p>}
              
              {!loadingList && events.length === 0 && (
                  <p className="text-neutral-400">Nenhum evento registrado.</p>
              )}

              {events.map((ev) => (
                  <div key={ev.id} className="w-full flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl p-6 hover:border-green-300 transition-colors">
                      <div>
                          <h3 className="text-lg font-semibold text-neutral-800">{ev.title}</h3>
                          <p className="text-sm text-neutral-500 mt-1 max-w-xl truncate">{ev.description}</p>
                      </div>
                      <button 
                        onClick={() => handleDownload(ev.id)}
                        disabled={loadingPdf}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-70 whitespace-nowrap"
                      >
                         {loadingPdf ? 'Processando Autenticação...' : 'Autenticar Diário e Baixar PDF'}
                      </button>
                  </div>
              ))}
          </div>

        </div>
      </div>
    </main>
  );
}
