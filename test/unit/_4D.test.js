const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts, waffle } = require("hardhat")

!network.config.chainId === 31337
    ? describe.skip
    : describe("_4D unit test", function () {
          let _4D
          let deployer
          const maxSendValue = ethers.utils.parseEther("0.15")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture()
              _4D = await ethers.getContract("_4D", deployer)
          })

          describe("enter4D", function () {
              it("Fails if bet amount is too low", async () => {
                  await expect(_4D.enter4D(1000, { value: 0 })).to.be.revertedWith(
                      "_4D__BetAmountTooLow"
                  )
              })

              it("Fails if bet amount is too high", async () => {
                  await expect(
                      _4D.enter4D(1000, { value: ethers.utils.parseEther("1") })
                  ).to.be.revertedWith("_4D__BetAmountTooHigh")
              })

              it("Updates betAmount and _4DNumber successfully", async () => {
                  await _4D.enter4D(1000, { value: maxSendValue })
                  const { betAmount, _4DNumber } = await _4D.getBetDetails()
                  assert.equal(betAmount.toString(), maxSendValue.toString())
                  assert.equal(1000, _4DNumber)
              })
          })

          describe("sendWinnings", function () {
              it("Fails if no winnings to be sent", async () => {
                  await expect(_4D.sendWinnings()).to.be.revertedWith("_4D__NoWinningsToSend")
              })

              it("Sends winnings to deployer successfully", async () => {
                  await _4D.enter4D(8888, { value: ethers.utils.parseEther("0.05") })
                  await _4D.enter4D(1000, { value: maxSendValue })
                  const winnings = ethers.utils.parseEther("0.1")

                  const startingDeployerBalance = await waffle.provider.getBalance(deployer)
                  const transactionResponse = await _4D.sendWinnings()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingDeployerBalance = await waffle.provider.getBalance(deployer)

                  assert.equal(
                      winnings.add(startingDeployerBalance).toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Updates s_addressToBets successfully", async () => {
                  await _4D.enter4D(8888, { value: ethers.utils.parseEther("0.05") })
                  await _4D.enter4D(1000, { value: maxSendValue })

                  const transactionResponse = await _4D.sendWinnings()
                  await transactionResponse.wait()
                  await expect(_4D.getBetDetails()).to.be.revertedWith("_4D__NoBetsMade")
              })
          })

          describe("withdraw", function () {
              it("Fails to withdraw if insufficient balance", async () => {
                  const contractBalance = await waffle.provider.getBalance(_4D.address)
                  await expect(
                      _4D.withdraw(contractBalance.add(ethers.utils.parseEther("0.1")))
                  ).to.be.revertedWith("_4D__InsufficientFundsForWithdrawal")
              })
              it("Successfully withdraws", async () => {
                  const contractBalance = await waffle.provider.getBalance(_4D.address)
                  const transactionResponse = await _4D.withdraw(contractBalance)
                  await transactionResponse.wait()
                  const endContractBalance = await waffle.provider.getBalance(_4D.address)
                  assert.equal(endContractBalance.toString(), "0")
              })
          })
      })
