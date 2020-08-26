import * as React from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { fetch } from '@tensorflow/tfjs-react-native';
import * as jpeg from 'jpeg-js';
import { Camera } from 'expo-camera';

const instructions = Platform.select({
  ios: `Press Cmd+R to reload,\nCmd+D or shake for dev menu`,
  android: `Double tap R on your keyboard to reload,\nShake or press menu button for dev menu`,
});



export default function App() {

 //camera
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  //to use to transfer output text outside functions
  const [displayText, setDisplayText] = useState("loading...");

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }



//with async functions await keywords are permitted
 async function getImageGuess(url){
    //setDisplay("Loading Tensor Flow");
    await tf.ready();
    //setDisplay("Loading Mobile Net");

    //loads the model to classify images
    const model = await mobilenet.load();
    //fetch the image into binary

    //const image = require(url);
    const imageAssetPath = Image.resolveAssetSource(url);
    const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });



    //const response = await fetch(url, {}, {isBinary:true});
    //buffer of image
    const imageData = await response.arrayBuffer();
    //tensor of image
    const imageToTensor = imageToTensorValue(imageData);

    //pass it to model
    const predict = await model.classify(imageToTensor);

    //use react camera and input jpeg straight into url

    setDisplayText(JSON.stringify(predict));
 }
 //pass to neural network (bytes in image to RGB to vector matrix)
 function imageToTensorValue(imageData){
  //returns as Unit8Array
    const {width, height, data} = jepg.decode(rawData, true);

    //taking out RGB values out of data 
    const buffer = new Unit8Array(width*height*3);
    let offset = 0;
    for(let i = 0; i < buffer.length; i+=3){
      buffer[i] = data[offset]; //red
      buffer[i+1] = data[offset+1]; //green
      buffer[i+2] = data[offset+2];//blue 
      offset += 4; //skip alpha value
    }
    return tf.tensor3d(buffer, [height,width, 3]);
 }

  return (


    <View style={styles.container}>
      <Text style={styles.welcome}>Classify object Application Using Tensorflow</Text>
      
      
      <Camera style={{ flex: 1 }} type={type}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#000000',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: 'flex-end',
              alignItems: 'center',
            }}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Text style={{ fontSize: 18, marginBottom: 10, color: 'black' }}> Flip </Text>
          </TouchableOpacity>
        </View>
      </Camera>
      
      <Button title="Classify Image" onPress={()=>getImageGuess("./home/user/Downloads/index.jpeg")}></Button>
      <Text style>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
