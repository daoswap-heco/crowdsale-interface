import CrowdsaleByUSDT_CONTRACT from "./contracts/CrowdsaleByUSDT.json";
import ERC20_ABI from "./contracts/erc20-abi.json";

export { CrowdsaleByUSDT_CONTRACT, ERC20_ABI };

export const CrowdsaleByUSDTContractAddress =
  "0x2c25e0eFa381CAa416E989575A9c1fCCAa89a9e3";

export const USDTAddress = "0x04F535663110A392A6504839BEeD34E019FdB4E0";

export const CHAIN_ID = process.env.VUE_APP_CHAIN_ID || 128;

export const NETWORK_ID = process.env.VUE_APP_NETWORK_ID || 128;
