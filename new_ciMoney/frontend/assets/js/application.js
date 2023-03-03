


    $(document).ready(function () {
        var base_color = "rgb(230,230,230)";
        var active_color = "#009ef7";


        const d = new Date();
        let currentYear = d.getFullYear();
        let emailRegex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let pincode;
        let oldPincode;
        let step1 = false, step2 =false, step3 = false,  step4 = false;
        let phoneValid, nameValid, emailValid, dobValid, genderValid, pincodeValid, cityValid, stateValid, workValid, itrValid, companyValid, incomeValid;


        var child = 1;
        var length = $("section").length - 1;
        $("#prev").addClass("disabled");
        $("#submit").addClass("disabled");

        $("section").not("section:nth-of-type(1)").hide();
        $("section").not("section:nth-of-type(1)").css('transform', 'translateX(100px)');

        var svgWidth = length * 200 + 24;
        $("#svg_wrap").html(
            '<svg version="1.1" id="svg_form_time" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 ' +
            svgWidth +
            ' 24" xml:space="preserve"></svg>'
        );

        function makeSVG(tag, attrs) {
            var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
            for (var k in attrs) el.setAttribute(k, attrs[k]);
            return el;
        }

        for (i = 0; i < length; i++) {
            var positionX = 12 + i * 200;
            var rect = makeSVG("rect", { x: positionX, y: 9, width: 200, height: 6 });
            document.getElementById("svg_form_time").appendChild(rect);
            // <g><rect x="12" y="9" width="200" height="6"></rect></g>'
            var circle = makeSVG("circle", {
                cx: positionX,
                cy: 12,
                r: 12,
                width: positionX,
                height: 6
            });
            document.getElementById("svg_form_time").appendChild(circle);
        }

        var circle = makeSVG("circle", {
            cx: positionX + 200,
            cy: 12,
            r: 12,
            width: positionX,
            height: 6
        });
        document.getElementById("svg_form_time").appendChild(circle);

        $('#svg_form_time rect').css('fill', base_color);
        $('#svg_form_time circle').css('fill', base_color);
        $("circle:nth-of-type(1)").css("fill", active_color);


        $(".button").click(function () {
            $("#svg_form_time rect").css("fill", active_color);
            $("#svg_form_time circle").css("fill", active_color);
            var id = $(this).attr("id");
            if (id == "next") {
                $("#prev").removeClass("disabled");
                if (child >= length) {
                    $(this).addClass("disabled");
                    $('#submit').removeClass("disabled");
                }
                if (child <= length) {
                    child++;
                }
            } else if (id == "prev") {
                $("#next").removeClass("disabled");
                $('#submit').addClass("disabled");
                if (child <= 2) {
                    $(this).addClass("disabled");
                }
                if (child > 1) {
                    child--;
                }
            }
            var circle_child = child + 1;
            $("#svg_form_time rect:nth-of-type(n + " + child + ")").css(
                "fill",
                base_color
            );
            $("#svg_form_time circle:nth-of-type(n + " + circle_child + ")").css(
                "fill",
                base_color
            );
            var currentSection = $("section:nth-of-type(" + child + ")");
            currentSection.fadeIn();
            currentSection.css('transform', 'translateX(0)');
            currentSection.prevAll('section').css('transform', 'translateX(-100px)');
            currentSection.nextAll('section').css('transform', 'translateX(100px)');
            $('section').not(currentSection).hide();
        });

        $("#DOB").attr({
            "max": `${currentYear - 18}-12-31`,
            "min": `${currentYear - 100}-12-31`
        });
    
        
        // Input Number Filter
        $('#form_phone,#form_pincode,#form_income,#phone_number').on('keypress', function (event) {
            var regex = new RegExp("^[0-9]+$");
            var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
            if (!regex.test(key)) {
                event.preventDefault();
                return false;
            }});
            $('#form_name,#full_name').on('keypress', function (event) {
            var regex = new RegExp("^[a-zA-Z_ ]+$");
            var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
            if (!regex.test(key)) {
                event.preventDefault();
                return false;
            }
        });
        // CHILD 1
        $("#phone_number").keyup(function(e){
            if(e.target.value.length !== 10){
                $("#phone_number").css('border-color', 'red');
                disabledButton()
                phoneValid = false;

            }else{
                $("#phone_number").css('border-color', 'lightgrey');
                phoneValid = true;
                enableButton()
            }
        })
        $("#full_name").keyup(function(e){
            if(e.target.value === ""){
                $("#full_name").css('border-color', 'red');
                disabledButton()
                nameValid = false;
            }else{
                $("#full_name").css('border-color', 'lightgrey');
                nameValid = true;
                enableButton()
            }
        })
        $("#email").keyup(function(e){
            if(emailRegex.test(e.target.value)){
                $("#email").css('border-color', 'lightgrey');
                disabledButton()
                emailValid = true;
            }else{
                $("#email").css('border-color', 'red');
                emailValid = false;
                enableButton()
            }
        })
        $("#DOB").keyup(function(e){
            if(!e.target.value){
                $("#DOB").css('border-color', 'red');
                disabledButton()
                dobValid = false;
            }else{
                $("#DOB").css('border-color', 'lightgrey');
                dobValid = true;
                enableButton()
            }
        })
        $("#gender").change(function(e){
            if(e.target.value === ""){
                disabledButton()
              $("#gender").css('border-color', 'red');
                genderValid = false;
            }else if(e.target.value === "Male" || e.target.value === "Female"){
                $("#gender").css('border-color', 'lightgrey');
                genderValid = true;
                enableButton()
            }
        })
        // CHILD 2
        $("#pincode").keyup(function(e){
            if (e.target.value.length === 6) {
                pincode = e.target.value;
              } else {
                pincode = 0;
                $("#city").val("");
                $("#state").val("");
                pincodeValid = false;
                cityValid = false;
                stateValid = false;
                disabledButton();
                oldPincode = 0;
              }
              if (pincode != 0 && pincode != oldPincode) {
                oldPincode = pincode;
                getPincodeValue(pincode);
              }
            if(e.target.value === ""){
              $("#pincode").css('border-color', 'red');
                pincodeValid = false;
                cityValid = false;
                stateValid = false;
            }else{
                pincodeValid = true;
                enableButton()

            }
        })
        function getPincodeValue(value) {
            $.ajax({
              type: "POST",
              url: "/api/cibil-report/get-pincode-data",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              data: {
                pincode: value,
              },
              success: function (data, textStatus, jqXHR) {
                $("#city").val(data.payload.district)
                $("#state").val(data.payload.state)
                cityValid = true;
                stateValid = true;
                enableButton()
              },
              error: function (jqXHR, textStatus, errorThrown) {
                alert("Invalid Pincode");
              },
            });
          }
          
        // CHILD 3
        $("#work").change(function(e){
            if(e.target.value === ""){
              $("#work").css('border-color', 'red');
                disabledButton()
                workValid = false;
            }else{
                $("#work").css('border-color', 'lightgrey');
                workValid = true;
                enableButton()
            }
        })
        $("#itr").change(function(e){
            if(e.target.value === ""){
              $("#itr").css('border-color', 'red');
                disabledButton()
                itrValid = false;
            }else{
                $("#itr").css('border-color', 'lightgrey');
                itrValid = true;
                enableButton()
            }
        })
        $("#company").change(function(e){
            if(e.target.value === ""){
              $("#company").css('border-color', 'red');
                disabledButton()
                companyValid = false;
            }else{
                $("#company").css('border-color', 'lightgrey');
                companyValid = true;
                enableButton()
            }
        })
        $("#income").change(function(e){
            if(e.target.value === ""){
              $("#income").css('border-color', 'red');
                disabledButton()
                incomeValid = false;
            }else{
                $("#income").css('border-color', 'lightgrey');
                incomeValid = true;
                enableButton()
            }
        })
        function disabledButton(){
            $("#next").prop("disabled",true).removeClass("btn-primary").addClass("btn-grey");
        }
        function enableButton(){
            if(child === 1 && phoneValid && nameValid && dobValid && emailValid && genderValid){
                step1 = true;
                $("#next").prop("disabled",false).removeClass("btn-grey").addClass("btn-primary");
            }
            if(child === 2 && pincodeValid && cityValid && stateValid){
                step2 = true;
                $("#next").prop("disabled",false).removeClass("btn-grey").addClass("btn-primary");
            }
            if(child === 3 && workValid && itrValid && companyValid && incomeValid){
                step3 = true;
                $("#next").prop("disabled",false).removeClass("btn-grey").addClass("btn-primary");
            }
            else{
                console.log("NOT OK")
            }
        }
            
        $("#next").click(function(){
            if(child === 2 && step1 === true && step2 === false){
                $("#next").prop("disabled",true).removeClass("btn-primary").addClass("btn-grey");
            }
            if(child === 3 && step1 === true && step2 === true && step3 === false){
                $("#next").prop("disabled",true).removeClass("btn-primary").addClass("btn-grey");
            }
            if(child === 4 && step3 === true && step4 === false){
                $("#next").prop("disabled",true).removeClass("btn-primary").addClass("btn-grey");
            }
        })
        $("#prev").click(function(){
            if(child === 1 && step1 === true){
                $("#next").prop("disabled",false).removeClass("btn-grey").addClass("btn-primary");
            }
            if(child === 2 && step2 === true){
                $("#next").prop("disabled",false).removeClass("btn-grey").addClass("btn-primary");
            }
            if(child === 3 && step3 === true){
                $("#next").prop("disabled",false).removeClass("btn-grey").addClass("btn-primary");
            }
        })
            
        $("#submit").click(function(){
            window.location.reload();
        })

        
});
    