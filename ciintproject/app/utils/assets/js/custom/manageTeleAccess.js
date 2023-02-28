$(".check_box").click(function(e){
    let str = e.target.id;

    let issuer = str.slice(0, str.indexOf('_'));
    let userId = str.substring(str.indexOf('_') + 1);;
    let isChecked = $(this).is(':checked')
    $("#loader").show();
    $.ajax({
        url: "/users/update-tele-teams",
        type: "POST",
        data: {
           issuer : issuer,
           userId : userId,
           isChecked : isChecked
        },

        success: function (result) {
            console.log("ok")
            $("#loader").hide();
        },
        error: function(error){
            $("#loader").hide();
            console.log("error")
       }
    })
    console.log(issuer, userId, isChecked)
})