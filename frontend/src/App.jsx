import AuthProvider from "./provider/authProvider";
import Routes from "./routes";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" />
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </div>
  );
}

export default App;
