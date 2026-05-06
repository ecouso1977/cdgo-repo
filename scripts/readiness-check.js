const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");
const { ethers } = require("ethers");

dotenv.config();

function readJson(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function isPending(value) {
  if (typeof value !== "string") {
    return false;
  }

  const lowered = value.toLowerCase();
  return lowered.includes("pending") || lowered.includes("still pending");
}

function checkEnv() {
  const required = ["RPC_URL", "PRIVATE_KEY", "TOKEN_OWNER", "CONTRIBUTOR_WALLET"];
  const missing = required.filter((name) => !process.env[name]);

  return {
    ok: missing.length === 0,
    missing
  };
}

function checkMetadata(metadata) {
  const issues = [];

  if (isPending(metadata.explorer?.contractAddress)) {
    issues.push("explorer.contractAddress");
  }

  if (isPending(metadata.socials?.x)) {
    issues.push("socials.x");
  }

  if (isPending(metadata.branding?.wordmarkAsset)) {
    issues.push("branding.wordmarkAsset");
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

async function checkDeployerBalance() {
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    return {
      checked: false,
      ok: false,
      address: null,
      balanceEth: null,
      minimumEth: null,
      reason: "RPC_URL or PRIVATE_KEY missing"
    };
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    const minimumBalance = ethers.parseEther("0.005");

    return {
      checked: true,
      ok: balance >= minimumBalance,
      address: wallet.address,
      balanceEth: ethers.formatEther(balance),
      minimumEth: ethers.formatEther(minimumBalance),
      reason: balance >= minimumBalance ? null : "Insufficient gas balance"
    };
  } catch (error) {
    return {
      checked: true,
      ok: false,
      address: null,
      balanceEth: null,
      minimumEth: null,
      reason: `Balance check failed: ${error.message}`
    };
  }
}

async function main() {
  const metadata = readJson("docs/token-metadata.json");
  const env = checkEnv();
  const meta = checkMetadata(metadata);
  const funds = await checkDeployerBalance();

  console.log("Codigio readiness report");
  console.log("=======================");
  console.log(`Environment ready: ${env.ok ? "YES" : "NO"}`);
  if (!env.ok) {
    console.log(`Missing env vars: ${env.missing.join(", ")}`);
  }

  console.log(`Metadata ready: ${meta.ok ? "YES" : "NO"}`);
  if (!meta.ok) {
    console.log(`Pending metadata fields: ${meta.issues.join(", ")}`);
  }

  if (!funds.checked) {
    console.log("Deployer balance check: SKIPPED");
    console.log(`Reason: ${funds.reason}`);
  } else {
    console.log(`Deployer balance check: ${funds.ok ? "YES" : "NO"}`);
    console.log(`Deployer address: ${funds.address}`);
    console.log(`Deployer balance (ETH): ${funds.balanceEth}`);
    console.log(`Suggested minimum (ETH): ${funds.minimumEth}`);
    if (!funds.ok) {
      console.log(`Balance issue: ${funds.reason}`);
    }
  }

  if (env.ok && meta.ok && funds.checked && funds.ok) {
    console.log("Overall status: READY for deployment and submission workflow");
    return;
  }

  console.log("Overall status: NOT READY");
  process.exitCode = 1;
}

main();