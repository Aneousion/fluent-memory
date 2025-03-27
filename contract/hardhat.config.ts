import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-vyper";

const config: HardhatUserConfig = {
  networks: {
    fluent_devnet1: {
      url: "https://rpc.dev.gblend.xyz/",
      chainId: 20993,
      accounts: [
        `0x${"e3e42c40a99de12c1d917e2a04dd59cb0f850278990124a9a53781df9f211800"}`,
      ],      
    },
  },
  solidity: {
    version: "0.8.20",
  },
};

export default config;
