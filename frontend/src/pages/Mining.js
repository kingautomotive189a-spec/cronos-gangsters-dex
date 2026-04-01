import React, { useState, useEffect, useCallback } from 'react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Mining = () => {
  const [wallet, setWallet] = useState(null);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [lottery, setLottery] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [jackpot, setJackpot] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('mine');
  const [tokenPrice, setTokenPrice] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  // Form states
  const [betAmount, setBetAmount] = useState(10);
  const [crashCashout, setCrashCashout] = useState(2);
  const [limboTarget, setLimboTarget] = useState(2);
  const [leverage, setLeverage] = useState(10);
  const [lotteryTickets, setLotteryTickets] = useState(1);
  const [predAmount, setPredAmount] = useState(10);
  const [stakeAmount, setStakeAmount] = useState(100);
  const [selectedPool, setSelectedPool] = useState('30days');

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) localStorage.setItem('referrer', ref);
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, lotteryRes, predRes, tournRes, jackRes, priceRes] = await Promise.all([
        fetch(`${API}/mining/stats`),
        fetch(`${API}/mining/lottery/current`),
        fetch(`${API}/mining/prediction/current`),
        fetch(`${API}/mining/tournament/current`),
        fetch(`${API}/mining/jackpot`),
        fetch(`${API}/token/price`)
      ]);
      const [s, l, p, t, j, pr] = await Promise.all([
        statsRes.json(), lotteryRes.json(), predRes.json(), tournRes.json(), jackRes.json(), priceRes.json()
      ]);
      if (s.success) setStats(s);
      if (l.success) setLottery(l.lottery);
      if (p.success) setPrediction(p.prediction);
      if (t.success) setTournament(t.tournament);
      if (j.success) setJackpot(j.pool);
      if (pr.success) setTokenPrice(pr.data);
    } catch (e) { console.error(e); }
  };

  const fetchUser = useCallback(async () => {
    if (!wallet) return;
    try {
      const res = await fetch(`${API}/mining/user/${wallet}`);
      const data = await res.json();
      if (data.success) setUserData(data);
    } catch (e) { console.error(e); }
  }, [wallet]);

  useEffect(() => {
    if (wallet) { fetchUser(); const i = setInterval(fetchUser, 10000); return () => clearInterval(i); }
  }, [wallet, fetchUser]);

  const connect = async () => {
    if (!window.ethereum) return setMessage('Install MetaMask!');
    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const res = await fetch(`${API}/mining/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: accounts[0], referrer_code: localStorage.getItem('referrer') })
      });
      const data = await res.json();
      if (data.success) { setWallet(accounts[0]); setMessage(data.message); }
    } catch (e) { setMessage('Failed'); } finally { setLoading(false); }
  };

  const apiCall = async (endpoint, body = {}) => {
    try {
      setLoading(true);
      setGameResult(null);
      const res = await fetch(`${API}/mining${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: wallet, ...body })
      });
      const data = await res.json();
      if (data.success) {
        if (data.payout !== undefined || data.win !== undefined || data.result) setGameResult(data);
        setMessage(data.message || (data.win ? `WON ${data.payout} $GANG!` : data.payout === 0 ? 'Lost!' : 'Success!'));
      } else {
        setMessage(data.error || 'Failed');
      }
      fetchUser();
      fetchAll();
      return data;
    } catch (e) { setMessage('Error'); return null; } finally { setLoading(false); }
  };

  const claim = () => apiCall('/claim');
  const withdraw = () => apiCall('/withdraw');
  const upgradeVIP = (tier) => apiCall('/vip/upgrade', { tier });
  const buyLottery = () => apiCall('/lottery/buy', { tickets: lotteryTickets });
  const betPrediction = (dir) => apiCall('/prediction/bet', { prediction: dir, amount: predAmount });
  const stake = () => apiCall('/stake', { pool: selectedPool, amount: stakeAmount });
  const unstake = (id) => apiCall('/unstake', { stake_id: id });
  const joinTournament = () => tournament && apiCall('/tournament/join', { tournament_id: tournament.tournament_id });
  const spinDailyWheel = () => apiCall('/daily-wheel');
  const openBox = (type) => apiCall('/mystery-box', { box_type: type });

  // Games
  const playCoinflip = (choice) => apiCall('/game/coinflip', { amount: betAmount, choice });
  const playDice = (choice) => apiCall('/game/dice', { amount: betAmount, choice });
  const playCrash = () => apiCall('/game/crash', { amount: betAmount, auto_cashout: crashCashout });
  const playSlots = () => apiCall('/game/slots', { amount: betAmount });
  const playRPS = (choice) => apiCall('/game/rps', { amount: betAmount, choice });
  const playHighLow = (choice) => apiCall('/game/highlow', { amount: betAmount, choice });
  const playWheel = () => apiCall('/game/wheel', { amount: betAmount });
  const playLimbo = () => apiCall('/game/limbo', { amount: betAmount, choice: String(limboTarget) });
  const playBlackjack = () => apiCall('/game/blackjack', { amount: betAmount });
  const playLeverage = (dir) => apiCall('/game/leverage', { amount: betAmount, direction: dir, leverage });

  const formatTime = (iso) => {
    if (!iso) return '';
    const diff = new Date(iso) - new Date();
    if (diff <= 0) return 'Ready!';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const copyRef = () => {
    navigator.clipboard.writeText(`${window.location.origin}/mining?ref=${userData?.referral_code}`);
    setMessage('Copied!');
  };

  const tabs = [
    { id: 'mine', icon: '⛏️' }, { id: 'games', icon: '🎮' }, { id: 'casino', icon: '🎰' },
    { id: 'lottery', icon: '🎫' }, { id: 'stake', icon: '🔒' }, { id: 'more', icon: '💎' }
  ];

  return (
    <div style={s.container}>
      {/* Ad Banner */}
      <div style={s.ad}><span style={s.adTag}>AD</span> Your Ad Here - Contact @CronosGangsters</div>

      {/* Header */}
      <h1 style={s.title}>$GANG Hub</h1>
      <div style={s.price}>
        ${tokenPrice?.price_usd ? parseFloat(tokenPrice.price_usd).toFixed(6) : '---'}
        <span style={{color: tokenPrice?.change_h24 >= 0 ? '#0f8' : '#f44', marginLeft: 10}}>
          {tokenPrice?.change_h24 || 0}%
        </span>
      </div>

      {/* Stats */}
      <div style={s.stats}>
        <div style={s.statBox}><div style={s.statVal}>{stats?.total_users || 0}</div><div style={s.statLbl}>Miners</div></div>
        <div style={s.statBox}><div style={s.statVal}>{Math.round(jackpot)}</div><div style={s.statLbl}>Jackpot</div></div>
        <div style={s.statBox}><div style={s.statVal}>{lottery?.pot || 0}</div><div style={s.statLbl}>Lottery</div></div>
        <div style={s.statBox}><div style={s.statVal}>{stats?.current_reward || 5}</div><div style={s.statLbl}>Daily</div></div>
      </div>

      {/* Connect */}
      {!wallet ? (
        <button style={s.connectBtn} onClick={connect} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <>
          <div style={s.userCard}>
            <div style={s.userRow}>
              <span>{wallet.slice(0,6)}...{wallet.slice(-4)}</span>
              <span style={s.vipBadge}>{userData?.vip_tier?.toUpperCase()}</span>
            </div>
            <div style={s.balance}>{userData?.balance?.toFixed(2) || 0} $GANG</div>
            {userData?.balance >= 100 && <button style={s.withdrawBtn} onClick={withdraw}>Withdraw (5% burn)</button>}
          </div>

          {/* Tabs */}
          <div style={s.tabs}>
            {tabs.map(t => (
              <button key={t.id} style={{...s.tab, background: activeTab === t.id ? '#ffd700' : '#222', color: activeTab === t.id ? '#000' : '#fff'}}
                onClick={() => setActiveTab(t.id)}>{t.icon}</button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={s.content}>
            {/* MINE TAB */}
            {activeTab === 'mine' && (
              <>
                <h2>⛏️ Daily Mining</h2>
                <p style={s.desc}>Earn {stats?.current_reward || 5} $GANG daily {userData?.vip_multiplier > 1 && `(${userData.vip_multiplier}x VIP!)`}</p>
                
                {userData?.can_claim ? (
                  <button style={s.claimBtn} onClick={claim} disabled={loading}>⛏️ MINE NOW</button>
                ) : (
                  <div style={s.cooldown}>Next: {formatTime(userData?.next_claim_time)}</div>
                )}

                <h3 style={{marginTop: 20}}>⭐ VIP Tiers</h3>
                <div style={s.tierGrid}>
                  {Object.entries(stats?.vip_tiers || {}).map(([k, v]) => (
                    <div key={k} style={{...s.tierCard, border: userData?.vip_tier === k ? '2px solid #ffd700' : '1px solid #333'}}>
                      <div style={s.tierName}>{v.name}</div>
                      <div style={s.tierMulti}>{v.multiplier}x</div>
                      <div style={s.tierCost}>{v.cost} $GANG</div>
                      {userData?.vip_tier !== k && v.cost > 0 && (
                        <button style={s.tierBtn} onClick={() => upgradeVIP(k)}>Upgrade</button>
                      )}
                    </div>
                  ))}
                </div>

                <h3 style={{marginTop: 20}}>🎁 Daily Bonus Wheel</h3>
                <button style={s.actionBtn} onClick={spinDailyWheel} disabled={!userData?.can_daily_wheel || loading}>
                  {userData?.can_daily_wheel ? '🎡 SPIN FREE' : 'Come back tomorrow'}
                </button>

                <div style={s.refBox}>
                  <h3>👥 Referrals (10% bonus)</h3>
                  <p>Referrals: {userData?.referral_count || 0}</p>
                  <button style={s.copyBtn} onClick={copyRef}>Copy Link</button>
                </div>
              </>
            )}

            {/* GAMES TAB */}
            {activeTab === 'games' && (
              <>
                <h2>🎮 Mini Games</h2>
                <div style={s.betRow}>
                  <span>Bet:</span>
                  <input type="number" value={betAmount} onChange={e => setBetAmount(Math.max(1, +e.target.value))} style={s.input} />
                  <span>$GANG</span>
                </div>

                <h3>🪙 Coin Flip (2x)</h3>
                <div style={s.btnRow}>
                  <button style={s.gameBtn} onClick={() => playCoinflip('heads')}>HEADS</button>
                  <button style={s.gameBtn} onClick={() => playCoinflip('tails')}>TAILS</button>
                </div>

                <h3>🎲 Dice (6x)</h3>
                <div style={s.diceRow}>
                  {[1,2,3,4,5,6].map(n => <button key={n} style={s.diceBtn} onClick={() => playDice(String(n))}>{n}</button>)}
                </div>

                <h3>✊ Rock Paper Scissors (2x)</h3>
                <div style={s.btnRow}>
                  <button style={s.gameBtn} onClick={() => playRPS('rock')}>✊</button>
                  <button style={s.gameBtn} onClick={() => playRPS('paper')}>✋</button>
                  <button style={s.gameBtn} onClick={() => playRPS('scissors')}>✌️</button>
                </div>

                <h3>📊 Higher or Lower (2x)</h3>
                <div style={s.btnRow}>
                  <button style={s.gameBtn} onClick={() => playHighLow('high')}>📈 HIGH</button>
                  <button style={s.gameBtn} onClick={() => playHighLow('low')}>📉 LOW</button>
                </div>

                <h3>🃏 Blackjack (2x)</h3>
                <button style={s.actionBtn} onClick={playBlackjack}>PLAY</button>
              </>
            )}

            {/* CASINO TAB */}
            {activeTab === 'casino' && (
              <>
                <h2>🎰 Casino</h2>
                <div style={s.betRow}>
                  <span>Bet:</span>
                  <input type="number" value={betAmount} onChange={e => setBetAmount(Math.max(1, +e.target.value))} style={s.input} />
                </div>

                <h3>🚀 Crash</h3>
                <div style={s.betRow}>
                  <span>Cashout at:</span>
                  <input type="number" step="0.1" value={crashCashout} onChange={e => setCrashCashout(Math.max(1.1, +e.target.value))} style={s.input} />
                  <span>x</span>
                </div>
                <button style={s.actionBtn} onClick={playCrash}>🚀 PLAY CRASH</button>

                <h3>🎰 Slots (up to 100x)</h3>
                <button style={s.actionBtn} onClick={playSlots}>🎰 SPIN SLOTS</button>
                {gameResult?.reels && <div style={s.result}>{gameResult.reels.join(' ')} = {gameResult.multiplier}x</div>}

                <h3>🎡 Wheel of Fortune</h3>
                <button style={s.actionBtn} onClick={playWheel}>🎡 SPIN WHEEL</button>

                <h3>🎯 Limbo</h3>
                <div style={s.betRow}>
                  <span>Target:</span>
                  <input type="number" step="0.1" value={limboTarget} onChange={e => setLimboTarget(Math.max(1.01, +e.target.value))} style={s.input} />
                  <span>x</span>
                </div>
                <button style={s.actionBtn} onClick={playLimbo}>PLAY LIMBO</button>

                <h3>📈 Leverage Trading</h3>
                <div style={s.betRow}>
                  <span>Leverage:</span>
                  {[10,25,50,100].map(l => (
                    <button key={l} style={{...s.levBtn, background: leverage === l ? '#ffd700' : '#333', color: leverage === l ? '#000' : '#fff'}}
                      onClick={() => setLeverage(l)}>{l}x</button>
                  ))}
                </div>
                <div style={s.btnRow}>
                  <button style={{...s.gameBtn, background: '#0a5'}} onClick={() => playLeverage('long')}>📈 LONG</button>
                  <button style={{...s.gameBtn, background: '#a00'}} onClick={() => playLeverage('short')}>📉 SHORT</button>
                </div>
              </>
            )}

            {/* LOTTERY TAB */}
            {activeTab === 'lottery' && (
              <>
                <h2>🎫 Lottery & Predictions</h2>

                <div style={s.card}>
                  <h3>🎰 Weekly Lottery</h3>
                  <div style={s.potDisplay}>{lottery?.pot || 0} $GANG</div>
                  <p>Tickets sold: {lottery?.tickets_sold || 0} | Yours: {userData?.lottery_tickets || 0}</p>
                  <div style={s.betRow}>
                    <input type="number" value={lotteryTickets} onChange={e => setLotteryTickets(Math.max(1, +e.target.value))} style={s.input} min="1" />
                    <span>= {lotteryTickets * 10} $GANG</span>
                  </div>
                  <button style={s.actionBtn} onClick={buyLottery}>Buy Tickets</button>
                </div>

                <div style={s.card}>
                  <h3>📊 Price Prediction</h3>
                  <div style={s.poolRow}>
                    <div style={s.pool}>📈 UP: {prediction?.up_pool || 0}</div>
                    <div style={s.pool}>📉 DOWN: {prediction?.down_pool || 0}</div>
                  </div>
                  <div style={s.betRow}>
                    <input type="number" value={predAmount} onChange={e => setPredAmount(Math.max(1, +e.target.value))} style={s.input} />
                    <span>$GANG</span>
                  </div>
                  <div style={s.btnRow}>
                    <button style={{...s.gameBtn, background: '#0a5'}} onClick={() => betPrediction('up')}>📈 UP</button>
                    <button style={{...s.gameBtn, background: '#a00'}} onClick={() => betPrediction('down')}>📉 DOWN</button>
                  </div>
                </div>

                <div style={s.card}>
                  <h3>🏆 Tournament</h3>
                  <p>Entry: {tournament?.entry_fee || 50} $GANG</p>
                  <p>Prize Pool: {tournament?.prize_pool || 0} $GANG</p>
                  <p>Players: {tournament?.players?.length || 0}</p>
                  <button style={s.actionBtn} onClick={joinTournament}>Join Tournament</button>
                </div>
              </>
            )}

            {/* STAKE TAB */}
            {activeTab === 'stake' && (
              <>
                <h2>🔒 Staking</h2>
                <div style={s.poolGrid}>
                  {Object.entries(stats?.staking_pools || {}).map(([k, v]) => (
                    <div key={k} style={{...s.poolCard, border: selectedPool === k ? '2px solid #ffd700' : '1px solid #333'}}
                      onClick={() => setSelectedPool(k)}>
                      <div style={s.poolName}>{v.name}</div>
                      <div style={s.poolApy}>{v.apy}% APY</div>
                    </div>
                  ))}
                </div>
                <div style={s.betRow}>
                  <input type="number" value={stakeAmount} onChange={e => setStakeAmount(Math.max(10, +e.target.value))} style={s.input} />
                  <span>$GANG</span>
                </div>
                <button style={s.actionBtn} onClick={stake}>Stake</button>

                {userData?.active_stakes?.length > 0 && (
                  <div style={{marginTop: 20}}>
                    <h3>Your Stakes</h3>
                    {userData.active_stakes.map(st => (
                      <div key={st.stake_id} style={s.stakeCard}>
                        <p>{st.amount} $GANG in {st.pool}</p>
                        <p style={{color: '#0f8'}}>+{st.reward.toFixed(2)} reward</p>
                        <p>Unlocks: {formatTime(st.unlocks_at)}</p>
                        <button style={s.smallBtn} onClick={() => unstake(st.stake_id)}
                          disabled={new Date(st.unlocks_at) > new Date()}>
                          {new Date(st.unlocks_at) > new Date() ? 'Locked' : 'Unstake'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* MORE TAB */}
            {activeTab === 'more' && (
              <>
                <h2>💎 More Features</h2>

                <div style={s.card}>
                  <h3>📦 Mystery Boxes</h3>
                  <div style={s.boxGrid}>
                    {Object.entries(stats?.mystery_boxes || {}).map(([k, v]) => (
                      <button key={k} style={s.boxBtn} onClick={() => openBox(k)}>
                        <div>{k.toUpperCase()}</div>
                        <div>{v.cost} $GANG</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={s.card}>
                  <h3>💎 Jackpot Pool</h3>
                  <div style={s.jackpotDisplay}>{Math.round(jackpot)} $GANG</div>
                  <p style={{color: '#888'}}>1% of all bets goes here. Random winner weekly!</p>
                </div>

                <div style={s.card}>
                  <h3>🔥 Burn Stats</h3>
                  <p>Total Burned: {stats?.total_burned?.toFixed(0) || 0} $GANG</p>
                  <p>5% burned on every withdrawal</p>
                </div>

                <div style={s.card}>
                  <h3>📊 Your Stats</h3>
                  <p>Wins: {userData?.game_stats?.wins || 0}</p>
                  <p>Losses: {userData?.game_stats?.losses || 0}</p>
                  <p>Profit: {userData?.game_stats?.profit?.toFixed(2) || 0} $GANG</p>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Game Result */}
      {gameResult && (
        <div style={{...s.resultBox, background: gameResult.win || gameResult.payout > 0 ? '#0f22' : '#f002'}}>
          {gameResult.win !== undefined && <div style={s.resultText}>{gameResult.win ? '🎉 WIN!' : '💀 LOST'}</div>}
          {gameResult.payout !== undefined && <div>Payout: {gameResult.payout} $GANG</div>}
          {gameResult.result && <div>Result: {gameResult.result}</div>}
          {gameResult.reels && <div>{gameResult.reels.join(' ')}</div>}
          {gameResult.crash_point && <div>Crashed at {gameResult.crash_point}x</div>}
        </div>
      )}

      {/* Toast */}
      {message && <div style={s.toast} onClick={() => setMessage('')}>{message}</div>}

      {/* Footer */}
      <div style={s.footer}>
        <a href="https://cronosgangsters.com" style={s.link}>🌐</a>
        <a href="https://t.me/+DrWDScTEiLg1ZGQ0" style={s.link}>💬</a>
        <a href="https://x.com/AhmadOm93837106" style={s.link}>🐦</a>
      </div>
    </div>
  );
};

const s = {
  container: { minHeight: '100vh', background: '#0a0a12', color: '#fff', padding: 15, maxWidth: 500, margin: '0 auto', fontFamily: 'system-ui' },
  ad: { background: '#1a1a2e', padding: '12px 15px', borderRadius: 10, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #ffd70033' },
  adTag: { background: '#ffd700', color: '#000', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 },
  title: { textAlign: 'center', fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg, #ffd700, #ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 5px' },
  price: { textAlign: 'center', color: '#888', marginBottom: 15 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 15 },
  statBox: { background: '#ffffff08', padding: 10, borderRadius: 8, textAlign: 'center' },
  statVal: { fontSize: 16, fontWeight: 700, color: '#ffd700' },
  statLbl: { fontSize: 10, color: '#666' },
  connectBtn: { width: '100%', background: 'linear-gradient(90deg, #ffd700, #ff8c00)', color: '#000', border: 'none', padding: 18, borderRadius: 12, fontSize: 18, fontWeight: 700, cursor: 'pointer' },
  userCard: { background: '#ffffff08', padding: 15, borderRadius: 12, marginBottom: 15 },
  userRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  vipBadge: { background: '#ffd70033', color: '#ffd700', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  balance: { textAlign: 'center', fontSize: 28, fontWeight: 800, color: '#ffd700' },
  withdrawBtn: { width: '100%', marginTop: 10, background: '#8b5cf6', color: '#fff', border: 'none', padding: 12, borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  tabs: { display: 'flex', gap: 5, marginBottom: 15 },
  tab: { flex: 1, padding: 12, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 20, textAlign: 'center' },
  content: { background: '#ffffff05', borderRadius: 12, padding: 20, marginBottom: 15 },
  desc: { color: '#888', fontSize: 14, marginBottom: 15 },
  claimBtn: { width: '100%', background: 'linear-gradient(90deg, #0f8, #0a5)', color: '#000', border: 'none', padding: 18, borderRadius: 12, fontSize: 18, fontWeight: 800, cursor: 'pointer' },
  cooldown: { textAlign: 'center', padding: 18, background: '#ffffff08', borderRadius: 12, color: '#ff8c00', fontWeight: 600 },
  tierGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  tierCard: { background: '#ffffff08', padding: 15, borderRadius: 10, textAlign: 'center' },
  tierName: { fontWeight: 600 },
  tierMulti: { color: '#ffd700', fontWeight: 700, fontSize: 18 },
  tierCost: { color: '#888', fontSize: 12 },
  tierBtn: { marginTop: 8, background: '#ffd700', color: '#000', border: 'none', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  actionBtn: { width: '100%', background: 'linear-gradient(90deg, #ffd700, #ff8c00)', color: '#000', border: 'none', padding: 14, borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 10 },
  refBox: { marginTop: 20, background: '#8b5cf622', padding: 15, borderRadius: 10, border: '1px solid #8b5cf644' },
  copyBtn: { background: '#8b5cf6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', marginTop: 10 },
  betRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  input: { flex: 1, background: '#ffffff10', border: '1px solid #333', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16, maxWidth: 100 },
  btnRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  gameBtn: { padding: 15, background: '#ffd700', color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 16 },
  diceRow: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5 },
  diceBtn: { padding: 12, background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  levBtn: { padding: '8px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  card: { background: '#ffffff08', padding: 15, borderRadius: 10, marginBottom: 15 },
  potDisplay: { fontSize: 32, fontWeight: 800, color: '#ffd700', textAlign: 'center' },
  poolRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 },
  pool: { background: '#ffffff08', padding: 10, borderRadius: 8, textAlign: 'center' },
  poolGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 15 },
  poolCard: { background: '#ffffff08', padding: 15, borderRadius: 10, textAlign: 'center', cursor: 'pointer' },
  poolName: { fontWeight: 600 },
  poolApy: { color: '#0f8', fontWeight: 700, fontSize: 18 },
  stakeCard: { background: '#ffffff08', padding: 15, borderRadius: 10, marginTop: 10 },
  smallBtn: { background: '#8b5cf6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', marginTop: 8 },
  boxGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  boxBtn: { background: 'linear-gradient(135deg, #ffd700, #ff8c00)', color: '#000', border: 'none', padding: 15, borderRadius: 10, cursor: 'pointer', fontWeight: 600 },
  jackpotDisplay: { fontSize: 36, fontWeight: 800, color: '#ffd700', textAlign: 'center' },
  resultBox: { padding: 20, borderRadius: 12, marginBottom: 15, textAlign: 'center', border: '1px solid #ffd70033' },
  resultText: { fontSize: 24, fontWeight: 800, marginBottom: 10 },
  result: { fontSize: 32, textAlign: 'center', marginTop: 10 },
  toast: { position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#ffd700', color: '#000', padding: '12px 25px', borderRadius: 10, fontWeight: 600, zIndex: 1000, cursor: 'pointer' },
  footer: { display: 'flex', justifyContent: 'center', gap: 20, padding: 15, borderTop: '1px solid #333' },
  link: { color: '#888', textDecoration: 'none', fontSize: 20 },
};

export default Mining;
