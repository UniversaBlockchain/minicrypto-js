const AES = require('./aes');
const utils = require('../utils');

exports.AES = require('./aes');

var AESCTRTransformer,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

AESCTRTransformer = (function() {
  function AESCTRTransformer(key, iv) {
    this.iv = iv;
    this._putAt = bind(this._putAt, this);
    this._prepareBlock = bind(this._prepareBlock, this);
    if (this.iv.length !== 16) {
      throw new EncryptionError("Bad IV length: " + this.iv.length);
    }
    this.counter = 0;
    this.blockSize = 16;
    this.cipher = new AES(key);
    this._prepareBlock();
  }

  AESCTRTransformer.prototype._prepareBlock = function() {
    this.index = 0;
    this.buffer = new Uint8Array(this.iv);

    this._putAt(-4, this.counter >> 24);
    this._putAt(-3, this.counter >> 16);
    this._putAt(-2, this.counter >> 8);
    this._putAt(-1, this.counter);
    this.buffer = this.cipher.encrypt(this.buffer);
    return this.counter++;
  };

  AESCTRTransformer.prototype._putAt = function(offset, value) {
    var i;
    i = this.blockSize + offset;
    return this.buffer[i] = (value & 0xFF) ^ this.buffer[i];
  };

  AESCTRTransformer.prototype.transformByte = function(source) {
    if (this.index >= this.blockSize) {
      this._prepareBlock();
    }
    return this.buffer[this.index++] ^ (source & 0xFF);
  };

  AESCTRTransformer.prototype.transform = function(array) {
    var newArr = []
    var i, j, ref;
    for (i = j = 0, ref = array.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      newArr[i] = this.transformByte(array[i]);
    }
    return new Uint8Array(newArr);
  };

  return AESCTRTransformer;

})();

exports.AESCTRTransformer = AESCTRTransformer;
