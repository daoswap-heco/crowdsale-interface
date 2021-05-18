import Web3 from "web3";
import {
  CrowdsaleByUSDT_CONTRACT,
  CrowdsaleByUSDTContractAddress,
  ERC20_ABI,
  USDTAddress
} from "../constants";

const CONTRACTS = {
  Crowdsale: {
    contractJson: CrowdsaleByUSDT_CONTRACT,
    address: CrowdsaleByUSDTContractAddress
  },
  USDT: {
    contractJson: ERC20_ABI,
    address: USDTAddress
  }
};

export const getContract = (name, web3) => {
  const contractObj = CONTRACTS[name];
  // 定义合约变量
  const readContract = new web3.eth.Contract(
    contractObj.contractJson.abi,
    contractObj.address
  );
  return readContract;
};

export const getContractByABI = (name, web3) => {
  const contractObj = CONTRACTS[name];
  // 定义合约变量
  const readContract = new web3.eth.Contract(
    contractObj.contractJson,
    contractObj.address
  );
  return readContract;
};

/**
 * format amount
 * @param {(string|number)} amount
 * @param {number} decimals
 * @returns {number | null}
 */
export const formatAmount = (amount, decimals) => {
  const decimalsValue = decimals || 18;
  return Web3.utils.BN(amount).toString() / Math.pow(10, decimalsValue);
};

/**
 * format amount for string
 * @param {(string|number)} amount
 * @param {number} decimals
 * @returns {number | null}
 */
export const formatAmountForString = (amount, decimals) => {
  const decimalsValue = decimals || 18;
  return amount / Math.pow(10, decimalsValue);
};
