import Web3 from "web3";
import Cookies from "js-cookie";
import store from "@/store";

const currentAccount = "web3-account";

/**
 * 初始化 web3
 * @returns new Web3
 */
export function init() {
  const ethereum = window.ethereum;
  // 没有安装 MetaMask 钱包
  if (typeof ethereum === "undefined") {
    return false;
  }
  // 配置 window.ethereum 参数及事件
  ethereum.autoRefreshOnNetworkChange = false;
  ethereum.on("accountsChanged", (accounts) => {
    store.dispatch("web3/changeCurrentAccount", accounts[0]);
  });
  // ethereum.on('chainChanged', (chainId) => {
  //   window.location.reload()
  // })
  // 获取 provider 和实例化 Web3
  let provider;
  if (ethereum) {
    provider = ethereum;
    try {
      ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log("User denied account access");
    }
  } else if (window.web3) {
    provider = window.web3.currentProvider;
  } else {
    provider = new Web3.providers.HttpProvider(
      "https://http-testnet.hecochain.com"
    );
  }
  return new Web3(provider);
}

/**
 * 获取当前操作账号Token
 * @returns currentAccount
 */
export function getAccount() {
  return Cookies.get(currentAccount);
}

/**
 * 设置当前操作账号Token
 * @returns currentAccount
 */
export function setAccount(account) {
  return Cookies.set(currentAccount, account);
}

/**
 * 清空当前操作账号Token
 * @returns currentAccount
 */
export function removeAccount() {
  return Cookies.remove(currentAccount);
}

/**
 * 格式化Token
 * @returns token
 */
export function toChecksumAddress(token) {
  return Web3.utils.toChecksumAddress(token);
}

/**
 * 检查Token
 * @returns token
 */
export function checkAddressChecksum(token) {
  return Web3.utils.checkAddressChecksum(token);
}

/**
 * 获取合约
 * @returns contract
 */
export function getContract(contractJson, token, web3) {
  if (!token) {
    return new web3.eth.Contract(contractJson.abi);
  } else {
    return new web3.eth.Contract(contractJson.abi, toChecksumAddress(token));
  }
}

/**
 * 获取合约
 * @returns contract
 */
export function getContractByABI(contractABI, token, web3) {
  if (!token) {
    return new web3.eth.Contract(contractABI);
  } else {
    return new web3.eth.Contract(contractABI, toChecksumAddress(token));
  }
}

/**
 * 格式化Wei To Ether
 * @returns etherValue
 */
export function weiToEther(amount, decimals) {
  const decimalsVal = decimals || 18;
  return amount / Math.pow(10, decimalsVal);
}

/**
 * 格式化Ether To Wei
 * @returns weiValue
 */
export function etherToWei(amount, web3) {
  return web3.utils.toWei(amount.toString(), "ether");
}
