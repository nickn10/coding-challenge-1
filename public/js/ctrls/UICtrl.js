const UICtrl = (function () {
      const uiMainContent = document.getElementById('main-content');

      const addNewPeer = (peer) => {
            const newPeerContent = document.createElement('div');
            newPeerContent.classList = 'row mt-2'
            newPeerContent.id = `peer-content-${peer.index}`
            newPeerContent.innerHTML = `
            <div class="peer-display text-center" id="display-peer-${peer.index}">
               <i class="material-icons md-48 md-light mt-3">account_circle</i>
               <h3 class="peer-number">PEER#${peer.index}</h3>
               <div id="add-block-${peer.index}" class="card add-block mt-0">
                  <form>
                     <div class="form-group">
                        <span>DATA:</span>
                        <div class="data-input">
                           <textarea name="data" class="form-control" rows="5" id="new-block-peer-${peer.index}"></textarea>
                        </div>
                     </div>
                     <div class="text-center">
                        <button class="btn-custom add-block" id="add-block-btn-${peer.index}">Add Block</button>
                     </div>
                  </form>
               </div>
            </div>
            <div class="blockchain-display" id="blockchain-peer-${peer.index}"></div> 
      `
            uiMainContent.appendChild(newPeerContent);
      }

      const addNewBlock = (block, peer, size) => {
            const blockSize = size || 'small'
            const uiBlockchain = document.getElementById(`blockchain-peer-${peer.index}`);
            let newBlock = document.createElement('div');
            newBlock.classList = `card block ${blockSize}`
            newBlock.id = `peer-${peer.index}-block-${block.index}`
            newBlock.innerHTML =
                  `
               <div>
                  <span class="nonce-group pull-right">Nounce:
                     <span id="peer-${peer.index}-nonce-${block.index}" class="nonce-number">${block.nonce}</span>
                  </span>
                  <h3 class="block-title">${block.title}</h3>
                  <span class="date">${moment(block.timestamp).format('ddd MMM DD, YYYY h:mm a')}</span>
               </div>
               <form>
                  <div class="form-group">
                     <span>DATA:</span>
                     <div class="data-input">
                        <textarea name="data" class="form-control block-data" id="peer-${peer.index}-data-${block.index}">${block.data}</textarea>
                     </div>
                  </div>
                  <div>
                     <span>PREVIOUS HASH: </span><span class="previous-hash valid" id="peer-${peer.index}-prev-hash-${block.index}">${block.previousHash}</span>
                  </div>
                  <div>
                     <span>HASH: </span><span class="current-hash valid" id="peer-${peer.index}-hash-${block.index}">${block.hash}</span>
                  </div>
                  <br>
                  <div class="form-group hidden">
                     <button id="peer-${peer.index}-mine-btn-${block.index}" class="btn-custom mine">Mine</button>
                  </div>
               </form>
            `;
            uiBlockchain.appendChild(newBlock);
      }

      const updateBlock = (block, peer) => {
            const uiBlock = document.getElementById(`peer-${peer.index}-block-${block.index}`)
            uiBlock.classList.remove('invalid');
            uiBlock.innerHTML =
                  `
               <div>
                  <h3 class="block-title">${block.title}</h3>
                  <span class="date">${moment(block.timestamp).format('ddd MMM DD, YYYY h:mm a')}</span>
                  <span class="nonce-group pull-right">Nounce: 
                     <span id="peer-${peer.index}-nonce-${block.index}" class="nonce-number">${block.nonce}</span>
                  </span>
               </div>
               <form>
                  <div class="form-group">
                     <span>DATA:</span>
                     <div class="data-input">
                        <textarea name="data" class="form-control block-data" id="peer-${peer.index}-data-${block.index}">${block.data}</textarea>
                     </div>
                  </div>
                  <div>
                     <span>PREVIOUS HASH </span><span class="previous-hash valid" id="peer-${peer.index}-prev-hash-${block.index}">${block.previousHash}</span>
                  </div>
                  <div>
                     <span>HASH </span><span class="current-hash valid" id="peer-${peer.index}-hash-${block.index}">${block.hash}</span>
                  </div>
                  <br>
                  <div class="form-group hidden">
                     <button id="peer-${peer.index}-mine-btn-${block.index}" class="btn-custom mine">Mine</button>
                  </div>
               </form>
            `;
            if (peer.blockchain.isValidChain()) {
                  document.getElementById(`add-block-btn-${peer.index}`).disabled = false;
                  document.getElementById(`add-block-btn-${peer.index}`).classList.remove('btn-disabled');
            }
      }

      const invalidBlock = (peer, blockIndex) => {
            const uiBlock = document.getElementById(`peer-${peer.index}-block-${blockIndex}`);
            const uiHash = document.getElementById(`peer-${peer.index}-hash-${blockIndex}`);
            const uiAddBlockBtn = document.getElementById(`add-block-btn-${peer.index}`);
            let nextBlock = peer.blockchain.chain[blockIndex + 1];
            // Mark Block Invalid
            uiBlock.classList.add('invalid');
            // Mark Current Hash Invalid and Display
            uiBlock.children[1].children[2].children[1].classList.remove('valid')
            uiHash.innerHTML = peer.blockchain.chain[blockIndex].hash;
            // Show Mine Button
            uiBlock.children[1].children[4].classList.remove('hidden');
            // If next block
            if (nextBlock) {
                  const uiNextPrevHash = document.getElementById(`peer-${peer.index}-prev-hash-${blockIndex + 1}`);
                  const uiNextHash = document.getElementById(`peer-${peer.index}-hash-${blockIndex + 1}`);
                  //    Change next block's previous hash
                  nextBlock.previousHash = peer.blockchain.chain[blockIndex].calculateHash();
                  uiNextPrevHash.innerHTML = nextBlock.previousHash;
                  uiNextPrevHash.classList.remove('valid');
                  // Change next block's current hash
                  nextBlock.hash = nextBlock.calculateHash();
                  uiNextHash.innerHTML = nextBlock.hash;
                  uiNextPrevHash.classList.remove('valid');
            }
            if (!uiAddBlockBtn.disabled) {
                  uiAddBlockBtn.disabled = true;
                  uiAddBlockBtn.classList.add('btn-disabled');
            }
      }

      const validBlock = (peer, blockIndex) => {
            const uiBlock = document.getElementById(`peer-${peer.index}-block-${blockIndex}`);
            const uiHash = document.getElementById(`peer-${peer.index}-hash-${blockIndex}`);
            const uiAddBlockBtn = document.getElementById(`add-block-btn-${peer.index}`);
            let nextBlock = peer.blockchain.chain[blockIndex + 1];
            // Mark Block Invalid
            uiBlock.classList.remove('invalid');
            // Mark Current Hash Invalid and Display
            uiBlock.children[1].children[2].children[1].classList.add('valid')
            uiHash.innerHTML = peer.blockchain.chain[blockIndex].hash;
            // Show Mine Button
            uiBlock.children[1].children[4].classList.add('hidden');
            // If next block
            if (nextBlock) {
                  const uiNextPrevHash = document.getElementById(`peer-${peer.index}-prev-hash-${blockIndex + 1}`);
                  const uiNextHash = document.getElementById(`peer-${peer.index}-hash-${blockIndex + 1}`);
                  //    Change next block's previous hash
                  nextBlock.previousHash = peer.blockchain.chain[blockIndex].calculateHash();
                  uiNextPrevHash.innerHTML = nextBlock.previousHash;
                  uiNextPrevHash.classList.add('valid');
                  // Change next block's current hash
                  nextBlock.hash = nextBlock.calculateHash();
                  uiNextHash.innerHTML = nextBlock.hash;
                  if (nextBlock.isValidBlock()) {
                        uiNextPrevHash.classList.add('valid');
                  }
            }
            uiAddBlockBtn.disabled = false;
            uiAddBlockBtn.classList.remove('btn-disabled');
      }

      const invalidChain = (peer) => {
            const latestBlock = peer.blockchain.chain[peer.blockchain.getLastBlock().index];
            const prevBlock = peer.blockchain.chain[latestBlock.index - 1];
            // Update previous hash
            latestBlock.previousHash = prevBlock.hash
            latestBlock.hash = latestBlock.calculateHash();
            document.getElementById(`peer-${peer.index}-prev-hash-${latestBlock.index}`).innerHTML = latestBlock.previousHash;
            invalidBlock(peer, latestBlock.index);
      }

      return { addNewPeer, addNewBlock, updateBlock, invalidBlock, validBlock, invalidChain };
})(BlockCtrl);