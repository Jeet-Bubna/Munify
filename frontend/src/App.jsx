import AuthProvider from "./provider/authProvider";
import Routes from "./routes";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </div>
  );
}

export default App;
