const { network } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("Deploying 4D contract...")
    const _4D = await deploy("_4D", {
        from: deployer,
        //args : [],
        log: true,
        waitConfirmations: 1//network.config.blockConfirmations || 1,
    })
    log(`_4D deployed at ${_4D.address}`)

    //verify
    if(network.config.chainId !== 31337 && process.env.ETHERSCAN_API_KEY) await verify(_4D.address, [])
}