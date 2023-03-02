const id = window.location.search.split("=")[1];

async function getAllRoles() {
  try {
    const res = await fetch("/users/usersAdminRoles");
    const {payload} = await res.json();
    const urole = document.getElementById("userAdminRolesHere");
    const rolesHTML = payload.map((ele) => {
        let rl = ele.uar_role_name;
        const optionHTML = `<option value='${ele.uar_id}'>${rl}</option>`;
        return optionHTML;
      });
      urole.innerHTML = rolesHTML;
  } catch (error) {
    console.log(error);
  }
}

getAllRoles();

async function addNewAdminUser() {
  const userName = document.getElementById("adminUserName").value;
  const uEmail = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;
  const urole = document.getElementById("userAdminRolesHere").value;
  const uactiveStatus = document.getElementById("new_active_user").checked;
  if(userName === '' || uEmail === '' || urole === '' || uactiveStatus === ''){
    return alert('Please fill all the fields!')
  }
  let data = {
    UAuserName:userName,
    UAuserEmail: uEmail,
    UApassword:password,
    UAuserRole: urole,
    UAActiveUser: uactiveStatus,
  };
  $("#loader").show();
  try {
    $.ajax({
        url: "/users/adminAddNewUser",
        type: "POST",
        data,
        success: function (result) {
          $("#loader").hide();
          document.getElementById("adminUserName").value='';
          document.getElementById("adminEmail").value='';
          document.getElementById("adminPassword").value='';
          document.getElementById("userAdminRolesHere").value='';
          document.getElementById("new_active_user").checked=false;
          alert('New user has been created!')
          console.log(result);
        },
      });
  } catch (error) {
    console.log(error);
  }
}
