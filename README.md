
Remote Control for APRS
-----------------------

This project is intended to provide an APRS-based way of executing selected
commands on a remote machine and getting the response from those commands.

General User Scenario
---------------------

The user has an APRS-capable radio installation connected to a PC of some sort
that is capable of sending APRS messages (e.g. APRSIS32).  For the purpose
of discussion, this is the "local context".

The user sends an APRS message to the remote machine (e.g. VE3RSB) which runs
a shell command on the remote machine.  For instance, one command might be
'power-cycle repeater'.  This command prints out a few lines of output.  The
output lines are fed back to the user as APRS messages.

Security
--------

The remote machine should only accept commands from known and authorized people.
Identity should be proven with dual-key encryption (same mechanism as ssh).

There should be no usable secret transmitted over the airwaves, which we would
assume to be monitored (and in fact stored on sites like 'aprs.fi' for some time).

The system must comply with the general understanding that it isn't permisible
to encrypt messages to hide their content.  I think we'll have to assume that it's
OK to encrypt part of a message to prevent unauthorized use of the facility (i.e.
it's OK to use a digitally-signed code like an HMAC, so long as the message itself
is in clear text).

The system should be resistant to replay attacks - i.e. receiving the same
message twice would not cause the command to be executed twice. Note that apart
from malicious attacks, the nature of APRS messaging is that a given message will
be repeatedly sent by the sender until the receiver's acknowledgement is heard.
So it's perfectly normal to
receive the same message more than once.

Remote Context
--------------

As it stands, the remote machine is a digipeater/IGate that runs APRX as its
IGate software.  It is connected via a KISS modem to an FT2400 radio tuned to the
APRS frequency.

Local Context
-------------

The system could support several users - their APRS installations may vary.

Initially, we'll concentrate on PC-based APRS clients, so as to allow us to
construct a message and copy/paste it to the APRS software (unless it's easy to
plug in this functionality to existing software - but that seems doubtful).

Later on, we'll consider whether one could use a standalone radio (e.g. Yaesu
FT2DR or Kenwood TM-D700) to send the control messages.  In that case, we would
need a simplified coding that could be entered on the radio by hand.

System Architecture
-------------------

The basic concept is to take advantage of APRX's digipeating functionality.  The
remote control system simulates a TCP-Socket-Connected KISS serial interface to a
radio.  APRX forwards messages to this "radio" interface, and forwards "packets"
received from this interface to its internal digipeater, which sends the packets
out to the normal RF interface.

(Insert system diagram here...)
