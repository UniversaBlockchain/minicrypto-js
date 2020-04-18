var Universa = Universa || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

describe('BOSS Protocol', function() {
  var boss;

  const { Boss } = Universa;

  const vectors = [
    ['8', 7],
    ['\xb8F', 70],
    ['\xc8p\x11\x01', 70000],
    ['.\x00\x08\n8:', [0, 1, -1, 7, -7]],
    ['+Hello', 'Hello']
  ];

  const {
    hexToBytes,
    bytesToHex: hex,
    arrayToByteString,
    byteStringToArray,
    decode64
  } = Universa;

  beforeEach(function() {
    boss = new Boss();
  });

  it('should ignore functions', function() {
    const hash = { a: 1, b: 2, c: function() {} };
    const decoded = boss.load(boss.dump(hash));

    expect("undefined").to.equal(typeof decoded.c);
  });

  it('should pack doubles', function() {
    const double = 3.75;
    const encoded = boss.dump(double);

    expect(boss.load(encoded)).to.equal(3.75);
  });

  it('should cache equal byte arrays', function() {
    const d = decode64("f7YrNmKlscCxpIwNw7jIIKrDtN1fkhsdsc7RDsZEb20");
    const hash = { a: 1, b: d, c: d };
    const decoded = boss.load(boss.dump(hash));

    expect("object").to.equal(typeof decoded.c);
  });

  it('should pack date', function() {
    const d = new Date('2218 07 Mar 21:39');
    const encoded = boss.dump(d);

    expect(hex(encoded)).to.equal("79446b3e169d");
  });

  it('should read date', function() {
    const encoded = hexToBytes('79446b3e169d');
    const decoded = boss.load(encoded);

    expect(decoded.getTime()).to.equal(7831795140000);
  });

  it('should encode false', function() {
    expect(boss.load(boss.dump({ a: false }))).to.deep.equal({ a: false });
  });

  it('should encode null', function() {
    expect(boss.load(boss.dump({ a: null }))).to.deep.equal({ a: null });
  });

  it('should encode utf8 strings', function() {
    // console.log(boss.dump('АБВГД'));

    expect(boss.load(boss.dump('АБВГД'))).to.equal('АБВГД');
  });

  it('should cache similar objects', function() {
    const txt = { __type: 'text', value: "" };
    const obj = { binary: hexToBytes('aa'), text: txt };
    const unpacked = boss.load(boss.dump(obj));

    expect(obj.text).to.deep.equal(unpacked.text);
  });

  // FIXME: need to deprecate byte strings
  it.skip('should perform compatible encode', function() {
    for (const [a, b] of vectors)
      expect(arrayToByteString(boss.dump(b))).to.equal(a);
  });

  // FIXME: need to deprecate byte strings
  it.skip('should perform compatible decode', function() {
    for (const [a, b] of vectors)
      expect(hex(boss.load(byteStringToArray(a)))).to.equal(hex(b));
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
    const seconds = 1507766400;
    const d = new Date(seconds * 1000);

    expect(boss.load(boss.dump(d)).getTime()).to.equal(d.getTime());
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
    expect(boss.load(boss.dump(now)).getTime()).to
      .equal(parseInt(now.getTime() / 1000) * 1000);
  });

  it('should encode in stream mode', function() {
    const writer = new Boss.writer();

    writer.write(0);
    writer.write(1);
    writer.write(2);
    writer.write(3);

    const dump = writer.get();

    expect(hex(dump)).to.equal('00081018');
  });

  it('should decode in stream mode', function() {
    const reader = new Boss.reader(hexToBytes('00081018'));

    const arg1 = reader.read();
    const arg2 = reader.read();
    const arg3 = reader.read();
    const arg4 = reader.read();
    const arg5 = reader.read();

    expect(arg1).to.equal(0);
    expect(arg2).to.equal(1);
    expect(arg3).to.equal(2);
    expect(arg4).to.equal(3);
    expect(arg5).to.equal(undefined);
  });

  it('should cache data', function() {
    const a = [1, 2, 3, 4];
    const ca = { 1: 55 };
    const data = [a, a, ca, ca, 'oops', 'oops'];

    const t = boss.load(boss.dump(data));
    const [b, c, d, e, f, g] = t;

    expect(a).to.deep.equal(b);
    expect(b).to.equal(c);

    expect(ca).to.deep.equal(d);
    expect(ca).to.deep.equal(e);
    expect(d).to.equal(e);

    expect(f).to.equal('oops');

    expect(g).to.equal(f);
    expect(Object.isFrozen(g)).to.equal(true);
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

    expect(data).to.deep.equal(result);
    expect(result[0]).to.deep.equal(result[2]);
    expect(result[1]).to.deep.equal(result[3]);
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

    expect(boss.unpack(boss.pack(source))).to.deep.equal(source);
  });

  function round(value) {
    expect(value).to.deep.equal(boss.load(boss.dump(value)));
  }
});
