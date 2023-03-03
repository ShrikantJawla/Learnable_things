const id = window.location.search.split("id=")[1];

fetchCurrentOfferToDisplay();

async function fetchCurrentOfferToDisplay() {
  try {
    const prom = await fetch(`/offers/getSingleOffer/${id}`);
    const data = await prom.json();
    const {
      of_name,
      of_desc,
      of_sequence,
      of_active_status,
      of_logo,
      of_image_url,
      of_share_link,
      of_private_status,
    } = data.allData;
    appendDataToInputs(
      of_name,
      of_desc,
      of_sequence,
      of_active_status,
      of_image_url,
      of_logo,
      of_share_link,
      of_private_status
    );
    showPreview1OnLoad(of_image_url);
    showPreview2OnLoad(of_logo);
  } catch (error) {
    console.log(error);
    alert(error.message);
  }
}


getParameters();

function editOffer() {
  const offer_name = document.querySelector("#name").value;
  const offer_desc = document.querySelector("#desc").value;
  const offer_sequence = document.querySelector("#sequence").value;
  const offer_status = document.querySelector("#status").value;
  const share_link = document.querySelector("#share_link").value;
  const offer_img = document.querySelector("#img").files[0];
  const logo = document.querySelector("#logo").files[0];

  if (
    offer_name === "" ||
    offer_desc === "" ||
    offer_sequence === "" ||
    share_link === "" ||
    offer_status === "" ||
    offer_img === "" ||
    logo === ""
  ) {
    alert("Please fill all the fields!");
  }

  let form = new FormData();

  form.append("name", offer_name);
  form.append("desc", offer_desc);
  form.append("sequence", offer_sequence);
  form.append("status", offer_status);
  form.append("share_link", share_link);
  form.append("img", offer_img);
  form.append("logo", logo);

  fetch("/offers/updateAnyExistingOffer/"+id, {
    method: "PATCH",
    body: form,
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

function showPreview1OnLoad(src) {
  var preview = document.getElementById(`img-preview`);
  preview.src = src;
  preview.style.display = "block";
}
function showPreview2OnLoad(src) {
  var preview = document.getElementById(`logo-preview`);
  preview.src = src;
  preview.style.display = "block";
}

function appendDataToInputs(name, desc, sequence, status,logo, img,share_link) {
  const cat_name = document.querySelector("#name");
  const cat_desc = document.querySelector("#desc");
  const cat_sequence = document.querySelector("#sequence");
  const share_l = document.querySelector("#share_link");
  const cat_status = document.querySelector("#status");
  const cat_img = document.querySelector("#img").files[0];

  cat_name.value = name;
  cat_desc.value = desc;
  cat_sequence.value = sequence;
  share_l.value = share_link;
  cat_status.value = status ? "true" : "false";
}


function showPreview(event) {
  event.preventDefault();
  if (event.target.files.length > 0) {
    let src = URL.createObjectURL(event.target.files[0]);
    var preview = document.getElementById(`${event.target.id}-preview`);
    preview.src = src;
    preview.style.display = "block";
  }
}