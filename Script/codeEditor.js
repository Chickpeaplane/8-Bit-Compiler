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

// Callback to insert or remove a tab (indent or unindent)
function insert_tab(event) {
    const isShift = event.shiftKey;

    if (event.key === 'Tab') {
        event.preventDefault();  // Prevent the default Tab behavior

        // Get the current selection (cursor position)
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const cursorPosition = range.startContainer;

        if (isShift) {
            // Handle Shift+Tab (un-indent)
            const text = cursorPosition.innerText;

            // Check if there is a tab at the beginning of the line and remove it
            if (text.startsWith('\t')) {
                // Remove the leading tabs
                cursorPosition.nodeValue = text.slice(1);
                range.setStart(cursorPosition, 0);
                range.setEnd(cursorPosition, 0);
            } else {
                // No tab to remove, so don't do anything
                return;
            }
        } else {
            // Handle regular Tab (indent)
            const textNode = document.createTextNode("\t");

            // Insert a tab character at the current cursor position
            range.deleteContents();
            range.insertNode(textNode);

            // Move the cursor after the inserted tab character
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
        }

        // Update the selection to reflect the new cursor position
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// Add listeners to the codeEntry
const codeEntry = document.getElementById("codeentry");
codeEntry.addEventListener("keydown", insert_tab);
codeEntry.addEventListener("input", highlight_code);