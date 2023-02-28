const id = window.location.search.split("=")[1];

const userName = document.getElementById("adminUserName");
const email = document.getElementById("adminEmail");
const role = document.getElementById("adminRole");
const activeStatus = document.getElementById("new_active_user");

const fetchExistingData = async (req, res) => {
  try {
    const res = await fetch("/users/admin-get-single-user/" + id);
    const data = await res.json();
    const {
      payload: { ua_name, ua_email, ua_role, active_user },
    } = data;
    console.log(ua_name, ua_email, ua_role, active_user)
    appendOldData(ua_name, ua_email, ua_role, active_user);
  } catch (error) {
    console.log(error);
  }
};

fetchExistingData();

function appendOldData(name, email, role, activeStatus) {
  const userName = document.getElementById("adminUserName");
  const uEmail = document.getElementById("adminEmail");
//   const urole = document.getElementById("adminRole");
  const uactiveStatus = document.getElementById("new_active_user");

  userName.value = name;
  uEmail.value = email;
//   urole.value = role;
  uactiveStatus.checked = activeStatus;
}



async function getAllRoles(){
    try {
        const data = await fetch('/users/usersAdminRoles');
        const 
    } catch (error) {
        console.log(error)
    }
}