const id = window.location.search.split("=")[1];

const userName = document.getElementById("adminUserName");
const email = document.getElementById("adminEmail");
const role = document.getElementById("adminRole");
const activeStatus = document.getElementById("new_active_user");

const fetchExistingData = async (req, res) => {
  try {
    const res = await fetch("/admin/users/admin-get-single-user/" + id);
    const data = await res.json();
    const {
      payload: { ua_name, ua_email, ua_role, active_user },
    } = data;
    appendOldData(ua_name, ua_email, ua_role, active_user);
  } catch (error) {
    console.log(error);
  }
};

fetchExistingData();

async function appendOldData(name, email, role, activeStatus) {
  const userName = document.getElementById("adminUserName");
  const uEmail = document.getElementById("adminEmail");
  const password = document.getElementById("adminPassword");
  const urole = document.getElementById("userAdminRolesHere");
  const uactiveStatus = document.getElementById("new_active_user");
  password.value = "";
  const roles = await getAllRoles();

  const rolesHTML = roles.map((ele) => {
    let rl = ele.uar_role_name;
    const optionHTML = `<option value='${ele.uar_id}'>${rl}</option>`;
    return optionHTML;
  });

  urole.innerHTML = rolesHTML;

  userName.value = name;
  uEmail.value = email;
  urole.value = role;
  uactiveStatus.checked = activeStatus;
}

async function getAllRoles() {
  try {
    const res = await fetch("/admin/users/usersAdminRoles");
    const data = await res.json();
    return data.payload;
  } catch (error) {
    console.log(error);
  }
}

async function updateData() {
  const userName = document.getElementById("adminUserName").value;
  const uEmail = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;
  const urole = document.getElementById("userAdminRolesHere").value;
  const uactiveStatus = document.getElementById("new_active_user").checked;
  let data = {
    userName,
    email: uEmail,
    role: urole,
    activeStatus: uactiveStatus,
  };
  $("#loader").show();
  try {
    if (password !== "") {
      data.password = password;
    }
    // let res1 = await fetch("/admin/users/updateExistingAdminUser/" + id, {
    //   method: "PATCH",
    //   body: JSON.stringify(data),
    // });
    $.ajax({
      url: "/admin/users/updateExistingAdminUser/" + id,
      type: "PATCH",
      data,
      success: function (result) {
        $("#loader").hide();
        console.log(result);
      },
    });
  } catch (error) {
    console.log(error);
  }
}
