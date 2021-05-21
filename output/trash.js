if (document.getElementById('02_id').value == 'hard coded') {
    let node = document.getElementById('01_id');
    node.style.display = "inline";
    if (node.previousElementSibling !== null) {
        node.previousElementSibling.style.display = "inline";
    } else {
        node.nextElementSibling.style.display = "inline";
    }
    visibilityParent(node);
} else {
    let node = document.getElementById('01_id');
    node.style.display = "none";
    if (node.previousElementSibling !== null) {
        node.previousElementSibling.style.display = "none";
    } else {
        node.nextElementSibling.style.display = "none";
    }
    visibilityParent(node);
}