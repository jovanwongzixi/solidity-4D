const { ethers, getNamedAccounts } = require("hardhat")

async function main(){
    const { deployer } = await getNamedAccounts()
    const _4D = await ethers.getContract("_4D", deployer)
    console.log(`Deployer: ${deployer}`)
    console.log(`Got contract _4D at ${_4D.address}`)
    const balance = await ethers.provider.getBalance(_4D.address)
    console.log(parseInt(balance._hex)/(1e18))
    const transactionResponse = await _4D.sendWinnings()
    await transactionResponse.wait(1)

    const balanceAfter = await ethers.provider.getBalance(_4D.address);
    console.log(parseInt(balanceAfter._hex)/(1e18))
    
    console.log("Winnings sent!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })