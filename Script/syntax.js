// Define the commands, as well as their values and argument types
const commands = {
    "NOP": { value: 0, args: false, addr: false },
    "JMP": { value: 1, args: true, addr: true },
    "ADD": { value: 2, args: true, addr: true },
    "SUB": { value: 3, args: true, addr: true },
    "STA": { value: 4, args: true, addr: true },
    "ATB": { value: 5, args: false, addr: false },
    "ADA": { value: 6, args: false, addr: false },
    "ADB": { value: 7, args: false, addr: false },
    "LDA": { value: 8, args: true, addr: true },
    "LDB": { value: 9, args: true, addr: true },
    "LIA": { value: 10, args: true, addr: false },
    "LIB": { value: 11, args: true, addr: false },
    "JZ": { value: 12, args: true, addr: true },
    "JC": { value: 13, args: true, addr: true },
    "OUT": { value: 14, args: true, addr: true },
    "HLT": { value: 15, args: false, addr: false }
};

// Create a list of valid syntax
const intents = ["@"];
const syntax = [...Object.keys(commands), ...intents];