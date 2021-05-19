import CrowdsaleByUSDT_CONTRACT from "./contracts/CrowdsaleByUSDT.json";
import ERC20_ABI from "./contracts/erc20-abi.json";

export { CrowdsaleByUSDT_CONTRACT, ERC20_ABI };

export const CrowdsaleByUSDTContractAddress =
  "0xC065B7fd4853B3C0dE88C67853eC41F65103E107";

export const USDTAddress = "0x3aA03210EaA74C7D09163fe3ddF80260Cf42DAa6";

export const CHAIN_ID = process.env.VUE_APP_CHAIN_ID || 128;

export const NETWORK_ID = process.env.VUE_APP_NETWORK_ID || 128;
