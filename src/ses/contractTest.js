// Copyright (C) 2011 Google Inc.
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
 * @fileoverview Test simple contract code
 * @requires define
 */

define('contractTest', [
           'Q',
           'contract/makeContractHost',
           'contract/makeMint',
           'contract/escrowExchange',
           'contract/makeAlice',
           'contract/makeBob'],
function(Q,
         makeContractHost,
         makeMint,
         escrowExchange,
         makeAlice,
         makeBob) {
  "use strict";

  var contractHostP = Q(makeContractHost).fcall();

  function trivContract(whiteP, blackP) {
    return 8;
  }
  var contractSrc = '' + trivContract;

  var tokensP = Q(contractHostP).send('setup', contractSrc);

  var whiteTokenP = Q(tokensP).get(0);
  Q(contractHostP).send('play', whiteTokenP, contractSrc, 0, {});

  var blackTokenP = Q(tokensP).get(1);
  var eightP = Q(contractHostP).send('play', blackTokenP, contractSrc, 1, {});
  // check that eightP fulfills with 8.
  // (At the time of this writing, did the right thing under debugger)




  var moneyMintP = Q(makeMint).fcall();
  var aliceMoneyPurseP = Q(moneyMintP).fcall(1000);
  var bobMoneyPurseP = Q(moneyMintP).fcall(1001);

  var stockMintP = Q(makeMint).fcall();
  var aliceStockPurseP = Q(stockMintP).fcall(2002);
  var bobStockPurseP = Q(stockMintP).fcall(2003);

  var aliceP = Q(makeAlice).fcall(aliceMoneyPurseP, aliceStockPurseP,
                                  contractHostP);
  var bobP = Q(makeBob).fcall(bobMoneyPurseP, bobStockPurseP,
                              contractHostP);

  var ifItFitsP = Q(aliceP).send('payBobWell', bobP);
  // check that ifItFitsP fulfills correctly, and that
  // payBobBadly1 and payBobBadly2 reject correctly.
  // (At the time of this writing, did the right thing under debugger)


  return Q(bobP).send('tradeWell', aliceP);
//  return Q(aliceP).send('tradeWell', bobP);
});
