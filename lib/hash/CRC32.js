module.exports = (function() {
  var i, k, table, tmp;
  table = new Uint32Array(256);
  i = 256;
  while (i--) {
    tmp = i;
    k = 8;
    while (k--) {
      tmp = tmp & 1 ? 3988292384 ^ tmp >>> 1 : tmp >>> 1;
    }
    table[i] = tmp;
  }
  return function(data) {
    var crc, l;
    crc = -1;
    i = 0;
    l = data.length;
    while (i < l) {
      crc = crc >>> 8 ^ table[crc & 255 ^ data[i]];
      i++;
    }
    return (crc ^ -1) >>> 0;
  };
})();