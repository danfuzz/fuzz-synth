import { spawn } from 'child_process';
import { fdatasync } from 'fs';
import { promisify } from 'util';

import { Endianness } from './Endianness.js';

/** {int} Output sample rate, in Hz. */
const SAMPLE_RATE_HZ = 44100;

/** {int} Desired buffer size, in msec. */
const BUFFER_TIME_MSEC = 100;

/** {int} Desired buffer size, in samples. */
const BUFFER_SAMPLE_COUNT = Math.ceil(BUFFER_TIME_MSEC * SAMPLE_RATE_HZ / 1000);

/** {string} Sample format to use, to reflect the native system endianness. */
const SAMPLE_FORMAT = Endianness.isLittleEndian() ? 'FLOAT64_LE' : 'FLOAT64_BE';

/**
 * {array<string>} Command to issue (executable to run, and arguments) to start
 * playing audio, when ALSA is available. The command needs to take as `stdin`
 * bytes representing two interleaved channels of 64-bit little-endian float
 * samples, at 44.1kHz.
 */
const ALSA_AUDIO_OUTPUT_COMMAND = Object.freeze([
  'aplay',
  `--buffer-time=${BUFFER_TIME_MSEC * 1000}`, // The argument is in usec, not msec.
  '--channels=2',
  '--duration=0', // `0` means "forever."
  `--format=${SAMPLE_FORMAT}`,
  '--nonblock',
  '--quiet',
  `--rate=${SAMPLE_RATE_HZ}`
]);

/**
 * {array<string>} `sox` command to issue, equivalent to the above, for use if
 * SoX is available but ALSA is not (e.g. on macOS).
 */
const SOX_AUDIO_OUTPUT_COMMAND = Object.freeze([
  'sox',
  '--bits=64',
  '--channels=2',
  '--encoding=floating-point',
  `--endian=${Endianness.isLittleEndian() ? 'little' : 'big'}`,
  '--no-show-progress', // a/k/a `--quiet` or `--silent` on most utilities.
  `--rate=${SAMPLE_RATE_HZ}`,
  '--type=raw',
  '-', // Read from `stdin`.
  '--default-device' // Write to the default device.
]);

/**
 * Simple wrapper around an external audio output command, which can be fed
 * buffers of samples. Sample buffers must be instances of `Float64Array`
 * containing interleaved stereo.
 */
export class AudioOut {
  /**
   * Constructs an instance.
   */
  constructor() {
    /**
     * {ChildProcess|null} Object representing the running audio output command,
     * or `null` if it hasn't yet been run (or has since stopped and been
     * cleaned up).
     */
    this._process = null;

    /** {boolean} Whether audio output is running. */
    this._running = false;

    /**
     * {int} Count of currently-pending (stereo) samples. This is the amount
     * written that the underlying system has yet to issue a callback for.
     */
    this._pendingCount = 0;

    /**
     * {Promise|null} Promise which gets resolved when the most recently-made
     * call to {@link #output} completes. Used to serialize calls to that
     * method.
     */
    this._lastOutputDone = null;
  }

  /**
   * Output the given buffer of audio. It is an error to call this if the audio
   * output command is not running.
   *
   * @param {Float64Array} buf Buffer to output.
   */
  async output(buf) {
    // **TODO:** Assert type of `buf`.

    if (this._process === null) {
      throw new Error('not_running');
    }

    const stream = this._process.stdin;

    // `write()` requires specifically a `Buffer` or `Uint8Array`. We receive a
    // `Float64Array`, so we need to rewrap.
    const usableBuf = new Uint8Array(buf.array);

    // **TODO:** Factor out `promisify()`.
    const writeResult = promisify((buf, cb) => stream.write(buf, cb))(usableBuf);

    const sampleCount = buf.length / 2; // `/ 2` because stereo.
    this._pendingCount += sampleCount;

    if (this._pendingCount >= BUFFER_SAMPLE_COUNT) {
      // **TODO:** Figure out how to flush!
      //fs.fdatasync(this._process.stdin.something.something.fd)
    }

    await writeResult;
    this._pendingCount -= sampleCount;
    console.log('Wrote audio data.');
  }

  /**
   * Starts outputting audio. This does nothing if audio output is already
   * running.
   */
  async start() {
    if (this._running) {
      // Already running.
      return;
    }

    // **TODO:** Should probably be more robust.
    const [name, ...args] = (process.platform === 'darwin')
      ? SOX_AUDIO_OUTPUT_COMMAND
      : ALSA_AUDIO_OUTPUT_COMMAND;

    this._process = spawn(name, args);
    this._running = true;

    this._process.on('exit', () => {
      this._process = null;
      this._running = false;
    });
  }

  /**
   * Stops outputting audio, killing the audio output command. This does nothing
   * if audio output isn't actually running.
   */
  async stop() {
    if (! this._running) {
      // Not running.
      return;
    }

    this._process.kill();
  }
}
