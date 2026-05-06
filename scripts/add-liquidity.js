const { ethers } = require("ethers");
require("dotenv").config();

// Uniswap V2 Router02 (mainnet)
const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const CDGO_TOKEN = "0xCAFacE86f71cD3926836F7AAd854b27167dfCbc7";

const ROUTER_ABI = [
  "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) payable returns (uint amountToken, uint amountETH, uint liquidity)",
  "function WETH() view returns (address)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const cdgoAmount = ethers.parseUnits("500000", 18);   // 500,000 CDGO
  const ethAmount  = ethers.parseEther("0.04");          // 0.04 ETH

  // Allow 1% slippage minimums (first-time pool, both directions)
  const cdgoMin = (cdgoAmount * 99n) / 100n;
  const ethMin  = (ethAmount  * 99n) / 100n;

  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 min

  const token  = new ethers.Contract(CDGO_TOKEN, ERC20_ABI, wallet);
  const router = new ethers.Contract(UNISWAP_V2_ROUTER, ROUTER_ABI, wallet);

  // Check balance
  const cdgoBal = await token.balanceOf(wallet.address);
  const ethBal  = await provider.getBalance(wallet.address);
  console.log("CDGO balance:", ethers.formatUnits(cdgoBal, 18));
  console.log("ETH balance:", ethers.formatEther(ethBal));

  if (cdgoBal < cdgoAmount) throw new Error("Insufficient CDGO balance");
  if (ethBal  < ethAmount)  throw new Error("Insufficient ETH balance");

  // Step 1: Approve router to spend CDGO
  const allowance = await token.allowance(wallet.address, UNISWAP_V2_ROUTER);
  if (allowance < cdgoAmount) {
    console.log("Approving Uniswap V2 Router to spend CDGO...");
    const approveTx = await token.approve(UNISWAP_V2_ROUTER, cdgoAmount);
    console.log("Approve tx:", approveTx.hash);
    await approveTx.wait();
    console.log("Approval confirmed.");
  } else {
    console.log("Router already approved.");
  }

  // Step 2: Add liquidity
  console.log("Adding liquidity: 500,000 CDGO + 0.04 ETH...");
  const tx = await router.addLiquidityETH(
    CDGO_TOKEN,
    cdgoAmount,
    cdgoMin,
    ethMin,
    wallet.address,  // LP tokens go to owner wallet
    deadline,
    { value: ethAmount }
  );
  console.log("Liquidity tx:", tx.hash);
  console.log("Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("Liquidity added! Block:", receipt.blockNumber);
  console.log("Etherscan: https://etherscan.io/tx/" + tx.hash);
  console.log("Dexscreener: https://dexscreener.com/ethereum/search?q=" + CDGO_TOKEN);
}

main().catch((e) => { console.error(e.message); process.exitCode = 1; });
