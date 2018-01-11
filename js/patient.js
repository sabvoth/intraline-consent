//Encapsulates a patient as an object + business logic + file IO

function Patient(){

    this.fname = "";
    this.lname = "";
    this.id = "";
    this.dateofbirth = "";
    this.address = "";
    this.email = "";
    this.emailconsent = false
    this.tel = "";



    this.createPatient = function createPatient(formData){
        this.fname = formData.fname;
        this.lname = formData.lname;
        this.id = "";

        if(formData.dateofbirth) this.dateofbirth = formData.dateofbirth;
        if(formData.address) this.address = formData.address;
        if(formData.email) this.email = formData.email;
        this.emailconsent = formData.emailconsent;
        if(formData.tel) this.tel = formData.tel;
        // I feel dirty now...

        this.constructPatient(1);
    }

    this.constructPatient = function constructPatient(id){
        this.id = id;
        var patientTemplate = getPatientTemplate();
        patientTemplate.fname = this.fname;
        patientTemplate.lname = this.lname;
        patientTemplate.dateofbirth = this.dateofbirth;
        patientTemplate.address = this.address;
        patientTemplate.email = this.email;
        patientTemplate.emailconsent = this.emailconsent;
        patientTemplate.tel = this.tel;
        console.log(this);


        patientTemplate.id = id;
        patientTemplate.createDate = returnStandardDate(new Date());
        //should validate
        var folderName = this.lname + "-" + this.fname + "-" + id;
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Archive", function(dataDic){
            dataDic.getDirectory(folderName, { create: true, exclusive: true },
                function(dirEntry){
                    dirEntry.getFile("data.json", {create:true}, function(file) {
                        file.createWriter(function (fileWriter){
                            fileWriter.write(JSON.stringify(patientTemplate));
                            console.log("done creating patient: " + this.id);
                        });
                    });
                },
                function(e){
                    console.log(e);
                    if(e.code == 12) constructPatient(id + 1); //Recursion bbby
                }
            );
        });
    }

    this.findPatient = function findPatient(callback, fname, lname, id){

        this.fname = fname;
        this.lname = lname;
        this.id = id;

        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Archive/" + this.getFolderName(), function(dirEntry){
            dirEntry.getFile("data.json", {create:false}, function(file) {
                file.file(function(fileData){
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        console.log("Successful patient file read: " + this.result);
                        //call a function from here.
                        returnData = JSON.parse(this.result);

                        this.dateofbirth = returnData.dateofbirth;
                        this.address = returnData.address;
                        this.email = returnData.email;
                        this.emailconsent = returnData.emailconsent;
                        this.tel = returnData.tel;
                        callback(returnData);
                    };
                    reader.readAsText(fileData);
                });
            });
        });
    }

    this.getFolderName = function(){
        var returnData = "" + this.lname + "-" + this.fname + "-" + this.id;
        return returnData;
    }

    function getPatientTemplate(){
        var returnData;
        $.ajaxSetup({ async: false});

        jQuery.getJSON("./data/patient-template.json", function(data){
            returnData = data;
        });
        $.ajaxSetup({ async: true});

        return returnData;
    }

    this.addTreatment = function addTreatment(treatmentData){

        var treatment = new Treatment();
        var folderName = this.fname + "-" + this.lname + "-" + this.id;
        treatment.createTreatment(folderName, treatmentData);

    }

    //Writes this object to the file, completely overwriting the original*****
    this.writeToFile = function writeToFile(callback){
        var folderName = this.getFolderName();
        console.log("writing json over in folderName" + folderName);

        var patientTemplate = getPatientTemplate();
        patientTemplate.fname = this.fname;
        patientTemplate.lname = this.lname;
        patientTemplate.dateofbirth = this.dateofbirth;
        patientTemplate.address = this.address;
        patientTemplate.email = this.email;
        patientTemplate.emailconsent = this.emailconsent;
        patientTemplate.tel = this.tel;


        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Archive", function(dataDic){
            dataDic.getDirectory(folderName, { create: false }, function(dirEntry){
                dirEntry.getFile("data.json", {create:false}, function(file) {
                    //Open the file
                    file.createWriter(function (fileWriter){
                        fileWriter.write(JSON.stringify(patientTemplate));
                        console.log("done writing");
                        callback();
                    });
                });
            });
        });
    }


    //
    //OLD STUFF BEWAREEEEE
    //


    //Should add error handling here
    //Triggers displaying the info right aways!!!!! Part of a chain
    function getClientInfo(fname, lname, id){
        var returnData = "";

        //should validate
        var folderName = lname + "-" + fname + "-" + id;
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Archive", function(dataDic){
            dataDic.getDirectory(folderName, { create: false }, function(dirEntry){
                dirEntry.getFile("data.json", {create:false}, function(file) {
                    file.file(function(fileData){
                        var reader = new FileReader();
                        reader.onloadend = function() {
                            console.log("Successful file read: " + this);
                            displayPatient(JSON.parse(this.result));
                        };
                        reader.readAsText(fileData);
                    });
                });
            });
        });
    }





}
