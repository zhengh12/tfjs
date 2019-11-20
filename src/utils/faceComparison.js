import * as faceDetectionControls from "../utils/faceDetectionControls"
import * as faceapi from "face-api.js";

async function updateResults(faceMatcher) {
    if (!faceDetectionControls.isFaceDetectionModelLoaded()) {
      return
    }

    const inputImgEl = $('#inputImg').get(0)
    console.log(inputImgEl)
    const options = faceDetectionControls.getFaceDetectorOptions()
    
    //提取所有面孔并计算结果
    const results = await faceapi
      .detectAllFaces(inputImgEl, options)//class DetectAllFacesTask
      .withFaceLandmarks()//class DetectAllFaceLandmarksTask
      .withFaceDescriptors()//class ComputeAllFaceDescriptorsTask

    drawFaceRecognitionResults(results,faceMatcher)
}

function drawFaceRecognitionResults(results,faceMatcher) {
    const canvas = $('#overlay').get(0)
    const inputImgEl = $('#inputImg').get(0)
    console.log(canvas)
    faceapi.matchDimensions(canvas, inputImgEl)
    // resize detection and landmarks in case displayed image is smaller than
    // original size
    const resizedResults = faceapi.resizeResults(results, inputImgEl)

    //
    resizedResults.forEach(({ detection, descriptor }) => {
      const label = faceMatcher.findBestMatch(descriptor).toString()//找到最distance最小的对应的label
      const options = { label }
      console.log(label)
      const drawBox = new faceapi.draw.DrawBox(detection.box, options)
      drawBox.draw(canvas)
    })
}

export{
    updateResults as updateResults
}