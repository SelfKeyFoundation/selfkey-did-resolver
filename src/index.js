'use strict'

const util = require('util')
const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/'))
const keyTypes = {
		1: "ERC725ManagementKey",
		2: "ERC725ActionKey",
		3: "ERC725ClaimSignerKey",
		4: "ERC725EncryptionKey"
	}
const nameRegistryAddress = '0xffe08afb7fe148c42deba7ff80d6b9444ce95b6a'

// retrieve the contract object from the network
async function identityContractConnector(address) {
	return new web3.eth.Contract(JSON.parse(fs.readFileSync(path.join(__dirname, './id-abi.json'))).abi, address)
}

async function nameRegistryConnector(address) {
	return new web3.eth.Contract(JSON.parse(fs.readFileSync(path.join(__dirname, './NameRegistry.json'))).abi, address)
}

// handle multiple keys
async function loopKeys(contract, did) {
	const keysCount = await contract.methods.keysCount().call()
	let keys = []
	for (let i = keysCount.length - 1; i >= 0; i--) {
		const hash = await contract.methods.keyHashes(i).call()
		const gotKey = await contract.methods.getKeyByHash(hash).call()
		const key = {
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
	const servicesCount = await contract.methods.servicesCount().call()
	let services = []
	for (let i = servicesCount.length - 1; i >= 0; i--) {
		const serviceType = await contract.methods.services(i).call()
		const endpoint = await contract.methods.getServiceByType(serviceType).call()
		const service = {
				type: web3.utils.toAscii(serviceType).replace(/\0/g, ''),
				serviceEndpoint: endpoint
			}
		services.push(service)
	}
	return services
}

// build the DID Document
async function buildDocument(did, address) {
	let doc = {
		'@context': 'https://w3id.org/did/v1',
		id: did
	}
	if (await web3.eth.getCode(address) != "0x") {
		const contract = await identityContractConnector(address)
		const owner = await contract.methods.owner().call()
		const keys = await loopKeys(contract, did)
		const services = await loopServices(contract)
		if (keys.length > 0) doc.publicKey = keys
		if (services.length > 0) doc.service = services
	} else {
		doc.publicKey = [
			{
				id: `${did}#keys-1`,
				type: ['KoblitzVerificationKey2017'],
				owner: did,
				publicAddress: address
		}]
	}
	return doc
}

// resolve the DID and return the DID document
async function didResolver(did) {
	let address, name
	if (!did.match(/^did:key:0x[0-9a-fA-F]{40}$/)) {
		if (!did.match(/^did:key:\w{0,32}$/)) {
			return { error: 'Not a valid SelfKey DID' }
		} else {
			const nameRegistry = await nameRegistryConnector(nameRegistryAddress)
			name = did.match(/\w{0,32}$/)[0]
			address = await nameRegistry.methods.resolveName(web3.utils.asciiToHex(name)).call()
			if (Number(address) == 0) {
				return { error: 'Not a valid SelfKey DID' }
			}
		}
	} else {
		address = did.match(/0x[0-9a-fA-F]{40}/)[0]
	}
	return buildDocument(did, address)
}

// take the did from command line if there is one
if (process.argv[2]) {
	async function didConsole(did) {
		const resolved = await didResolver(process.argv[2])
		console.log(resolved)
	}
	didConsole(process.argv[2])
}

module.exports = didResolver
