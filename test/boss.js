const should = require('should');

const Boss = require('../lib/boss/protocol');
const utils = require('../lib/utils');

Object.prototype.equals = function () {

};

const vectors = [
  ['8', 7],
  ['\xb8F', 70],
  ['\xc8p\x11\x01', 70000],
  ['.\x00\x08\n8:', [0, 1, -1, 7, -7]],
  ['+Hello', 'Hello']
];

const {
  hexToBytes,
  byteStringToHex,

  arrayToByteString,
  byteStringToArray,

  decode64
} = utils;

describe('BOSS Protocol', function() {
  var boss;

  beforeEach(function() {
    boss = new Boss();
  });

  it('should ignore functions', function() {
    var hash = { a: 1, b: 2, c: function() {} };

    var decoded = boss.load(boss.dump(hash));

    should(typeof decoded.c).eql('undefined');
  });

  it('should pack doubles', function() {
    var double = 3.75;

    var encoded = boss.dump(double);

    should(boss.load(encoded)).eql(3.75);
  });

  it('should cache equal byte arrays', function() {
    var d = decode64("f7YrNmKlscCxpIwNw7jIIKrDtN1fkhsdsc7RDsZEb20");
    var hash = { a: 1, b: d, c: d };

    var decoded = boss.load(boss.dump(hash));

    should(typeof decoded.c).eql('object');
  });

  it('should pack date', function() {
    var d = new Date('2218 07 Mar 21:39');

    var encoded = boss.dump(d);

    should(byteStringToHex(arrayToByteString(encoded))).eql('79446b3e169d');
  });

  it('should read date', function() {
    var encoded = '79446b3e169d';
    var encoded1 = hexToBytes(encoded);
    var decoded = boss.load(encoded1);

    should(decoded.getTime()).eql(7831795140000);
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
    for (const [a, b] of vectors) should(arrayToByteString(boss.dump(b))).equal(a);
  });

  it('should perform compatible decode', function() {
    for (const [a, b] of vectors) should(boss.load(byteStringToArray(a))).eql(b);
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

    should(byteStringToHex(dump)).eql('00081018');
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
