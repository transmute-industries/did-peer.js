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

 
export const key = {
  type: 'Ed25519VerificationKey2018',
  id: '#z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP',
  controller: 'did:key:z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP',
  publicKeyBase58: 'dbDmZLTWuEYYZNHFLKLoRkEX4sZykkSLNQLXvMUyMB1',
  privateKeyBase58:
    '47QbyJEDqmHTzsdg8xzqXD8gqKuLufYRrKWTmB7eAaWHG2EAsQ2GUyqRqWWYT15dGuag52Sf3j4hs2mu7w52mgps',
};

export const states = {
  0: require('./states/0.json'),
  1: require('./states/1.json'),
};

export const deltas = {
  0: require('./deltas/0.json'),
};
