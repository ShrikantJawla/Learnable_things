function clearPreview() {
    let preview = document.getElementById(`img-preview`);
    preview.src = '';
  }
  
  
  function showPreview(event) {
    event.preventDefault()
    if (event.target.files.length > 0) {
        let src = URL.createObjectURL(event.target.files[0])
        var preview = document.getElementById(`${event.target.id}-preview`)
        preview.src = src
        preview.style.display = "block"
    }
  }
  
  function resetFeilds(){
    document.querySelector('#name').value = '';
    document.querySelector('#desc').value = '';
    document.querySelector('#sequence').value = '';
    $("#img").val('');
    clearPreview();
  }


  function addAOffer() {
    const name = document.querySelector("#name").value;
    const desc = document.querySelector("#desc").value;
    const sequence = document.querySelector("#sequence").value;
    const status = document.querySelector("#status").value;
    const img = document.querySelector("#img").files[0];
  
    if (
      name === "" ||
      desc === "" ||
      sequence === "" ||
      status === "" ||
      img === ""
    ) {
      alert("Please fill all the fields!");
    }
  
    let form = new FormData();
  
    form.append("name", name);
    form.append("desc", desc);
    form.append("sequence", sequence);
    form.append("status", status);
    form.append("img", img);
  
    fetch("/categories/addNewCategory", {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((res) => {
        // console.log(res);
        resetFeilds()
        alert('Entry has been added successfully!')
      })
      .catch((err) => {
        console.log(err);
        alert(err.message)
      });
  }
  