import './App.css'
import { PrimeReactProvider } from 'primereact/api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserTable from './components/UsersTable';

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <PrimeReactProvider value={{ ripple: true }}>
          <UserTable/>
      </PrimeReactProvider>
    </QueryClientProvider>
  )
}

export default App
