import CrowdsaleByUSDT_CONTRACT from "./contracts/CrowdsaleByUSDT.json";
import ERC20_ABI from "./contracts/erc20-abi.json";

export { CrowdsaleByUSDT_CONTRACT, ERC20_ABI };

export const CrowdsaleByUSDTContractAddress =
  "0xE729c32C8E986f8D652a6bdd7BDD7d0bbb5A5cd3";

export const USDTAddress = "0x04F535663110A392A6504839BEeD34E019FdB4E0";

export const CHAIN_ID = process.env.VUE_APP_CHAIN_ID || 128;

export const NETWORK_ID = process.env.VUE_APP_NETWORK_ID || 128;
