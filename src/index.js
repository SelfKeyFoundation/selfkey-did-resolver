const didResolver = require('did-resolver')
const contractConnector = require('./contractConnector')
const Web3 = require('web3')
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://ropsten.infura.io/'
  )
)
//const keccak256 = require('keccak')

/*const MANAGEMENT_KEY = 1
const ACTION_KEY = 2
const CLAIM_SIGNER_KEY = 3
const ENCRYPTION_KEY = 4*/

module.exports = {
  resolveDID: function (did) {
    buildDidDocument = async function (did, address) {
      const contract = contractConnector(address)

      let publicAddress = ''
      let owner = await contract.owner.call()

      if (owner == '0x')
        publicAddress = address
      else
        publicAddress = owner

      // get services
      const services = []
      const servicesCount = await contract.servicesCount.call()
      let serviceType = ''
      let endpoint = ''
      let service = {}

      for (var i = 0; i < servicesCount; i++) {
        serviceType = await contract.services.call(i)
        endpoint = await contract.getServiceByType(serviceType)
        service = {
          type: web3.toAscii(serviceType).replace(/\0/g, ''),
          serviceEndpoint: endpoint
        }
        services.push(service)
      }

      const doc = {
        '@context': 'https://w3id.org/did/v1',
        id: did,
        //version: didVersion
        publicKey: [{
          id: `${did}#keys-1`,
          type: ['KoblitzVerificationKey2017', 'ERC725ManagementKey'],
          owner: did,
          publicAddress: publicAddress
        }],
      }

      if (services.length > 0) {
        doc.service = services
      }

      return doc
    }

    if (!did.match(/^did:key:0x[0-9a-fA-F]{40}$/))
      return { error: 'Not a valid selfkey DID' }

    const address = did.match(/0x[0-9a-fA-F]{40}/)[0]

    return buildDidDocument(did, address)
  }
}
