function populate_table(program) {
    console.log(program)
    const tableBody = document.getElementById("outputtablebody")

    while (tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.lastChild);
    }

    for (let i = 0; i < 16; i++) {
        const tr = tableBody.insertRow()
        for (let j = 0; j < 5; j++) {
            const td = tr.insertCell()
            var text
            if (j === 0) {
                text = i
                td.style.width = "5%"
            } else if (j === 1) {
                text = program[i][0]
                td.style.width = "7%"
            } else if (j === 2) {
                text = program[i][1]
                td.style.width = "10%"
            } else if (j === 3) {
                text = program[i][2]
                td.style.width = "8%"
            } else if (j === 4) {
                text = program[i][3]
                td.style.width = "10%"
            }
            td.appendChild(document.createTextNode(text))
        }
    }
}

function insert_tab(event) {
    const isShift = event.shiftKey;

    if (event.key === 'Tab') {
        event.preventDefault();

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value

        if (start === end) {
            textarea.value = value.substring(0, start) + '\t' + value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 1;
            return;
        }

        let selectedText = value.substring(start, end);
        let lines = selectedText.split(/\r?\n/);

        if (isShift) {
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('\t')) {
                    lines[i] = lines[i].substring(1);  // Remove the tab
                }
            }
        } else {
            for (let i = 0; i < lines.length; i++) {
                lines[i] = '\t' + lines[i];
            }
        }

        selectedText = lines.join('\n');
        textarea.value = value.substring(0, start) + selectedText + value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + selectedText.length;
    }
}

const textarea = document.getElementById("codeentry");
textarea.addEventListener('keydown', insert_tab);


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

const intents = ["@"]
const syntax = [...Object.keys(commands), ...intents]

var compiled_program = Array.from({ length: 16 }, (_, i) => ["NOP", 0, "0x00", "0b00000000"])

function show_error(location, reason) {
    console.log("Error at " + location + ": " + reason)
}

function compile_program(program) {
    compiled_program = Array.from({ length: 16 }, (_, i) => [
        'NOP',
        0,
        '0x00',
        '0b00000000',
    ]);
    var labels = [];
    var variables = {};
    var functions = {};
    var variable_index = 0;
    var program_index = 0;

    for (let i = 0; i < program.length; i++) {
        let line = program[i];
        if (line.startsWith('@')) {
            let colon = line.search(/:/i);
            if (colon >= 0) {
                let name = line.slice(1, colon);
                if (!labels.includes(name)) {
                    let dotvalue = line.search(/:\s.value/i);
                    if (dotvalue >= 0) {
                        let parts = line.split(/\s+/i);
                        if (parts.length === 3) {
                            let value = parts[2];
                            if (isFinite(value)) {
                                if (0 <= value && value < 256) {
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
        if (program_index + variable_index > 16) {
            show_error('Memory out of bounds');
            return false;
        }
    }

    program_index = 0;
    for (var j = 0; j < program.length; j++) {
        let line = program[j];
        let stripped = line.replace(/^\s+/, '');
        if (stripped) {
            if (syntax.some(cmd => stripped.startsWith(cmd))) {
                if (Object.keys(commands).some(cmd => stripped.startsWith(cmd))) {
                    let splitline = stripped.split(/\s+/i);
                    let command = commands[splitline[0]];
                    if (command.args) {
                        if (splitline.length === 2) {
                            if (isFinite(splitline[1])) {
                                if (0 <= splitline[1] && splitline[1] < 16) {
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
                            } else if (command.addr) {
                                let label = splitline[1].slice(1);
                                if (labels.includes(label)) {
                                    if (Object.keys(variables).includes(label)) {
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
                                    } else if (Object.keys(functions).includes(label)) {
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
                    } else {
                        if (splitline.length === 1) {
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
                    program_index++;
                }
            } else {
                show_error(j, 'Unkown command');
                return false;
            }
        }
    }
    return true;
}

function compile() {
    console.log("Compiling...")
    console.log(document.getElementById("codeentry").value)
    let program = document.getElementById("codeentry").value.split(/\r?\n/);
    let success = compile_program(program);
    if (success) {
        populate_table(compiled_program)
    }
}

populate_table(compiled_program)