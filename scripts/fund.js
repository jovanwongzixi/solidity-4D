const { ethers, getNamedAccounts } = require("hardhat")

async function main(){
    const { deployer } = await getNamedAccounts()
    const _4D = await ethers.getContract("_4D", deployer)
    console.log(`Got contract _4D at ${_4D.address}`)
    console.log(`Deployer: ${deployer}`)

    const transactionResponse = await _4D.fund({
        value: ethers.utils.parseEther("0.1")
    })
    await transactionResponse.wait(1)
    console.log("Contract funded!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })