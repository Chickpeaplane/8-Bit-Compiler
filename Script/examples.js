// Function to force all scroll events on the element to be horizontal
function scroll_horizontally(event) {
    // Is not it over the example gallery?
    if (event.target.getAttribute("class") != "exampleblock" && event.target.getAttribute("class") != "exampleheader" && event.target.getAttribute("class") != "examplecontent") {
        return;
    }
    // There is already no vertical motion
    if (!event.deltaY) {
        return;
    }

    // Scroll left by the sum of the horizontal and vetical
    event.currentTarget.scrollLeft += event.deltaY + event.deltaX;
    // Prevent actual vertical scrolling
    event.preventDefault();
}

// Add the callback onto the examplegallery
document.getElementById("examplegallery").addEventListener('wheel', scroll_horizontally);

// Callback to highlight the program
function highlight_code(div) {
    // Get and highlight the text in the editor
    let code = div.innerText;

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
    div.innerHTML = code;
}

let codeBoxes = document.getElementsByClassName("codeBox");
for (let i = 0; i < codeBoxes.length; i++) {
    highlight_code(codeBoxes[i]);
}