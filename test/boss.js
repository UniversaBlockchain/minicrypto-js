const should = require('should');

const Boss = require('../lib/boss/protocol');
const utils = require('../lib/utils');

const vectors = [
  ['8', 7],
  ['\xb8F', 70],
  ['\xc8p\x11\x01', 70000],
  ['.\x00\x08\n8:', [0, 1, -1, 7, -7]],
  ['+Hello', 'Hello']
];

const { hexToBytes, byteStringToBin, bytesToHex, bytesToArray, arrayToBytes } = utils;

describe('BOSS Protocol', function() {
  var boss;

  beforeEach(function() {
    boss = new Boss();
  });

  it('should pack doubles', function() {
    var double = 3.75;

    var encoded = boss.dump(double);

    should(boss.load(encoded)).eql(3.75);
  });

  it('should cache equal byte arrays', function() {
    var d = utils.v2.decode64("f7YrNmKlscCxpIwNw7jIIKrDtN1fkhsdsc7RDsZEb20");
    var hash = { a: 1, b: d, c: d };

    var decoded = boss.load(boss.dump(hash));

    should(typeof decoded.c).eql('object');
  });

  it.skip('should pack date', function() {
    var d = new Date('2218 07 Mar 21:39');

    var encoded = boss.dump(d);
    console.log(d);
    console.log(boss.load(encoded));

    should(bytesToHex(arrayToBytes(encoded))).eql('79446b3e169d');
  });

  it('should read date', function() {
    var encoded = '79446b3e169d';
    var encoded1 = hexToBytes(encoded);
    var decoded = boss.load(encoded1);

    should(decoded.getTime()).eql(7831795140000);
  });

  it('should find difference', function() {
    var a1 = '1f1b6e657706437265766f6b696e671d43636f6e7472616374274b6170695f6c6576656c10335f5f7479706583556e697665727361436f6e747261637453646566696e6974696f6e2f53657870697265735f6174790a4f50508523646174611f5b6465736372697074696f6ebbb97468697320646f63756d656e74732063657274696669657320746865207269676874206f6620686f6c64657220286f776e65722920746f2061636365737320616c6c20726561646f6e6c7920556e6976657273612073657276696365732077697468696e2074686520706572696f64207374617274696e6720617420276163746976652073696e63652720616e6420656e64696e67206174207468652074696d65206f6620636f6e74726163742065787069726174696f6e2e636163746976655f73696e636579617e174c852374797065936163636573732063657274696669636174655b7065726d697373696f6e7317336873674d59321f23726f6c651f5b7461726765745f6e616d652b6f776e65724543526f6c654c696e6b236e616d656b406368616e67655f6f776e657245ab4368616e67654f776e65725065726d697373696f6ebd1d636368616e67655f6f776e657233505a696556371fbd181fbd1abd1b45bd1cbd1d3b407265766f6b6545835265766f6b655065726d697373696f6ebd1d337265766f6b6553637265617465645f6174790a20365085336973737565721f236b6579730e1fbd1d43556e6976657273611b6b65791745635253415075626c69634b6579337061636b6564c409011e081c010001c40001850a1c9044b930edc01f0f2e02de91bef3fc7d0c4a2c31ccf2d7ece7010b8017c0232f56a06cc8f499327e2d90a0eee363cbab4ee3ced5b715c0299fd4eb75c24a4157b3ed1fa7467131b21336c976e2281de402ca127f79f1836d05fd4c84b96b09e4492519f742cb66e8e3a1150522e7a9d8692e313e398d914c37940ecb7fcc6d70e50f7ac504c7e55dbb034b493e8c01e0c092ba88fda90d462f1a6155c46b63cbb77ee9091729dda54bdfcf98c03d2f39c015c43b9688da3a3d92229775ed1638f9c123b8632ad45d48686d3518ce37612c737bb2ae188ca031c8001eb15f1313222595812aeb485c474cb46981ee0d0bae85e80132542a766dac0921eb454b4b65795265636f7264455353696d706c65526f6c65bd1dbd282b737461746547bd1b1fbd1abd2845bd1cbd1dbd1b33706172656e74056d074b6272616e63685f696405336f726967696e05bd27790a2036508553637265617465645f62791fbd1abd2845bd1cbd1d3b63726561746f72437265766973696f6e08';
    var encoded1 = hexToBytes(a1);

    var decoded = boss.load(encoded1);
    var encoded2 = boss.dump(decoded);

    should(bytesToHex(arrayToBytes(encoded2))).eql(bytesToHex(arrayToBytes(encoded1)));
  });

  it('should encode false', function() {
    should(boss.load(boss.dump({a: false}))).eql({a: false});
  });

  it('should encode null', function() {
    should(boss.load(boss.dump({ a: null }))).eql({ a: null });
  });

  it('should encode utf8 strings', function() {
    should(boss.load(boss.dump('АБВГД'))).eql('АБВГД');
  });

  it('should cache similar objects', function() {
    const txt = { __type: 'text', value: "" };
    const obj = { binary: hexToBytes('aa'), text: txt };
    const unpacked = boss.load(boss.dump(obj));

    should(obj.text).eql(unpacked.text);
  });

  it('should perform compatible encode', function() {
    for (const [a, b] of vectors) should(arrayToBytes(boss.dump(b))).equal(a);
  });

  it('should perform compatible decode', function() {
    for (const [a, b] of vectors) should(boss.load(bytesToArray(a))).eql(b);
  });

  it('should properly encode positive and negative floats', function() {
    round(0);
    round(1.0);
    round(-1.0);
    round(2.0);
    round(-2.0);
    round(1.11);
    round(-1.11);
  });

  it('should properly encode rounded Dates', function() {
    var seconds = 1507766400;
    var d = new Date(seconds * 1000);
    should(boss.load(boss.dump(d))).eql(d);
  });

  it('should encode booleans', function() {
    round(true);
    round(false);
  });

  it('should properly encode null', function() {
    round(1);
    round(null);
    round([1]);
    round([null, null, null, 3, 4, 5, null]);
  });

  it('should encode Date', function() {
    const now = new Date();

    // Time is rounded to seconds on serialization, so we need
    // take care of the comparison
    should(boss.load(boss.dump(now)).getTime())
      .equal(parseInt(now.getTime() / 1000) * 1000);
  });

  it('should encode in stream mode', function() {
    const writer = new Boss.writer();

    writer.write(0);
    writer.write(1);
    writer.write(2);
    writer.write(3);

    const dump = writer.get();

    should(bytesToHex(dump)).eql('00081018');
  });

  it('should decode in stream mode', function() {
    const reader = new Boss.reader(hexToBytes('00081018'));

    const arg1 = reader.read();
    const arg2 = reader.read();
    const arg3 = reader.read();
    const arg4 = reader.read();
    const arg5 = reader.read();

    should(arg1).eql(0);
    should(arg2).eql(1);
    should(arg3).eql(2);
    should(arg4).eql(3);
    should(arg5).eql(undefined);
  });

  it('should cache data', function() {
    const a = [1, 2, 3, 4];
    const ca = { 1: 55 };
    const data = [a, a, ca, ca, 'oops', 'oops'];

    const t = boss.load(boss.dump(data));
    const [b, c, d, e, f, g] = t;

    should(a).eql(b);
    should(b).equal(c);

    should(ca).eql(d);
    should(ca).eql(e);
    should(d).equal(e);

    should(f).equal('oops');

    should(g).equal(f);
    should(Object.isFrozen(g)).equal(true);
  });

  it('should properly encode very big intergers', function() {
    const value = 1 << 1024 * 7 + 117;
    round(value);
  });

  it('should cache arrays and hashed', function() {
    const dictionary = { 'Hello': 'world' };
    const array = [112, 11];
    const data = [
      array,
      dictionary,
      array,
      dictionary
    ];

    const result = boss.loadAll(boss.dump(...data));

    should(data).eql(result);
    should(result[0]).eql(result[2]);
    should(result[1]).eql(result[3]);
  });

  it('should properly encode multilevel structures', function() {
    const main = { level: 1 };
    var p = main;

    for (let i = 0; i < 200; i++) {
      const x = { level: i + 2 };

      p.data = x;
      p.payload = 'great';
      p = x;
    }

    round(main);
  });

  it('has shortcuts', function() {
    const source = ['foo', 'bar', { 'hello': 'world' }];

    should(boss.unpack(boss.pack(source))).eql(source);
  });

  function round(value) {
    should(value).eql(boss.load(boss.dump(value)));
  }
});
