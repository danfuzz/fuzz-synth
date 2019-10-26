FuzzBasicMono
=============

This is a very simple monophonic synth, which is meant to be useful for two
purposes:

* As a template upon which more complicated synth patches can be built.

* As a demonstration of the basic flow of notes through to sound output, using
  a structured approach which (I hope) is particularly clear. Specifically:

  * It uses no cross-object `send/receive` or `throw/catch` pairs, making it
    unnecessary to go on a wild goose chase to understand the data flow of the
    patch.

  * It defines a straightforward processing stream of MIDI notes, to note
    parser, to synthesizer voice, to audio post-processing.

  * It defines a well-structured set of messages going from the note parser
    to the voice.

The core synth of this patch is quite simple: It's a monophonic sawtooth wave,
with no envelope, and which uses an LFO to pan left-and-right.

### How to use

The full source for this patch provides both a vanilla (pure) Pd version and
a version adapted for use on the Organelle.

#### Vanilla

Build an install file using the script `scripts/build-vanilla`. Open the file
`main.pd` for direct use, or use the object `synth~` as a component in more
complicated patches.

For local development, open the file `vanilla/main.pd`.

#### Organelle

Build an install file using the script `scripts/build-organelle`, and install
the resulting file on your Organelle.

For local development, open the file `organelle/main.pd`.

- - - - -

```
Copyright 2019 Dan Bornstein <danfuzz@milk.com>. Licensed AS IS and WITHOUT
WARRANTY under the Apache License, Version 2.0.
Details: <http://www.apache.org/licenses/LICENSE-2.0>
```
