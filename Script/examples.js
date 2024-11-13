// Function to force all scroll events on the element to be horizontal
function scroll_horizontally(event) {
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