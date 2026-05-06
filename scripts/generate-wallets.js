const fs = require("node:fs");
const path = require("node:path");
const { ethers } = require("ethers");

function createWalletRecord(label) {
  const wallet = ethers.Wallet.createRandom();

  return {
    label,
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic ? wallet.mnemonic.phrase : null
  };
}

function main() {
  const wallets = [
    createWalletRecord("TOKEN_OWNER"),
    createWalletRecord("TREASURY_WALLET"),
    createWalletRecord("CONTRIBUTOR_WALLET")
  ];

  const outputPath = path.join(process.cwd(), ".generated-wallets.json");
  fs.writeFileSync(outputPath, `${JSON.stringify(wallets, null, 2)}\n`, { encoding: "utf8", flag: "w" });

  console.log("Generated EVM addresses:");
  for (const wallet of wallets) {
    console.log(`${wallet.label}=${wallet.address}`);
  }
  console.log(`Full wallet details written to ${outputPath}`);
}

main();