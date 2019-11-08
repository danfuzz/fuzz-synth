Infiknob
========

"Infinite" range knob. With this object, one can use fixed-range
non-spring-loaded controls to accurately pick values from an arbitrarily large
range. Specifically, this takes a "raw" control value in the range [-1..1], and
treats it as a control over a (generally speaking) wider range of values. The
middle half of the input range selects individual values around the current
value, and the extremes of the input range cause the value to auto-increment
towards the respective ends of the output range, at a rate that increases as
the control veers further from the center. Constructor arguments are `min`
(minimum value in range), `max` (maximum value in range), and `quant` (smallest
quantum of change / quantization amount).

**Note:** The included object `ctl-to-pm1` converts a standard MIDI control
value in the range [0..127] into a value in the range [-1..1] as expected by
this object. Similarly `01-to-pm1` converts from the range [0..1] (which is
notably the range of an Organelle control knob.)

Messages:

* Number -- A control value, which is handled per the above description.
* `reset` -- Reset the control to its initial state.
* `set <value>` -- Reset the control to its initial state, except that its value
  is set as given.
* `bang` -- Send current value.

### How to use

Copy the desired file(s) and make sure they are on your patch search path.

The two `main.pd` files in this distribution demonstrate the object, under
`vanilla` for a vanilla Pd demo, and under `organelle` for an Organelle demo.

### How to build

The script `scripts/build-organelle` builds an install file for the Organelle.

- - - - -

```
Copyright 2019 Dan Bornstein <danfuzz@milk.com>. Licensed AS IS and WITHOUT
WARRANTY under the Apache License, Version 2.0.
Details: <http://www.apache.org/licenses/LICENSE-2.0>
```
