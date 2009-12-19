// Copyright (C) 2009 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * See <a href=
 * "http://wiki.ecmascript.org/doku.php?do=show&id=strawman:proxiesv2#an_identity-preserving_membrane">Membrane example on the wiki</a>.
 * 
 * Written in proposed ES-Harmony + strawmen
 * <ul>
 * <li>catchalls / proxies
 * <li>const functions
 * <li>EphemeronTables
 * </ul>
 */
const makeMembrane(wetTarget) {
  let wet2dry = EphemeronTable(true);
  let dry2wet = EphemeronTable(true);
  
  function asDry(wet) {
    if (wet !== Object(wet)) {
      // primitives provide only irrevocable knowledge, so don't
      // bother wrapping it.
      return wet;
    }
    const dryResult = wet2dry.get(wet);
    if (dryResult) { return dryResult; }
    
    const wetHandler = handlerMaker(wet);
    const dryRevokeHandler = Proxy.create(Object.freeze({
      invoke: const(rcvr, name, dryArgs) {
        const optWetHandler = dry2wet.get(dryRevokeHandler);
        return asDry(optWetHandler[name](...dryArgs.map(asWet)));
      }
    }));
    dry2wet.set(dryRevokeHandler, wetHandler);
          
    if (typeof wet === "function") {
      const aTrap(drySelf, dryArgs) {
        return asDry(wet.apply(asWet(drySelf), dryArgs.map(asWet)));
      }
      const cTrap(dryArgs) {
        return asDry(new wet(...dryArgs.map(asWet)));
      }
      dryResult = Proxy.createFunction(dryRevokeHandler, aTrap, cTrap);
    } else {
      dryResult = Proxy.create(dryRevokeHandler, 
                               asDry(Object.getPrototype(wet)));
    }
    wet2dry.set(wet, dryResult);
    dry2wet.set(dryResult, wet);
    return dryResult;
  }
  
  const asWet(dry) {
    if (dry !== Object(dry)) {
      // primitives provide only irrevocable knowledge, so don't
      // bother wrapping it.
      return dry;
    }
    const wetResult = dry2wet.get(dry);
    if (wetResult) { return wetResult; }
    
    const dryHandler = handlerMaker(dry);
    const wetRevokeHandler = Proxy.create(Object.freeze({
      invoke: const(rcvr, name, wetArgs) {
        const optDryHandler = wet2dry.get(wetRevokeHandler);
        return asWet(optDryHandler[name](...wetArgs.map(asDry)));
      }
    }));
    wet2dry.set(wetRevokeHandler, dryHandler);
          
    if (typeof dry === "function") {
      const aTrap(wetSelf, wetArgs) {
        return asWet(dry.apply(asDry(wetSelf), wetArgs.map(asDry)));
      }
      const cTrap(wetArgs) {
        return asWet(new dry(...wetArgs.map(asDry)));
      }
      wetResult = Proxy.createFunction(wetRevokeHandler, aTrap, cTrap);
    } else {
      wetResult = Proxy.create(wetRevokeHandler, 
                               asWet(Object.getPrototype(dry)));
    }
    dry2wet.set(dry, wetResult);
    wet2dry.set(wetResult, dry);
    return wetResult;
  }
  
  const gate = Object.freeze({
    revoke: const() {
      dry2wet = wet2dry = Object.freeze{
        get: const(key) { throw new Error("revoked"); },
        set: const(key, val) {}
      };
    }
  });
  
  return Object.freeze({ wrapper: asDry(wetTarget), gate: gate });
}
