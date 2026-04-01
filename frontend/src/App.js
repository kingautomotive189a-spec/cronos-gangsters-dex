import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import Mining from "./pages/Mining";
import DeployContract from "./pages/DeployContract";
import DeployFarms from "./pages/DeployFarms";
import Trading from "./pages/Trading";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f1a 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: '800',
        background: 'linear-gradient(90deg, #ffd700, #ff8c00)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '20px'
      }}>
        Cronos Gangsters
      </h1>
      <p style={{ color: '#888', marginBottom: '40px', textAlign: 'center' }}>
        The Most Gangster DEX on Cronos
      </p>
      <Link 
        to="/mining" 
        style={{
          background: 'linear-gradient(90deg, #ffd700, #ff8c00)',
          color: '#000',
          padding: '16px 48px',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '1.2rem',
          boxShadow: '0 10px 30px rgba(255,215,0,0.3)'
        }}
        data-testid="mining-link"
      >
        Start Mining $GANG
      </Link>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mining" element={<Mining />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/deploy" element={<DeployContract />} />
          <Route path="/deploy-farms" element={<DeployFarms />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
