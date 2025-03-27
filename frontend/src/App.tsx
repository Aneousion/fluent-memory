import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WagmiProvider, createConfig, http, useAccount} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import GameBoard from './components/GameBoard';
import NFTImage from './images/NFT.jpg';

// Fluent Devnet Chain Configuration
const fluentDevnetChain = {
  id: 20993,
  name: 'Fluent Devnet',
  network: 'fluent-devnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.dev.gblend.xyz/'] },
    public: { http: ['https://rpc.dev.gblend.xyz/'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://fluent.xyz' },
  },
  testnet: true,
};

// Wagmi Config with RainbowKit
const config = createConfig({
  chains: [fluentDevnetChain],
  transports: {
    [20993]: http('https://rpc.dev.gblend.xyz/'),
  },
  connectors: [
    // Default connectors are included automatically; add custom ones if needed
  ],
});

const queryClient = new QueryClient();

// Contract Configuration
const contractAddress = '0x34F01Eef631F4f2e03D3401EcA8c3f674FdC3ff9';
const contractABI = [
  'function mintNFT(address to, string memory uri) public returns (uint256)',
  'function _tokenIdCounter() public view returns (uint256)',
];

function App() {
  const { address, isConnected, connector } = useAccount();
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const setupSigner = async () => {
      if (connector && isConnected) {
        try {
          const provider: any = await connector.getProvider();
          const web3Provider = new ethers.BrowserProvider(provider);
          const signer = await web3Provider.getSigner();
          setSigner(signer);
        } catch (error) {
          console.error('Error setting up signer:', error);
          setSigner(null);
        }
      } else {
        setSigner(null);
      }
    };
    setupSigner();
  }, [connector, isConnected]);

  const mintNFT = async () => {
    if (!isConnected || !address || !signer) {
      alert('Please connect your wallet first');
      return;
    }
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    try {
      const code = await signer.provider.getCode(contractAddress);
      if (code === '0x') {
        alert('Contract not found at this address');
        return;
      }
      const tokenId = Number(await contract._tokenIdCounter()) + 1;
      const metadataObj = {
        name: `Fluent Memory #${tokenId}`,
        description: 'A memory match game achievement',
        image: NFTImage,
        attributes: [{ trait_type: 'Time', value: '15' }],
      };
      const uri = '/nft_metadata/metadata.json';
      console.log(`Metadata for token ${tokenId}:`, JSON.stringify(metadataObj));
      const tx = await contract.mintNFT(address, uri);
      await tx.wait();
      alert('NFT Minted!');
    } catch (error) {
      console.error('Failed to mint NFT:', error);
    }
  };

  return (
    <div>
      <div className="background-video">
        <video
          width="100%"
          playsInline
          autoPlay
          muted
          loop
          aria-label="Decorative background animation"
        >
          <source
            src="https://cdn.jsdelivr.net/gh/masonpajunas/fluent/videos/homepage/3_millions.mp4"
            type="video/mp4"
          />
          <source
            src="https://cdn.jsdelivr.net/gh/masonpajunas/fluent/videos/homepage/3_millions.webm"
            type="video/webm"
          />
          Your browser does not support the video tag.
        </video>
      </div>
      <div style={{ margin: '20px' }}>
        <ConnectButton />
      </div>
      {isConnected && address ? (
        <p>Connected: {address}</p>
      ) : (
        <p>Please connect your wallet using the button above.</p>
      )}
      <div>
        <h2>Instructions</h2>
        <p>Flip cards to find matching pairs. Complete the game within 15 seconds to mint an NFT.</p>
        <ol>
          <li>Connect your wallet using the button above.</li>
          <li>Start the game and find all pairs.</li>
          <li>If you finish within 15 seconds, click "Mint NFT" to claim your reward.</li>
        </ol>
      </div>
      <GameBoard onMintNFT={mintNFT} />
    </div>
  );
}

function AppWrapper() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={[fluentDevnetChain]} theme={darkTheme()}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default AppWrapper;