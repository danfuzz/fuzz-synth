import delay from 'delay';
import osc from 'osc';

import { AudioOut } from './AudioOut.js';

function doOsc() {
  const port = new osc.UDPPort({
    localAddress: '127.0.0.1',
    localPort: 4000, // The Organelle OS expects to speak with the patch on UDP port 4000.
    remoteAddress: '127.0.0.1',
    remotePort: 4001, // The Organelle OS exposes an OSC receiver on UDP port 4001.
    metadata: true
  });

  port.on('error', error => {
    console.log('error', error);
  });

  let msgCount = 0;
  port.on('message', function (oscMsg, timeTag, info) {
    msgCount++;
    console.log('\nFrom: %o\nAt: %o\n%o', info, timeTag, oscMsg);

    if (oscMsg.address.startsWith('/quit')) {
      // Be a good Organelle citizen!
      process.exit(0);
    }

    port.send({
      address: '/oled/line/2',
      args: [
        {
          type: "s",
          value: `Got: ${oscMsg.address} / ${oscMsg.args.length}`
        }
      ]
    });
    port.send({
      address: '/oled/line/3',
      args: [
        {
          type: "s",
          value: `Total: ${msgCount}`
        }
      ]
    });
  });

  port.on('ready', () => {
    console.log('Ready!');
    sendStuff(port);
    port.send({
      address: '/'
    })
  });

  console.log('Opening...');
  port.open();
  console.log('Still opening...');
}

async function sendStuff(port) {
  for (let i = 0; i < 10000; i++) {
    if ((i % 10) === 0) {
      console.log('Sending', i);
    }
    port.send({
      address: '/oled/line/1',
      args: [
        {
          type: "s",
          value: `Hello ${i}!`
        }
      ]
    });
    port.send({
      address: '/oled/gFlip',
      args: [
        {
          type: "i",
          value: 3
        }
      ]
    });
    await delay(250);
  }
}

async function doAudio() {
  const SAMPLE_RATE_HZ    = 44100;
  const CHANNELS          = 2;
  const FREQ_HZ           = 130.8128; // One octave below middle C.
  const WAVELEN_SAMPLES   = Math.round(SAMPLE_RATE_HZ / FREQ_HZ);
  const INC_PER_SAMPLE    = 2 / WAVELEN_SAMPLES; // `2 === (1 - -1)` (the full range).
  const WAVE_AMP          = 0.8;
  const TOTAL_SAMPLES_OUT = 10 * SAMPLE_RATE_HZ;

  const buf = new Float64Array(WAVELEN_SAMPLES * 2);
  for (let i = 0; i < WAVELEN_SAMPLES; i++) {
    const fullAmpValue = (i * INC_PER_SAMPLE) - 1; // `- 1` so the range is `[-1..1]`.
    const value        = fullAmpValue * WAVE_AMP;
    buf[i * 2] = buf[(i * 2) + 1] = value;
    console.log('====', value);
  }

  const audioOut = new AudioOut();
  await audioOut.start();

  console.log('Outputting audio...');
  for (let i = 0; i < TOTAL_SAMPLES_OUT; i += WAVELEN_SAMPLES) {
    await audioOut.output(buf);
  }
  console.log('Done outputting audio!');

  await audioOut.stop();
}

console.log('Hello Organelle!');
doOsc();
doAudio();
