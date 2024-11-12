function tableCreate() {
    const body = document.body
    const tableBody = document.getElementById("outputtablebody")

    for (let i = 0; i < 16; i++) {
        const tr = tableBody.insertRow()
        for (let j = 0; j < 5; j++) {
            const td = tr.insertCell();
            var text;
            if (j === 0) {
                text = i;
                td.style.width = "5%"
            } else if (j === 1) {
                text = "HLT"
                td.style.width = "7%"
            } else if (j === 2) {
                text = ""
                td.style.width = "10%"
            } else if (j === 3) {
                text = "0xF0"
                td.style.width = "8%"
            } else if (j === 4) {
                text = "0b11110000"
                td.style.width = "10%"
            }
            td.appendChild(document.createTextNode(text))
        }
    }
}

function compile() {
    console.log("Compiling...");
}

tableCreate();