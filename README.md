# 8-Bit Compiler
## Overview
This is a simple compiler that can convert custom assembly into raw bytecode for Ben Eater's 8-bit computers.

## Instruction Set
Full documentation can be found [here](https://chickpeaplane.github.io/8-Bit-Compiler/docs).
| Instruction | Description | Argument | ID |
|---|---|---|---|
| NOP | Sleeps for one instruction cycle. | None | 0x0 |
| JMP | Jumps to the given address. | Address | 0x1 |
| ADD | Adds the contents of the A and B registers and stores it at the given address. | Address | 0x2 |
| SUB | Subtracts the contents of the A register from the A register and stores it at the given address. | Address | 0x3 |
| STA | Stores the value in the A register at the given address. | Address | 0x4 |
| ATB | Copies the contents of the A register into the B register. | None | 0x5 |
| ADA | Adds the contents of the A and B registers and stores it in the A register. | None | 0x6 |
| ADB | Adds the contents of the A and B registers and stores it in the B register. | None | 0x7 |
| LDA | Copies the value from the given address to the A register. | Address | 0x8 |
| LDB | Copies the value from the given address to the B register. | Address | 0x9 |
| LIA | Immediately writes the given value to the A register. | Value | 0xA |
| LIB | Immediately writes the given value to the B register. | Value | 0xB |
| JZ | Jumps to the given address, if and only if, the Zero Flag is set. | Address | 0xC |
| JC | Jumps to the given address, if and only if, the Carry Flag is set. | Address | 0xD |
| OUT | Copies the value at the given address to the Output Register. | Address | 0xE |
| HLT | Halts the CPU clock. | None | 0xF |

## Examples
Examples can be found [here](https://chickpeaplane.github.io/8-Bit-Compiler/examples).

## License
[AGPL-3.0](LICENSE)
