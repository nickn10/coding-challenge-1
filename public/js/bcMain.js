(function () {
   const uiMainContent = document.getElementById('main-content');
   const uiAddBlockForm = document.getElementById('add-block-form');
   const uiAddPeerBtn = document.getElementById('add-peer-btn');
   const uiDistroBtns = document.getElementById('distro-btns');
   const peerList = [];
   let simulator;

   // LOAD GENESIS BLOCK
   window.addEventListener('load', () => {
      const peer = new PeerCtrl.Peer(0);
      peer.blockchain.addNewBlock();
      peerList.push(peer);
      UICtrl.addNewPeer(peer);
      UICtrl.addNewBlock(peer.blockchain.getLastBlock(), peer);
   });

   // ADD NEW BLOCK & MINE BLOCK
   uiMainContent.addEventListener('submit', (e) => {
      e.preventDefault();
      // ADD BLOCK
      if (e.target.children[1].children[0].classList.value === 'btn-custom add-block') {
         const peerIndex = getPeerIndex(e.target.parentElement);
         const peer = peerList[peerIndex];
         const peerChainLength = peer.blockchain.chain.length;
         const uiData = document.getElementById(`new-block-peer-${peer.index}`).value;
         const timestamp = Date.now();
         if (!peer.blockchain.isAlterd) {
            peerList.forEach(peer => {
               if (peer.blockchain.chain.length > peerChainLength) {
                  return;
               }
               if (peer.index !== peerIndex) {
                  peer.blockchain.chain.push(peerList[peerIndex].blockchain.createBlockCopy(uiData, timestamp));
                  const newBlock = peer.blockchain.getLastBlock();
                  const prevLastBlock = peer.blockchain.chain[newBlock.index - 1];
                  const uiCurrentLastBlock = document.getElementById(`peer-${peer.index}-block-${prevLastBlock.index}`);
                  UICtrl.addNewBlock(newBlock, peer);
                  if (newBlock.previousHash !== prevLastBlock.hash || uiCurrentLastBlock.classList.value.indexOf('invalid') !== -1) {
                     UICtrl.invalidChain(peer);
                  }
               }
            });
         }
         const newBlock = peer.blockchain.addNewBlock(uiData, timestamp);
         UICtrl.addNewBlock(newBlock, peer);
         uiData.value = '';
         scrollToEnd();
      } else if (e.target.children[4].children[0].classList.value === 'btn-custom mine') {
         // MINE BLOCK
         const blockIndex = getBlockIndex(e.target.parentElement);
         const peerIndex = getPeerIndex(e.target.parentElement);
         const peer = peerList[peerIndex];
         const uiBlocks = document.querySelectorAll(`#blockchain-peer-${peerIndex} .block`);
         const block = peerList[peerIndex].blockchain.chain[blockIndex];
         let nextBlock = Boolean(blockIndex < uiBlocks.length - 1)
         let uiNextPrevHash;
         block.mineHash(true);
         peer.blockchain.isAlterd = true;
         if (nextBlock) {
            nextBlock = peer.blockchain.chain[blockIndex + 1]
            uiNextPrevHash = document.getElementById(`peer-${peerIndex}-prev-hash-${blockIndex + 1}`)
            uiNextHash = document.getElementById(`peer-${peerIndex}-hash-${blockIndex + 1}`);
            nextBlock.previousHash = block.calculateHash();
            nextBlock.hash = nextBlock.calculateHash();
            uiNextHash.innerHTML = nextBlock.hash;
            uiNextHash.classList.remove('valid');
            uiNextPrevHash.innerHTML = nextBlock.previousHash;
            uiNextPrevHash.classList.add('valid');
         }
         UICtrl.updateBlock(peer.blockchain.chain[blockIndex], peer);
      }

   });

   // Add Peer
   if (uiAddPeerBtn) {
      uiAddPeerBtn.addEventListener('click', () => {
         const newPeer = new PeerCtrl.Peer(peerList.length);
         let longestValidChain = [];
         newPeer.blockchain.addNewBlock();
         if (peerList.length > 0) {
            peerList.forEach(peer => {
               if (peer.blockchain.isValidChain() && peer.blockchain.chain.length > longestValidChain.length) {

                  longestValidChain = peer.blockchain.chain;
               }
            });
            if (longestValidChain) {
               for (let i = 1; i < longestValidChain.length; i++) {
                  newPeer.blockchain.chain.push(longestValidChain[i])
                  console.log('longest chain')
               }
            }
         }
         peerList.push(newPeer);
         UICtrl.addNewPeer(newPeer);
         newPeer.blockchain.chain.forEach(block => UICtrl.addNewBlock(block, newPeer));
         scrollToEnd();
         scrollToBottom();
      });
   }

   // UPDATE HASH ON DATA CHANGE
   uiMainContent.addEventListener('input', (e) => {
      if (e.target.classList.value === 'form-control block-data') {
         const blockIndex = getBlockIndex(e.target);
         const peerIndex = getPeerIndex(e.target);
         const peer = peerList[peerIndex];
         const block = peer.blockchain.chain[blockIndex];
         block.data = e.target.value;;
         block.hash = block.calculateHash();
         if (!block.isValidBlock()) {
            const uiBlocks = document.querySelectorAll(`#blockchain-peer-${peer.index} .block`);
            for (let i = blockIndex; i < uiBlocks.length; i++) {
               UICtrl.invalidBlock(peer, i);
            }
         } else {
            const uiBlocks = document.querySelectorAll(`#blockchain-peer-${peer.index} .block`);
            for (let i = blockIndex; i < uiBlocks.length; i++) {
               UICtrl.validBlock(peer, i);
            }
         }
      }
   });

   // SIMULATOR
   if (uiDistroBtns) {
      uiDistroBtns.addEventListener('click', (e) => {
         const uiStartBtn = document.getElementById('simulation-start');
         const uiStopBtn = document.getElementById('simulation-stop');
         const uiResetBtn = document.getElementById('simulation-reset');
         // START SIMULATION
         if (e.target.id === 'simulation-start') {
            uiStartBtn.classList.toggle('hidden');
            uiStopBtn.classList.toggle('hidden');
            if (peerList.length < 2) {
               const peer = new PeerCtrl.Peer(1);
               peer.blockchain.addNewBlock();
               peerList.push(peer);
               UICtrl.addNewPeer(peer);
               UICtrl.addNewBlock(peer.blockchain.getLastBlock(), peer);
            }
            simulator = setInterval(() => {
               // Find peer with unaltered chain
               let uiPeerAddBlockBtn;

               for (let i = 0; i < peerList.length; i++) {
                  if (!document.getElementById(`add-block-btn-${i}`).disabled) {
                     uiPeerAddBlockBtn = document.getElementById(`add-block-btn-${i}`)
                     break
                  }
               }
               uiPeerAddBlockBtn.click();
            }, 1200);
         } else if (e.target.id === 'simulation-stop') {
            uiStopBtn.classList.toggle('hidden');
            uiResetBtn.classList.toggle('hidden');
            // STOP SIMULATION
            clearInterval(simulator);
         } else if (e.target.id === 'simulation-reset') {
            // RESET SIMULATION
            window.location.reload();
         }
      })
   };

   function scrollToEnd() {
      peerList.forEach(peer => {
         const uiAddBlockBtn = document.getElementById(`add-block-btn-${peer.index}`);
         if (peer.blockchain.chain.length > 2 && uiAddBlockBtn.classList.value.indexOf('btn-disabled') === -1) {
            const uiBlockchain = document.getElementById(`blockchain-peer-${peer.index}`)
            const newBlock = uiBlockchain.lastElementChild;
            let prevBlock = newBlock.previousElementSibling;

            const clientWidth = uiBlockchain.clientWidth;
            const scrollLeft = uiBlockchain.scrollLeft;
            const scrollWidth = uiBlockchain.scrollWidth;

            const newBlockStyle = window.getComputedStyle(newBlock, null);
            const newBlockWidth = parseInt(newBlockStyle.getPropertyValue("width"));
            let prevBlockWidth = 0;

            if (prevBlock) {
               const prevBlockStyle = window.getComputedStyle(prevBlock, null);
               prevBlockWidth = parseInt(prevBlockStyle.getPropertyValue("width"));
            }

            if ((clientWidth + scrollLeft + newBlockWidth + prevBlockWidth) >= scrollWidth) {
               uiBlockchain.scrollLeft = scrollWidth;
            }
         }
      });
   }

   function scrollToBottom() {
      window.scrollTo(0, document.body.scrollHeight);
   }

   function getBlockIndex(element) {
      return Number(element.id.substring(element.id.lastIndexOf('-') + 1));
   }
   function getPeerIndex(element) {
      return Number(/\d+/.exec(element.id));
   }
})(PeerCtrl, UICtrl, BlockCtrl);