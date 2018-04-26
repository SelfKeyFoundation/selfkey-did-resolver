const 
	selfkeyResolver = require('selfkey-did-resolver')
	did = 'did:key:0x62dfbf9cee9c6eded64d7e0b1e72165f0d26a7c8'

async function runTest(did) {
	console.log('Begin DID Resolver Test...')
  	const doc = await selfkeyResolver(did)
  	console.log(JSON.stringify(doc, undefined, 2))
}

runTest(did)
