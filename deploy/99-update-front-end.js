const { ethers, network } = require("hardhat")
const fs = require("fs")
require("dotenv").config()

const FRONT_END_ADDRESSES_FILE = "../nextjs-solidity-4d/constants/contractAddresses.json"
const FRONT_END_ABI_FILE = "../nextjs-solidity-4d/constants/abi.json"

module.exports = async function (){
    if(process.env.UPDATE_FRONT_END){
        console.log("UPdating front end stuff")
        await updateContractAddresses()
        await updateAbi()
    }
}

async function updateContractAddresses(){
    const _4D = await ethers.getContract("_4D")
    const chainId = network.config.chainId.toString()
    const currentAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf-8"))
    if (chainId in currentAddresses){
        if(!currentAddresses[chainId].includes(_4D.address)){
            currentAddresses[chainId].push(_4D.address)
        }
    } {
        currentAddresses[chainId] = [_4D.address]
    }
    fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses))
}

async function updateAbi() {
    const _4D = await ethers.getContract("_4D")
    fs.writeFileSync(FRONT_END_ABI_FILE, _4D.interface.format(ethers.utils.FormatTypes.json))
}