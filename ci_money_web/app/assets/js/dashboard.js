let crausel = document.querySelector(".second_offers_crausel");
let model = document.querySelector('text_copied_model');

let demoArr = new Array(12).fill(0);

for (let i = 0; i < demoArr.length; i++) {
  let div = document.createElement("div");
  div.setAttribute("class", "card");

  div.innerHTML = `<img src="/app/assets/images/card-insider-logo.png" class="card-img-top" alt="..." />
  <div class="card_content">
    <p class="earning_badge">You Earn</p>
    <p class="card-text">Upto 5% off</p>
  </div>
  <div class="card_footer">
    <div
      class="btn_group btn rounded-pill d-flex flex-row justify-content-center align-items-center gap-2"
    >
      <i class="fa-brands fa-whatsapp"></i>
      <div class="text-uppercase">Share now</div>
    </div>
    <div
      class="btn_group btn btn-outline rounded-pill d-flex flex-row justify-content-center align-items-center gap-2 copy_link_btn"
    >
    <!-- Pass text as arguement to copy on click -->
      <div class="text-uppercase" onclick="copyTextOnClick('Text to copy')">Copy link</div>
    </div>
  </div>`;
  crausel.appendChild(div);
}

function copyTextOnClick(textToCopy) {
  console.log("hello");
  navigator.clipboard.writeText(textToCopy);
  alert("text has been copied to clipboard");
}

$(".crausel_container").slick({
  dots: true,
  infinite: true,
  speed: 300,
  slidesToShow: 3,
  slidesToScroll: 3,
  autoplay: true,
  autoplaySpeed: 2000,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
});

let categoriesContainer = document.querySelector('.categories_container');

let cat_anchors = document.querySelectorAll('.cat_anchor');

const setActive=(event) =>{
    if (event.target.classList.contains('cat_anchor')) {
        cat_anchors.forEach(ele => {
            if (ele.classList.contains('active')) ele.classList.remove('active');
        })
        event.target.classList.add('active');
    }
}

