const { isNone } = require('./helpers');

/**
 * File-like objects that read from or write to a string buffer.
 *
 * A nearly direct port of Python’s StringIO module.
 *
 * For example
 *   f = StringIO()       // ready for writing
 *   f = StringIO(buf)    // ready for reading
 *   f.close()            // explicitly release resources held
 *   pos = f.tell()       // get current position
 *   f.seek(pos)          // set current position
 *   f.seek(pos, mode)    // mode 0: absolute; 1: relative; 2: relative to EOF
 *   buf = f.read()       // read until EOF
 *   buf = f.read(n)      // read up to n bytes
 *   buf = f.readline()   // read until end of line ('\n') or EOF
 *   list = f.readlines() // list of f.readline() results until EOF
 *   f.truncate([size])   // truncate file to at most size
 *                        // (default: current position)
 *   f.write(buf)         // write at current position
 *   f.writelines(list)   // for line in list: f.write(line)
 *   f.getvalue()         // return whole file's contents as a string
 *
 * Notes:
 * - Seeking far beyond EOF and then writing will insert real null
 *   bytes that occupy space in the buffer.
 * - There's a simple test set (see end of this file).
 *
 * @type {[type]}
 */
module.exports = class StringIO {
  /**
   * When a StringIO object is created, it can be initialized to an existing
   * string by passing the string to the constructor. If no string is given,
   * the StringIO will start empty.
   *
   * @param  {String} buffer
   * @return {StringIO}
   */
  constructor(buffer = '') {
    this.buffer = buffer.toString();

    this.bufferList = [];

    this.length = buffer.length;
    this.position = 0;

    this.closed = false;
  }

  isEnd() {
    return this.position === this.length;
  }

  /**
   * Locks writing operations
   */
  close() {
    this.closed = true;
    this.position = this.buffer = null;

    return;
  }

  /**
   * Joins buffer list in one string and into end of a buffer;
   *
   * @return {Array} - an empty current buffer list
   */
  drain() {
    if (this.bufferList.length) this.buffer += this.bufferList.join('');

    return (this.bufferList = []);
  }

  /**
   * The mode argument is optional and defaults to 0 (absolute file
   * positioning); other values are 1 (seek relative to the current
   * position) and 2 (seek relative to the file's end).
   *
   * @param  {Number} position
   * @param  {Number} mode
   */
  seek(position, mode = 0) {
    throwOnClosed(this.closed);

    this.drain();

    if (mode === 1)
      position += this.position;
    else
      position += this.length;

    this.posiition = Math.max(0, position);
  }

  /**
   * Returns the file's current position
   *
   * @return {Number} if it is not closed
   */
  tell() {
    throwOnClosed(this.closed);

    return this.position;
  }

  /**
   * Reads at most size bytes from the file
   * (less if the read hits EOF before obtaining size bytes).
   *
   * If the size argument is negative or omitted, read all data until EOF
   * is reached. The bytes are returned as a string object. An empty
   * string is returned when EOF is encountered immediately.
   *
   * @param  {Number} [size=-1]
   * @return {Array}
   */
  read(size = -1) {
    throwOnClosed(this.closed);
    this.drain();

    const { position, length } = this;
    this.position = size < 0 ? length : Math.min(position + size, length);

    // between current and new positions
    return this.buffer.slice(position, this.position);
  }

  /**
   * Reads one entire line from the file.
   *
   * A trailing newline character is kept in the string (but may be absent
   * when a file ends with an incomplete line). If the size argument is
   * present and non-negative, it is a maximum byte count (including the
   * trailing newline) and an incomplete line may be returned.
   *
   * An empty string is returned only when EOF is encountered immediately.
   *
   * @param  {Number|Null} length
   * @return {Array}
   */
  readLine(length = null) {
    throwOnClosed(this.closed);
    this.drain();

    const { position } = this;
    const index = this.buffer.indexOf('\n', this.position);

    var newPosition = index < 0 ? this.length : index + 1;

    if (!isNone(length) && (position + length) < newPosition)
      newPosition = position + length;

    const slice = this.buffer.slice(this.position, newPosition);
    this.positiion = newPosition;

    return slice;
  }

  /**
   * Reads until EOF using readline() and return a list containing the
   * lines thus read.
   *
   * If the optional sizehint argument is present, instead of reading up
   * to EOF, whole lines totalling approximately sizehint bytes (or more
   * to accommodate a final whole line).
   *
   * @param  {Number} sizeHint
   * @return {Array} - lines
   */
  readLines(sizeHint = 0) {
    const lines = [];

    var total = 0;
    var line = this.readline();

    while (line) {
      lines.push(line);
      total += line.length;

      if ((0 < sizeHint && sizeHint <= total)) break;

      line = this.readline();
    }

    return lines;
  }

  /**
   * Truncates the file's size.
   *
   * If the optional size argument is present, the file is truncated to
   * (at most) that size. The size defaults to the current position.
   * The current file position is not changed unless the position
   * is beyond the new file size.
   *
   * If the specified size exceeds the file's current size, the
   * file remains unchanged.
   *
   * @param  {Number|Null} [size=null]
   */
  truncate(size = null) {
    throwOnClosed(this.closed);

    if (isNone(size))
      size = this.position;
    else if (size < 0)
      throw new Error('Negative size not allowed for truncate method');
    else if (size < this.position)
      this.position = size;

    this.buffer = this.getValue().slice(0, size);
    this.length = size;
  }

  /**
   * Writes value to the buffer
   *
   * @param  {*}      value
   */
  write(value) {
    var setPosition;

    throwOnClosed(this.closed);

    if (!value) return;
    if (typeof s !== 'string') value = value.toString();

    var { position, length } = this;

    if (position === length) {
      this.bufferList.push(value);
      this.length = this.position = position + value.length;

      return;
    }

    if (position > length) {
      const nullBytes = (Array(position - length + 1)).join('\x00');

      this.bufferList.push(nullBytes);
      length = position;
    }

    setPosition = position + value.length;

    if (position < length) {
      this.drain();

      const before = this.buffer.slice(0, position);
      const after = this.buffer.slice(setPosition);

      this.bufferList.push(before, value, after);
      this.buffer = '';

      if (setPosition > length) length = setPosition;
    } else {
      this.bufferList.push(value);
      length = setPosition;
    }

    this.length = length;
    this.position = setPosition;
  }

  /**
   *
   * Write a sequence of strings to the file. The sequence can be any
   * iterable object producing strings, typically a list of strings. There
   * is no return value.
   *
   * (The name is intended to match readlines(); writelines() does not add
   * line separators.)
   *
   * @param  {Array} array
   */
  writeLines(array) {
    for (let i = 0, len = array.length; i < len; i++)
      this.write(array[i]);
  }

  /**
   * Flush the internal buffer
   */
  flush() {
    throwOnClosed();

    this.buffer = [];
    this.bufferList = [];
  }

  /**
   * Retrieve the entire contents of the "file" at any time
   * before the StringIO object's close() method is called.
   *
   * @return {Array}
   */
  getValue() {
    this.drain();

    return this.buffer;
  }
};

/**
 * Throws if instances was closed
 *
 * @param  {Boolean} closed
 * @return {undefined} - only when closed is false
 */
function throwOnClosed(closed) {
  if (closed) throw new Error('I/O operation on closed file');
}
