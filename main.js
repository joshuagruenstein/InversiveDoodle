var overlay = document.getElementById('overlay');
renderMathInElement(overlay);

function openModal() {
    overlay.classList.remove("is-hidden");
}

function closeModal() {
    overlay.classList.add("is-hidden");
}

document.onkeydown = function(evt) {
    evt = evt || window.event;
    if (("key" in evt) ? (evt.key == "Escape" || evt.key == "Esc") : (evt.keyCode == 27))
        closeModal();
};
