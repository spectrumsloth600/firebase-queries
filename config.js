import * as  firebase from 'firebase'
require('@firebase/firestore')


const firebaseConfig = {   
    apiKey : "AIzaSyDU3ohDS-GXu6f-Ny0Rgtxag2yXU-SsVYg" ,   
authDomain : "wily-app-5111d.firebaseapp.com" 
,   projectId : "wily-app-5111d" ,   
storageBucket : "wily-app1: 5 .com " ,   
messagingSenderId : " 709641739518 " ,   
appId : " 1: 709641739518: web: fa561ffae40574f55099af " 


}; 
firebase.intializeApp(firebaseConfig);
export default firebase.firestore();


