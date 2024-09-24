import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import SwapRouterABI from "../abi/SwapRouter.json";
import WMATIC from "../abi/WMATIC.json";

describe("UniswapV3LProvider", function () {
  async function deployContract() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const contractFactory = await hre.ethers.getContractFactory(
      "UniswapV3LProvider"
    );

    const contract = await contractFactory.deploy(
      "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
    );

    return { contract, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should be deployed", async function () {
      const { contract } = await loadFixture(deployContract);

      expect(await contract.getAddress()).to.be.a("string");
    });
  });

  describe("Add liqudity", () => {
    let contract, owner, amountIn, maticAddress, usdtAddress, swapRouterAddress, swapRouter, deadline;

    before(async function () {
      ({ contract, owner } = await loadFixture(deployContract));
      amountIn = hre.ethers.parseUnits("100", 18);
      maticAddress = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
      usdtAddress = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
      swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
      swapRouter = new hre.ethers.Contract(swapRouterAddress, SwapRouterABI, owner);
      deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    });
    it("Should swap tokens", async function () {
      await swapRouter.exactInputSingle({
        tokenIn: maticAddress,
        tokenOut: usdtAddress,
        fee: 500,
        amountIn: amountIn,
        recipient: owner.address,
        deadline: deadline,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      }, { value: amountIn });
    });

    it("Should deposit WMATIC", async function () {
      const tokenContractWMATIC = new hre.ethers.Contract(maticAddress, WMATIC, owner);
      const txw = await tokenContractWMATIC.deposit({ value: amountIn });
      await txw.wait();
    });

    it("Should approve tokens", async function () {
      const tokenContractWMATIC = new hre.ethers.Contract(maticAddress, WMATIC, owner);
      const tokenContractUSDT = new hre.ethers.Contract(usdtAddress, WMATIC, owner);
      const address = await contract.getAddress();
      const wmaticd = await tokenContractWMATIC.decimals();
      const tokenUsdt = await tokenContractUSDT.decimals();

      await tokenContractWMATIC.approve(address, hre.ethers.parseUnits("100", wmaticd));
      await tokenContractUSDT.approve(address, hre.ethers.parseUnits("100", tokenUsdt));
    });

    it("Should mint new position", async function () {
      const tokenContractWMATIC = new hre.ethers.Contract(maticAddress, WMATIC, owner);
      const tokenContractUSDT = new hre.ethers.Contract(usdtAddress, WMATIC, owner);
      const wmaticd = await tokenContractWMATIC.decimals();
      const tokenUsdt = await tokenContractUSDT.decimals();

      const tx = await contract.mintNewPosition(
        "0x9B08288C3Be4F62bbf8d1C20Ac9C5e6f9467d8B7",
        hre.ethers.parseUnits("25", wmaticd),
        hre.ethers.parseUnits("25", tokenUsdt)
      );

      await expect(tx.wait()).to.eventually.have.property('status', 1);
    });
  });
});
