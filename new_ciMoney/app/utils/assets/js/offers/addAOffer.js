function clearImgPreview() {
    let preview = document.getElementById(`img-preview`);
    preview.src = "";
  }
  function clearLogoPreview() {
    let preview = document.getElementById(`logo-preview`);
    preview.src = "";
  }
  
  function showImgPreview(event) {
    event.preventDefault();
    if (event.target.files.length > 0) {
      let src = URL.createObjectURL(event.target.files[0]);
      var preview = document.getElementById(`${event.target.id}-preview`);
      preview.src = src;
      preview.style.display = "block";
    }
  }
  function showLogoPreview(event) {
    event.preventDefault();
    if (event.target.files.length > 0) {
      let src = URL.createObjectURL(event.target.files[0]);
      var preview = document.getElementById(`${event.target.id}-preview`);
      preview.src = src;
      preview.style.display = "block";
    }
  }
  
  function resetFeilds() {
    document.querySelector("#name").value = "";
    document.querySelector("#desc").value = "";
    document.querySelector("#sequence").value = "";
    document.querySelector("#share_link").value = "";
    $("#img").val("");
    $("#logo").val("");
    clearImgPreview();
    clearLogoPreview();
  }
  
  function addAOffer() {
    const name = document.querySelector("#name").value;
    const desc = document.querySelector("#desc").value;
    const sequence = document.querySelector("#sequence").value;
    const status = document.querySelector("#status").value;
    const shareLink = document.querySelector("#share_link").value;
    const img = document.querySelector("#img").files[0];
    const logo = document.querySelector("#logo").files[0];
  
    if (
      name === "" ||
      desc === "" ||
      sequence === "" ||
      status === "" ||
      img === "" ||
      shareLink === "" ||
      logo === ""
    ) {
      alert("Please fill all the fields!");
    }
  
    let form = new FormData();
  
    form.append("name", name);
    form.append("desc", desc);
    form.append("sequence", sequence);
    form.append("status", status);
    form.append("share_link", shareLink);
    form.append("img", img);
    form.append("img", logo);
  
    fetch("/offers/addOfferByRequest", {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        resetFeilds();
        alert("Entry has been added successfully!");
      })
      .catch((err) => {
        console.log(err);
        alert(err.message);
      });
  }
  