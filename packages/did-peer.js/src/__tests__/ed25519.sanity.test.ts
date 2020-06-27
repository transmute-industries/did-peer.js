/*
 * Copyright 2020 - Transmute Industries Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Ed25519KeyPair, EdDSA } from '@transmute/did-key-ed25519';

let key: Ed25519KeyPair;

it('generate', async () => {
  key = await Ed25519KeyPair.generate({
    seed: Buffer.from(
      '9b937b81322d816cfab9d5a3baacc9b2a5febe4b149f126b3630f93a29527017',
      'hex'
    ),
  });
  expect(key.publicKeyBase58).toBe(
    'dbDmZLTWuEYYZNHFLKLoRkEX4sZykkSLNQLXvMUyMB1'
  );
});

it('sign and verify', async () => {
  let _jwk = await key.toJwk(true);
  const payload = { hello: 'world' };
  const jws = await EdDSA.sign(payload, _jwk, {
    kid: key.controller + key.id,
    alg: 'EdDSA',
  });
  _jwk = await key.toJwk();
  let verified = await EdDSA.verify(jws, _jwk);
  expect(verified).toEqual({ hello: 'world' });
});
