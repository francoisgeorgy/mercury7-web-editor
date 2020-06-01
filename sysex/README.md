# Mercury7 sysex format

## Summary

Ref: https://www.midi.org/specifications/item/table-1-summary-of-midi-message

A MIDI System Exclusive message has the following format:

`N` is the number of bytes of bytes of the messages.

| Offset | Data   | BS-II | Description                            |
| ------:| ------:| -----:|:-------------------------------------- |
|      0 |     F0 |       | Mark the start of the SysEx message    | 
|      1 |   _id_ |  0x00 | Manufacturer's ID                      |
|      2 |   _id_ |  0x20 | Manufacturer's ID                      |
|      3 |   _id_ |  0x10 | Manufacturer's ID                      |
| 4.._N_-2 | _xx_ |       | DATA (N-5 bytes) View description below |
|    _N_-1 |   F7 |       | Mark the end of the SysEx message      |

Note: "Japanese Group" manufacturers have only one ID byte. See [https://www.midi.org/specifications/item/manufacturer-id-numbers] for more details.


## DATA

- **Offset**: index from the start of the SysEx data. First byte (0xF0) has offset=0.
- **Bytes**: number of bytes to consider for this parameter
- **Mask**: mask to apply to the above bytes to get the bits relative to the parameter
- **Bits**: how many bits form the value


| Offset | Bytes | Hex mask   | Bin mask            | Bits | Description |
| ------:| -----:| :--------- | :------------------ | ----:| ----------- |
|      1 |     3 | `7F 7F 7F` | `01111111 01111111 01111111` | 3x 7 | Manufacturer ID = 0x00 0x20 0x10 |
|      4 |     1 | `7F`       | `01111111         ` |    7 | Prod ID (user definable, matches midi channel - 1) |
|      5 |     1 | `7F`       | `01111111         ` |    7 | Group ID (01 = pedal series) |
|      6 |     1 | `7F`       | `01111111         ` |    7 | Model # (0=Ottobit Jr, 1=Mercury7, 2=Polymoon, 3=Enzo) |
|      7 |     1 | `7F`       | `01111111         ` |    7 | Command |
|      8 |     1 | `7F`       | `01111111         ` |    7 | Preset number |
|      9 |     1 | `7F`       | `01111111`          |    7 | Space Decay (CC 16) |
|     10 |     1 | `7F`       | `01111111`          |    7 | Modulate (CC 17) |
|     11 |     1 | `7F`       | `01111111`          |    7 | Mix (CC 18) |
|     12 |     1 | `7F`       | `01111111`          |    7 | Lo Freq (CC 19) |
|     13 |     1 | `7F`       | `01111111`          |    7 | Pitch Vector (CC 20) |
|     14 |     1 | `7F`       | `01111111`          |    7 | Hi Freq (CC 21) |
|     15 |     1 | `7F`       | `01111111`          |    7 | Predelay (CC 22) |
|     16 |     1 | `7F`       | `01111111`          |    7 | Mod Speed (CC 23) |
|     17 |     1 | `7F`       | `01111111`          |    7 | Pitch Vector Mix (CC 24) |
|     18 |     1 | `7F`       | `01111111`          |    7 | Density (CC 25) |
|     19 |     1 | `7F`       | `01111111`          |    7 | Attack Time (CC 26) |
|     20 |     1 | `7F`       | `01111111`          |    7 | Vibrato Depth (CC 27) |
|     21 |     1 | `7F`       | `01111111`          |    7 | Bypass (CC 14) |
|     22 |     1 | `7F`       | `01111111`          |    7 | Swell (CC 28) |
|     23 |     1 | `7F`       | `01111111`          |    7 | Algorithm (CC 29) |
|     24 |     1 | `7F`       | `01111111`          |    7 | not used (always 0) |
|     25 |     1 | `7F`       | `01111111`          |    7 | not used (always 0) |
|     26 |     1 | `7F`       | `01111111`          |    7 | Space Decay (CC 16) - second value when using EXP |
|     27 |     1 | `7F`       | `01111111`          |    7 | Modulate (CC 17) - second value when using EXP |
|     28 |     1 | `7F`       | `01111111`          |    7 | Mix (CC 18) - second value when using EXP |
|     29 |     1 | `7F`       | `01111111`          |    7 | Lo Freq (CC 19) - second value when using EXP |
|     30 |     1 | `7F`       | `01111111`          |    7 | Pitch Vector (CC 20) - second value when using EXP |
|     31 |     1 | `7F`       | `01111111`          |    7 | Hi Freq (CC 21) - second value when using EXP |
|     32 |     1 | `7F`       | `01111111`          |    7 | Predelay (CC 22) - second value when using EXP |
|     33 |     1 | `7F`       | `01111111`          |    7 | Mod Speed (CC 23) - second value when using EXP |
|     34 |     1 | `7F`       | `01111111`          |    7 | Pitch Vector Mix (CC 24) - second value when using EXP |
|     35 |     1 | `7F`       | `01111111`          |    7 | Density (CC 25) - second value when using EXP |
|     36 |     1 | `7F`       | `01111111`          |    7 | Attack Time (CC 26) - second value when using EXP |
|     37 |     1 | `7F`       | `01111111`          |    7 | Vibrato Depth (CC 27) - second value when using EXP |
