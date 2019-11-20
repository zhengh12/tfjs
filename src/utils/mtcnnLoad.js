
const tf = require("@tensorflow/tfjs");

const fs = require("fs");

function readImg(path) {
    fs.readFile(path, 'binary', function (err, file) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log(file)
        }
    })
}

function loadLayersModel(fs){
    readImg("../assets/logo.png")
    //tfjs/mobilenet_v1_0.25_224/imagenet_class_names.json
    const model = tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    //const model = tf.loadLayersModel('indexeddb://my-model-1');
    //const model = tf.loadGraphModel(fs);
    console.log("hihi2")
    return model
}

export {
    loadLayersModel as loadLayersModel 
}


