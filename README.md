# did-resolver
Library for resolving DIDs in SelfKey method space

## Usage

The following script can be used for testing the did-resolver library:

```javascript
const selfkeyResolver = require('selfkey-did-resolver')
const didString = 'did:key:0x62dfbf9cee9c6eded64d7e0b1e72165f0d26a7c8'

runTest = async () => {
  const doc = await selfkeyResolver.resolveDID(didString)
  console.log(JSON.stringify(doc, undefined, 2))
}

runTest()
```
