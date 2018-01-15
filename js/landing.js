
$(window).ready(function(){
    if(checkLogin()){
        changePhase("intraline-content-main");
        $(".intraline-footer").delay(200).fadeIn();
    }
    else{
        changePhase("intraline-content-login");
        login(); //This handles first time sessions, since we don't care about proper login for now
    }

    $('.intraline-checkbox-enablesettings input[type=checkbox]').change(function() {
        if (this.checked) {
            $(this).parent().siblings("input[type=text]").prop("readonly", false);
            $(this).parent().siblings("input[type=text]").prop("required", true);

        } else {
            $(this).parent().siblings("input[type=text]").prop("readonly", true);
            $(this).parent().siblings("input[type=text]").prop("required", false);
        }
    });
});

$(".intraline-hyperlink").on("click", function(){
    changePage($(this).data("href"));
});

$(".intraline-phaselink").on("click", function(){
    changePhase($(this).data("href"));
});

$('.popover-dismiss').popover({
  trigger: 'focus'
})

$("#intraline-settings-submit").click(function(){
    //submit the settings to be changed
    $("#intraline-settings input[type='text']").each(function(index){
        //Basically, try and process it if the option isn't optional OR there is a value there
        if(!($(this).parents(".intraline-settings-setting").data("setting-optional")) || $(this).val().length > 0){
            var settingName = "" + $(this).parents(".intraline-settings-setting").data("setting-name");
            console.log($(this).parents(".intraline-settings-setting").data("setting-name"));
            //Should validate!!!!!
            if(settingName.length > 0 && $(this).val().length > 0)  updateSetting(settingName, $(this).val());
            else {
                console.log("Name or value was mis-set for setting: " + settingName + " val: " + $(this).val());
            }
        }
    });

    $("#intraline-archive-patient").fadeOut(400, function(){
        $("#intraline-archive-folders").delay(200).fadeIn(1000);
    });

    changePhase($(this).data("href"));
});

$("#intraline-settings input[type='text']").on("change", function(){
    $(this).data("valueChanged", true);
})

$("#enablePassword").change(function(){
    if (!this.checked) {
        $(this).parent().siblings("input[type=text]").prop("readonly", true);
    }
});

//Additional login features can be implemented from here
function login(){

    var storage = window.localStorage;
    storage.setItem("logIn", "true") // Set to logged in
    storage.setItem("logInTime", Date.now()) // Set timestamp

    changePhase("intraline-content-main");
}



$("#intraline-patient-editform-submit").on("click", function(){
    // handle updating the client
    // also validate
    console.log("updating patient");
    var name = $("#intraline-patient-editform-submit").data("name").split('-');
    var patient = new Patient();
    patient.findPatient(function(resultPatient){
        console.log($("#intraline-patient-editform input"));

        $("#intraline-patient-editform input").filter( function(index){  return $(this).data("valueChanged") == true }).each(function(index){
            console.log($(this));
            if(patient[$(this).attr("name")].length > 0) patient[$(this).attr("name")] = $(this).val();
        });

        patient.writeToFile(function(){
            $("#intraline-archive-patient").fadeOut(400, function(){
                $("#intraline-archive-folders").delay(200).fadeIn(1000);
            });
        });
    }, name[1], name[0], name[2]);

});

$("#intraline-archive-patient input").on("change", function(){
    $(this).data("valueChanged", true);
});

function displayArchive(){
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Archive",
      function (fileSystem) {
        var reader = fileSystem.createReader();
        reader.readEntries(
          function (entries) {
              var template = $(".intraline-folder").first();
              for(x in entries) {

                  if(entries[x].isDirectory){
                      var name = entries[x].name.split('-');
                      template.clone().insertAfter(template).text(name[1] + " " + name[0]).data("name", entries[x].name).on("click", function(){triggerDisplayPatient($(this).data("name"))});
                  }
              }
              $(".intraline-folder").first().css("display", "none");

            console.log(entries);
          },
          function (e) {
            //write to log
          }
        );
      }, function (e) {
        verifyAndFixFolders(function(){console.log("done")});
      }
    );
}


function displayPatient(patient){
    console.log(patient);

    if(patient.id){
        for(var x in patient){
            $("#intraline-patient-editform input[name='" + x + "']").val(patient[x]);
        }
        $("#intraline-patient-editform-submit").data("name", patient.lname + "-" + patient.fname + "-" + patient.id);
        $("#intraline-archive-patient").delay(200).fadeIn(1000);
        console.log("finished displaying patient");
        displayPatientTreatments(patient.lname + "-" + patient.fname + "-" + patient.id);

    }
    else{
        console.log("Misconfigured patient file >:(");
    }
}
function displayPatientTreatments(folderName){

    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Archive/" + folderName + "/Forms/",
      function (fileSystem) {
        var reader = fileSystem.createReader();
        reader.readEntries(
          function (entries) {
              for(x in entries) {
                  if(entries[x].isDirectory){
                      $("#intraline-patient-editform-treatments").append("<li class='list-group-item'>"+ entries[x].name + "</>");
                  }
              }
            console.log(entries);
          }
        );
    },
    function onErr(e){
            if(e.code == 1){
                verifyAndCreateFolder("/Archive/" + folderName + "/Forms/", function(res){if(res) displayPatientTreatments(folderName)});
            }
        }
    );
}

//Provide the folder name of the patient to display
// in format lname-fname-id
function triggerDisplayPatient(folderName){
    console.log('displaying patient!' + folderName);
    var name = folderName.split('-');

    var patient = new Patient();
    patient.findPatient(displayPatient, name[1], name[0], name[2]);

    $("#intraline-archive-folders").fadeOut(600);

}

function hidePatient(){
    $("#intraline-archive-patient").fadeOut(600);
    $("#intraline-archive-folders").delay(200).fadeIn(1000);
}

function createTestPDF(name){
    createClient("Cheryl", "McCarter", 2);
}
