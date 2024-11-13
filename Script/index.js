// Fills the output table with the first 16 elements of the given program
function populate_table(program) {
    const tableBody = document.getElementById("outputtablebody");

    while (tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.lastChild);
    }

    for (let i = 0; i < 16; i++) {
        const tr = tableBody.insertRow();
        for (let j = 0; j < 5; j++) {
            const td = tr.insertCell();
            var text;
            if (j === 0) {
                // Address
                text = i;
                td.style.width = "5%";
            } else if (j === 1) {
                // Instruction
                text = program[i][0];
                td.style.width = "7%";
            } else if (j === 2) {
                // Argument
                text = program[i][1];
                td.style.width = "10%";
            } else if (j === 3) {
                // Hex value
                text = program[i][2];
                td.style.width = "8%";
            } else if (j === 4) {
                // Binary value
                text = program[i][3];
                td.style.width = "10%";
            }
            td.appendChild(document.createTextNode(text));
        }
    }
}

// Callback to insert a tab into the program box, instead of selecting the next element
function insert_tab(event) {
    const isShift = event.shiftKey;

    if (event.key === 'Tab') {
        // Prevent selecting the next element
        event.preventDefault();

        // Get the selectio start, end, and contents of the codeentry
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value

        // If no code is selected...
        if (start === end) {
            // ...then just insert a space...
            textarea.value = value.substring(0, start) + '\t' + value.substring(end);
            // ...and move the cursor back to where it was
            textarea.selectionStart = textarea.selectionEnd = start + 1;
            return;
        }

        // Get the selected code
        let selectedText = value.substring(start, end);
        let lines = selectedText.split(/\r?\n/);

        // Un-indent if shift is pressed, else indent
        if (isShift) {
            for (let i = 0; i < lines.length; i++) {
                // Check that it can be unindented
                if (lines[i].startsWith('\t')) {
                    // Remove the indent by slicing the string from the first character
                    lines[i] = lines[i].substring(1);
                }
            }
        } else {
            for (let i = 0; i < lines.length; i++) {
                // Add the indent
                lines[i] = '\t' + lines[i];
            }
        }

        // Rejoin the indented/unindented lines...
        selectedText = lines.join('\n');
        // ...insert it back into the textarea...
        textarea.value = value.substring(0, start) + selectedText + value.substring(end);
        // ...and replace the cursor where it should be
        textarea.selectionStart = textarea.selectionEnd = start + selectedText.length;
    }
}

// Add the callback to the textarea
const textarea = document.getElementById("codeentry");
textarea.addEventListener('keydown', insert_tab);

//
// Compiling Logic 
//

// Define the commands, as well as their values and argument types
const commands = {
    "NOP": { value: 0,  args: false, addr: false },
    "JMP": { value: 1,  args: true,  addr: true  },
    "ADD": { value: 2,  args: true,  addr: true  },
    "SUB": { value: 3,  args: true,  addr: true  },
    "STA": { value: 4,  args: true,  addr: true  },
    "ATB": { value: 5,  args: false, addr: false },
    "ADA": { value: 6,  args: false, addr: false },
    "ADB": { value: 7,  args: false, addr: false },
    "LDA": { value: 8,  args: true,  addr: true  },
    "LDB": { value: 9,  args: true,  addr: true  },
    "LIA": { value: 10, args: true,  addr: false },
    "LIB": { value: 11, args: true,  addr: false },
    "JZ":  { value: 12, args: true,  addr: true  },
    "JC":  { value: 13, args: true,  addr: true  },
    "OUT": { value: 14, args: true,  addr: true  },
    "HLT": { value: 15, args: false, addr: false }
}

// Create a list of valid syntax
const intents = ["@"]
const syntax = [...Object.keys(commands), ...intents]

// Initilise an empty compiled program
var compiled_program = Array.from({ length: 16 }, (_, i) => ["NOP", 0, "0x00", "0b00000000"])

// Helper function to show any compile errors that occured
function show_error(location, reason) {
    console.log("Error at " + location + ": " + reason)
}

// Function to take an array of strings, each being a line of the program
function compile_program(program) {
    // Reset the compile program
    compiled_program = Array.from({ length: 16 }, (_, i) => [
        'NOP',
        0,
        '0x00',
        '0b00000000',
    ]);

    // Arrays/dictionaries to store labels, variables, functions, etc.
    var labels = [];
    var variables = {};
    var functions = {};
    var variable_index = 0;
    var program_index = 0;

    // Start by finding all of the variables and functions
    for (let i = 0; i < program.length; i++) {
        let line = program[i];
        // Is it a variable or function?
        if (line.startsWith('@')) {
            let colon = line.search(/:/i);
            // Is the variable/function name followed by a colon?
            if (colon >= 0) {
                let name = line.slice(1, colon);
                // Is it already defined?
                if (!labels.includes(name)) {
                    let dotvalue = line.search(/:\s.value/i);
                    // Is it followed by a .value, indicating a variable?
                    if (dotvalue >= 0) {
                        let parts = line.split(/\s+/i);
                        // Does it have the correct number of arguments?
                        if (parts.length === 3) {
                            let value = parts[2];
                            // Is the value a number?
                            if (isFinite(value)) {
                                // Is the value within 8-bit range?
                                if (0 <= value && value < 256) {
                                    // Add it to the compiled program, labels array, etc.
                                    variables[name] = 15 - variable_index;
                                    compiled_program[15 - variable_index] = [
                                        'VAR (' + name + ')',
                                        Number(value),
                                        '0x' + Number(value).toString(16).padStart(2, 0),
                                        '0b' + Number(value).toString(2).padStart(8, 0),
                                    ];
                                    labels.push(name);
                                    variable_index++;
                                } else {
                                    show_error(i, 'Value out of range');
                                    return false;
                                }
                            } else {
                                show_error(i, 'Value is not a number');
                                return false;
                            }
                        } else {
                            show_error(i, 'Bad argument count');
                            return false;
                        }
                    // Or is it followed entirely by whitespace, indicating a function?
                    } else if (line.split(/\s+/i).length === 1) {
                        labels.push(name);
                        functions[name] = program_index;
                    } else {
                        show_error(i, 'Invalid command');
                        return false;
                    }
                } else {
                    show_error(i, 'Name already defined');
                    return false;
                }
            } else {
                show_error(i, 'Expected colon');
                return false;
            }
        } else if (line.replace(/^\s+/, '')) {
            program_index++;
        }

        // Have we run out of memory?
        if (program_index + variable_index > 16) {
            show_error('Memory out of bounds');
            return false;
        }
    }

    // Reset the program_index
    program_index = 0;

    // Then compile the actual commands
    for (var j = 0; j < program.length; j++) {
        let line = program[j];
        let stripped = line.replace(/^\s+/, '');
        // Is it an empty line?
        if (stripped) {
            // Does it start with the syntax?
            if (syntax.some(cmd => stripped.startsWith(cmd))) {
                // Does it start with a command?
                if (Object.keys(commands).some(cmd => stripped.startsWith(cmd))) {
                    let splitline = stripped.split(/\s+/i);
                    let command = commands[splitline[0]];
                    // Does the command need an argument?
                    if (command.args) {
                        // Is there exactly one argument?
                        if (splitline.length === 2) {
                            // Is the argument a number?
                            if (isFinite(splitline[1])) {
                                // Is it within 4-bit range?
                                if (0 <= splitline[1] && splitline[1] < 16) {
                                    // Add it to the compiled program
                                    compiled_program[program_index] = [
                                        splitline[0],
                                        Number(splitline[1]),
                                        (
                                            '0x' +
                                            Number((command.value << 4) + Number(splitline[1]))
                                                .toString(16)
                                                .padStart(2, 0)
                                        ).toUpperCase(),
                                        '0b' +
                                        Number((command.value << 4) + Number(splitline[1]))
                                            .toString(2)
                                            .padStart(8, 0),
                                    ];
                                } else {
                                    show_error(j, 'Value is out of range');
                                    return false;
                                }
                            // Is the argument meant to be an address instead?
                            } else if (command.addr) {
                                let label = splitline[1].slice(1);
                                // Does the address exist?
                                if (labels.includes(label)) {
                                    // Is it a variable?
                                    if (Object.keys(variables).includes(label)) {
                                        // Add it to the compiled program
                                        compiled_program[program_index] = [
                                            splitline[0],
                                            Number(variables[label]),
                                            (
                                                '0x' +
                                                Number((command.value << 4) + Number(variables[label]))
                                                    .toString(16)
                                                    .padStart(2, 0)
                                            ).toUpperCase(),
                                            '0b' +
                                            Number((command.value << 4) + Number(variables[label]))
                                                .toString(2)
                                                .padStart(8, 0),
                                        ];
                                    // Or is it a function?
                                    } else if (Object.keys(functions).includes(label)) {
                                        // Add it to the compiled program
                                        compiled_program[program_index] = [
                                            splitline[0],
                                            Number(functions[label]),
                                            (
                                                '0x' +
                                                Number((command.value << 4) + Number(functions[label]))
                                                    .toString(16)
                                                    .padStart(2, 0)
                                            ).toUpperCase(),
                                            '0b' +
                                            Number((command.value << 4) + Number(functions[label]))
                                                .toString(2)
                                                .padStart(8, 0),
                                        ];
                                    }
                                } else {
                                    show_error(j, 'Name is not defined');
                                    return false;
                                }
                            } else {
                                show_error(j, 'Value is not a number');
                                return false;
                            }
                        } else {
                            show_error(j, 'Bad argument count');
                            return false;
                        }
                    // The command does not need an argument.
                    } else {
                        // Is there exactly zero arguments?
                        if (splitline.length === 1) {
                            // Add it to the compiled program
                            compiled_program[program_index] = [
                                splitline[0],
                                0,
                                (
                                    '0x' +
                                    Number(command.value << 4)
                                        .toString(16)
                                        .padStart(2, 0)
                                ).toUpperCase(),
                                '0b' +
                                Number(command.value << 4)
                                    .toString(2)
                                    .padStart(8, 0),
                            ];
                        } else {
                            show_error(j, 'Unexpected argument');
                            return false;
                        }
                    }
                    // Increment the program_index, as we have added a new instruction
                    program_index++;
                }
            } else {
                show_error(j, 'Unkown command');
                return false;
            }
        }
    }
    // Everything compiled successfully
    return true;
}

// Callback for the compile button
function compile() {
    let program = document.getElementById("codeentry").value.split(/\r?\n/);
    let success = compile_program(program);
    // If it succeded, update the table
    if (success) {
        populate_table(compiled_program)
    }
}

// Initialise the table with the empty program
populate_table(compiled_program)