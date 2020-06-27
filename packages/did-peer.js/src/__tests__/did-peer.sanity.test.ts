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

import * as peer from '..';
import * as fixtures from '../__fixtures__';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import R from 'ramda';

it('generate', async () => {
  const results = await peer.generate(
    Buffer.from(
      '9b937b81322d816cfab9d5a3baacc9b2a5febe4b149f126b3630f93a29527017',
      'hex'
    )
  );
  expect(results.key.publicKeyBase58).toBe(
    'dbDmZLTWuEYYZNHFLKLoRkEX4sZykkSLNQLXvMUyMB1'
  );
  expect(results.didDoc).toEqual(fixtures.states[0]);
});

it('getSignedDelta', async () => {
  let key = await Ed25519KeyPair.from(fixtures.key);
  let second = R.clone(fixtures.states[0]);
  second.publicKey.push({
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
  const delta = await peer.getSignedDelta(
    fixtures.states[0],
    second,
    key,
    '2020-06-27T18:08:28.514Z'
  );
  expect(delta).toEqual(fixtures.deltas[0]);
});

it('applySignedDelta', async () => {
  const second = await peer.applySignedDelta(
    fixtures.states[0],
    fixtures.deltas[0]
  );
  expect(second).toEqual(fixtures.states[1]);
});

it('resolve', async () => {
  const didDoc = await peer.resolve(
    fixtures.states[0].id,
    Object.values(fixtures.deltas)
  );
  expect(didDoc).toEqual(fixtures.states[1]);
});
