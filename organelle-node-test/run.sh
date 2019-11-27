#!/bin/bash

echo 'Hello!' > ./output.txt

node --experimental-modules src/main.js 2>&1 | tee --append output.txt
