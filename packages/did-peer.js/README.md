# @transmute/did-peer.js

## What is `did:peer`?

[Latest DID Peer Method Spec](https://dhh1128.github.io/peer-did-method-spec/index.html)

DID Peer is a patch based authenticated CRDT, designed to support privacy preserving communication between parties based on the [DID Core Spec](https://www.w3.org/TR/did-core/)

## How is this implementation different?

- Absolutely no reliance on [DIDComm](https://github.com/decentralized-identity/didcomm-messaging) or [SGL](https://github.com/evernym/sgl).
- Only dependencies are `did:key`, `jose`, `base64url`, and `ietf-json-patch`.
- We provide test vectors for ensuring conformance.
- We don't support `authorization` because it requires the use of `sgl` and its not described in [DID Core Spec](https://www.w3.org/TR/did-core/), or [DID Spec Registries](https://www.w3.org/TR/did-spec-registries/).

## Why do these differences matter?

We believe in seperation of concerns, and think that the conflation of `did:peer`, `didcomm` and `sgl` has prevented `did:peer` from being described accuratly, tested in isolation, or widely adopted outside of the Hyperledger Aries ecosystem.

## Where can I see other implementations / interoperability tests?

As far as we know, did peer has never been tested in isolation from `didcomm`.

## Usage

### Create

```ts
import * as peer from '@transmute/did-peer.js';
const { key, didDoc } = await peer.generate(
  Buffer.from(
    '9b937b81322d816cfab9d5a3baacc9b2a5febe4b149f126b3630f93a29527017',
    'hex'
  )
);
```

### Resolve

```ts
const didDoc = await peer.resolve(
  'did:peer:0z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP'
);
```

Yields:

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    {
      "@base": "did:peer:0z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP"
    }
  ],
  "id": "did:peer:0z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP",
  "publicKey": [
    {
      "id": "#z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:peer:0z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP",
      "publicKeyBase58": "dbDmZLTWuEYYZNHFLKLoRkEX4sZykkSLNQLXvMUyMB1"
    }
  ],
  "authentication": ["#z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP"],
  "assertionMethod": ["#z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP"],
  "capabilityDelegation": ["#z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP"],
  "capabilityInvocation": ["#z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP"],
  "keyAgreement": [
    {
      "id": "#z6LScqmY9kirLuY22G6CuqBjuMpoqtgWk7bahWjuxFw5xH6G",
      "type": "X25519KeyAgreementKey2019",
      "controller": "did:peer:0z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP",
      "publicKeyBase58": "2AbNdSuzFSpGvsiSPBfnamcKzk9Q3WRRpY2EToHZEuKW"
    }
  ]
}
```

### Update

```ts
const oldDoc = {
  /*example above*/
};
const newDoc = Object.clone(oldDoc).publicKey.push({
  id: '#4SZ-StXrp5Yd4_4rxHVTCYTHyt4zyPfN1fIuYsm6k3A',
  type: 'JsonWebKey2020',
  controller: second.id,
  publicKeyJwk: {
    kid: '4SZ-StXrp5Yd4_4rxHVTCYTHyt4zyPfN1fIuYsm6k3A',
    kty: 'EC',
    crv: 'secp256k1',
    x: 'Z4Y3NNOxv0J6tCgqOBFnHnaZhJF6LdulT7z8A-2D5_8',
    y: 'i5a2NtJoUKXkLm6q8nOEu9WOkso1Ag6FTUT6k_LMnGk',
  },
});

// throw the magic of ietf-json-patch update deltas can be inferred and signed!
const delta = await peer.getSignedDelta(
  oldDoc,
  newDoc,
  key,
  '2020-06-27T18:08:28.514Z'
);

// did peer resolve takes a did AND some deltas
const didDoc = await peer.resolve(
  'did:peer:0z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP',
  [delta]
);
```

Yields:

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    {
      "@base": "did:peer:0z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP"
    }
  ],
  "id": "did:peer:0z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP",
  "publicKey": [
    {
      "id": "#z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:peer:0z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP",
      "publicKeyBase58": "dbDmZLTWuEYYZNHFLKLoRkEX4sZykkSLNQLXvMUyMB1"
    },
    {
      "id": "#4SZ-StXrp5Yd4_4rxHVTCYTHyt4zyPfN1fIuYsm6k3A",
      "type": "JsonWebKey2020",
      "controller": "did:peer:0z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP",
      "publicKeyJwk": {
        "crv": "secp256k1",
        "kid": "4SZ-StXrp5Yd4_4rxHVTCYTHyt4zyPfN1fIuYsm6k3A",
        "kty": "EC",
        "x": "Z4Y3NNOxv0J6tCgqOBFnHnaZhJF6LdulT7z8A-2D5_8",
        "y": "i5a2NtJoUKXkLm6q8nOEu9WOkso1Ag6FTUT6k_LMnGk"
      }
    }
  ],
  "authentication": ["#z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP"],
  "assertionMethod": ["#z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP"],
  "capabilityDelegation": ["#z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP"],
  "capabilityInvocation": ["#z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP"],
  "keyAgreement": [
    {
      "id": "#z6LScqmY9kirLuY22G6CuqBjuMpoqtgWk7bahWjuxFw5xH6G",
      "type": "X25519KeyAgreementKey2019",
      "controller": "did:peer:0z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP",
      "publicKeyBase58": "2AbNdSuzFSpGvsiSPBfnamcKzk9Q3WRRpY2EToHZEuKW"
    }
  ]
}
```

### Deactivate

Per the did:peer spec.

This implementations chooses not to [announce deactivations](https://dhh1128.github.io/peer-did-method-spec/index.html#deactivate).


### License

```
Copyright 2020 Transmute Industries Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```