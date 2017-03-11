// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

var BertLoop = function() {
  var line, cmd, cmdkey, dispatch = {
    "ddoc"     : DDoc.ddoc,
    // "view"    : Views.handler,
    "reset"    : State.reset,
    "add_fun"  : State.addFun,
    "add_lib"  : State.addLib,
    "map_doc"  : Views.mapDoc,
    "reduce"   : Views.reduce,
    "rereduce" : Views.rereduce,
  };

  var decoder = new couch_chakra.Ernie.Decoder(new TextDecoder());
  
  try {
    while(true) {
      let packetSizeBuffer = read(4);
      if(packetSizeBuffer.length < 4) {
        print_e("error reading length header.");
        exit(0);
      }

      var view = new DataView(packetSizeBuffer);
      var length = view.getUint32(0);
    
      let packet = read(length);
      if(packet.length < length) {
        print_e("error reading packet.");
        exit(0);
      }

      var packetTyped = new Uint8Array(packet);

      let result = decoder.decode(packetTyped);
      tryDispatch(result, dispatch);
    }
  } catch(e) {
    print_e("exception: " + e);
    exit(0);
  }
};


this.print = function(a) {
  var encoder = new couch_chakra.Ernie.Encoder(new TextEncoder());

  if(a == "true") {
    a = true;
  }

  let encoded = encoder.encode(a);
  let length = new Uint8Array(4);
  let lView = new DataView(length.buffer);
  lView.setUint32(0, encoded.length);

  write(length);
  write(encoded);
}

this.respond = function(obj) {
  try {
    print(obj);
  } catch(e) {
    log("error on obj: "+ (obj.toSource ? obj.toSource() : obj.toString()));
  }
};

BertLoop();
