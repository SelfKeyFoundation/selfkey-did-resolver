# SelfKey DID Resolver

Library for resolving DIDs in SelfKey method space

## Install

```bash
npm i --save selfkey-did-resolver
```

## Usage

The following example script shows how we can integrate the did-resolver library:

```javascript
const 
	selfkeyResolver = require('selfkey-did-resolver')
	did = 'did:key:0x62dfbf9cee9c6eded64d7e0b1e72165f0d26a7c8'

runTest = async () => {
  const doc = await selfkeyResolver(did)
  console.log(JSON.stringify(doc, undefined, 2))
}

runTest()
```

Alternatively you can run the script via the command line by passing the DID string as an argument:

```bash
node index.js did:key:0x62dfbf9cee9c6eded64d7e0b1e72165f0d26a7c8
```

## Tests

```bash
npm run test
```