class TpgaTelbankApp {
  constructor() {
    this.address = null;
    this.chainId = null;
    this.flows = [];
    this.rate = null; // { eur, usd }

    this.$walletDot = document.getElementById("walletDot");
    this.$walletAccount = document.getElementById("walletAccount");
    this.$walletNetwork = document.getElementById("walletNetwork");
    this.$connectButton = document.getElementById("connectButton");

    this.$rateInfoIn = document.getElementById("rateInfoIn").querySelector("span");
    this.$rateInfoOut =
      document.getElementById("rateInfoOut").querySelector("span");

    this.$flowList = document.getElementById("flowList");
    this.$flowCount = document.getElementById("flowCount");
    this.$clearFlowsButton = document.getElementById("clearFlowsButton");

    // Inflow elements
    this.$inLabel = document.getElementById("inLabel");
    this.$inFiatAmount = document.getElementById("inFiatAmount");
    this.$inFiatCurrency = document.getElementById("inFiatCurrency");
    this.$inCryptoAmount = document.getElementById("inCryptoAmount");
    this.$inCryptoSymbol = document.getElementById("inCryptoSymbol");
    this.$inExternalAccount = document.getElementById("inExternalAccount");
    this.$addInflowButton = document.getElementById("addInflowButton");

    // Outflow elements
    this.$outLabel = document.getElementById("outLabel");
    this.$outCryptoAmount = document.getElementById("outCryptoAmount");
    this.$outCryptoSymbol = document.getElementById("outCryptoSymbol");
    this.$outFiatAmount = document.getElementById("outFiatAmount");
    this.$outFiatCurrency = document.getElementById("outFiatCurrency");
    this.$outExternalAccount = document.getElementById("outExternalAccount");
    this.$addOutflowButton = document.getElementById("addOutflowButton");
  }

  init() {
    this.loadFlows();
    this.renderFlows();

    this.$connectButton.addEventListener("click", () => this.connectWallet());
    this.$addInflowButton.addEventListener("click", () => this.addInflow());
    this.$addOutflowButton.addEventListener("click", () => this.addOutflow());
    this.$clearFlowsButton.addEventListener("click", () => this.clearFlows());

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        this.address = accounts && accounts[0] ? accounts[0] : null;
        this.updateWalletUi();
      });
      window.ethereum.on("chainChanged", (chainId) => {
        this.chainId = chainId;
        this.updateWalletUi();
      });
    }

    this.fetchEthRate();
  }

  async connectWallet() {
    if (!window.ethereum) {
      alert(
        "MetaMask (oder eine kompatible Wallet) wurde nicht gefunden. Bitte installiere MetaMask in deinem Browser."
      );
      return;
    }
    try {
      this.$connectButton.disabled = true;
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      this.address = accounts && accounts[0] ? accounts[0] : null;
      this.chainId = chainId;
      this.updateWalletUi();
    } catch (err) {
      console.error("MetaMask connection error:", err);
      alert("Wallet connection was rejected or failed.");
    } finally {
      this.$connectButton.disabled = false;
    }
  }

  updateWalletUi() {
    if (this.address) {
      this.$walletDot.classList.add("connected");
      const short =
        this.address.slice(0, 6) + "…" + this.address.slice(this.address.length - 4);
      this.$walletAccount.innerHTML = `<span>Wallet:</span> ${short}`;
      const networkName = this.getNetworkName(this.chainId);
      this.$walletNetwork.innerHTML = `<span>Network:</span> ${networkName}`;
      this.$connectButton.textContent = "Connected";
      this.$connectButton.disabled = true;
    } else {
      this.$walletDot.classList.remove("connected");
      this.$walletAccount.innerHTML = "<span>Wallet:</span> Not connected";
      this.$walletNetwork.innerHTML = "<span>Network:</span> –";
      this.$connectButton.textContent = "Connect MetaMask";
      this.$connectButton.disabled = false;
    }
  }

  getNetworkName(chainId) {
    if (!chainId) return "Unknown";
    const id = chainId.toString().toLowerCase();
    switch (id) {
      case "0x1":
        return "Ethereum Mainnet";
      case "0x5":
        return "Goerli Testnet";
      case "0xaa36a7":
        return "Sepolia Testnet";
      default:
        return `Chain ${id}`;
    }
  }

  async fetchEthRate() {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur,usd"
      );
      if (!res.ok) throw new Error("Failed to fetch ETH rate");
      const data = await res.json();
      if (data && data.ethereum) {
        this.rate = {
          eur: data.ethereum.eur,
          usd: data.ethereum.usd,
        };
        this.updateRateUi();
      }
    } catch (err) {
      console.error("Rate fetch error:", err);
    }
  }

  updateRateUi() {
    if (!this.rate) return;
    this.$rateInfoIn.textContent = `1 ETH = ${this.rate.eur} EUR / ${this.rate.usd} USD`;
    this.$rateInfoOut.textContent = `1 ETH = ${this.rate.eur} EUR / ${this.rate.usd} USD`;
  }

  addInflow() {
    const label = this.$inLabel.value.trim() || "Fiat to Crypto inflow";
    const fiatAmount = parseFloat(this.$inFiatAmount.value || "0");
    const fiatCurrency = this.$inFiatCurrency.value;
    const cryptoAmount = parseFloat(this.$inCryptoAmount.value || "0");
    const cryptoSymbol = this.$inCryptoSymbol.value;
    const externalAccount = (this.$inExternalAccount.value || "").trim();

    if (!fiatAmount || !cryptoAmount) {
      alert("Please enter both fiat and crypto amounts.");
      return;
    }

    const flow = {
      id: "in-" + Date.now(),
      direction: "in",
      label,
      fiatAmount,
      fiatCurrency,
      cryptoAmount,
      cryptoSymbol,
      externalAccount: externalAccount || null,
      createdAt: new Date().toISOString(),
    };
    this.flows.unshift(flow);
    this.saveFlows();
    this.renderFlows();
    this.clearInflowForm();
    this.sendTransferToBackend(flow);
  }

  addOutflow() {
    const label = this.$outLabel.value.trim() || "Crypto to Fiat outflow";
    const cryptoAmount = parseFloat(this.$outCryptoAmount.value || "0");
    const cryptoSymbol = this.$outCryptoSymbol.value;
    const fiatAmount = parseFloat(this.$outFiatAmount.value || "0");
    const fiatCurrency = this.$outFiatCurrency.value;
    const externalAccount = (this.$outExternalAccount.value || "").trim();

    if (!fiatAmount || !cryptoAmount) {
      alert("Please enter both crypto and fiat amounts.");
      return;
    }

    const flow = {
      id: "out-" + Date.now(),
      direction: "out",
      label,
      fiatAmount,
      fiatCurrency,
      cryptoAmount,
      cryptoSymbol,
      externalAccount: externalAccount || null,
      createdAt: new Date().toISOString(),
    };
    this.flows.unshift(flow);
    this.saveFlows();
    this.renderFlows();
    this.clearOutflowForm();
    this.sendTransferToBackend(flow);
  }

  clearInflowForm() {
    this.$inLabel.value = "";
    this.$inFiatAmount.value = "";
    this.$inCryptoAmount.value = "";
    if (this.$inExternalAccount) this.$inExternalAccount.value = "";
  }

  clearOutflowForm() {
    this.$outLabel.value = "";
    this.$outCryptoAmount.value = "";
    this.$outFiatAmount.value = "";
    if (this.$outExternalAccount) this.$outExternalAccount.value = "";
  }

  async sendTransferToBackend(flow) {
    // Optional server-side logging; configure base via global or default relative API path.
    const base =
      window.TELBANK_TRANSFER_API_BASE || "/api/telbank";
    if (!base) return;
    try {
      const body = {
        direction: flow.direction,
        label: flow.label,
        walletAddress: this.address || null,
        network: this.getNetworkName(this.chainId),
        cryptoAmount: flow.cryptoAmount,
        cryptoSymbol: flow.cryptoSymbol,
        fiatAmount: flow.fiatAmount,
        fiatCurrency: flow.fiatCurrency,
        externalAccount: flow.externalAccount || null,
        meta: {
          source: "tpga-telbank-console",
        },
      };
      await fetch(`${base}/transfers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.warn("Failed to send transfer to backend:", err);
    }
  }

  saveFlows() {
    try {
      const payload = {
        version: 1,
        flows: this.flows,
      };
      localStorage.setItem("tpga-telbank-flows", JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to save flows:", err);
    }
  }

  loadFlows() {
    try {
      const raw = localStorage.getItem("tpga-telbank-flows");
      if (!raw) {
        this.flows = [];
        return;
      }
      const payload = JSON.parse(raw);
      this.flows = Array.isArray(payload.flows) ? payload.flows : [];
    } catch (err) {
      console.error("Failed to load flows:", err);
      this.flows = [];
    }
  }

  clearFlows() {
    if (!confirm("Clear the local Telbank log in this browser?")) return;
    this.flows = [];
    this.saveFlows();
    this.renderFlows();
  }

  renderFlows() {
    this.$flowList.innerHTML = "";
    if (!this.flows.length) {
      this.$flowList.innerHTML =
        '<div class="hint">No flows recorded yet. Use the panels above to log your Telbank movements.</div>';
      this.$flowCount.textContent = "(0 flows)";
      return;
    }

    for (const flow of this.flows) {
      const row = document.createElement("div");
      row.className = "flow-item";

      const main = document.createElement("div");
      main.className = "flow-main";

      const labelEl = document.createElement("div");
      labelEl.className = "flow-label";
      labelEl.textContent = flow.label;

      const metaEl = document.createElement("div");
      metaEl.className = "flow-meta";
      const date = new Date(flow.createdAt);
      metaEl.textContent = `${flow.cryptoAmount} ${flow.cryptoSymbol} ↔ ${flow.fiatAmount} ${flow.fiatCurrency} • ${date.toLocaleString()}`;

      main.appendChild(labelEl);
      main.appendChild(metaEl);

      const dir = document.createElement("div");
      dir.className = "flow-dir " + (flow.direction === "in" ? "in" : "out");
      dir.textContent = flow.direction === "in" ? "INFLOW" : "OUTFLOW";

      row.appendChild(main);
      row.appendChild(dir);

      this.$flowList.appendChild(row);
    }

    this.$flowCount.textContent =
      "(" + this.flows.length.toString() + (this.flows.length === 1 ? " flow)" : " flows)");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new TpgaTelbankApp();
  app.init();
});


