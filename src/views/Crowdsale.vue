<template>
  <div class="fill-height">
    <v-container v-if="state.connected" class="fill-height">
      <v-row justify="center">
        <v-col md="6">
          <!-- 认购数据显示 -->
          <v-card justify="center" class="fill-width">
            <v-card-title>
              <span class="title font-weight-light">
                {{ $t("Crowdsale Progress") }}
              </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row align="center">
                <v-col class="body-1" cols="12">
                  <p>
                    {{ $t("Crowdsaled Amount") }}：
                    {{ dataForCrowdsale.weiRaised }}
                    {{ dataForCrowdsale.tokenSymbol }}
                  </p>
                </v-col>
                <v-col class="body-1" cols="12">
                  <p>
                    {{ $t("Crowdsale Remaining") }}：
                    {{ dataForCrowdsale.soldNumber }} /
                    {{ dataForCrowdsale.totalNumber }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <!-- 认购操作 -->
          <v-card class="fill-width mt-10">
            <v-card outlined v-if="dataForCrowdsale.joinedAmount <= 0">
              <v-card-title>
                <v-avatar size="24" class="mr-2">
                  <img :src="require('@/assets/logo.png')" alt="DOI" />
                </v-avatar>
                <span class="title font-weight-light">
                  {{ $t("Input Crowdsale Amount") }}
                </span>
              </v-card-title>
              <v-card-text
                v-if="
                  dataForCrowdsale.soldNumber < dataForCrowdsale.totalNumber
                "
              >
                <v-text-field
                  v-model="crowdsaleAmount"
                  :error-messages="crowdsaleAmountErrors"
                  required
                  @input="$v.crowdsaleAmount.$touch()"
                  @blur="$v.crowdsaleAmount.$touch()"
                  autofocus
                >
                  <span slot="append">
                    {{ dataForCrowdsale.tokenSymbol }}
                  </span>
                </v-text-field>
              </v-card-text>
              <v-card-text v-else>
                {{ $t("Crowdfunding is over") }}
              </v-card-text>
              <v-divider
                v-if="
                  crowdsaleAmountErrors.length <= 0 &&
                    dataForCrowdsale.soldNumber < dataForCrowdsale.totalNumber
                "
              ></v-divider>
              <v-card-actions
                class="justify-center"
                v-if="
                  dataForCrowdsale.soldNumber < dataForCrowdsale.totalNumber
                "
              >
                <v-btn
                  v-if="crowdsaleAmountErrors.length <= 0"
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
            <v-card outlined v-if="dataForCrowdsale.joinedAmount > 0">
              <v-card-title>
                <v-avatar size="24" class="mr-2">
                  <img :src="require('@/assets/logo.png')" alt="DOI" />
                </v-avatar>
                <span class="title font-weight-light">
                  {{ $t("Person Crowdsaled Amount") }}
                </span>
              </v-card-title>
              <v-card-text>
                <v-row align="center">
                  <v-col class="display-3" cols="12">
                    {{ dataForCrowdsale.joinedAmount }}
                    <span class="display-1">
                      {{ dataForCrowdsale.tokenSymbol }}
                    </span>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card>
          <!-- 当前钱包账号 -->
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
          <!-- 遮罩层 -->
          <v-overlay z-index="9999" opacity="0.7" :value="state.fetching">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
          <!-- 提示层 -->
          <v-snackbar
            v-model="operationResult.snackbar"
            color="success"
            centered
            timeout="4000"
          >
            {{ $t(operationResult.text) }}
          </v-snackbar>
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
import { validationMixin } from "vuelidate";
import { required, integer } from "vuelidate/lib/validators";
import clip from "@/utils/clipboard";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { getChainData } from "@/utils/utilities";
import {
  getContract,
  getContractByABI,
  formatAmountForString
} from "@/utils/contract";
import {
  CHAIN_ID,
  NETWORK_ID,
  CrowdsaleByUSDTContractAddress
} from "@/constants";

const initStats = {
  fetching: false,
  address: "",
  web3: null,
  provider: null,
  connected: false,
  chainId: Number(CHAIN_ID),
  networkId: Number(NETWORK_ID),
  assets: []
};

export default {
  name: "Crowdsale",
  mixins: [validationMixin],
  validations: {
    crowdsaleAmount: { required, integer }
  },
  data: () => ({
    // 众筹信息
    dataForCrowdsale: {
      tokenSymbol: "USDT",
      weiRaised: 0,
      soldNumber: 0,
      totalNumber: 1000,
      joinedAmount: 0,
      minCrowdsaleAmount: 150,
      maxCrowdsaleAmount: 1500
    },
    // 通用授权额度
    approveToContractAmount: 1500,
    // 默认认购额度
    crowdsaleAmount: 150,
    // 已授权额度
    allowanceAmount: null,
    // 初始参数
    state: initStats,
    web3Modal: undefined,
    // 提示框
    operationResult: {
      snackbar: false,
      text: `Hello`
    }
  }),
  computed: {
    crowdsaleAmountErrors() {
      const errors = [];
      if (!this.$v.crowdsaleAmount.$dirty) return errors;
      !this.$v.crowdsaleAmount.integer &&
        errors.push(this.$t("CrowdsaleForm.Invalid amount"));
      !this.$v.crowdsaleAmount.required &&
        errors.push(this.$t("CrowdsaleForm.The amount is required"));

      const crowdsaleAmountValue = parseFloat(this.$v.crowdsaleAmount.$model);
      if (
        crowdsaleAmountValue < this.dataForCrowdsale.minCrowdsaleAmount ||
        crowdsaleAmountValue > this.dataForCrowdsale.maxCrowdsaleAmount
      ) {
        errors.push(
          this.$t("CrowdsaleForm.The amount ranges from") +
            " " +
            this.dataForCrowdsale.minCrowdsaleAmount +
            this.$t("to") +
            " " +
            this.dataForCrowdsale.maxCrowdsaleAmount +
            " " +
            this.$t("usdt")
        );
      }
      if (crowdsaleAmountValue > this.state.assets.balance) {
        errors.push(this.$t("CrowdsaleForm.The amount exceeds the balance"));
      }
      return errors;
    }
  },
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
      provider.on("accountsChanged", async accounts => {
        const addressState = {
          address: Web3.utils.toChecksumAddress(accounts[0])
        };
        this.state = Object.assign(this.state, addressState);
        await this.getAccountAssets();
      });
      provider.on("chainChanged", async chainId => {
        const { web3 } = this.state;
        const networkId = await web3.eth.net.getId();
        const chainState = { chainId: chainId, networkId: networkId };
        this.state = Object.assign(this.state, chainState);
        await this.getAccountAssets();
      });

      provider.on("networkChanged", async networkId => {
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
          package: WalletConnectProvider
        }
      };
      return providerOptions;
    },
    // 获取众筹信息
    async getCrowdsaleInfo() {
      const { web3, address } = this.state;
      this.state.fetching = true;
      try {
        const contract = await getContract("Crowdsale", web3);
        const weiRaised = await contract.methods.weiRaised().call();
        this.dataForCrowdsale.weiRaised = formatAmountForString(weiRaised);
        this.dataForCrowdsale.soldNumber = await contract.methods
          .soldNumber()
          .call();
        this.dataForCrowdsale.totalNumber = await contract.methods
          .totalNumber()
          .call();
        const joinedAmount = await contract.methods.joined(address).call();
        this.dataForCrowdsale.joinedAmount = formatAmountForString(
          joinedAmount
        );
        this.dataForCrowdsale.minCrowdsaleAmount = await contract.methods
          .minCrowdsaleAmount()
          .call();
        this.dataForCrowdsale.maxCrowdsaleAmount = await contract.methods
          .maxCrowdsaleAmount()
          .call();
        this.crowdsaleAmount = this.dataForCrowdsale.minCrowdsaleAmount;
        const assetsState = {
          fetching: false
        };
        this.state = Object.assign(this.state, assetsState);
      } catch (error) {
        const errorState = {
          fetching: false,
          connected: false
        };
        this.state = Object.assign(this.state, errorState);
      }
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
        this.allowanceAmount = formatAmountForString(allowance);
        const balance = await contract.methods.balanceOf(address).call();
        const assetsState = {
          fetching: false,
          assets: {
            allowanceAmount: this.allowanceAmount,
            balance: formatAmountForString(balance)
          }
        };
        this.state = Object.assign(this.state, assetsState);
        await this.getCrowdsaleInfo();
      } catch (error) {
        const errorState = {
          fetching: false,
          connected: false
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
            outputFormatter: web3.utils.hexToNumber
          }
        ]
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
        networkId
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
        assets: []
      };
      this.state = nullStats;
    },
    // 授权
    handleApprove() {
      const { web3, address } = this.state;
      this.state.fetching = true;
      // 执行合约
      getContractByABI("USDT", web3)
        .methods.approve(
          CrowdsaleByUSDTContractAddress,
          web3.utils.toWei(this.approveToContractAmount.toString(), "ether")
        )
        .send({ from: address })
        .then(() => {
          this.state.fetching = false;
          this.operationResult.snackbar = true;
          this.operationResult.text = "Approve Success";
          this.getAccountAssets();
        })
        .catch(e => {
          this.state.fetching = false;
          console.info(e);
        });
    },
    // 认购
    handleCrowdsale() {
      const { web3, address } = this.state;
      this.state.fetching = true;
      // 执行合约
      getContract("Crowdsale", web3)
        .methods.buyTokens(
          web3.utils.toWei(this.crowdsaleAmount.toString(), "ether")
        )
        .send({ from: address })
        .then(() => {
          this.state.fetching = false;
          this.operationResult.snackbar = true;
          this.operationResult.text = "Crowdsale Success";
          this.getAccountAssets();
        })
        .catch(e => {
          this.state.fetching = false;
          console.info(e);
        });
    }
  },
  mounted() {
    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: true,
      providerOptions: this.getProviderOptions()
    });
    if (!this.web3Modal.cachedProvider) {
      this.onConnect();
    }
  },
  watch: {
    web3Modal: function(web3) {
      if (web3 && web3.currentProvider && web3.currentProvider.close) {
        this.state.connected = false;
      } else {
        this.onConnect();
      }
    }
  }
};
</script>
