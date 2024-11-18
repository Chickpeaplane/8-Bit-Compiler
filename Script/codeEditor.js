// Callback to highlight the program
function highlight_code() {
    // Get the cursor position
    const selection = window.getSelection();
    let cursorIndex = 0;

    // Calculate cursor index in plain text
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCursorRange = range.cloneRange();
        preCursorRange.selectNodeContents(codeEntry);
        preCursorRange.setEnd(range.startContainer, range.startOffset);
        cursorIndex = preCursorRange.toString().length;
    }

    // Get and highlight the text in the editor
    let code = codeEntry.innerText;

    // Add the relevant spans
    code = code.replaceAll(/;.*(\r\n|\r|\n|$)/g, `<span class="comment">$&</span>`);
    code = code.replaceAll(/\b\d+\b/g, `<span class="number">$&</span>`);

    Object.keys(commands).forEach(keyword => {
        const keywordRegex = new RegExp(`\\b${keyword}\\b`, "g");
        code = code.replaceAll(keywordRegex, `<span class="keyword">${keyword}</span>`);
    });

    code = code.replaceAll(/@[A-Za-z0-9]+/g, `<span class="pointer">$&</span>`);
    code = code.replaceAll(/\.value/g, `<span class="keyword">$&</span>`);

    // Set the inner HTML
    codeEntry.innerHTML = code;

    // Get all text nodes in the code editor
    const textNodes = [];
    // Helper function to recursively collect all text nodes
    function getTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            textNodes.push(node); 
        } else {
            node.childNodes.forEach(getTextNodes);
        }
    }
    getTextNodes(codeEntry);

    // Calculate the remaining index in the text where the cursor was before highlighting
    let remainingIndex = cursorIndex;
    let targetNode = null;
    let targetOffset = 0;

    // Loop through the text nodes to find the one corresponding to the original cursor position
    for (const node of textNodes) {
        if (remainingIndex <= node.length) {
            targetNode = node;
            targetOffset = remainingIndex;
            break;
        } else {
            remainingIndex -= node.length;
        }
    }

    // If we found the target node
    if (targetNode) {
        // Create a new range to set the cursor position
        const newRange = document.createRange();
        newRange.setStart(targetNode, targetOffset);
        newRange.collapse(true);

        // Clear the current selection and set the new range
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
}

// Save to code to localStorage for persistance between sessions
function cache_code() {
    localStorage.setItem("program", codeEntry.innerText);
}

// Load the code from localStorage for persistance between sessions
function load_code() {
    codeEntry.innerText = localStorage.getItem("program");
    highlight_code();
}

// Callback to insert a tab or newline
function insert_special(event) {
    const isShift = event.shiftKey;

    // For indent / unindent
    if (event.key === "Tab") {
        // Stop the default action
        event.preventDefault();

        // Get the current cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const cursorPosition = range.startContainer;

        // Are we unindenting?
        if (isShift) {
            const text = cursorPosition.innerText;

            // Is there a tab to unindent?
            if (text.startsWith("\t")) {
                // Remove it
                cursorPosition.nodeValue = text.slice(1);
                range.setStart(cursorPosition, 0);
                range.setEnd(cursorPosition, 0);
            } else {
                // Nothing to unindent
                return;
            }
        } else {
            // Insert a tab
            const textNode = document.createTextNode("\t");

            // Move the cursor back to where it was
            range.deleteContents();
            range.insertNode(textNode);

            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
        }

        selection.removeAllRanges();
        selection.addRange(range);

    } else if (event.key === "Enter") {
        event.preventDefault()
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        const textNode = document.createTextNode("\n");

        range.deleteContents();
        range.insertNode(textNode);

        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
    }
}

// Add listeners to the codeEntry
const codeEntry = document.getElementById("codeentry");
codeEntry.addEventListener("keydown", insert_special);
codeEntry.addEventListener("input", highlight_code);
codeEntry.addEventListener("input", cache_code);
load_code();