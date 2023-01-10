const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts, waffle } = require("hardhat")

network.config.chainId === 31337
    ? describe.skip
    : describe("_4D staging test", function() {
        let _4D
        let deployer
        const maxSendValue = ethers.utils.parseEther("0.15")

        beforeEach(async() => {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture()
            _4D = await ethers.getContract(
                "_4D",
                deployer,
            )
        })

        it("Enters 4D and receives winnings successfully on live testnet", async () => {
            //test entering4D
            const startingContractBalance = await waffle.provider.getBalance(_4D.address)

            await _4D.enter4D(8888, { value: ethers.utils.parseEther("0.05") })
            await _4D.enter4D(1000, { value: maxSendValue })
            const winnings = ethers.utils.parseEther("0.1")

            const contractBalanceAfterEntering4D = await waffle.provider.getBalance(_4D.address)

            assert.equal(startingContractBalance.add(ethers.utils.parseEther("0.05").add(maxSendValue)), contractBalanceAfterEntering4D)

            //test receiving funds
            const startingDeployerBalance = await waffle.provider.getBalance(deployer)
            const transactionResponse = await _4D.sendWinnings()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingDeployerBalance = await waffle.provider.getBalance(deployer)

            assert.equal(winnings
                .add(startingDeployerBalance)
                .toString(),
                endingDeployerBalance
                .add(gasCost)
                .toString()
            )
        })
    })