import { spawn } from 'child_process';
import delay from 'delay';
import { fdatasync } from 'fs';
import { promisify } from 'util';

async function sendStuff() {
  const process = spawn('cat', []);

  process.on('exit', () => {
    console.log('Subprocess exited.');
  });

  process.stdout.on('data', (data) => console.log('stdout:', data.toString()));
  process.stderr.on('data', (data) => console.log('stderr:', data.toString()));

  const stream = process.stdin;

  for (let i = 0; i < 1000; i++) {
    const data = Uint8Array.from(Buffer.from(`#${i}: This is a test of the emergency data system.`));
    const writeResult = promisify((buf, cb) => stream.write(buf, cb))(data);

    await writeResult;
    console.log(`Wrote #${i}.`);
    await delay(50);
  }

  console.log('Closing stream...');

  await promisify((cb) => stream.end(cb))();

  console.log('Waiting a moment...');
  await delay(1000);

  console.log('Killing subprocess...');
  process.kill();

  console.log('Waiting a moment...');
  await delay(1000);

  console.log('Done!');
}

sendStuff();
