#!/bin/bash
#
# Copyright 2019 Dan Bornstein <danfuzz@milk.com>. Licensed AS IS and WITHOUT
# WARRANTY under the Apache License, Version 2.0.
# Details: <http://www.apache.org/licenses/LICENSE-2.0>
#
# Wrapper for running AWK Music on an Organelle.

# Set `progName` to the program name, `progDir` to its directory, and `baseDir`
# to `progDir`'s directory. Follows symlinks.
function init-prog {
    local newp p="$0"

    while newp="$(readlink "$p")"; do
        [[ ${newp} =~ ^/ ]] && p="${newp}" || p="$(dirname "$p")/${newp}"
    done

    progName="${p##*/}"
    progDir="$(cd "$(dirname "$p")"; /bin/pwd -P)"
    baseDir="$(cd "${progDir}/.."; /bin/pwd -P)"
}
init-prog

#
# Helper functions
#

# Monitors OSC, exiting when a `/quit` is received.
function wait-for-osc-quit {
    # `stdbuf` forces unbuffered output on `oscdump`, so we can see the `/quit`
    # promptly. Similarly `--line-buffered` on `grep`; and `--quiet` makes it
    # exit (silently) after the first match.
    stdbuf -o0 oscdump osc.udp://:4000 | grep --line-buffered --quiet '^/quit'
}

#
# Main script
#

oscsend localhost 4001 /oled/line/2 s '     AWK  Music'
oscsend localhost 4001 /oled/line/4 s '    by Kyle Keen'

"${progDir}/awk-music" | aplay -r 64000 &
childPid="$!"

# Add the child PID to the list of same associated with this patch.
echo "${childPid}" > /tmp/pids/awk-music.pid

(
    echo 'Waiting for OSC `/quit`...' 
    wait-for-osc-quit
    echo 'Quitting...'

    kill "${childPid}"

    echo 'Adieu.'
) | tee "${progDir}/log.txt"
