const fs = require('fs')
const Web3 = require('web3')
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://ropsten.infura.io/SYGRk61NUc3yN4NNRs60'
  )
)

// load contract ABI
const identityABIFile = 'Identity.json'
const identitySpecs = JSON.parse(
  fs.readFileSync('./abi/' + identityABIFile)
)
const identityABI = identitySpecs.abi

// function for retrieving contract object from the network
connector = function (address) {
  return web3.eth.contract(identityABI).at(address)
}

module.exports = connector
