var Universa = Universa || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

describe('Hash', function() {
  const {
    textToHex,
    textToBytes,
    hexToBytes,
    bytesToHex,
    encode64,
    decode64
  } = Universa;

  const { SHA, HMAC } = Universa;

  const STANDARD = {
    sha256: {
      'one': '7692c3ad3540bb803c020b3aee66cd8887123234ea0c6e7143c0add73ff431ed',
      'onetwo': '25b6746d5172ed6352966a013d93ac846e1110d5a25e8f183b5931f4688842a1'
    },
    sha512: {
      'one': '05f70341078acf6a06d423d21720f9643d5f953626d88a02636dc3a9e79582aeb0c820857fd3f8dc502aa8360d2c8fa97a985fda5b629b809cad18ffb62d3899',
      'onetwo': '04aebe936d8eab8a145ce973d1101ac89ea8a2192ca43d3c986ba73ad3de1a58a6a5c95d85d86fc1900d24bad1334d56e550d1a23baf3f867f56fb64aaed0d59'
    },
    hmac: {
      'my secret data': 'cc54950346e46a542b596afdbf32cb984c2566ebf9cfc702ebce0e257a12af57',
      'a quick brown for his done something disgusting': 'la3Xl78Z3ktK2JLoDpPKthhqVilUX6+e6a0WultI9f8='
    }
  };

  describe('SHA', function() {
    describe('SHA256', function() {
      var hashFor = STANDARD.sha256;
      var sha256;

      beforeEach(function() { sha256 = new SHA('256'); });

      it('should calculate hash for message "one"', function() {
        var msg = 'one';

        expect(sha256.get(textToBytes(msg), 'hex')).to.equal(hashFor[msg]);
      });

      it('should calculate hash for message "onetwo" divided by parts', function() {
        sha256.put(textToBytes('one'));
        sha256.put(textToBytes('two'));

        expect(sha256.get('hex')).to.equal(hashFor['onetwo']);
      });
    });

    describe('SHA512', function() {
      var hashFor = STANDARD.sha512;
      var sha512;

      beforeEach(function() { sha512 = new SHA('512'); });

      it('should calculate hash for message "one"', function() {
        var msg = 'one';

        expect(sha512.get(textToBytes(msg), 'hex')).to.equal(hashFor[msg]);
      });

      it('should calculate hash for message "onetwo" divided by parts', function() {
        sha512.put(textToBytes('one'));
        sha512.put(textToBytes('two'));

        expect(sha512.get('hex')).to.equal(hashFor['onetwo']);
      });
    });

    describe('SHA 3 (384)', function() {
      it("should get hash with SHA384", function() {
        const vector = "abc";
        const hash = new SHA("3_384");

        const digest = bytesToHex(hash.get(vector));

        expect(digest).to.equal("ec01498288516fc926459f58e2c6ad8df9b473cb0fc08c2596da7cf0e49be4b298d88cea927ac7f539f1edf228376d25");
      });
    });
  });

  describe('HMAC', function() {
    var hashFor = STANDARD.hmac;

    it('should calculate hash for message and key', function() {
      var data = textToBytes('a quick brown for his done something disgusting');
      var key = textToBytes('1234567890abcdef1234567890abcdef');

      var sha256 = new SHA('256');
      var hmac = new HMAC(sha256, key);

      expect(encode64(hmac.get(data))).to.equal('la3Xl78Z3ktK2JLoDpPKthhqVilUX6+e6a0WultI9f8=');
    });

    it('should calculate hash for larg data', function() {
      var data = decode64("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wrXDg8KDw4LCpMODwoLDgsKgw4PCgsOCwrfDg8KDw4LCpcODwoPDgsKlFkgiaXrDg8KDw4LCg8ODwoLDgsKdw4PCg8OCwrnDg8KDw4LCksODwoPDgsK7w4PCg8OCwoBjeGdcw4PCg8OCwrvDg8KCw4LCrEAmYcODwoLDgsKfw4PCgsOCwrtbw4PCg8OCwpwFw4PCg8OCwqM4w4PCg8OCwo1gw4PCgsOCwosmw4PCgsOCwr1Ow4PCg8OCwpcdw4PCgsOCwqzDg8KDw4LCqsODwoPDgsKcPXYDw4PCgsOCwpMFw4PCgsOCwrduaMODwoPDgsK+w4PCgsOCwrPDg8KCw4LCoMODwoLDgsKoTSXDg8KDw4LCnh/Dg8KDw4LCu8ODwoPDgsKfw4PCg8OCwpLDg8KDw4LClSnDg8KCw4LCgcODwoPDgsKCTw8JG3jDg8KCw4LCsWbDg8KCw4LCrxTDg8KCw4LCpcODwoPDgsKERGQaw4PCg8OCwpZcw4PCg8OCwpXDg8KDw4LCsXwHEsODwoLDgsKBw4PCgsOCwpXDg8KCw4LCvsODwoPDgsKWw4PCgsOCwrHDg8KDw4LCkRg4bBlUw4PCgsOCwo7Dg8KDw4LCkMODwoPDgsKFYVrDg8KCw4LCgV59w4PCgsOCwq7Dg8KCw4LClMODwoPDgsKlw4PCgsOCworDg8KDw4LChMODwoLDgsKldRbDg8KDw4LCqBzDg8KCw4LCkcODwoPDgsKNw4PCgsOCwoltw4PCgsOCwrhHEUfDg8KCw4LCvgwTw4PCgsOCwqdYFnPDg8KDw4LCmMODwoPDgsKzw4PCg8OCwqc+w4PCg8OCwpl0KcODwoPDgsK3Y8ODwoLDgsKDw4PCgsOCwqTDg8KCw4LClHnDg8KDw4LCjcODwoLDgsKUcsODwoPDgsK2fsODwoLDgsKFw4PCgsOCwronSgfDg8KCw4LCpcODwoLDgsKaw4PCgsOCwqTDg8KDw4LCm2vDg8KCw4LCoMODwoPDgsKCHsODwoPDgsKEw4PCgsOCwoHDg8KDw4LCj8ODwoLDgsKuw4PCg8OCwqUdFcODwoPDgsKww4PCgsOCwrTDg8KDw4LCp8ODwoLDgsKtQFVcKHEiEg3Dg8KCw4LCpcODwoPDgsK5w4PCg8OCwpHDg8KCw4LCl8ODwoLDgsKuJBpRw4PCg8OCwoM4OhpUw4PCg8OCwr8/QMODwoLDgsKvw4PCgsOCwqFbcGVybWlzc2lvbnMXM0RPSGVJSj9TZmllbGRfbmFtZTNhbW91bnRLbWluX3ZhbHVlOXsUw4PCgsOCwq5Hw4PCg8OCwqF6w4PCgsOCwoQ/Q21pbl91bml0OXsUw4PCgsOCwq5Hw4PCg8OCwqF6w4PCgsOCwoQ/w4PCgsOCwotqb2luX21hdGNoX2ZpZWxkcw5jc3RhdGUub3JpZ2luNcODwoLDgsKbU3BsaXRKb2luUGVybWlzc2lvbiNyb2xlHzVDUm9sZUxpbmvDg8KCw4LCvRdTQHNwbGl0Sm9pblt0YXJnZXRfbmFtZStvd25lcsODwoLDgsK9F1NzcGxpdF9qb2luM3JkZkhWRh81w4PCgsOCwqtDaGFuZ2VPd25lclBlcm1pc3Npb27Dg8KCw4LCvS0fNcODwoLDgsK9L8ODwoLDgsK9F2NAY2hhbmdlT3duZXLDg8KCw4LCvTHDg8KCw4LCvTLDg8KCw4LCvRdjY2hhbmdlX293bmVyK3JvbGVzBitzdGF0ZTddeQEdX0/Dg8KCw4LChVNjcmVhdGVkX2J5HzXDg8KCw4LCtcODwoLDgsK9FztjcmVhdG9yw4PCgsOCwr0YDhc1w4PCgsOCwr0bw4PCgsOCwr0cFzXDg8KCw4LCvR7Dg8KCw4LCvR/Dg8KDw4LChAoBHggcAQABw4PCg8OCwoQBAQDDg8KCw4LCpsODwoPDgsKQH8ODwoPDgsKZw4PCg8OCwqxpw4PCgsOCwqnDg8KCw4LCvXs3LsODwoPDgsKEw4PCgsOCwrfDg8KCw4LChMODwoPDgsKJRcODwoPDgsK1JcODwoLDgsKJHsODwoPDgsKZaMODwoPDgsKWesODwoPDgsKIw4PCg8OCwovDg8KDw4LCpcODwoPDgsK3w4PCgsOCwql0F2Y5e3oTw4PCgsOCwoNWw4PCgsOCwp4JdcODwoLDgsKxw4PCgsOCwoLDg8KDw4LCjVErw4PCgsOCwoIYbxDDg8KCw4LCkg1bAcODwoLDgsKVw4PCg8OCwqXDg8KCw4LCtcODwoPDgsKkw4PCgsOCwqDDg8KCw4LCt8ODwoPDgsKlw4PCg8OCwqUWSCJpesODwoPDgsKDw4PCgsOCwp3Dg8KDw4LCucODwoPDgsKSw4PCg8OCwrvDg8KDw4LCgGN4Z1zDg8KDw4LCu8ODwoLDgsKsQCZhw4PCgsOCwp/Dg8KCw4LCu1vDg8KDw4LCnAXDg8KDw4LCozjDg8KDw4LCjWDDg8KCw4LCiybDg8KCw4LCvU7Dg8KDw4LClx3Dg8KCw4LCrMODwoPDgsKqw4PCg8OCwpw9dgPDg8KCw4LCkwXDg8KCw4LCt25ow4PCg8OCwr7Dg8KCw4LCs8ODwoLDgsKgw4PCgsOCwqhNJcODwoPDgsKeH8ODwoPDgsK7w4PCg8OCwp/Dg8KDw4LCksODwoPDgsKVKcODwoLDgsKBw4PCg8OCwoJPDwkbeMODwoLDgsKxZsODwoLDgsKvFMODwoLDgsKlw4PCg8OCwoREZBrDg8KDw4LCllzDg8KDw4LClcODwoPDgsKxfAcSw4PCgsOCwoHDg8KCw4LClcODwoLDgsK+w4PCg8OCwpbDg8KCw4LCscODwoPDgsKRGDhsGVTDg8KCw4LCjsODwoPDgsKQw4PCg8OCwoVhWsODwoLDgsKBXn3Dg8KCw4LCrsODwoLDgsKUw4PCg8OCwqXDg8KCw4LCisODwoPDgsKEw4PCgsOCwqV1FsODwoPDgsKoHMODwoLDgsKRw4PCg8OCwo3Dg8KCw4LCiW3Dg8KCw4LCuEcRR8ODwoLDgsK+DBPDg8KCw4LCp1gWc8ODwoPDgsKYw4PCg8OCwrPDg8KDw4LCpz7Dg8KDw4LCmXQpw4PCg8OCwrdjw4PCgsOCwoPDg8KCw4LCpMODwoLDgsKUecODwoPDgsKNw4PCgsOCwpRyw4PCg8OCwrZ+w4PCgsOCwoXDg8KCw4LCuidKB8ODwoLDgsKlw4PCgsOCwprDg8KCw4LCpMODwoPDgsKba8ODwoLDgsKgw4PCg8OCwoIew4PCg8OCwoTDg8KCw4LCgcODwoPDgsKPw4PCgsOCwq7Dg8KDw4LCpR0Vw4PCg8OCwrDDg8KCw4LCtMODwoPDgsKnw4PCgsOCwq1AVVwocSISDcODwoLDgsKlw4PCg8OCwrnDg8KDw4LCkcODwoLDgsKXw4PCgsOCwq4kGlHDg8KDw4LCgzg6GlTDg8KDw4LCvz9Aw4PCgsOCwq/Dg8KCw4LCoWUPw4PCgsOCwr0mw4PCg8OCwoDDg8KDw4LCqAPDg8KCw4LCvTIfNcODwoLDgsK9L8ODwoLDgsK9F8ODwoLDgsK9MsODwoLDgsK9McODwoLDgsKlQ3JldmlzaW9uCMODwoLDgsK9OgYbbmV3BkNjb250cmFjdCczX190eXBlw4LCg1VuaXZlcnNhQ29udHJhY3RLYXBpX2xldmVsEFNkZWZpbml0aW9uN1NjcmVhdGVkX2F0eQEdX0/DgsKFI2RhdGEfS3VuaXRfbmFtZRt3ZXJ7dW5pdF9zaG9ydF9uYW1lw4LChWt0ZW1wbGF0ZV9uYW1lW1VOSVRfQ1JFQVRFU2V4cGlyZXNfYXR5AUN8GsOCwoYzaXNzdWVyHz1TU2ltcGxlUm9sZSNuYW1lw4LCrSNrZXlzDhc9S0tleVJlY29yZBtrZXkXPWNSU0FQdWJsaWNLZXkzcGFja2Vkw4PChAoBHggcAQABw4PChAEBAMOCwqbDg8KQH8ODwpnDg8KsacOCwqnDgsK9ezcuw4PChMOCwrfDgsKEw4PCiUXDg8K1JcOCwokew4PCmWjDg8KWesODwojDg8KLw4PCpcODwrfDgsKpdBdmOXt6E8OCwoNWw4LCngl1w4LCscOCwoLDg8KNUSvDgsKCGG8Qw4LCkg1bAcOCwpXDg8Klw4LCtcODwqTDgsKgw4LCt8ODwqXDg8KlFkgiaXrDg8KDw4LCncODwrnDg8KSw4PCu8ODwoBjeGdcw4PCu8OCwqxAJmHDgsKfw4LCu1vDg8KcBcODwqM4w4PCjWDDgsKLJsOCwr1Ow4PClx3DgsKsw4PCqsODwpw9dgPDgsKTBcOCwrduaMODwr7DgsKzw4LCoMOCwqhNJcODwp4fw4PCu8ODwp/Dg8KSw4PClSnDgsKBw4PCgk8PCRt4w4LCsWbDgsKvFMOCwqXDg8KERGQaw4PCllzDg8KVw4PCsXwHEsOCwoHDgsKVw4LCvsODwpbDgsKxw4PCkRg4bBlUw4LCjsODwpDDg8KFYVrDgsKBXn3DgsKuw4LClMODwqXDgsKKw4PChMOCwqV1FsODwqgcw4LCkcODwo3DgsKJbcOCwrhHEUfDgsK+DBPDgsKnWBZzw4PCmMODwrPDg8KnPsODwpl0KcODwrdjw4LCg8OCwqTDgsKUecODwo3DgsKUcsODwrZ+w4LChcOCwronSgfDgsKlw4LCmsOCwqTDg8Kba8OCwqDDg8KCHsODwoTDgsKBw4PCj8OCwq7Dg8KlHRXDg8Kww4LCtMODwqfDgsKtQFVcKHEiEg3DgsKlw4PCucODwpHDgsKXw4LCriQaUcODwoM4OhpUw4PCvz9Aw4LCr8OCwqFbcGVybWlzc2lvbnMXM0RPSGVJSj9TZmllbGRfbmFtZTNhbW91bnRLbWluX3ZhbHVlOXsUw4LCrkfDg8KhesOCwoQ/Q21pbl91bml0OXsUw4LCrkfDg8KhesOCwoQ/w4LCi2pvaW5fbWF0Y2hfZmllbGRzDmNzdGF0ZS5vcmlnaW49w4LCm1NwbGl0Sm9pblBlcm1pc3Npb24jcm9sZR89Q1JvbGVMaW5rw4LCvRhTQHNwbGl0Sm9pblt0YXJnZXRfbmFtZStvd25lcsOCwr0YU3NwbGl0X2pvaW4zcmRmSFZGHz3DgsKrQ2hhbmdlT3duZXJQZXJtaXNzaW9uw4LCvS4fPcOCwr0ww4LCvRhjQGNoYW5nZU93bmVyw4LCvTLDgsK9M8OCwr0YY2NoYW5nZV9vd25lcityb2xlcwYrc3RhdGVPZXkBHV9Pw4LChVNjcmVhdGVkX2J5Hz3DgsK9F8OCwr0YO2NyZWF0b3LDgsK9GQ4XPcOCwr0cw4LCvR0XPcOCwr0fw4LCvSDDg8KECgEeCBwBAAHDg8KEAQEAw4LCpsODwpAfw4PCmcODwqxpw4LCqcOCwr17Ny7Dg8KEw4LCt8OCwoTDg8KJRcODwrUlw4LCiR7Dg8KZaMODwpZ6w4PCiMODwovDg8Klw4PCt8OCwql0F2Y5e3oTw4LCg1bDgsKeCXXDgsKxw4LCgsODwo1RK8OCwoIYbxDDgsKSDVsBw4LClcODwqXDgsK1w4PCpMOCwqDDgsK3w4PCpcODwqUWSCJpesODwoPDgsKdw4PCucODwpLDg8K7w4PCgGN4Z1zDg8K7w4LCrEAmYcOCwp/DgsK7W8ODwpwFw4PCozjDg8KNYMOCwosmw4LCvU7Dg8KXHcOCwqzDg8Kqw4PCnD12A8OCwpMFw4LCt25ow4PCvsOCwrPDgsKgw4LCqE0lw4PCnh/Dg8K7w4PCn8ODwpLDg8KVKcOCwoHDg8KCTw8JG3jDgsKxZsOCwq8Uw4LCpcODwoREZBrDg8KWXMODwpXDg8KxfAcSw4LCgcOCwpXDgsK+w4PClsOCwrHDg8KRGDhsGVTDgsKOw4PCkMODwoVhWsOCwoFefcOCwq7DgsKUw4PCpcOCworDg8KEw4LCpXUWw4PCqBzDgsKRw4PCjcOCwoltw4LCuEcRR8OCwr4ME8OCwqdYFnPDg8KYw4PCs8ODwqc+w4PCmXQpw4PCt2PDgsKDw4LCpMOCwpR5w4PCjcOCwpRyw4PCtn7DgsKFw4LCuidKB8OCwqXDgsKaw4LCpMODwptrw4LCoMODwoIew4PChMOCwoHDg8KPw4LCrsODwqUdFcODwrDDgsK0w4PCp8OCwq1AVVwocSISDcOCwqXDg8K5w4PCkcOCwpfDgsKuJBpRw4PCgzg6GlTDg8K/P0DDgsKvw4LCoW0Pw4LCvSfDgsKww4LCvTMfPcOCwr0Xw4LCvRjDgsK9M8OCwr0ZDhc9w4LCvRzDgsK9HRc9w4LCvR/DgsK9IMODwoQKAR4IHAEAAcODwoQBAQDDg8KNAcODwo7Dg8K6w4PCvsODwqJzK8OCwqTDg8Kcw4PCvnbDgsKqJTIcUFDDgsKuw4PCiWJVGmrDgsKfw4PCmMODwpfDg8Kow4PCuMODwqoFw4LCt8ODwp8pfcOCwpnDg8KybDokw4PCiXIrw4PCqGrDgsKAK8ODwq8IfyjDgsKZw4PCvwRpw4PChG/DgsKAYXcMw4PCqGDDgsKEIcOCwr/Dg8KuJcODwqwOPEzDg8K8w4PCgMODwq5Aw4LCglrDgsKmGhzDg8KTw4PChRXDg8KLE1fDg8KVdsODwoZ8X8OCwpHDg8KtBjLDg8KhbRTDg8KNT8ODwropKMODwp/DgsK0w4PCjcOCwrzDgsK5w4PCrifDgsKJOwHDg8KZZGbDgsKAw4LCnFDDg8KCK8ODwqPDg8Kbw4LCiwrDgsKIw4PCjEVbw4LCssOCwr/Dg8KWw4LChRHDgsKpw4LCmMOCwq4ncDdcw4PCmH7Dg8KuJcOCwrPDg8KULsODwpbDgsKMUcOCwpVww4LCncODwpLDgsKhw4PCgU4Vw4PCqQhaw4PCpcOCwqU9C8OCwot3w4LCvTjDgsKEw4LCp8ODwrXDgsKjLV/DgsKHw4PClQkoS8OCwpbDgsKiw4PCrwUuHwoHw4LCq3tMAkUQeXA8w4PCv2d5JsOCwpsaVcOCwpHDgsKCw4PCtMODwq7Dg8KMw4LCoRnDgsKjCsODwoTDg8Kqw4PCrcOCwqfDg8Kxw4LCrSTDgsKMw4PCisOCwqLDg8KMAsODwrR7w4PCt8OCwpzDgsK4AC0iHlHDg8KKIjjDg8KFCcODwrFbw4PCtsOCwrc0PDtow4PClCM0H8ODwr7Dg8KRQ3JldmlzaW9uEMOCwr07BkticmFuY2hfaWQbMToxM29yaWdpbhc9M0hhc2hJZDNzaGE1MTLDgsK8QEbDgsKLw4LChXMWw4PCgUrDgsKMeMOCwqgtw4PCp8ODwrrDg8KbXMOCwppvw4PCucODwofDgsK9w4LCowAYw4LCvn18w4LCpsOCwovDgsKgNMODwoHDgsKMQcOCwoDDg8KsRcODwpxgdXcYw4LCpUUeahIwYsOCwonDgsKBw4LCrwkzQsODwoMOw4LChcOCwq0lRMODwpcVw4PCuRozcGFyZW50Fz3DgsK9UsOCwr1Tw4LCvEBGw4LCi8OCwoVzFsODwoFKw4LCjHjDgsKoLcODwqfDg8K6w4PCm1zDgsKab8ODwrnDg8KHw4LCvcOCwqMAGMOCwr59fMOCwqbDgsKLw4LCoDTDg8KBw4LCjEHDgsKAw4PCrEXDg8KcYHV3GMOCwqVFHmoSMGLDgsKJw4LCgcOCwq8JM0LDg8KDDsOCwoXDgsKtJUTDg8KXFcODwrkaG25ldwZDY29udHJhY3QnM19fdHlwZcKDVW5pdmVyc2FDb250cmFjdEthcGlfbGV2ZWwQU2RlZmluaXRpb243U2NyZWF0ZWRfYXR5AR1fT8KFI2RhdGEfS3VuaXRfbmFtZRt3ZXJ7dW5pdF9zaG9ydF9uYW1lwo1rdGVtcGxhdGVfbmFtZVtVTklUX0NSRUFURVNleHBpcmVzX2F0eQFDfBrChjNpc3N1ZXIfRVNTaW1wbGVSb2xlI25hbWXCtSNrZXlzDhdFS0tleVJlY29yZBtrZXkXRWNSU0FQdWJsaWNLZXkzcGFja2Vkw4QKAR4IHAEAAcOEAQEAwqbDkB/DmcOsacKpwr17Ny7DhMK3woTDiUXDtSXCiR7DmWjDlnrDiMOLw6XDt8KpdBdmOXt6E8KDVsKeCXXCscKCw41RK8KCGG8QwpINWwHClcOlwrXDpMKgwrfDpcOlFkgiaXrDg8Kdw7nDksO7w4BjeGdcw7vCrEAmYcKfwrtbw5wFw6M4w41gwosmwr1Ow5cdwqzDqsOcPXYDwpMFwrduaMO+wrPCoMKoTSXDnh/Du8Ofw5LDlSnCgcOCTw8JG3jCsWbCrxTCpcOERGQaw5Zcw5XDsXwHEsKBwpXCvsOWwrHDkRg4bBlUwo7DkMOFYVrCgV59wq7ClMOlworDhMKldRbDqBzCkcONwoltwrhHEUfCvgwTwqdYFnPDmMOzw6c+w5l0KcO3Y8KDwqTClHnDjcKUcsO2fsKFwronSgfCpcKawqTDm2vCoMOCHsOEwoHDj8Kuw6UdFcOwwrTDp8KtQFVcKHEiEg3CpcO5w5HCl8KuJBpRw4M4OhpUw78/QMKvwqFbcGVybWlzc2lvbnMXM0RPSGVJSj9TZmllbGRfbmFtZTNhbW91bnRLbWluX3ZhbHVlOXsUwq5Hw6F6woQ/Q21pbl91bml0OXsUwq5Hw6F6woQ/wotqb2luX21hdGNoX2ZpZWxkcw5jc3RhdGUub3JpZ2luRcKbU3BsaXRKb2luUGVybWlzc2lvbiNyb2xlH0VDUm9sZUxpbmvCvRlTQHNwbGl0Sm9pblt0YXJnZXRfbmFtZStvd25lcsK9GVNzcGxpdF9qb2luM3JkZkhWRh9FwqtDaGFuZ2VPd25lclBlcm1pc3Npb27CvS8fRcK9McK9GWNAY2hhbmdlT3duZXLCvTPCvTTCvRljY2hhbmdlX293bmVyK3JvbGVzBitzdGF0ZU9teQEdX0/ChVNjcmVhdGVkX2J5H0XCvRjCvRk7Y3JlYXRvcsK9Gg4XRcK9HcK9HhdFwr0gwr0hw4QKAR4IHAEAAcOEAQEAw40Bw47DusO+w6JzK8Kkw5zDvnbCqiUyHFBQwq7DiWJVGmrCn8OYw5fDqMO4w6oFwrfDnyl9wpnDsmw6JMOJcivDqGrCgCvDrwh/KMKZw78EacOEb8KAYXcMw6hgwoQhwr/DriXDrA48TMO8w4DDrkDCglrCphocw5PDhRXDixNXw5V2w4Z8X8KRw60GMsOhbRTDjU/Duikow5/CtMONwrzCucOuJ8KJOwHDmWRmwoDCnFDDgivDo8ObwosKwojDjEVbwrLCv8OWwoURwqnCmMKuJ3A3XMOYfsOuJcKzw5Quw5bCjFHClXDCncOSwqHDgU4Vw6kIWsOlwqU9C8KLd8K9OMKEwqfDtcKjLV/Ch8OVCShLwpbCosOvBS4fCgfCq3tMAkUQeXA8w79neSbCmxpVwpHCgsO0w67DjMKhGcKjCsOEw6rDrcKnw7HCrSTCjMOKwqLDjALDtHvDt8KcwrgALSIeUcOKIjjDhQnDsVvDtsK3NDw7aMOUIzQfw77DkXUPwr0oYMK9NB9Fwr0Ywr0Zwr00wr0aDhdFwr0dwr0eF0XCvSDCvSHDhAoBHggcAQABw4QBAQDCpsOQH8OZw6xpwqnCvXs3LsOEwrfChMOJRcO1JcKJHsOZaMOWesOIw4vDpcO3wql0F2Y5e3oTwoNWwp4JdcKxwoLDjVErwoIYbxDCkg1bAcKVw6XCtcOkwqDCt8Olw6UWSCJpesODwp3DucOSw7vDgGN4Z1zDu8KsQCZhwp/Cu1vDnAXDozjDjWDCiybCvU7Dlx3CrMOqw5w9dgPCkwXCt25ow77Cs8KgwqhNJcOeH8O7w5/DksOVKcKBw4JPDwkbeMKxZsKvFMKlw4REZBrDllzDlcOxfAcSwoHClcK+w5bCscORGDhsGVTCjsOQw4VhWsKBXn3CrsKUw6XCisOEwqV1FsOoHMKRw43CiW3CuEcRR8K+DBPCp1gWc8OYw7PDpz7DmXQpw7djwoPCpMKUecONwpRyw7Z+woXCuidKB8KlwprCpMOba8Kgw4Iew4TCgcOPwq7DpR0Vw7DCtMOnwq1AVVwocSISDcKlw7nDkcKXwq4kGlHDgzg6GlTDvz9Awq/CoUNyZXZpc2lvbhjCvTwGS2JyYW5jaF9pZBsyOjEzb3JpZ2luF0UzSGFzaElkM3NoYTUxMsK8QEbCi8KFcxbDgUrCjHjCqC3Dp8O6w5tcwppvw7nDh8K9wqMAGMK+fXzCpsKLwqA0w4HCjEHCgMOsRcOcYHV3GMKlRR5qEjBiwonCgcKvCTNCw4MOwoXCrSVEw5cVw7kaM3BhcmVudBdFwr1Twr1UwrxAwppSwplkB0jCpndlagJfwrPDl18uPMOMTjJJw4rDnhrDosKMAzrDrsKzbcOlJsOTwrlWfxPCgFE0AWXDhcK7wrxPfcOcIl7CgjEfXMK2w5p+wq50NHMHwp0bbmV3BlBLAQIUAAoAAAAAALi6cEsAAAAAAAAAAAAAAAAMAAAAAAAAAAAAEAAAAAAAAABhdHRhY2htZW50cy9QSwECFAAKAAAAAAC4unBL8W+dBbszAAC7MwAAGAAAAAAAAAAAAAAAAAAqAAAAYXR0YWNobWVudHMvMTJ3ZXIudW5pY29uUEsFBgAAAAACAAIAgAAAABs0AAAAAA==");
      var key = textToBytes('1234567890abcdef1234567890abcdef');

      var sha256 = new SHA('256');
      var hmac = new HMAC(sha256, key);

      var arr = data;

      expect(encode64(hmac.get(arr))).to.equal('6wTwsUjFpsm9ccQd3LOIpEpevalwhO8fbHOX9rffdEg=');
    });
  });
});
