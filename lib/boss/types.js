// Basic types

const INT = 0;
const EXTRA = 1;
const NINT = 2;

const TEXT = 3;
const BIN = 4;
const CREF = 5;
const LIST = 6;
const DICT = 7;

// Extra types:

const DZERO = 0;  // float 0.0
const FZERO = 1;  // double 0.0

const DONE = 2;  // double 1.0
const FONE = 3;   // float 1.0
const DMINUSONE = 4; // double -1.0
const FMINUSONE = 5; // float  -1.0

const TFLOAT = 6; // 32-bit IEEE float
const TDOUBLE = 7; // 64-bit IEEE float

const TOBJECT = 8; // object record
const TMETHOD = 9; // instance method
const TFUNCTION = 10; // callable function
const TGLOBREF = 11; // global reference

const TTRUE = 12;
const TFALSE = 13;

const TCOMPRESSED = 14;
const TTIME = 15;

const XT_STREAM_MODE = 16;

module.exports = {
  INT,
  EXTRA,
  NINT,
  TEXT,
  BIN,
  CREF,
  LIST,
  DICT,

  DZERO,
  FZERO,
  DONE,
  FONE,
  DMINUSONE,
  FMINUSONE,
  TFLOAT,
  TDOUBLE,
  TOBJECT,
  TMETHOD,
  TFUNCTION,
  TGLOBREF,
  TTRUE,
  TFALSE,
  TCOMPRESSED,
  TTIME,
  XT_STREAM_MODE
};
