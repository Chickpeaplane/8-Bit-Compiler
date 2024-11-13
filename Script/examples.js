function scroll_horizontally(event) {
  if (!event.deltaY) {
    return;
  }

  event.currentTarget.scrollLeft += event.deltaY + event.deltaX;
  event.preventDefault();
}

document.getElementById("examplegallery").addEventListener('wheel', scroll_horizontally);