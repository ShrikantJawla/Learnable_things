const id = window.location.search.split("id=")[1];

fetchCurrentCategoryToDisplay();

async function fetchCurrentCategoryToDisplay() {
  try {
    const prom = await fetch(`/categories/getSingleCategory/${id}`);
    const data = await prom.json();
    const { cat_name, cat_desc, cat_sequence, cat_status, cat_img } =
      data.allData;
    appendDataToInputs(cat_name, cat_desc, cat_sequence, cat_status, cat_img);
    showPreviewOnLoad(cat_img);
  } catch (error) {
    console.log(error);
    alert(error.message);
  }
}

function editOffer() {
  const name = document.querySelector("#name").value;
  const desc = document.querySelector("#desc").value;
  const sequence = document.querySelector("#sequence").value;
  const status = document.querySelector("#status").value;
  const img = document.querySelector("#img").files[0];

  if (name === "" || desc === "" || sequence === "" || status === "") {
    alert("Please fill all the fields!");
  }

  let form = new FormData();

  form.append("name", name);
  form.append("desc", desc);
  form.append("sequence", sequence);
  form.append("status", status);
  if (document.querySelector("#img").files.length) {
    form.append("img", img);
  }

  fetch("/categories/editExistingCategory/" + id, {
    method: "PATCH",
    body: form,
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      alert('Entry has been updated!')
    })
    .catch((err) => {
      console.log(err);
    });
}

function appendDataToInputs(name, desc, sequence, status, img) {
  const cat_name = document.querySelector("#name");
  const cat_desc = document.querySelector("#desc");
  const cat_sequence = document.querySelector("#sequence");
  const cat_status = document.querySelector("#status");
  const cat_img = document.querySelector("#img").files[0];

  cat_name.value = name;
  cat_desc.value = desc;
  cat_sequence.value = sequence;
  cat_status.value = status ? "true" : "false";
}

function showPreviewOnLoad(src) {
  var preview = document.getElementById(`img-preview`);
  preview.src = src;
  preview.style.display = "block";
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
