
// Get the current page, fade it out, then fade in the chosen one
// Href is provided as the class of the page to fade into


function changePhase(href){

    $(".intraline-content-show").fadeOut(400);

    //initial transition
    if($(".intraline-landing-logo").length > 0){
        $(".intraline-landing-logo").removeClass("intraline-landing-logo");
        $(".intraline-footer").delay(1000).fadeIn(600);
    }

    switch(href){
        //signing out
        case "intraline-content-login":
            $(".intraline-logo").addClass("intraline-landing-logo");
            $("." + href).fadeIn();
            $(".intraline-footer").fadeOut();
            break;
        case "intraline-content-archive":
            displayArchive();
            $("." + href).delay(1000).fadeIn(600);
            break;
        case "intraline-load-settings":
            getSettings(displaySettings);
            break;
        case "intraline-content-settings":
            $("." + href).delay(1000).fadeIn(600);
            break;
        default:
            $("." + href).delay(200).fadeIn(1000);
    }


    $(".intraline-content-show").removeClass("intraline-content-show");
    $("." + href).addClass("intraline-content-show");

}


function validateAppFiles(){

    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dataDic){
        dataDic.getDirectory("Config", { create: true }, function(dirEntry){
            dirEntry.getFile("settings.json", {create:false}, function(){
                //success, settings exists
            },
            function(){
                createSettingsFromTemplate();
                //settings does not exist
            });
        });
    });
}

function changePage(href){
    window.plugins.nativepagetransitions.slide({
        // the defaults for direction, duration, etc are all fine
        "href" : href
    });
}


function checkLogin(){

    var returnData = false;
    var storage = window.localStorage;

    if(storage.getItem("logIn") == "true" && Date.now() - 1800000 <= parseInt(storage.getItem("logInTime"))) {
        returnData = true;
        console.log("hotdog");

    }
    else if(storage.getItem("logIn") == "true" && Date.now() - 1800000 > parseInt(storage.getItem("logInTime"))) {
        storage.setItem("logIn", "false") // Set to logged in
    }
    return returnData;
}




function returnStandardDate(srcDate){
    var res = "" + srcDate.getDate() + "-" + (srcDate.getMonth() + 1) + "-" + srcDate.getFullYear() + "_" + srcDate.getHours() + ":" + srcDate.getMinutes();
    console.log("formatted " + srcDate + " to be " + res);
    return res;

}


// Section for "Settings.json" manipulation


function getSettingsTemplate(){
    var returnData;
    $.ajaxSetup({ async: false});

    jQuery.getJSON("./data/settings.json", function(data){
        returnData = data;
    });
    $.ajaxSetup({ async: true});

    return returnData;
}


function createSettingsFromTemplate(){

    var settings = getSettingsTemplate();
    //could update the settings right aways, but default is fine.

    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Config", function(dirEntry){
            dirEntry.getFile("settings.json", {create:true, exclusive: true}, function(file) {
                file.createWriter(function (fileWriter){
                    fileWriter.write(JSON.stringify(settings));
                    console.log("created the settings from template");
                });
            });
    });
}

function displaySettings(settingsJSON, callback){
    $("#intraline-settings-template").css("display", "block");

    $("#intraline-settings").find(".intraline-settings-setting").remove();
    for(var x in settingsJSON.settings){
        var setting = settingsJSON.settings[x];

        var curSetting = $("#intraline-settings-template").clone().removeAttr("id").insertAfter("#intraline-settings-template");
        curSetting.addClass("intraline-settings-setting");
        curSetting.data("setting-name", setting.name);
        curSetting.data("setting-optional", setting.optional);
        if(!setting.optional){
            curSetting.find(".intraline-settings-template-checkbox").parent().remove();
        }
        if(setting.value.length > 0){
            curSetting.find(".intraline-settings-template-text").val(setting.value);
            curSetting.find(".intraline-settings-template-checkbox").prop("checked", "true");
            curSetting.find(".card").parent().collapse('toggle');
        }
        curSetting.find(".intraline-settings-template-checkbox").on("change", function(){$(this).parents(".intraline-settings-setting").find(".card").parent().collapse('toggle');});
        curSetting.find(".intraline-settings-template-subheading").text(setting.descName);
        curSetting.find(".card-body").text(setting.fullDesc);
    }
    $("#intraline-settings-template").css("display", "none");
    changePhase("intraline-content-settings");
}

// Gets the phones setting page and returns it as JSON object
// *** ASYNC
function getSettings(callback){
    var returnData = "";

    //should validate
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Config", function(dirEntry){
        dirEntry.getFile("settings.json", {create:false}, function(file) {
            file.file(function(fileData){
                var reader = new FileReader();
                reader.onloadend = function() {
                    console.log("Successful file read: " + this.result);
                    //call a function from here.
                    returnData = JSON.parse(this.result);
                    callback(returnData);
                };
                reader.readAsText(fileData);
            });
        });
    });
}


function writeJSONtoSettings(settingsJSON){

    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Config", function(dataDic){
        dataDic.getFile("settings.json", {create:false}, function(file) {
            //Open the file
            file.createWriter(function (fileWriter){
                fileWriter.write(JSON.stringify(settingsJSON));
                console.log("successfully updated settings");
            });
        });
    });
}

//Should add error handling here
function updateSetting(settingName, val){
    var returnData = "";
    console.log("updating setting " + settingName + " to " + val);
    //should validate
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Config", function(dataDic){
            dataDic.getFile("settings.json", {create:false}, function(file) {
                //Open the file
                file.file(function(fileData){
                    var reader = new FileReader();

                    reader.onloadend = function() {
                        console.log("Successful file read: " + this.result);
                        var settingObject = JSON.parse(this.result);
                        for(var x in settingObject.settings){
                            if(settingObject.settings[x].name == settingName){
                                settingObject.settings[x].value = val;
                            }
                        }

                        writeJSONtoSettings(settingObject);
                    };
                    reader.readAsText(fileData);
                });
            });
    });
}
