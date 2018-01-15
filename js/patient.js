//Encapsulates a patient as an object + business logic + file IO

function Patient(){

    //Provided with form data object and object[] for treatments
    this.createPatient = function createPatient(formData, treatments){
        for(var x in formData){
            this[x] = formData[x];
        }

        this.constructPatient(0, treatments);

    }

    this.constructPatient = function constructPatient(id, treatments){
        this.id = id;
        var patientTemplate = getPatientTemplate();
        for(var x in patientTemplate){
            patientTemplate[x] = this[x]; //Transfer all of self's properties to the template
        }

        patientTemplate.id = id;
        patientTemplate.createDate = returnStandardDate(new Date());
        //should validate
        var folderName = this.lname + "-" + this.fname + "-" + id;
        var self = this;
        //on initial run, do things differently
        if(id == 0){
            verifyAndCreateFolder(this.lname + "-" + this.fname + "-1", function(result){
                if(result){
                    self.constructPatient(1, treatments);
                }
            })
        }
        if(id != 0){
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Archive", function(dataDic){
                dataDic.getDirectory(folderName, { create: true, exclusive:true},
                    function(dirEntry){
                        dirEntry.getFile("data.json", {create:true}, function(file) {
                            file.createWriter(function (fileWriter){
                                fileWriter.write(JSON.stringify(patientTemplate));
                                console.log("done creating patient: " + self.id);
                                verifyAndCreateFolder(folderName, function(result){
                                    if(result) {
                                        for(x in treatments) self.addTreatment(treatments[x]);
                                    }
                                });
                            });
                        });
                    },
                    function(e){
                        if(e.code == 12) self.constructPatient(id + 1, treatments); //Recursion bbby
                    }
                );
            });
        }
    }

    this.findPatient = function findPatient(callback, fname, lname, id){

        this.fname = fname;
        this.lname = lname;
        this.id = id;

        var self = this;
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/Archive/" + this.getFolderName(), function(dirEntry){
            dirEntry.getFile("data.json", {create:false}, function(file) {
                file.file(function(fileData){
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        console.log("Successful patient file read: " + this.result);
                        //call a function from here.
                        returnData = JSON.parse(this.result);
                        for(var x in returnData){
                            self[x] = returnData[x];
                        }

                        callback(self);
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
        for(var x in patientTemplate){
            patientTemplate[x] = this[x]; //Transfer all of self's properties to the template
        }

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
                            console.log("Successful file read: " + this.result);
                            displayPatient(JSON.parse(this.result));
                        };
                        reader.readAsText(fileData);
                    });
                });
            });
        });
    }





}
