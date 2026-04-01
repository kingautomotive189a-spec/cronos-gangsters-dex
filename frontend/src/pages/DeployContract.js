import React, { useState } from 'react';
import { ethers } from 'ethers';

const GANG_TOKEN = "0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF";

// REAL compiled bytecode from solc 0.8.19
const BYTECODE = "0x608060405234801561001057600080fd5b506040516109ae3803806109ae8339818101604052810190610032919061011c565b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610149565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006100e9826100be565b9050919050565b6100f9816100de565b811461010457600080fd5b50565b600081519050610116816100f0565b92915050565b600060208284031215610132576101316100b9565b5b600061014084828501610107565b91505092915050565b610856806101586000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80633ccfd60b1461005c5780638da5cb5b14610066578063b69ef8a814610084578063d0679d34146100a2578063fc0c546a146100d2575b600080fd5b6100646100f0565b005b61006e6102dc565b60405161007b9190610543565b60405180910390f35b61008c610300565b6040516100999190610577565b60405180910390f35b6100bc60048036038101906100b791906105ef565b6103a3565b6040516100c9919061064a565b60405180910390f35b6100da6104dc565b6040516100e791906106c4565b60405180910390f35b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461017e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101759061073c565b60405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016102389190610543565b602060405180830381865afa158015610255573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102799190610771565b6040518363ffffffff1660e01b815260040161029692919061079e565b6020604051808303816000875af11580156102b5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102d991906107f3565b50565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b815260040161035d9190610543565b602060405180830381865afa15801561037a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061039e9190610771565b905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610434576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161042b9061073c565b60405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb84846040518363ffffffff1660e01b815260040161049192919061079e565b6020604051808303816000875af11580156104b0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104d491906107f3565b905092915050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061052d82610502565b9050919050565b61053d81610522565b82525050565b60006020820190506105586000830184610534565b92915050565b6000819050919050565b6105718161055e565b82525050565b600060208201905061058c6000830184610568565b92915050565b600080fd5b6105a081610522565b81146105ab57600080fd5b50565b6000813590506105bd81610597565b92915050565b6105cc8161055e565b81146105d757600080fd5b50565b6000813590506105e9816105c3565b92915050565b6000806040838503121561060657610605610592565b5b6000610614858286016105ae565b9250506020610625858286016105da565b9150509250929050565b60008115159050919050565b6106448161062f565b82525050565b600060208201905061065f600083018461063b565b92915050565b6000819050919050565b600061068a61068561068084610502565b610665565b610502565b9050919050565b600061069c8261066f565b9050919050565b60006106ae82610691565b9050919050565b6106be816106a3565b82525050565b60006020820190506106d960008301846106b5565b92915050565b600082825260208201905092915050565b7f4e6f74206f776e65720000000000000000000000000000000000000000000000600082015250565b60006107266009836106df565b9150610731826106f0565b602082019050919050565b6000602082019050818103600083015261075581610719565b9050919050565b60008151905061076b816105c3565b92915050565b60006020828403121561078757610786610592565b5b60006107958482850161075c565b91505092915050565b60006040820190506107b36000830185610534565b6107c06020830184610568565b9392505050565b6107d08161062f565b81146107db57600080fd5b50565b6000815190506107ed816107c7565b92915050565b60006020828403121561080957610808610592565b5b6000610817848285016107de565b9150509291505056fea2646970667358221220a5db94f01ab0957854598186229c3275de66b2a0a569fb3f58517648220f3b8764736f6c63430008130033";

const ABI = [{"inputs":[{"internalType":"address","name":"_token","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"balance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"send","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const DeployContract = () => {
  const [status, setStatus] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState('');

  const deploy = async () => {
    if (!window.ethereum) {
      setStatus('Install MetaMask or use wallet browser!');
      return;
    }

    try {
      setLoading(true);
      setStatus('Connecting...');

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainNum = parseInt(chainId, 16);
      
      if (chainNum !== 25) {
        setStatus('Switch to Cronos Mainnet (Chain ID 25)!');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x19' }],
          });
        } catch (e) {
          setLoading(false);
          return;
        }
      }

      setStatus('Deploying contract...');

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const factory = new ethers.ContractFactory(ABI, BYTECODE, signer);
      
      const contract = await factory.deploy(GANG_TOKEN);
      setStatus('Confirming on blockchain...');
      
      await contract.deployed();
      
      setContractAddress(contract.address);
      setStatus('SUCCESS!');
      setLoading(false);

    } catch (err) {
      console.error(err);
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        setStatus('You rejected the transaction');
      } else if (err.message?.includes('insufficient funds')) {
        setStatus('Not enough CRO for gas!');
      } else {
        setStatus('Error: ' + (err.reason || err.message || 'Failed'));
      }
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Deploy $GANG Rewards</h1>
        
        {wallet && (
          <div style={styles.connected}>
            {wallet.slice(0,6)}...{wallet.slice(-4)}
          </div>
        )}

        {!contractAddress ? (
          <>
            <button 
              style={{...styles.btn, opacity: loading ? 0.6 : 1}}
              onClick={deploy}
              disabled={loading}
            >
              {loading ? 'DEPLOYING...' : 'DEPLOY NOW'}
            </button>
            
            {status && (
              <div style={{
                ...styles.status,
                background: status.includes('SUCCESS') ? '#0f02' : 
                            status.includes('Error') || status.includes('rejected') || status.includes('Not enough') ? '#f002' : '#ff08'
              }}>
                {status}
              </div>
            )}
          </>
        ) : (
          <div style={styles.success}>
            <div style={{fontSize: '3rem'}}>✅</div>
            <h2>Contract Deployed!</h2>
            <p style={{color: '#888', marginBottom: '10px'}}>Address:</p>
            <code 
              style={styles.addr}
              onClick={() => {
                navigator.clipboard.writeText(contractAddress);
                alert('Copied!');
              }}
            >
              {contractAddress}
            </code>
            <p style={styles.next}>
              Now send $GANG tokens to this address to fund rewards!
            </p>
          </div>
        )}

        <div style={styles.info}>
          <p><strong>Token:</strong> $GANG</p>
          <p><strong>Network:</strong> Cronos</p>
          <p><strong>Functions:</strong> send, withdraw, balance</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    background: '#14141f',
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '400px',
    width: '100%',
    border: '1px solid #ffd70033',
    color: '#fff',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.5rem',
    background: 'linear-gradient(90deg, #ffd700, #ff8c00)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '20px',
  },
  connected: {
    background: '#0f03',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '20px',
    color: '#0f8',
  },
  btn: {
    width: '100%',
    background: 'linear-gradient(90deg, #ffd700, #ff8c00)',
    color: '#000',
    border: 'none',
    padding: '20px',
    borderRadius: '12px',
    fontSize: '1.3rem',
    fontWeight: '800',
    cursor: 'pointer',
  },
  status: {
    marginTop: '15px',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.9rem',
  },
  success: {
    background: '#0f01',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #0f83',
  },
  addr: {
    display: 'block',
    background: '#0003',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.65rem',
    wordBreak: 'break-all',
    color: '#ffd700',
    cursor: 'pointer',
  },
  next: {
    marginTop: '15px',
    padding: '10px',
    background: '#ffd70022',
    borderRadius: '8px',
    fontSize: '0.85rem',
  },
  info: {
    marginTop: '20px',
    padding: '15px',
    background: '#fff1',
    borderRadius: '10px',
    textAlign: 'left',
    fontSize: '0.85rem',
    color: '#888',
  },
};

export default DeployContract;
