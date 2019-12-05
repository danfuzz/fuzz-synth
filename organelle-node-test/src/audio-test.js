import { spawn } from 'child_process';
import delay from 'delay';
import { promisify } from 'util';

import { Endianness } from './Endianness.js';

const SAMPLE_RATE_HZ    = 44100;
const FREQ_HZ           = 130.8128; // One octave below middle C.
const WAVELEN_SAMPLES   = Math.round(SAMPLE_RATE_HZ / FREQ_HZ);
const MSEC_PER_WAVE     = SAMPLE_RATE_HZ / WAVELEN_SAMPLES;

const ALSA_AUDIO_OUTPUT_COMMAND = Object.freeze([
  'aplay',
  '--buffer-time=50000', // 50 msec
  '--channels=1',
  '--duration=0', // `0` means "forever."
  `--format=${Endianness.isLittleEndian() ? 'U32_LE' : 'U32_BE'}`,
  '--nonblock',
  //'--quiet',
  `--rate=${SAMPLE_RATE_HZ}`
]);

const SOX_AUDIO_OUTPUT_COMMAND = Object.freeze([
  'sox',
  //'-V3',
  '--bits=32',
  '--buffer=2205',
  '--channels=1',
  '--encoding=unsigned-integer',
  `--endian=${Endianness.isLittleEndian() ? 'little' : 'big'}`,
  '--ignore-length',
  '--no-show-progress', // a/k/a `--quiet` or `--silent` on most utilities.
  `--rate=${SAMPLE_RATE_HZ}`,
  '--type=raw',
  '-', // Read from `stdin`.
  '--default-device' // Write to the default device.
]);

const INC_PER_SAMPLE = (0x100000000 * 0.75) / WAVELEN_SAMPLES;
const singleCycleSaw = new Uint32Array(WAVELEN_SAMPLES);
const waveBuf = new Uint8Array(singleCycleSaw.buffer);
for (let i = 0; i < WAVELEN_SAMPLES; i++) {
  const value = (i * INC_PER_SAMPLE) + ((1 << 32) * 0.05);
  singleCycleSaw[i] = value;
  console.log('====', singleCycleSaw[i], value);
}
console.log(`==== Single cycle is ${WAVELEN_SAMPLES} samples.`);

async function sendStuff() {
  const [name, ...args] = (process.platform === 'darwin')
    ? SOX_AUDIO_OUTPUT_COMMAND
    : ALSA_AUDIO_OUTPUT_COMMAND;

  console.log('Running:', name, args);

  const proc = spawn(name, args);
  let exited = false;

  proc.on('exit', () => {
    console.log('Subprocess exited.');
    exited = true;
  });

  proc.stdout.on('data', (data) => console.log('stdout:', data.toString()));
  proc.stderr.on('data', (data) => console.log('stderr:', data.toString()));

  const stream = proc.stdin;

  const data = new Uint8Array()

  let lastSecs = 0;
  for (let i = 0; i < SAMPLE_RATE_HZ * 10; i += WAVELEN_SAMPLES) {
    if (exited) {
      break;
    }

    const writeResult = promisify((buf, cb) => stream.write(buf, cb))(waveBuf);

    await writeResult;

    const secs = Math.round(i * 10 / SAMPLE_RATE_HZ) / 10;
    if (secs !== lastSecs) {
      lastSecs = secs;
      console.log(`Wrote ${secs} seconds of data.`);
    }
  }

  console.log('Waiting a moment...');
  await delay(1000);

  console.log('Closing stream...');

  await promisify((cb) => stream.end(cb))();

  console.log('Waiting a moment...');
  await delay(1000);

  console.log('Killing subprocess...');
  proc.kill();

  console.log('Waiting a moment...');
  await delay(1000);

  console.log('Done!');
}

sendStuff();
