(function () {
   const uiContent = document.getElementById('blockchain-peer-0');
   const peerList = []

   // LOAD GENESIS BLOCK
   window.addEventListener('load', () => {
      const peer = new PeerCtrl.Peer(0);
      peer.blockchain.addNewBlock();
      peerList.push(peer);
      UICtrl.addNewBlock(peer.blockchain.getLastBlock(), peer, 'large');
   });

   // UPDATE BLOCK HASH ON INPUT
   uiContent.addEventListener('input', (e) => {
      const uiHash = document.getElementById(`peer-0-hash-0`);
      const block = peerList[0].blockchain.chain[0];
      const uiAddBlockBtn = document.getElementById(`add-block-btn-0`);
      block.data = e.target.value;
      uiHash.innerHTML = block.calculateHash();
      if (!block.isValidBlock()) {
         uiContent.children[0].classList.add('invalid');
         uiContent.children[0].children[1].children[2].children[1].classList.remove('valid');
         uiContent.children[0].children[1].children[4].classList.remove('hidden');
      } else {
         uiContent.children[0].classList.remove('invalid');
         uiContent.children[0].children[1].children[2].children[1].classList.add('valid');
         uiContent.children[0].children[1].children[4].classList.add('hidden');
      }
   });

   // MINE BLOCK
   uiContent.addEventListener('click', (e) => {
      if (e.target.classList.value === 'btn-custom mine') {
         const peer = peerList[0]
         const block = peer.blockchain.chain[0];
         block.mineHash(true);
         UICtrl.updateBlock(block, peer);
         e.preventDefault();
      }
   })
})(PeerCtrl, UICtrl, BlockCtrl);