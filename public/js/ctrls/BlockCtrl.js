const BlockCtrl = (function() {
  const SHA256 = CryptoJS.SHA256;

  const Block = function(index, data, previousHash, timestamp, nonce) {
      this.index = index;
      this.timestamp = timestamp || Date.now();
      this.data = data;
      this.previousHash = previousHash;
      this.hash = ''
      this.nonce = nonce || this.mineHash();
      this.title = index === 0 ? 'GENESIS BLOCK' : 'BLOCK #' + index; 
   }

  Block.prototype = {
      calculateHash: function() {
        const nonce = this.nonce || 0
        return SHA256(this.index + this.previousHash + this.timestamp + this.data + nonce).toString();
      },

      mineHash: function(altered) {
        let nonce = 0;
        if(altered) {
        this.timestamp = Date.now();
        this.altered = true;
        }
        while (true) {
          const tempHash = SHA256(this.index + this.previousHash + this.timestamp + this.data + nonce).toString()
          if(tempHash.substring(0,3) === "000") {
            this.hash = tempHash;
              this.nonce = nonce;
              return nonce;
          }
          nonce++
        }
      },
      
      isValidBlock: function() {
        if(this.hash === this.calculateHash() && this.hash.substring(0,3) === "000") {
          return true;
        }
        return false;
      },
  }

  const Blockchain = function() {
      this.chain=[];
   }

  Blockchain.prototype = {
      createGenesisBlock: () =>  {
        const genesis = new Block(0, "Important data is stored here", '0', new Date('01/03/2009 18:15:05').getTime());
        genesis.hash = genesis.calculateHash();
        genesis.mineHash()
        return genesis;
      },
      
      getLastBlock: 
         function() {
            return this.chain[this.chain.length - 1]
         },

      addNewBlock: 
         function(data, timestamp) {
            let newBlock;
            const timeStamp = timestamp || Date.now();
            if(typeof data === 'undefined') {
              newBlock =  this.createGenesisBlock();
            } else {
              newBlock = new Block(this.chain.length, data, this.getLastBlock().hash, timeStamp);
            }
            this.chain.push(newBlock);
            return newBlock;
         },
      
      isValidChain: 
         function(index) {
            const indexValue = index || 1
            for(let i=indexValue; i<this.chain.length; i++) {
               const currentBlock = this.chain[i];
               const previousBlock = this.chain[i - 1];
               if(!currentBlock.isValidBlock() ||
                  currentBlock.previousHash !== previousBlock.calculateHash()) {
                  return false;
               }
            }
            return true;
         },

      createBlockCopy: function(data, timestamp) {
        return new Block(this.chain.length, data, this.getLastBlock().hash, timestamp);
      }
   }

  function formatDate(date) {
    const index = date.toString().indexOf('-');
    return date.toString().substring(0,index);
  }

   return { Block, Blockchain }
})()