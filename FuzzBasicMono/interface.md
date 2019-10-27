Interface and patch structure
=============================

This patch is structured with a model composed of three top-level parts and
a couple of additional part-internal layers. The three top-level parts are:

* a note interpreter, which takes incoming MIDI messages and processes them into
  a form suitable for passing onto&hellip;

* a voice oscillator, which outputs stereo audio which then gets passed
  onto &hellip;

* an audio post-processor.

This top-level arrangement is fairly common arrangement in Pd / Organelle.
Unlike many Pd synths, though, the interface between the first two components is
a single outlet/inlet over which structured messages get sent. This departure is
motivated by a desire to maintain a simple, straightforward, and consistent
data flow into oscillators, across many oscillator variants including ones with
nontrivial controls. (That is, this avoids both the "spaghetti code" resulting
from using non-local `send`s and `receive`s _and_ the mind-numbing tedium of
dealing with an inlet/outlet pair per controllable parameter.

**Note:** This structure is meant to be common across many patches, which is why
it is a bit richer than strictly necessary for a simple monophonic synth.

### Note-to-voice interface

The following is a description of each of the messages that can flow from a
note interpreter into a voice, and its corresponding meaning.

* `frequency <float>` &mdash; Indicate the frequency to use for the next `on` or
  `on-top` message. This message does not immediately alter the output of the
  voice. The frequency value is in Hz (cycles per second), and is _not_ a MIDI
  note number.

* `velocity <float 0..1>` &mdash; Indicate the velocity to use for the next `on`
  or `on-top` message. This message does not immediately alter the output of the
  voice.

* `on` &mdash; Initiate a new note with the `frequency` and `velocity` as
  indicated by previous messages. If the voice has an envelope of any sort (or
  similar), this message would restart the envelope.

* `on-top` &mdash; Change the frequency and velocity of the currently-playing
  note, without resetting the envelope (if any).

* `off` &mdash; Release the currently-playing note. If the voice has an
  envelope with a "release" portion (or similar), this message would get that
  release action going.

### Envelope input interface

Similar to the voice interface, this patch defines a message-based interface
to amplitude envelopes, with the following messages:

* `on <float 0..1>` &mdash; Initiate a new envelope with the velocity as
  indicated by the argument.

* `off <float 0..1>` &mdash; Initiate the "release" portion of the current
  envelope, with release velocity as indicated.
