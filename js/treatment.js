//Designed to handle all the functions related to treatments (both PDF and JSON data formats, and business logic)

function Treatment(){

    this.patientFolder = "";
    this.treatmentFolder = "";



    this.createTreatment = function createTreatment(patientFolder, formData){
        console.log("creating treatment");

        this.patientFolder = patientFolder;
        createTreatmentFile(patientFolder, function(res){
            console.log(res);
        });
    }

    this.getAsJSON = function getAsJSON(callback){
        if(this.patientFolder.length > 0 && this.treatmentFolder.length > 0){
            var returnData;
            $.ajaxSetup({ async: false});
            var template;

            jQuery.getJSON("./data/treatment-template.json", function(data){
                template = data;
            });

            window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Archive/" + this.patientFolder + "/Forms/" + this.treatmentFolder, function(dirEntry){
                dirEntry.getFile("treatment.json", {create:false}, function(file) {
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
            $.ajaxSetup({ async: true});
        }
        else {
            return "Folders (Patient/Treatment) are not set correctly for this treatment";
        }
    }

    this.getasPDF = function getasPDF(){
        //doesn't do anything right now
    }

    this.createPDF = function createPDF(){
        //doesn't do anyhhing right now
    }

    function createTreatmentFile(patientFolder, formData, callback){

        var returnData;
        $.ajaxSetup({ async: false});
        var template;

        jQuery.getJSON("./data/treatment-template.json", function(data){
            template = data;
        });

        template.speakToMedia = formData.speakToMedia;
        template.scientificPhotoUsage = formData.scientificPhotoUsage;
        template.mediaPhotoUsage = formData.mediaPhotoUsage;
        template.questions = formData.questions;

        //should validate
        this.treatmentFolder = returnStandardDate(new Date());
        //Requires Forms to be created before creating the treatment folder
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Archive/" + patientFolder + "/Forms", function(dataDic){
            dataDic.getDirectory(this.treatmentFolder, { create: true }, function(dirEntry){
                dirEntry.getFile("treatment.json", {create:true}, function(file) {
                    file.createWriter(function (fileWriter){
                        fileWriter.write(JSON.stringify(template));
                        console.log("writing: " + JSON.stringify(template));
                        callback(true);
                    });
                });
            });
        });

        $.ajaxSetup({ async: true});
    }

}
