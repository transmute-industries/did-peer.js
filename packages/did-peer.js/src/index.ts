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

import { Ed25519KeyPair, EdDSA, driver } from '@transmute/did-key-ed25519';
import moment from 'moment';
import { compare, applyPatch } from 'fast-json-patch';

const base64url = require('base64url');
const canonicalize = require('canonicalize');
const R = require('ramda');

const didKeyDocToDidPeerDoc = (didKeyDoc: any) => {
  const didKeyDocString = JSON.stringify(didKeyDoc);
  const didPeerDocString = didKeyDocString.replace(/did:key:/g, 'did:peer:0');
  const didPeerDoc = JSON.parse(didPeerDocString);
  return didPeerDoc;
};

export const generate = async (seed: Buffer) => {
  let key = await Ed25519KeyPair.generate({
    seed,
  });
  const didKeyDoc = driver.keyToDidDoc(key);
  const didPeerDoc = didKeyDocToDidPeerDoc(didKeyDoc);
  return { key, didDoc: didPeerDoc };
};

export const getSignedDelta = async (
  firstDidDoc: any,
  secondDidDoc: any,
  key: Ed25519KeyPair,
  when: string = moment().toISOString()
) => {
  const patches = compare(firstDidDoc, secondDidDoc);
  const delta = {
    change: base64url.encode(canonicalize(patches)),
    when,
  };
  const _jwk = await key.toJwk(true);
  const jws = await EdDSA.signDetached(Buffer.from(canonicalize(delta)), _jwk, {
    kid: key.controller + key.id,
    alg: 'EdDSA',
    b64: false,
    crit: ['b64'],
  });
  const deltaWithDetachedSignatures = {
    ...delta,
    by: [{ key: key.id, sig: jws }],
  };
  return deltaWithDetachedSignatures;
};

export const applySignedDelta = async (state: any, delta: any) => {
  let { key, sig } = delta.by[0];
  if (state.authentication.indexOf(key) === -1) {
    throw new Error(key + ' not in authentication relationship');
  }
  key = state.publicKey.find((vm: any) => {
    return vm.id === key;
  });
  const _jwk = await (await Ed25519KeyPair.from(key)).toJwk();
  let payload = R.clone(delta);
  delete payload.by;
  payload = Buffer.from(canonicalize(payload));
  const detachedJws = sig;
  const verified = EdDSA.verifyDetached(detachedJws, payload, _jwk);
  if (!verified) {
    throw new Error('delta verification failed.');
  }
  let newState = state;
  try {
    const patch = JSON.parse(base64url.decode(delta.change));
    newState = applyPatch(newState, patch).newDocument;
    // other checks for size of did document
    // conformance to json schema
    // etc....
  } catch (e) {
    throw new Error('invalid delta change: ' + e);
  }
  return newState;
};

export const resolve = async (did: string, deltas: any[] = []) => {
  const didKey = did.replace(/did:peer:0/g, 'did:key:');
  const didKeyDoc = await driver.get({ did: didKey });
  let didPeerDoc = didKeyDocToDidPeerDoc(didKeyDoc);
  for (const delta of deltas) {
    didPeerDoc = await applySignedDelta(didPeerDoc, delta);
  }
  return didPeerDoc;
};
