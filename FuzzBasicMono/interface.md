Voice interface used by this patch
==================================

This patch is structured with a model composed of two parts, a note interpreter
and a voice oscillator, which is a fairly common arrangement in Pd / Organelle.
Unlike many Pd synths, though, the interface between these two components is
a single outlet/inlet over which structured messages get sent. This departure is
motivated by a desire to maintain a simple, straightforward, and consistent
data flow into oscillators, across many oscillator variants including ones with
nontrivial controls. (That is, this avoids both the "spaghetti code" resulting
from using non-local `send`s and `receive`s _and_ the mind-numbing tedium of
dealing with an inlet/outlet pair per controllable parameter.

**Note:** This structure is meant to be common across many patches, which is why
it is a bit richer than strictly necessary for a simple monophonic synth.

The following is a description of each of the messages and their meaning.

* `frequency <float>` &mdash; Indicate the frequency to use for the next `on` or
  `on-top` message. This message does not immediately alter the output of the
  voice.

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
