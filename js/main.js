
var AsthmaDB = asthmaFBApp.database();
var AsthmaRef = AsthmaDB.ref();


var AQdatabase = airQualityFBApp.database(); //PM25 db
var ref = AQdatabase.ref();


InitializePicker(1999, 2011,"#datepicker");
InitializeMap(ref);

InitializePicker(1999, 2011,"#asthma-datepicker");
InitializeStateMap(AsthmaRef);
