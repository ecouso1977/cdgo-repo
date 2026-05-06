/**
 * fund-wallet.js
 * Checks deployer balance and requests Sepolia ETH from available faucets.
 * Run: node scripts/fund-wallet.js
 */

require("dotenv").config();
const https = require("https");
const http = require("http");

// ── Config ────────────────────────────────────────────────────────────────────

const RPC_URL =
  process.env.ALCHEMY_SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/TtOsSp-kyw7NTBa2LSAW6";

const WALLET_ADDRESS =
  process.env.DEPLOYER_ADDRESS || "0xE69aDFdE9082d33b65fcCC17D0446c84c7F1d310";

// ── Helpers ───────────────────────────────────────────────────────────────────

function rpcPost(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };
    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error("Request timed out"));
    });
    req.write(payload);
    req.end();
  });
}

async function getBalance(address) {
  const res = await rpcPost(RPC_URL, {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [address, "latest"],
    id: 1,
  });
  const wei = BigInt(res.body.result || "0x0");
  return Number(wei) / 1e18;
}

async function tryAlchemyFaucet(address) {
  // Alchemy Sepolia faucet API (requires Alchemy account but no extra auth header)
  return new Promise((resolve) => {
    const payload = JSON.stringify({ address });
    const options = {
      hostname: "faucet.alchemy.com",
      path: "/api/send-eth",
      port: 443,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "User-Agent": "Mozilla/5.0",
        Origin: "https://www.alchemy.com",
        Referer: "https://www.alchemy.com/",
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", () => resolve({ status: 0, body: "network error" }));
    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ status: 0, body: "timeout" });
    });
    req.write(payload);
    req.end();
  });
}

async function tryLearnWeb3Faucet(address) {
  // LearnWeb3 Sepolia faucet has an open endpoint
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      network: "ethereum-sepolia",
      address,
    });
    const options = {
      hostname: "learnweb3.io",
      path: "/faucet/ethereum-sepolia/request",
      port: 443,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "User-Agent": "Mozilla/5.0",
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", () => resolve({ status: 0, body: "network error" }));
    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ status: 0, body: "timeout" });
    });
    req.write(payload);
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║          CODIGIO — Sepolia Wallet Funder          ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  console.log(`🔎  Deployer address : ${WALLET_ADDRESS}`);

  // 1. Check current balance
  let balance;
  try {
    balance = await getBalance(WALLET_ADDRESS);
    console.log(`💰  Current balance  : ${balance.toFixed(6)} ETH (Sepolia)\n`);
  } catch (err) {
    console.error("⚠️  Could not fetch balance:", err.message);
    balance = 0;
  }

  if (balance >= 0.05) {
    console.log("✅  You already have enough Sepolia ETH to deploy!");
    console.log("    Run:  npm run deploy:sepolia\n");
    return;
  }

  console.log("⛽  Balance too low — attempting faucet requests...\n");

  // 2. Try Alchemy faucet
  process.stdout.write("   → Alchemy faucet ...  ");
  const alchemy = await tryAlchemyFaucet(WALLET_ADDRESS);
  if (
    alchemy.status === 200 ||
    (typeof alchemy.body === "object" && alchemy.body?.txHash)
  ) {
    console.log("✅  Success!", alchemy.body?.txHash || "");
  } else {
    const msg =
      typeof alchemy.body === "object"
        ? alchemy.body?.message || alchemy.body?.error || JSON.stringify(alchemy.body)
        : String(alchemy.body).slice(0, 120);
    console.log(`❌  ${msg} (HTTP ${alchemy.status})`);
  }

  // 3. Try LearnWeb3 faucet
  process.stdout.write("   → LearnWeb3 faucet ... ");
  const lw3 = await tryLearnWeb3Faucet(WALLET_ADDRESS);
  if (lw3.status === 200 || (typeof lw3.body === "object" && lw3.body?.txHash)) {
    console.log("✅  Success!", lw3.body?.txHash || "");
  } else {
    const msg =
      typeof lw3.body === "object"
        ? lw3.body?.message || lw3.body?.error || JSON.stringify(lw3.body)
        : String(lw3.body).slice(0, 120);
    console.log(`❌  ${msg} (HTTP ${lw3.status})`);
  }

  // 4. Re-check balance
  try {
    const newBalance = await getBalance(WALLET_ADDRESS);
    if (newBalance > balance) {
      console.log(`\n🎉  New balance: ${newBalance.toFixed(6)} ETH — you're funded!`);
      console.log("    Run:  npm run deploy:sepolia\n");
      return;
    }
  } catch {
    // ignore
  }

  // 5. Manual fallback links
  console.log("\n─────────────────────────────────────────────────────");
  console.log("  Automated faucets require social login. Use one of");
  console.log("  these links to manually claim your Sepolia ETH:\n");
  console.log(`  Wallet: ${WALLET_ADDRESS}\n`);
  console.log(
    "  1. Alchemy      → https://www.alchemy.com/faucets/ethereum-sepolia"
  );
  console.log(
    "  2. Google Cloud → https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
  );
  console.log(
    "  3. Infura       → https://www.infura.io/faucet/sepolia"
  );
  console.log(
    "  4. Chainstack   → https://faucet.chainstack.com/sepolia-testnet-faucet"
  );
  console.log(
    "  5. PoW Faucet   → https://sepolia-faucet.pk910.de  (no login, mines for you)"
  );
  console.log(
    "  6. LearnWeb3    → https://learnweb3.io/faucets/sepolia"
  );
  console.log("\n  After claiming, run:  node scripts/fund-wallet.js");
  console.log("  to verify balance, then:  npm run deploy:sepolia\n");
  console.log("─────────────────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
