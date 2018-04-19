const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://ropsten.infura.io/'
  )
)

// load contract ABI
const identityABIFile = 'Identity.json'
const identitySpecs = JSON.parse(
  fs.readFileSync(path.join(__dirname, './abi/' + identityABIFile))
)
const identityABI = identitySpecs.abi


// function for retrieving contract object from the network
connector = function (address) {
  return web3.eth.contract(identityABI).at(address)
  //return new web3.eth.contract(identityABI, address)
}

module.exports = connector
