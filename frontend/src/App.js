import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import { RefreshCw, Play, Square, TrendingUp, TrendingDown, DollarSign, Activity, Users, BarChart3, Send, ExternalLink, Copy, Check, AlertCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const formatNumber = (num) => {
  if (num === null || num === undefined || num === "N/A") return "N/A";
  const n = parseFloat(num);
  if (isNaN(n)) return "N/A";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
};

const formatChange = (change) => {
  if (change === null || change === undefined || change === "N/A") return { value: "N/A", positive: null };
  const c = parseFloat(change);
  if (isNaN(c)) return { value: "N/A", positive: null };
  return { value: `${c >= 0 ? "+" : ""}${c.toFixed(2)}%`, positive: c >= 0 };
};

const StatCard = ({ icon: Icon, label, value, change, subtext, iconColor = "text-cyan-400" }) => {
  const changeData = formatChange(change);
  return (
    <div className="stat-card" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="stat-icon-row">
        <div className={`stat-icon ${iconColor}`}>
          <Icon size={20} />
        </div>
        {changeData.positive !== null && (
          <span className={`stat-change ${changeData.positive ? 'positive' : 'negative'}`}>
            {changeData.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {changeData.value}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </div>
  );
};

const CommandCard = ({ command, description, isAdmin }) => (
  <div className={`command-card ${isAdmin ? 'admin' : ''}`} data-testid={`command-${command.replace('/', '')}`}>
    <code className="command-name">{command}</code>
    <span className="command-desc">{description}</span>
  </div>
);

function App() {
  const [tokenData, setTokenData] = useState(null);
  const [botConfig, setBotConfig] = useState(null);
  const [botStatus, setBotStatus] = useState({ running: false });
  const [commands, setCommands] = useState({ commands: [], admin_commands: [], security: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [botAction, setBotAction] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [priceRes, configRes, statusRes, commandsRes] = await Promise.all([
        axios.get(`${API}/token/price`),
        axios.get(`${API}/bot/config`),
        axios.get(`${API}/bot/status`),
        axios.get(`${API}/bot/commands`),
      ]);
      
      if (priceRes.data.success) setTokenData(priceRes.data.data);
      setBotConfig(configRes.data);
      setBotStatus(statusRes.data);
      setCommands(commandsRes.data);
      setError(null);
    } catch (e) {
      console.error("Error fetching data:", e);
      setError("Failed to fetch data. Please check backend connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleBotAction = async (action) => {
    setBotAction(action);
    try {
      const res = await axios.post(`${API}/bot/${action}`);
      if (res.data.success) {
        await fetchData();
      } else {
        setError(res.data.message);
      }
    } catch (e) {
      setError(`Failed to ${action} bot`);
    } finally {
      setBotAction(null);
    }
  };

  const copyContract = () => {
    if (botConfig?.contract) {
      navigator.clipboard.writeText(botConfig.contract);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-spinner">
          <RefreshCw className="spin" size={48} />
          <p>Loading Cronos Gangsters Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" data-testid="dashboard">
      {/* Header */}
      <header className="dashboard-header" data-testid="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <img src="https://cronosgangsters.com/gang-logo.png" alt="GANG" className="logo-img" />
              <div>
                <h1 className="header-title">Cronos Gangsters</h1>
                <p className="header-subtitle">$GANG Telegram Bot Dashboard</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button 
              className="refresh-btn" 
              onClick={() => fetchData(true)} 
              disabled={refreshing}
              data-testid="refresh-btn"
            >
              <RefreshCw className={refreshing ? 'spin' : ''} size={18} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="error-banner" data-testid="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Price Section */}
        <section className="section price-section" data-testid="price-section">
          <div className="section-header">
            <h2>$GANG Price</h2>
            <div className="price-links">
              <a href={botConfig?.dexscreener} target="_blank" rel="noopener noreferrer" className="link-btn">
                <BarChart3 size={16} /> Chart <ExternalLink size={12} />
              </a>
              <a href={botConfig?.dex_link} target="_blank" rel="noopener noreferrer" className="link-btn primary">
                <DollarSign size={16} /> Buy $GANG <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="price-hero" data-testid="price-hero">
            <div className="current-price">
              <span className="price-label">Current Price</span>
              <span className="price-value">${tokenData?.price_usd || 'N/A'}</span>
              {tokenData?.price_native && (
                <span className="price-native">{tokenData.price_native} CRO</span>
              )}
            </div>
            <div className="price-changes">
              <div className="change-item">
                <span>1H</span>
                <span className={`change-value ${parseFloat(tokenData?.change_h1) >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(tokenData?.change_h1).value}
                </span>
              </div>
              <div className="change-item">
                <span>6H</span>
                <span className={`change-value ${parseFloat(tokenData?.change_h6) >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(tokenData?.change_h6).value}
                </span>
              </div>
              <div className="change-item">
                <span>24H</span>
                <span className={`change-value ${parseFloat(tokenData?.change_h24) >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(tokenData?.change_h24).value}
                </span>
              </div>
            </div>
          </div>

          <div className="stats-grid" data-testid="stats-grid">
            <StatCard
              icon={BarChart3}
              label="24H Volume"
              value={formatNumber(tokenData?.volume_h24)}
              iconColor="text-purple-400"
            />
            <StatCard
              icon={DollarSign}
              label="Liquidity"
              value={formatNumber(tokenData?.liquidity_usd)}
              iconColor="text-green-400"
            />
            <StatCard
              icon={TrendingUp}
              label="Market Cap"
              value={formatNumber(tokenData?.market_cap)}
              iconColor="text-yellow-400"
            />
            <StatCard
              icon={Activity}
              label="24H Transactions"
              value={`${tokenData?.buys_h24 || 0} buys / ${tokenData?.sells_h24 || 0} sells`}
              iconColor="text-blue-400"
            />
          </div>
        </section>

        {/* Contract Section */}
        <section className="section contract-section" data-testid="contract-section">
          <h2>Contract Address</h2>
          <div className="contract-box">
            <code className="contract-address">{botConfig?.contract}</code>
            <button className="copy-btn" onClick={copyContract} data-testid="copy-contract-btn">
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="contract-links">
            <a href={botConfig?.explorer} target="_blank" rel="noopener noreferrer">
              View on Explorer <ExternalLink size={12} />
            </a>
            <a href={botConfig?.dexscreener} target="_blank" rel="noopener noreferrer">
              View on Dexscreener <ExternalLink size={12} />
            </a>
          </div>
        </section>

        {/* Bot Control Section */}
        <section className="section bot-section" data-testid="bot-section">
          <div className="section-header">
            <h2>Bot Control</h2>
            <div className={`status-badge ${botStatus.running ? 'running' : 'stopped'}`}>
              <span className="status-dot"></span>
              {botStatus.running ? 'Running' : 'Stopped'}
              {botStatus.pid && <span className="pid">PID: {botStatus.pid}</span>}
            </div>
          </div>

          <div className="bot-controls">
            <button
              className="bot-btn start"
              onClick={() => handleBotAction('start')}
              disabled={botStatus.running || botAction}
              data-testid="start-bot-btn"
            >
              <Play size={18} />
              {botAction === 'start' ? 'Starting...' : 'Start Bot'}
            </button>
            <button
              className="bot-btn stop"
              onClick={() => handleBotAction('stop')}
              disabled={!botStatus.running || botAction}
              data-testid="stop-bot-btn"
            >
              <Square size={18} />
              {botAction === 'stop' ? 'Stopping...' : 'Stop Bot'}
            </button>
          </div>

          <div className="bot-info">
            <div className="info-row">
              <span>Token:</span>
              <code>{botConfig?.token_masked}</code>
            </div>
            <div className="info-row">
              <span>Group ID:</span>
              <code>{botConfig?.group_id}</code>
            </div>
            <div className="info-row">
              <span>Price Updates:</span>
              <span>Every {(botConfig?.price_update_interval || 300) / 60} minutes</span>
            </div>
          </div>
        </section>

        {/* Commands Section */}
        <section className="section commands-section" data-testid="commands-section">
          <h2>Bot Commands</h2>
          
          <h3>General Commands ({commands.commands.length})</h3>
          <div className="commands-grid">
            {commands.commands.map((cmd) => (
              <CommandCard key={cmd.command} command={cmd.command} description={cmd.description} />
            ))}
          </div>

          <h3>Admin Commands ({commands.admin_commands.length})</h3>
          <div className="commands-grid">
            {commands.admin_commands.map((cmd) => (
              <CommandCard key={cmd.command} command={cmd.command} description={cmd.description} isAdmin />
            ))}
          </div>

          {commands.security && commands.security.length > 0 && (
            <>
              <h3>Security Features</h3>
              <div className="security-grid">
                {commands.security.map((sec) => (
                  <div key={sec.feature} className="security-card">
                    <span className="security-icon">🛡️</span>
                    <div>
                      <strong>{sec.feature}</strong>
                      <p>{sec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Social Links */}
        <section className="section social-section" data-testid="social-section">
          <h2>Quick Links</h2>
          <div className="social-grid">
            <a href={botConfig?.dex_link} target="_blank" rel="noopener noreferrer" className="social-card">
              <span className="social-icon">🌐</span>
              <span>Website</span>
            </a>
            <a href={botConfig?.twitter} target="_blank" rel="noopener noreferrer" className="social-card">
              <span className="social-icon">🐦</span>
              <span>Twitter</span>
            </a>
            <a href={botConfig?.telegram_group} target="_blank" rel="noopener noreferrer" className="social-card">
              <span className="social-icon">💬</span>
              <span>Telegram</span>
            </a>
            <a href={botConfig?.dexscreener} target="_blank" rel="noopener noreferrer" className="social-card">
              <span className="social-icon">📊</span>
              <span>Chart</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer" data-testid="footer">
        <p><img src="https://cronosgangsters.com/gang-logo.png" alt="GANG" style={{width: '20px', height: '20px', borderRadius: '50%', verticalAlign: 'middle', marginRight: '6px'}} />Cronos Gangsters — The most gangster DEX on Cronos</p>
        <p className="footer-sub">GANG or nothing! 🤝</p>
      </footer>
    </div>
  );
}

export default App;
