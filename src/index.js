const
	fs = require('fs')
	path = require('path')
	Web3 = require('web3')
	web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/'))
	keyTypes = {
		1: "ERC725ManagementKey",
		2: "ERC725ActionKey",
		3: "ERC725ClaimSignerKey",
		4: "ERC725EncryptionKey"
	}

// retrieve the contract object from the network
async function connector(address) {
	return new web3.eth.Contract(JSON.parse(fs.readFileSync(path.join(__dirname, './id-abi.json'))).abi, address)
}

// handle multiple keys
async function loopKeys(contract, did) {
	const keysCount = await contract.methods.keysCount.call()
	let keys = []
	for (let i = keysCount.length - 1; i >= 0; i--) {
		const
			hash = await contract.methods.keyHashes.call(i)
			gotKey = await contract.methods.getKeyByHash(hash)
			key = {
				id: `${did}#keys-` + (i + 1),
				type: ['KoblitzVerificationKey2017', keyTypes[gotKey[1]]],
				owner: did,
				publicAddress: gotKey[0]
			}
		keys.push(key)
	}
	return keys
}

// handle multiple service enpdpoints
async function loopServices(contract) {
	const servicesCount = await contract.methods.servicesCount.call()
	let services = []
	for (let i = servicesCount.length - 1; i >= 0; i--) {
		const 
			serviceType = await contract.methods.services.call(i)
			endpoint = await contract.methods.getServiceByType(serviceType)
			service = {
				type: web3.toAscii(serviceType).replace(/\0/g, ''),
				serviceEndpoint: endpoint
			}
		services.push(service)
	}
	return services
}

// build the DID Document
async function buildDocument(did, address) {
	const 
		contract = await connector(address)
		owner = await contract.methods.owner.call()
		keys = await loopKeys(contract, did)
		services = await loopServices(contract)
	let doc = {
		'@context': 'https://w3id.org/did/v1',
		id: did
	}
	if (keys.length > 0) doc.publicKey = keys
	if (services.length > 0) doc.service = services
	if (owner == '0x') {
		doc.publicKey = [
			{
				id: `${did}#keys-1`,
				type: ['KoblitzVerificationKey2017'],
				owner: did,
				publicAddress: address
			}
		]
	}
	return doc
}

// resolve the DID and return the DID document
async function didResolver(did) {
	if (!did.match(/^did:key:0x[0-9a-fA-F]{40}$/)) return { error: 'Not a valid SelfKey DID' }
	const address = did.match(/0x[0-9a-fA-F]{40}/)[0]
	return buildDocument(did, address)
}

// take the did from command line if there is one
if (process.argv[2]) {
	async function didConsole(did) {
		const cdid = await didResolver(process.argv[2])
		console.log(cdid)
	}
	didConsole(process.argv[2])
}

module.exports = didResolver
