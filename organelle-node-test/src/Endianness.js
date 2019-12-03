/**
 * Utility class that determines native system endianness.
 */
export class Endianness {
  /**
   * This class is not instantiable.
   */
  constructor() {
    throw new Error('not_instantiable');
  }

  /**
   * Returns `true` if and only if the native system is big endian.
   *
   * @returns {boolean} `true` iff the native system is big endian.
   */
  static isBigEndian() {
    return !this.isLittleEndian();
  }

  /**
   * Returns `true` if and only if the native system is little endian.
   *
   * @returns {boolean} `true` iff the native system is little endian.
   */
  static isLittleEndian() {
    const buf     = new ArrayBuffer(2);
    const array16 = new Uint16Array(buf);
    const array8  = new Uint8Array(buf);

    array16[0] = 0x2211;
    return (array8[0] === 0x11);
  }
}
