// Initialize Firebase
var aqconfig = {
    apiKey: "AIzaSyBtmNzZKz4acU4mpmN6N7Sdz2phWbdk7PE",
    authDomain: "envpolicies.firebaseapp.com",
    databaseURL: "https://envpolicies.firebaseio.com",
    storageBucket: "envpolicies.appspot.com",
    messagingSenderId: "329261080997"
};

// Initialize Firebase
var asthmaconfig = {
  apiKey: "AIzaSyAWas1qOvy84hezgYro9DYGSmFF4HFLQGo",
  authDomain: "waterquality-e91ba.firebaseapp.com",
  databaseURL: "https://waterquality-e91ba.firebaseio.com",
  storageBucket: "waterquality-e91ba.appspot.com",
  messagingSenderId: "636422349623"
};
airQualityFBApp = firebase.initializeApp(aqconfig);
asthmaFBApp = firebase.initializeApp(asthmaconfig, "Second");
