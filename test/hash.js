var should = require('should');
var hash = require('../hash');

var SHA = hash.SHA;
var HMAC = hash.HMAC;

var STANDARD = {
  sha256: {
    'one': '7692c3ad3540bb803c020b3aee66cd8887123234ea0c6e7143c0add73ff431ed',
    'onetwo': '25b6746d5172ed6352966a013d93ac846e1110d5a25e8f183b5931f4688842a1'
  },
  sha512: {
    'one': '05f70341078acf6a06d423d21720f9643d5f953626d88a02636dc3a9e79582aeb0c820857fd3f8dc502aa8360d2c8fa97a985fda5b629b809cad18ffb62d3899',
    'onetwo': '04aebe936d8eab8a145ce973d1101ac89ea8a2192ca43d3c986ba73ad3de1a58a6a5c95d85d86fc1900d24bad1334d56e550d1a23baf3f867f56fb64aaed0d59'
  },
  hmac: {
    'my secret data': 'cc54950346e46a542b596afdbf32cb984c2566ebf9cfc702ebce0e257a12af57'
  }
};

describe('Hash functions', function() {
  describe('SHA family', function() {
    describe('SHA256', function() {
      var hashFor = STANDARD.sha256;
      var sha256;

      beforeEach(function() { sha256 = new SHA('256'); });

      it('should calculate hash for message "one"', function() {
        var msg = 'one';

        sha256.get(msg).should.eql(hashFor[msg]);
      });

      it('should calculate hash for message "onetwo" divided by parts', function() {
        sha256.put('one');
        sha256.put('two');

        sha256.get().should.eql(hashFor['onetwo']);
      });
    });

    describe('SHA512', function() {
      var hashFor = STANDARD.sha512;
      var sha512;

      beforeEach(function() { sha512 = new SHA('512'); });

      it('should calculate hash for message "one"', function() {
        var msg = 'one';

        sha512.get(msg).should.eql(hashFor[msg]);
      });

      it('should calculate hash for message "onetwo" divided by parts', function() {
        sha512.put('one');
        sha512.put('two');

        sha512.get().should.eql(hashFor['onetwo']);
      });
    });
  });

  describe('HMAC', function() {
    var hashFor = STANDARD.hmac;

    it('should calculate hash for message and key', function() {
      var data = 'my secret data';
      var key = 'my secret key';

      var sha256 = new SHA('256');
      var hmac = new HMAC(sha256, 'my secret key');

      hmac.get(data).should.eql(hashFor[data]);
    });
  });
});
