import React from 'react';
import { Text,View,TouchableOpactiy,TextInput,Image,StyleSheet,TouchableOpacity,KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';s
import db from '../config'
import * as Permissions from 'expo-permissions';

export default class TransactionScreen extends React.Component {
    constructor(){
        super();
        this.state={
            hasCameraPermissions: null,
            scanned: false,
            scannedBookId:'',
            scannedStudentId:'',
            buttonState:'normal',
        transactionMessage:'',
        }
    }
    getCameraPermissions = async(id)=>{
        const{status}=await Permissions.askAsync(Permission.CAMERA);
        
        this.setState({
            hasCameraPermissions:status ==='granted',
            buttonState:id,
            scanned:false
        });
    }
    handleBarCodeScanned= async({type,data})=>{
        const {buttonState} = this.state

        if(buttonState==="BookId"){
        this.setState({
            scanned:true,
            scannedData:data,
            buttonState:'normal'
        });
    }
    else if(buttonState==="StudentId"){
        this.setState({
            scanned:true,
            scannedStudentId:data,
            buttonState:'normal'
        });

    }

}
initiateBookIssue=async()=>{
  db.collection("transactions").add({
    'studentId':this.state.scannedStudentId,
    'bookId':this.state.scannedBookId,
    'date':firebase.firestore.Timestamp.now().toDate(),
    'transactionType':"Issue"
    
  })
  db.collection("books").doc(this.state.scannedBookId).update({
    'bookAvailability':false
  })
  db.collection("students").doc(this.state.scannedStudentId).update({
    'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
  })

  
}
initiateBookReturn=async()=>{
  db.collection("transactions").add({
    'studentId':this.state.scannedStudentId,
    'bookId':this.state.scannedBookId,
    'date':firebase.firestore.Timestamp.now().toDate(),
    'transactionType':"return"
  })
  db.collection("books").doc(this.state.scannedBookId).update({
    'bookAvailability':true
  })
  db.collection("students").doc(this.state.scannedStudentId).update({
    'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
  })

  
}
  checkStudentEligibilityForBookIssue = async () => {
    const studentRef = await db
    .collection("students")
    .where("studentId", "==", this.state.scannedStudentId)
    .get();
    var isStudenteligible = "";
    if(studentRef.docs.length == 0) {
      this.setState({
        scannedStudentId:"",
        scannedBookId:"",
      });
      isStudentEligible = false;
      Alert.alert("The student id doesn't exist in the database! ");

    }else { 
      isStudentEligible = false;
      Alert.alert("The student has already issued 2 books!")
      this.setState({
        scannedStudentId:"",
        scannedBookId:"",
      });
    }
  });
  }
  return isStudentEligible; 

};
checkStudentEligibilityForReturn = async () => {
  const transactionRef = await db
  .collection("transactions")
  .where("bookId", "==", this.state.scannedBookId)
  .limit(1)
  .get();
  var isStudentEligible = "";
  transactionRef.docs.map(doc => {
    var lastBookTransaction = doc.data();
    if (lastBookTransaction.studentId === this.state.scannedStudentId){
    isStudentEligible = true;
    
  
  } else {
    isStudentEligible = false; 
    Alert.alert("the book wans't issued by this student");
    this.setState({
      scannedStudentId:"",
      scannedBookId:""
    })
  }

}
});
return isStudentEligible
handleTransaction= async () => {
  var transactionType = await this.checkBookEligibility();
  
  
  if (!transactioinType) {
    Alert.alert("The book doesn't exist in the library database!")
    this.setState({
      scannedStudentId: "",
      scannedBookId: ""
    });
  } 
  else if (transactionType === "Issue"){ 
    var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
    if (isStudentEligible){
      this.initiateBookIssue();
      Alert.alert("Book issued to student");
    } 
   } else {
     var isStudentEligible = await this.checkStudentEligibilityForReturn();
     if (isStudentEligible){
       this.initiateBookReturn();
       Alert.alert("The book will be returned to the library")
     }
   } 
  

  

}
    render(){
        
const hasCameraPermissions=this.state.hasCameraPermissions;
const scanned =this.state.scanned;
const buttonState = this.state.buttonState;

            if(buttonState !== "normal" && hasCameraPermissions){
                return(
                    <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined:this.handleBarCodeScanned}
                    style = {StyleSheet.absolouteFinObject}
                    />
                );

            }
            else if (buttonState === "normal"){
                return(

                   <KeyboardAvoidingView style={styles.container}behaviour="padding" enabled>

                    <View>
                        <Image 
                        source={require("../assests/booklogo.jpg")}
                        style={{width:200,height:200}}/>
                        <Text style={{textAlign:'center', fontSize:30}}>WILY</Text>
                        
                        </View>
                        <View style={styles.inputView}>
                            <TextInput
                            style={styles.inputBox}
                            placeholder="Book Id"
                            onChangeText={text=>this.setState({scannedBookId:text})}
                            value={this.state.scannedBookId}/>
                            <TouchableOpacity
                            style={styles.scanButton}
                            onPress={()=>{
                                this.getCameraPermissions("BookId")

                            }}>
                            <Text style={styles.buttonText}>SCAN</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text=>this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpactiy style={styles.submitbutton}
            onPress={async()=>{
              var transactionMessage=await this.handleTransaction()
              this.setState({
                scannedBookId:'',
                scannedStudentId:''
              })
            }}
            >
              <Text style={styles.submitbuttonText}>SUBMIT</Text>
              

            
              
            </TouchableOpactiy>



            </KeyboardAvoidingView>
                        
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitbutton:{
      backroundColor: 'green',
      width: 100,
      height:50
    },
    submitbuttonText:{
      color:'red',
      textalign:'center',
      fontsize:20,
      padding: 10

    }
  });         