const PeerCtrl = (function () {
      const Peer = function (index) {
            this.blockchain = new BlockCtrl.Blockchain();
            this.index = index
      }

      const PeersList = function () {
            this.peers = []
      }

      PeersList.prototype = {
            addPeer:
                  function (peer) {
                        this.peers.push(peer);
                  },
            getPeers:
                  function () {
                        return this.peers
                  }
      }
      return { Peer, PeersList }
})(BlockCtrl);