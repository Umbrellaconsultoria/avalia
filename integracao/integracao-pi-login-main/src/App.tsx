import { useContext } from 'react'
import './App.css'
import { AuthContext } from './contexts/AuthContext';

function App() {
  const { keycloak, userInfo } = useContext(AuthContext);

  if (!keycloak) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <h4>Aplicação de Exemplo de Integração com o Pi Login</h4>
      <div className="card">
      <div>
            <p>Username: {keycloak?.tokenParsed?.preferred_username}</p>
            <p>Email: {keycloak?.tokenParsed?.email}</p>
            <p>Access Token: {keycloak?.token}</p>
            <button onClick={() => keycloak?.logout()}>Logout</button>
        </div>
        <div>
          <h4>Informações do usuário</h4>
            {JSON.stringify(userInfo, null, 2)}
        </div>
      </div>
    </>
  )
}

export default App
