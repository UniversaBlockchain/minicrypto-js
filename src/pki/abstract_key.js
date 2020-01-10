const Boss = require('../boss/protocol');

class AbstractKey {
  static typeOf(bin) {
    const boss = new Boss();
    const parts = boss.load(bin);
    const tpe = parts[0];

    if (tpe === AbstractKey.TYPE_PRIVATE) return AbstractKey.TYPE_PRIVATE;
    if (tpe === AbstractKey.TYPE_PUBLIC) return AbstractKey.TYPE_PUBLIC;
    if (tpe === AbstractKey.TYPE_PRIVATE_PASSWORD)
      return AbstractKey.TYPE_PRIVATE_PASSWORD;
    if (tpe === AbstractKey.TYPE_PRIVATE_PASSWORD_V2)
      return AbstractKey.TYPE_PRIVATE_PASSWORD_V2;

    throw new Error('Failed to read key');
  }
}

AbstractKey.FINGERPRINT_SHA256 = 7;
AbstractKey.FINGERPRINT_SHA384 = 8;

AbstractKey.TYPE_PRIVATE = 0;
AbstractKey.TYPE_PUBLIC = 1;
AbstractKey.TYPE_PRIVATE_PASSWORD = 2;
AbstractKey.TYPE_PRIVATE_PASSWORD_V2 = 3;

module.exports = AbstractKey;
