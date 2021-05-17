<template>
  <div class="fill-height">
    <v-container v-if="state.connected" class="fill-height">
      <v-row justify="center">
        <v-col md="6">
          <v-card class="fill-width">
            <v-card outlined>
              <v-card-title>
                <v-avatar size="24" class="mr-2">
                  <img :src="require('@/assets/logo.png')" alt="DOI" />
                </v-avatar>
                <span class="title font-weight-light">
                  {{ $t("Select Crowdsale Amount") }}
                </span>
              </v-card-title>
              <v-card-text>
                <v-row align="center">
                  <v-col class="display-3" cols="12">
                    <v-btn-toggle
                      v-model="crowdsaleAmount"
                      tile
                      color="deep-purple accent-3"
                      group
                    >
                      <v-btn value="1">1</v-btn>
                      <v-btn value="2">2</v-btn>
                      <v-btn value="3">3</v-btn>
                    </v-btn-toggle>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-divider v-if="crowdsaleAmount"></v-divider>
              <v-card-actions class="justify-center">
                <v-btn
                  v-if="crowdsaleAmount"
                  large
                  color="primary"
                  dark
                  width="80%"
                  @click="
                    allowanceAmount &&
                    allowanceAmount >= parseInt(crowdsaleAmount)
                      ? handleCrowdsale()
                      : handleApprove()
                  "
                  :disabled="!crowdsaleAmount"
                >
                  {{
                    allowanceAmount &&
                    allowanceAmount >= parseInt(crowdsaleAmount)
                      ? $t("Crowdsale")
                      : $t("Approve")
                  }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-card>
          <v-card justify="center" class="fill-width mt-10">
            <v-card-title>
              <span class="title font-weight-light">
                {{ $t("Current Token Address") }}
              </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row align="center">
                <v-col
                  class="body-1"
                  cols="12"
                  @click="handleCopy(state.address, $event)"
                >
                  <p>
                    {{ state.address }}
                    <v-icon>mdi-content-copy</v-icon>
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="justify-center">
              <v-btn @click="resetApp">
                {{ $t("Disconnect Wallet") }}
              </v-btn>
            </v-card-actions>
          </v-card>
          <v-overlay z-index="9999" opacity="0.7" :value="state.fetching">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-if="!state.connected" class="fill-height">
      <v-row justify="center">
        <v-col md="6" align="center">
          <v-btn
            v-if="!state.connected"
            x-large
            color="deep-orange darken-4 white--text"
            @click="onConnect"
          >
            {{ $t("Connect Wallet") }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import clip from "@/utils/clipboard";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { getChainData } from "@/utils/utilities";
import { getContract, getContractByABI } from "@/utils/contract";
import {
  CHAIN_ID,
  NETWORK_ID,
  CrowdsaleByUSDTContractAddress,
} from "@/constants";

const initStats = {
  fetching: false,
  address: "",
  web3: null,
  provider: null,
  connected: false,
  chainId: Number(CHAIN_ID),
  networkId: Number(NETWORK_ID),
  assets: [],
};

export default {
  name: "Crowdsale",
  data: () => ({
    // 默认认购额度
    crowdsaleAmount: "1",
    // 已授权额度
    allowanceAmount: null,
    // 奖励参数
    state: initStats,
    web3Modal: undefined,
  }),
  methods: {
    // 复制地址
    handleCopy(text, event) {
      clip(text, event);
    },
    // 监听钱包事件 OK
    async subscribeProvider(provider) {
      if (!provider.on) {
        return;
      }
      provider.on("close", () => this.resetApp());
      provider.on("accountsChanged", async (accounts) => {
        const addressState = {
          address: Web3.utils.toChecksumAddress(accounts[0]),
        };
        this.state = Object.assign(this.state, addressState);
        await this.getAccountAssets();
      });
      provider.on("chainChanged", async (chainId) => {
        const { web3 } = this.state;
        const networkId = await web3.eth.net.getId();
        const chainState = { chainId: chainId, networkId: networkId };
        this.state = Object.assign(this.state, chainState);
        await this.getAccountAssets();
      });

      provider.on("networkChanged", async (networkId) => {
        const { web3 } = this.state;
        const chainId = await web3.eth.chainId();
        const networkState = { chainId: chainId, networkId: networkId };
        this.state = Object.assign(this.state, networkState);
        await this.getAccountAssets();
      });
    },
    // 获取网络配置 OK
    getNetwork() {
      getChainData(this.state.chainId).network;
    },
    // 获取Provider配置 OK
    getProviderOptions() {
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
        },
      };
      return providerOptions;
    },
    // 获取账号信息
    async getAccountAssets() {
      const { web3, address } = this.state;
      this.state.fetching = true;
      try {
        const contract = await getContractByABI("USDT", web3);
        const allowance = await contract.methods
          .allowance(address, CrowdsaleByUSDTContractAddress)
          .call();
        this.allowanceAmount = parseInt(allowance) / Math.pow(10, 6);
        const assetsState = {
          fetching: false,
          assets: {
            allowanceAmount: this.allowanceAmount,
          },
        };
        this.state = Object.assign(this.state, assetsState);
      } catch (error) {
        const errorState = {
          fetching: false,
          connected: false,
        };
        this.state = Object.assign(this.state, errorState);
      }
    },
    // 初始化web3 OK
    initWeb3(provider) {
      const web3 = new Web3(provider);

      web3.eth.extend({
        methods: [
          {
            name: "chainId",
            call: "eth_chainId",
            outputFormatter: web3.utils.hexToNumber,
          },
        ],
      });

      return web3;
    },
    // 连接钱包 OK
    async onConnect() {
      const provider = await this.web3Modal.connect();
      await this.subscribeProvider(provider);
      const web3 = this.initWeb3(provider);
      const accounts = await web3.eth.getAccounts();
      const address = Web3.utils.toChecksumAddress(accounts[0]);
      const networkId = await web3.eth.net.getId();
      const chainId = await web3.eth.chainId();

      const connectedState = {
        web3,
        provider,
        connected: true,
        address,
        chainId,
        networkId,
      };
      this.state = Object.assign(this.state, connectedState);
      await this.getAccountAssets();
    },
    // 重置钱包连接 OK
    async resetApp() {
      const { web3 } = this.state;
      if (web3 && web3.currentProvider && web3.currentProvider.close) {
        await web3.currentProvider.close();
      }
      this.web3Modal.clearCachedProvider();
      const nullStats = {
        fetching: false,
        address: "",
        web3: null,
        provider: null,
        connected: false,
        chainId: 1,
        networkId: 1,
        assets: [],
      };
      this.state = nullStats;
    },
    // 授权
    handleApprove() {
      const { web3, address } = this.state;
      this.state.fetching = true;
      this.dialog = false;
      // 执行合约
      getContractByABI("USDT", web3)
        .methods.approve(
          CrowdsaleByUSDTContractAddress,
          parseInt(this.crowdsaleAmount) * Math.pow(10, 6)
        )
        .send({ from: address })
        .then(() => {
          this.state.fetching = false;
          this.getAccountAssets();
        })
        .catch((e) => {
          this.state.fetching = false;
          console.info(e);
        });
    },
    // 认购
    handleCrowdsale() {
      const { web3, address } = this.state;
      this.state.fetching = true;
      this.dialog = false;
      // 执行合约
      getContract("Crowdsale", web3)
        .methods.buyTokens(parseInt(this.crowdsaleAmount) * Math.pow(10, 6))
        .send({ from: address })
        .then(() => {
          this.state.fetching = false;
          this.getAccountAssets();
        })
        .catch((e) => {
          this.state.fetching = false;
          console.info(e);
        });
    },
  },
  mounted() {
    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: true,
      providerOptions: this.getProviderOptions(),
    });
    if (!this.web3Modal.cachedProvider) {
      this.onConnect();
    }
  },
  watch: {
    web3Modal: function (web3) {
      if (web3 && web3.currentProvider && web3.currentProvider.close) {
        this.state.connected = false;
      } else {
        this.onConnect();
      }
    },
  },
};
</script>
