const should = require('should');

const Boss = require('../lib/boss/protocol');
const utils = require('../lib/utils');

const vectors = [
  ['8', 7],
  ['\xb8F', 70],
  ['\xc8p\x11\x01', 70000],
  ['.\x00\x08\n8:', [0, 1, -1, 7, -7]],
  ['+Hello', 'Hello'],
  // TODO: [',Hello', bytes!('Hello'), 2, 4, 4, 1]
];

const { hexToBytes, byteStringToBin, bytesToHex } = utils;

describe('BOSS Protocol', function() {
  var boss;

  beforeEach(function() {
    boss = new Boss();
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
    const obj = { binary: byteStringToBin(hexToBytes('aa')), text: txt };
    const unpacked = boss.load(boss.dump(obj));

    should(obj.text).eql(unpacked.text);
  });

  it('should perform compatible encode', function() {
    for (const [a, b] of vectors) should(boss.dump(b)).equal(a);
  });

  it('should perform compatible decode', function() {
    for (const [a, b] of vectors) should(boss.load(a)).eql(b);
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

  // it 'should decode one by one using block' do
  //   args = [1, 2, 3, 4, 5]
  //   s    = Boss.dump(*args)
  //   res  = []
  //   res  = Boss.load(s) { |x| x }
  //   args.should == res
  // end
  //

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

  // it 'sends and restores foobars1' do
  //   # stupid error
  //   src = { :ref => 7, :result => { "foo" => "bar", "bardd" => "buzz", "last" => "item", "bar" => "test", arr: 10.times.map { 'bar' } }, :serial => 7 }
  //   f   = Boss::Formatter.new
  //   f.set_stream_mode
  //   f << src
  //   # p f.get_stream.string
  //   encoded = f.get_stream.string
  //   ins     = Boss::Parser.new(encoded)
  //   ins.each { |res|
  //     # p res
  //     res['result']['bar'].should == 'test'
  //     res['result']['arr'].should == 10.times.map { 'bar' }
  //   }
  // end

  // it 'sends and restores foobars2' do
  //   # stupid error
  //   src = { :ref => 7, :result => { "foo" => "bar", "bardd" => "buzz", "last" => "item", "bar" => "test", arr: 10.times.map { 'bar' } }, :serial => 7 }
  //   f   = Boss::Formatter.new
  //   f << src
  //   # p f.get_stream.string
  //   encoded = f.get_stream.string
  //   ins     = Boss::Parser.new(encoded)
  //   ins.each { |res|
  //     # p res
  //     res['result']['arr'].should == 10.times.map { 'bar' }
  //     res['result']['bar'].should == 'test'
  //   }
  // end

  // it 'should effectively compress/decompress' do
  //   # No compression
  //   data = "Too short"
  //   x0   = Boss.dump_compressed data
  //   Boss.load(x0).should == data
  //   x0.length.should <= (data.length + 3)

  //   # short compression: zlib
  //   data = "z" * 1024
  //   x1   = Boss.dump_compressed data
  //   Boss.load(x1).should == data
  //   x1.length.should <= (data.length/10)

  //   # hevay compression on big data
  //   #data = JSON.parse(Zlib::Inflate.new(Zlib::MAX_WBITS).inflate(Base64::decode64(CompressedTestJson)))
  //   #round_check data
  //   #x2 = Boss.dump_compressed(data)
  //   #Boss.load(x2).should == data
  //   #x2.length.should < 13700
  // end

  // it 'should raise proper error' do
  //   class MyObject;
  //   end
  //   -> { Boss.dump MyObject.new }.should raise_error(Boss::NotSupportedException)
  // end

  // it 'should implement stream mode' do
  //   out = Boss::Formatter.new
  //   out.stream_mode
  //   3.times { out << "String too long" }
  //   (1..6).each { |n| out << "test#{n}" }
  //   (4..6).each { |n| out << "test#{n}" }
  //   (4..6).each { |n| out << "test#{n}" }
  //   out << "test7"

  //   #res = "\x81\x18P{String too long{String too long{String too long+test1+test2+test3+test4+test5+test6\r\x15\x1D\r\x15\x1D+test7"
  //   #res.force_encoding 'binary'
  //   #out.string.should == res

  //   inp = Boss::Parser.new out.string

  //   3.times { inp.get.should == "String too long" }
  //   (1..6).each { |n| inp.get.should == "test#{n}" }
  //   (4..6).each { |n| inp.get.should == "test#{n}" }
  //   (4..6).each { |n| inp.get.should == "test#{n}" }
  //   inp.get.should == "test7"

  //   #src2 = "gRhQe1N0cmluZyB0b28gbG9uZ3tTdHJpbmcgdG9vIGxvbmd7U3RyaW5nIHRvbyBsb25nK3Rlc3QxK3Rlc3QyK3Rlc3QzK3Rlc3Q0K3Rlc3Q1K3Rlc3Q2DRUdDRUdK3Rlc3Q3"
  // end

  // it 'should work fine with big stream mode' do
  //   out = Boss::Formatter.new
  //   out.stream_mode
  //   src = 4096.times.map { |n| s="Long string #{n}"; out << s; s }
  //   inp = Boss::Parser.new out.string
  //   src.each { |s| inp.get.should == s }
  // end

  // it 'should work in mixed normal and stream modes' do
  //   s1  = "The string"
  //   out = Boss::Formatter.new
  //   out << s1 << s1
  //   out.stream_mode
  //   out << s1 << s1
  //   # p Base64.encode64(out.string)
  //   input      = Boss::Parser.new out.string
  //   a, b, c, d = 4.times.map { input.get }
  //   b.__id__.should_not == c.__id__
  //   c.__id__.should_not == d.__id__
  //   a.should == b
  //   b.should == c
  //   c.should == d
  // end

  // it 'run interoperable' do
  //   s1, s2 = Socket.pair(:UNIX, :STREAM, 0)

  //   out = SocketStream.new(s1)
  //   ins = Boss::Parser.new SocketStream.new(s2)

  //   last = nil
  //   t = Thread.start {
  //     ins.each { |obj|
  //       obj == nil and break
  //       last= obj
  //     }
  //   }

  //   out << Boss.dump( { :cmd => "foo", :args => [], :kwargs => {}, :serial => 0 })
  //   out << Boss.dump({ :ref => 0, :error => { "class" => "ArgumentError", "text" => "wrong number of arguments (given 0, expected 2)" }, :serial => 0 })
  //   out << Boss.dump( { :cmd => "foo", :args => [10, 20], :kwargs => {}, :serial => 1 })
  //   out << Boss.dump( { :ref => 1, :result => "Foo: 30, none", :serial => 1 })
  //   out << Boss.dump( { :cmd => "foo", :args => [5, 6], :kwargs => { :optional => "yes!" }, :serial => 2 })
  //   out << Boss.dump( { :ref => 2, :result => "Foo: 11, yes!", :serial => 2 })
  //   out << Boss.dump( { :cmd => "a", :args => [], :kwargs => {}, :serial => 3 } )
  //   out << Boss.dump( { :ref => 3, :result => 5, :serial => 3 } )

  //   out << Boss.dump( { :cmd => "b", :args => [], :kwargs => {}, :serial => 4 } )
  //   out << Boss.dump( { :ref => 4, :result => 6, :serial => 4 } )
  //   out << Boss.dump( { :cmd => "get_hash", :args => [], :kwargs => {}, :serial => 5 } )
  //   out << Boss.dump( { :ref => 5, :result => { "foo" => "bar", "bardd" => "buzz", "last" => "item", "bar" => "test" }, :serial => 5 } )

  //   out << Boss.dump(nil)
  //   t.join

  //   last['ref'].should == 5
  //   last['result']['foo'].should == 'bar'
  // end
  //

  it('has shortcuts', function() {
    const source = ['foo', 'bar', { 'hello': 'world' }];

    should(boss.unpack(boss.pack(source))).eql(source);
  });

  function round(value) {
    should(value).eql(boss.load(boss.dump(value)));
  }
});
