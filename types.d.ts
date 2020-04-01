declare module 'universa-minicrypto' {
  export function encode64(data: Uint8Array): string;
  export function encode64Short(data: Uint8Array): string;
  export function decode64(encoded: string): Uint8Array;
  export function decode64Short(encoded: string): Uint8Array;
  export function encode58(data: Uint8Array): string;
  export function decode58(encoded: string): Uint8Array;

  export function textToBytes(text: string): Uint8Array;
  export function hexToBytes(hexstring: string): Uint8Array;
  export function bytesToHex(bytes: Uint8Array): string;
  export function hashId(data: Uint8Array): Uint8Array;
  export function randomBytes(size: number): Uint8Array;
  export function crc32(data: Uint8Array): Uint8Array;

  export interface CreateKeysOpts {
    bits?: number,
    e?: number
  }

  export interface Pair {
    publicKey: PublicKey;
    privateKey: PrivateKey;
  }

  export function createKeys(
    opts: CreateKeysOpts,
    cb: (err: Error, pair: Pair) => void
  ): void;

  export interface PBKDF2Opts {
    password: string | Uint8Array,
    salt?: string | Uint8Array,
    rounds?: number,
    keyLength?: number
  }

  export function pbkdf2(sha: SHA, options: PBKDF2Opts): Uint8Array;

  export class BigInteger {
    constructor(value: any, encoding: any);
  }

  export class SHA {
    constructor(size: string | number);

    get(encoding?: string): Uint8Array;
    get(data?: Uint8Array, encoding?: string): Uint8Array;
    put(data: Uint8Array): void;
  }

  export class HMAC {
    constructor(sha: SHA, key: Uint8Array);

    get(data?: Uint8Array): Uint8Array;
    put(data: Uint8Array): void;
  }

  export class AbstractKey {
    static readonly TYPE_PRIVATE: number;
    static readonly TYPE_PUBLIC: number;
    static readonly TYPE_PRIVATE_PASSWORD: number;
    static readonly TYPE_PRIVATE_PASSWORD_V2: number;
    static readonly FINGERPRINT_SHA256: number;
    static readonly FINGERPRINT_SHA384: number;

    static typeOf(key: Uint8Array): number;
  }

  export type SHAStringType = "sha1" | "sha256" | "sha384" | "sha512" | "sha512/256" | "sha3_256" | "sha3_384" | "sha3_512";

  export interface PrivateKeyUnpackBOSS {
    bin: Uint8Array,
    password: string
  }

  export interface PrivateKeyPackBOSS {
    rounds?: number,
    password: string
  }

  export interface PrivateKeySignOpts {
    pssHash?: SHA | HMAC | SHAStringType,
    mgf1Hash?: SHA | HMAC | SHAStringType,
    oaepHash?: SHA | HMAC | SHAStringType,
    salt?: string | Uint8Array,
    saltLength?: number,
    seed?: string | Uint8Array
  }

  export class PrivateKey {
    public publicKey: PublicKey;

    constructor(
      tpe: string,
      options: Uint8Array | PrivateKeyUnpackBOSS
    );

    pack(mode: string, options?: string | PrivateKeyPackBOSS): Uint8Array;
    sign(data: Uint8Array, options: PrivateKeySignOpts): Uint8Array;
    signExtended(data: Uint8Array): Uint8Array;
    decrypt(data: Uint8Array, options?: PublicKeyEncryptOpts): Uint8Array;

    static unpack(packed: Uint8Array, password?: string): PrivateKey;
  }

  export interface PublicKeyEncryptOpts {
    pssHash?: SHA | HMAC | SHAStringType,
    mgf1Hash?: SHA | HMAC | SHAStringType,
    oaepHash?: SHA | HMAC | SHAStringType,
    salt?: string | Uint8Array,
    saltLength?: number,
    seed?: string | Uint8Array
  }

  export interface AddressOpts {
    long?: boolean,
    typeMark?: number
  }

  export class PublicKey {
    constructor(tpe: string, options: Uint8Array);

    readonly packed: Uint8Array;

    fingerprint(): Uint8Array;
    address(options?: AddressOpts): Uint8Array;
    shortAddress(): Uint8Array;
    longAddress(): Uint8Array;
    getBitStrength(): number;
    encryptionMaxLength(options?: PublicKeyEncryptOpts): number;
    pack(mode: string): Uint8Array;
    verify(
      message: Uint8Array,
      signature: Uint8Array,
      options: PrivateKeySignOpts
    ): boolean;
    verifyExtended(signature: Uint8Array, message: Uint8Array): any;
    encrypt(data: Uint8Array, options?: PublicKeyEncryptOpts): Uint8Array;

    static unpack(packed: Uint8Array): PublicKey;
    static isValidAddress(address: Uint8Array | string): boolean;
    static readonly DEFAULT_OAEP_HASH: SHA;
    static readonly DEFAULT_MGF1_HASH: SHA;
  }

  export class Boss {
    constructor();

    dump(data: any): Uint8Array;
    load(packed: Uint8Array): any;
  }

  export namespace Boss {
    export class writer {
      constructor();

      write(data: any): void;
      get(): Uint8Array;
    }

    export class reader {
      constructor(data: Uint8Array);

      read(): any;
    }
  }

  export class SignedRecord {
    constructor(recordType: number, key: PrivateKey, payload: any, nonce?: Uint8Array);

    public recordType: number;
    public key: PrivateKey;
    public payload: any;
    public nonce: Uint8Array | null;

    static readonly RECORD_WITH_KEY: number;
    static readonly RECORD_WITH_ADDRESS: number;

    static packWithKey(key: PrivateKey, payload: any, nonce?: Uint8Array): Uint8Array;
    static unpack(packed: Uint8Array): SignedRecord;
  }

  export class Capsule {
    constructor();

    static sign(capsuleBinary: Uint8Array, key: PrivateKey): Uint8Array;
    static getSignatures(capsuleBinary: Uint8Array): Uint8Array[];
    static getSignatureKeys(capsuleBinary: Uint8Array): PublicKey[];
  }

  export interface KeyInfoOpts {
    algorithm: number;
    tag?: Uint8Array;
    keyLength?: number;
    prf?: number;
    rounds?: number;
    salt?: Uint8Array;
  }

  export interface PRFType {
    None: number;
    HMAC_SHA1: number;
    HMAC_SHA256: number;
    HMAC_SHA512: number;
  }

  export interface AlgorithmType {
    UNKNOWN: number;
    RSAPublic: number;
    RSAPrivate: number;
    AES256: number;
  }

  export class KeyInfo {
    constructor(params: KeyInfoOpts);

    static readonly PRF: PRFType;
    static readonly Algorithm: AlgorithmType;

    pack(): Uint8Array;
    matchType(other: KeyInfo): boolean;
    derivePassword(password: string): Uint8Array;

    static unpack(packed: Uint8Array): KeyInfo;
  }

  export interface SymmetricKeyOpts {
    keyBytes?: Uint8Array,
    keyInfo?: KeyInfo
  }

  export class SymmetricKey {
    constructor(options?: SymmetricKeyOpts);

    pack(): Uint8Array;
    encrypt(data: Uint8Array): Uint8Array;
    decrypt(data: Uint8Array): Uint8Array;
    etaEncrypt(data: Uint8Array): Uint8Array;
    etaDecrypt(data: Uint8Array): Uint8Array;

    static fromPassword(password: string, rounds: number, salt?: Uint8Array): SymmetricKey;
  }

  export class AES {
    constructor(key: Uint8Array);

    encrypt(data: Uint8Array): Uint8Array;
    decrypt(data: Uint8Array): Uint8Array;
  }
}
