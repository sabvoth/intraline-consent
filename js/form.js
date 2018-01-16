
$(window).ready(function(){

    $(".intraline-footer").fadeIn();
    $(".intraline-section-next").on("click", function(){
        if($(this).parents(".intraline-content-consentform")){
            changeSection($(this).parents(".intraline-content-consentform").data("section") + 1)
        }
    })
    $(".intraline-section-back").on("click", function(){
        if($(this).parents(".intraline-content-consentform")){
            changeSection($(this).parents(".intraline-content-consentform").data("section") - 1)
        }
    })
    $(".intraline-content").filter(function(index){  return $(this).data("section") == 1 }).fadeIn();
    displayMedicalQuestions();
    $("input[type='date']").valueAsDate = new Date(); //defaults all the date pickers to today


    $("#leaveClientAreaPasswordSubmit").click(function(){checkClientAreaPassword();});
    $(".intraline-section-formexit").click(function(){checkClientAreaPassword();});

});


function checkClientAreaPassword(){

    var res = false;
    getSettings(function(settingsData){
        for(var x in settingsData.settings) {
            var setting = settingsData.settings[x];
            if(setting.name == "clientAreaPassword" && setting.value.length > 0){
                console.log(document.getElementById("leaveClientAreaPasswordInput").value);
                if($("#leaveClientAreaModal").hasClass("show")){
                    if(setting.value == document.getElementById("leaveClientAreaPasswordInput").value) {

                            window.plugins.nativepagetransitions.slide({
                                // the defaults for direction, duration, etc are all fine
                                "href" : "index.html",
                                "direction" : "right",
                                "duration" : 500,
                                "slowdownfactor" : 6
                            });
                    }
                }
                else $("#leaveClientAreaModal").modal("show");
            }
            else {
                window.plugins.nativepagetransitions.slide({
                    // the defaults for direction, duration, etc are all fine
                    "href" : "index.html",
                    "direction" : "right",
                    "duration" : 500,
                    "slowdownfactor" : 6
                });
            }
        }
    });
}


function displayMedicalQuestions(){
    var questions = getQuestions();

    for(var x in questions){
       var question = $(".intraline-truefalse-row-template").clone().appendTo("#intraline-medical-history");
       question.removeClass("intraline-truefalse-row-template");
       question.data("name", questions[x].name);
       question.children("div.intraline-truefalse-question").text(questions[x].text);

       if("" + questions[x].provideDetails.length > 0){
           question.find(".intraline-truefalse-expand .card-body .form-control").prop("placeholder", questions[x].provideDetails);
           question.find(".intraline-truefalse-trueoption").on("click", function(){
               $(this).parents(".intraline-truefalse-row").first().find(".intraline-truefalse-expand").collapse('show');
               $(this).parents(".intraline-truefalse-row").data("result", "true");
           })
           question.find(".intraline-truefalse-falseoption").on("click", function(){
               $(this).parents(".intraline-truefalse-row").first().find(".intraline-truefalse-expand").collapse('hide');
               $(this).parents(".intraline-truefalse-row").data("result", "false");
           })
       }
       else {
            question.find(".intraline-truefalse-trueoption").on("click", function(){
                $(this).parents(".intraline-truefalse-row").data("result", "true");
            })
            question.find(".intraline-truefalse-falseoption").on("click", function(){
                $(this).parents(".intraline-truefalse-row").data("result", "false");
            })
        }
    }

    $("#intraline-consentform-submit").click(function(){handleFormSubmit()});
}

function changeSection(sectionNum){

    $(".intraline-content-consentform").stop().fadeOut(400, function(){
        window.setTimeout(function(){$(".intraline-content-consentform[data-section=" + sectionNum + "]").fadeIn(1000);}, 500);
    });
}

$("#intraline-form-emailAddress").one("focus", function(){
    $(this).siblings(".input-group-addon").children("input[type='checkbox']").trigger('click');
})

// Called when final page of form is submitted
function handleFormSubmit(){

    // Add in the signature shit
    // In here, make a json file and save it in the appropriate folder
    // then also make PDF :(

    var treatmentResults = {
        "speakToMedia" : $("#speakToMedia input[type='radio']:checked").val(),
        "scientificPhotoUsage" : $("#scientificPhotoUsage input[type='radio']:checked").val(),
        "mediaPhotoUsage" : $("#mediaPhotoUsage input[type='radio']:checked").val(),
        "questions" : []
    }

    $("#intraline-medical-history .intraline-truefalse-row").each(function(index){
        var tempRes = "";
        var writtenAnswer = $(this).find(".intraline-truefalse-expand .card-body .form-control").val();
        console.log(writtenAnswer);
        if(("" + writtenAnswer).length > 0) {
            tempRes = writtenAnswer
        }
        else tempRes = $(this).data("result");

        var answerObject = {
            "name" : $(this).data("name"),
            "question" : $(this).find(".intraline-truefalse-question").text(),
            "val" : tempRes
        };
        if(tempRes) treatmentResults.questions.push(answerObject);
    });
    var emailconsent = "" + $("#intraline-form-basicinfo input[name='emailconsent']:checked").val();
    //should validate
    var patientData = {
        "fname" : $("#intraline-form-basicinfo input[name='fname']").val(),
        "lname" : $("#intraline-form-basicinfo input[name='lname']").val(),
        "dateofbirth" : $("#intraline-form-basicinfo input[name='dateofbirth']").val(),
        "address" : $("#intraline-form-basicinfo input[name='address']").val(),
        "email" : $("#intraline-form-basicinfo input[name='email']").val(),
        "emailconsent" : emailconsent,
        "tel" : $("#intraline-form-basicinfo input[name='tel']").val(),
    }

    var patient = new Patient();
    patient.createPatient(patientData, [treatmentResults]);

}



// Returns an array of JSON objects that contain questions
function getQuestions(){
    var returnData;
    $.ajaxSetup({ async: false});

    jQuery.getJSON("./data/medical-questions.json", function(data){
        console.log("reading " + data.questions.length + " questions" );
        returnData = data.questions;
    });
    $.ajaxSetup({ async: true});

    return returnData;
}
