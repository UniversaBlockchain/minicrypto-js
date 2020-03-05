declare module 'universa-minicrypto' {
  export function encode64(data: Uint8Array): String;
  export function encode64Short(data: Uint8Array): String;
  export function decode64(encoded: String): Uint8Array;
  export function decode64Short(encoded: String): Uint8Array;
  export function encode58(data: Uint8Array): String;
  export function decode58(encoded: String): Uint8Array;

  export function hexToBytes(hexString: String): Uint8Array;
  export function bytesToHex(bytes: Uint8Array): String;
  export function hashId(data: Uint8Array): Uint8Array;
  export function randomBytes(size: number): Uint8Array;
  export function crc32(data: Uint8Array): Uint8Array;

  export function createKeys(opts: any, cb: any): void;

  export class SHA {
    constructor(size: string);
  }

  export class PrivateKey {
    publicKey: PublicKey;

    constructor(tpe: string, options: any);

    pack(mode: any, options?: any): Uint8Array;
    sign(data: Uint8Array, options: any): Uint8Array;
    signExtended(data: Uint8Array): Uint8Array;

    static unpack(packed: Uint8Array, password?: String): PrivateKey;
  }

  export class PublicKey {
    constructor(tpe: string, options: any);

    address(options: any): Uint8Array;
    pack(options: any): Uint8Array;
    verify(message: Uint8Array, signature: Uint8Array, options: any): boolean;
    verifyExtended(signature: Uint8Array, message: Uint8Array): any;
    readonly packed: Uint8Array;

    static unpack(packed: Uint8Array): PublicKey;
  }

  export class Boss {
    constructor();

    dump(data: any): Uint8Array;
    load(packed: Uint8Array): any;
  }

  export class SignedRecord {
    constructor(recordType: number, key: PrivateKey, payload: any, nonce?: Uint8Array);

    readonly RECORD_WITH_KEY: number;
    readonly RECORD_WITH_ADDRESS: number;

    static packWithKey(key: PrivateKey, payload: any, nonce?: Uint8Array): Uint8Array;
    static unpack(packed: Uint8Array): SignedRecord;
  }
}
