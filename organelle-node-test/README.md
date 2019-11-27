organelle-node-test
===================

This is a work-in-progress to demonstrate the use of Node to implement a patch
on an Organelle. As of this writing, it does nothing other than update the
display with an increasing count and a bit of detail of received OSC messages.
It's also pretty janky. Notably, it _does not_ receive or send audio data.

The _one_ thing it does sensibly is that it will quit itself if it receives
a `/quit` message (or any message whose name begins with `/quit`, really), since
otherwise the Organelle OS gets forlorn and confused, and maybe even just a
little depressed.

### Requirements

You need to have Node 12 installed on your Organelle for this to work. Find
some details about that here: <https://forum.critterandguitari.com/t/nodejs/5146>

### Build and Install

You need to have a relatively recent version of Node installed on your local
(desktop / laptop) machine. Run the script `scripts/build` on your machine, and
then copy the entire contents of this directory to a directory under `Patches`
on your Organelle.

When you run it, in addition to spewing a bit of data to the display, it writes
out the contents of received OSC messages to the file `output.txt` in the patch
directory.

- - - - -

```
Copyright 2019 Dan Bornstein <danfuzz@milk.com>. Licensed AS IS and WITHOUT
WARRANTY under the Apache License, Version 2.0.
Details: <http://www.apache.org/licenses/LICENSE-2.0>
```
