const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const _4D = await ethers.getContract("_4D", deployer)
    console.log(`Got contract _4D at ${_4D.address}`)
    console.log(`Deployer: ${deployer}`)
    //console.log(ethers.utils.parseEther(0.1).toString())
    const transactionResponse = await _4D.enter4D(2000, {
        value: ethers.utils.parseEther("0.1"),
    })
    await transactionResponse.wait(1)
    console.log("4D entered!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
