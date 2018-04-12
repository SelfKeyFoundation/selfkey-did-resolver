const didResolver = require('did-resolver')
const contractConnector = require('./contractConnector')
//const keccak256 = require('keccak')

module.exports = {
  resolveDID: function (did) {
    buildDidDocument = function (did, address) {
      const didVersion = '0.1'
      const didContract = contractConnector(address)

      // get Keys
      // get service endpoints

      const doc = {
        '@context': 'https://w3id.org/did/v1',
        id: did,
        version: didVersion
        /*publicKey: [{
          id: `${did}#keys-1`,
          type: 'Secp256k1VerificationKey2018',
          owner: did,
          ethereumAddress: address
        }] */
      }

      return doc
    }

    if (!did.match(/^did:key:0x[0-9a-fA-F]{40}$/)) return new Error(`Not a valid selfkey DID: ${did}`)
    const address = did.match(/0x[0-9a-fA-F]{40}/)[0]

    return buildDidDocument(did, address)
  }
}
