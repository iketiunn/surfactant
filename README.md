## 🧼 surfactant

Transforming soap describe into typescript interface.

If the result don't fit your needs, please fire an issue, thanks!

The detail return types was in https://github.com/vpulim/node-soap#clientmethodasyncargs---call-method-on-the-soap-service

Basic Usage:

```sh
$ npx surfactant ./calculator.wsdl > calculator.wsdl.ts
# or
$ npx surfactant 'http://www.dneonline.com/calculator.asmx?WSDL' > calculator.wsdl.ts

# if you need prettify
$ npx surfactant ./calculator.wsdl | npx prettier --parser typescript  > calculator.wsdl.ts

// In your client code
import * as soap from 'soap'
import { ClientAsync } from 'calculator.wsdl'
(async () => {
  const client = (await soap.createClientAsync('http://www.dneonline.com/calculator.asmx?WSDL')) as soap.client & ClientAsync;
  const [ret] = await client.AddAsync({ intA:1, intB:2 });
  console.log(ret) // { AddResult: 3 }
})()
```
