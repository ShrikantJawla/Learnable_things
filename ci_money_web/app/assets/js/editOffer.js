const id = window.location.search.split("id=")[1];


function getParameters() {
  let urlString = window.location.href;
  let paramString = urlString.split("?")[1];
  let queryString = new URLSearchParams(paramString);
  for (let pair of queryString.entries()) {
    console.log("Key is:" + pair[0]);
    console.log("Value is:" + pair[1]);
  }
}

getParameters()

function editOffer() {
  const offer_name = document.querySelector("#offer_name").value;
  const offer_desc = document.querySelector("#offer_desc").value;
  const offer_sequence = document.querySelector("#offer_sequence").value;
  const offer_status = document.querySelector("#offer_status").value;
  const offer_img = document.querySelector("#offer_img").files[0];

  if (
    offer_name === "" ||
    offer_desc === "" ||
    offer_sequence === "" ||
    offer_status === "" ||
    offer_img === ""
  ) {
    alert("Please fill all the fields!");
  }

  let form = new FormData();

  form.append("offer_name", offer_name);
  form.append("offer_desc", offer_desc);
  form.append("offer_sequence", offer_sequence);
  form.append("offer_status", offer_status);
  form.append("offer_img", offer_img);

  fetch("/offers/upload", {
    method: "POST",
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
