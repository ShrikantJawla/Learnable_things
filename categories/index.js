let categoriesContainer = document.querySelector('.categories_container');

let cat_anchors = document.querySelectorAll('.cat_anchor');

function setActive(event) {
    if (event.target.classList.contains('cat_anchor')) {
        cat_anchors.forEach(ele => {
            if (ele.classList.contains('active')) ele.classList.remove('active');
        })
        event.target.classList.add('active');
    }
}