import { init, getAccount, setAccount, toChecksumAddress } from "@/utils/web3";

const state = {
  web3: init(),
  currentAccount: getAccount()
};

const mutations = {
  SET_WEB3: (state, web3) => {
    state.web3 = web3;
  },
  SET_CURRENTACCOUNT: (state, account) => {
    state.currentAccount = toChecksumAddress(account);
  }
};

const actions = {
  // 切换网络
  changeNetwork({ commit }, web3) {
    commit("SET_WEB3", web3);
  },
  // 切换当前账号
  changeCurrentAccount({ commit }, account) {
    setAccount(account);
    commit("SET_CURRENTACCOUNT", account);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
