"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { WagmiProvider, createConfig, http, useAccount } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, darkTheme, ConnectButton } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import GameBoard from "./components/GameBoard"
import NFTImage from "./images/Tectra.png"

// Fluent Devnet Chain Configuration
const fluentDevnetChain = {
  id: 20993,
  name: "Fluent Devnet",
  network: "fluent-devnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.dev.gblend.xyz/"] },
    public: { http: ["https://rpc.dev.gblend.xyz/"] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://fluent.xyz" },
  },
  testnet: true,
}

// Wagmi Config with RainbowKit
const config = createConfig({
  chains: [fluentDevnetChain],
  transports: {
    [20993]: http("https://rpc.dev.gblend.xyz/"),
  },
})

const queryClient = new QueryClient()

// Contract Configuration
const contractAddress = "0xE2050D25186c0eB8b860Db327c1356a839E889CD" // Your deployed ERC-1155 address
const contractABI = [
  "function mintNFT(address to, string memory tokenURI) public returns (uint256)",
  "function _tokenIdCounter() public view returns (uint256)",
  "function uri(uint256 id) public view returns (string memory)",
]

// Simple Confetti Component
const Confetti = () => {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; color: string; speed: number }>
  >([])

  useEffect(() => {
    // Create confetti particles
    const colors = ["#ff77e9", "#a855f7", "#ec4899", "#ffffff"]
    const newParticles = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      size: 5 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 2 + Math.random() * 5,
    }))

    setParticles(newParticles)

    // Animate particles
    let animationId: number
    let frame = 0

    const animate = () => {
      frame++
      if (frame % 2 === 0) {
        setParticles((prev) =>
          prev
            .map((p) => ({
              ...p,
              y: p.y + p.speed,
              x: p.x + (Math.random() - 0.5) * 2,
            }))
            .filter((p) => p.y < window.innerHeight),
        )
      }

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}

function App() {
  const { address, isConnected, connector } = useAccount()
  const [signer, setSigner] = useState<ethers.Signer | null | any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [nextTokenId, setNextTokenId] = useState<number | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const setupSigner = async () => {
      if (connector && isConnected) {
        try {
          const provider: any = await connector.getProvider()
          const web3Provider = new ethers.BrowserProvider(provider)
          const signer = await web3Provider.getSigner()
          setSigner(signer)
        } catch (error) {
          console.error("Error setting up signer:", error)
          setSigner(null)
        }
      } else {
        setSigner(null)
      }
    }
    setupSigner()
  }, [connector, isConnected])

  const showMintModal = async () => {
    if (!isConnected || !address || !signer) {
      alert("Please connect your wallet first")
      return
    }
    const contract = new ethers.Contract(contractAddress, contractABI, signer)
    try {
      const code = await signer.provider.getCode(contractAddress)
      if (code === "0x") {
        alert("Contract not found at this address")
        return
      }
      const tokenId = Number(await contract._tokenIdCounter()) + 1
      setNextTokenId(tokenId)
      setShowModal(true)
    } catch (error) {
      console.error("Error fetching next token ID:", error)
    }
  }

  const mintNFT = async () => {
    if (!isConnected || !address || !signer || nextTokenId === null) {
      alert("Please connect your wallet first")
      return
    }
    const contract = new ethers.Contract(contractAddress, contractABI, signer)
    try {
      // const metadata = {
      //   name: "Fluent Memory",
      //   description: "A memory match game achievement",
      //   image: "ipfs://bafkreiam4hsd4gcca26pxcg226j52vo5l6clr2ovte2uppnvurpdmflg6m",
      //   attributes: [{ trait_type: "Time", value: "15" }],
      // }
      // Since Pinata SDK is removed, assume metadata is pre-uploaded or use a static URI
      // For simplicity, we'll encode metadata as JSON and use a gateway URL
      // const metadataJson = JSON.stringify(metadata)
      // const metadataBlob = new Blob([metadataJson], { type: "application/json" })
      // const metadataUrl = URL.createObjectURL(metadataBlob) // Temporary local URL for testing
      // Ideally, this should be uploaded to IPFS separately and pinned
      // For now, we'll use a pre-uploaded CID or gateway; replace with actual IPFS URI if uploaded
      const uri = `ipfs://bafkreiam4hsd4gcca26pxcg226j52vo5l6clr2ovte2uppnvurpdmflg6m` // Use your CID directly
      const tx = await contract.mintNFT(address, uri)
      await tx.wait()

      // Show success popup and confetti instead of alert
      setShowModal(false)
      setShowSuccessModal(true)
      setShowConfetti(true)

      // Auto-hide success popup after 5 seconds
      setTimeout(() => {
        setShowSuccessModal(false)
        setShowConfetti(false)
        window.location.reload() // Refresh the page after popup is hidden
      }, 5000)
    } catch (error) {
      console.error("Failed to mint NFT:", error)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-screen background video */}
      <div className="fixed inset-0 w-full h-full z-0">
        <video
          className="w-full h-full object-cover"
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

      {/* Confetti overlay */}
      {showConfetti && <Confetti />}

      {/* Main content container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center">
        {/* Connect button - fixed position */}
        <div className="absolute top-4 right-4 z-50">
          <ConnectButton />
        </div>

        {/* Header */}
        <div className="w-full flex justify-center items-center mt-8 mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 flex items-center justify-center text-white font-bold text-xl mr-3">
              F
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-red-500">
              Fluent Memory
            </h1>
          </div>
        </div>

        {/* Main content with glass effect */}
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Connection status */}
          <div className="mb-6">
            {isConnected && address ? (
              <div className="bg-black/70 backdrop-blur-md rounded-lg px-4 py-2 text-white/90 text-sm font-mono overflow-hidden text-ellipsis">
                Connected: {address}
              </div>
            ) : (
              <div className="bg-black/70 backdrop-blur-md rounded-lg px-4 py-3 text-white/90 text-center">
                Please connect your wallet using the button above.
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-black/70 backdrop-blur-md rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-3 text-white">Instructions</h2>
            <p className="mb-3 text-white/90">
              Flip cards to find matching pairs. Complete the game within 60 seconds to mint an NFT.
            </p>
            <ol className="list-decimal list-inside text-white/90 space-y-1 pl-2">
              <li>Connect your wallet using the button above.</li>
              <li>Start the game and find all pairs.</li>
              <li>If you finish within 60 seconds, click "Mint NFT" to claim your reward.</li>
            </ol>
          </div>

          {/* Game board */}
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 mb-8">
            <GameBoard onMintNFT={showMintModal} />
          </div>
        </div>
      </div>

      {/* Mint Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
          <div className="bg-black/90 backdrop-blur-md border border-gray-500/30 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl relative">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-red-500">
              You are about to mint Fluent Memory
            </h3>
            <div className="p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 rounded-lg mb-8">
              <img
                src={NFTImage || "/placeholder.svg"}
                alt="NFT"
                className="w-48 h-48 mx-auto object-contain rounded-lg bg-black"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://faucet.devnet.fluentlabs.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white text-black py-3 px-4 rounded-lg font-medium text-center transition-transform hover:scale-105"
              >
                Get Test ETH
              </a>
              <button
                onClick={mintNFT}
                className="flex-1 bg-white text-black py-3 px-4 rounded-lg font-medium transition-transform hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
          <div className="bg-black/90 backdrop-blur-md border border-gray-500/30 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl relative animate-bounce-once">
            <h3 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 text-center">
              NFT Minted Successfully!
            </h3>
            <div className="p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 rounded-lg mb-6">
              <img
                src={NFTImage || "/placeholder.svg"}
                alt="NFT"
                className="w-48 h-48 mx-auto object-contain rounded-lg bg-black"
              />
            </div>
            <p className="text-white text-center mb-6">
              Congratulations! Your Fluent Memory NFT has been minted and added to your wallet.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  setShowConfetti(false)
                  window.location.reload()
                }}
                className="bg-white text-black py-3 px-8 rounded-lg font-medium transition-transform hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AppWrapper() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default AppWrapper;

