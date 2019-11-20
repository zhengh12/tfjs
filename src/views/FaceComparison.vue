<template>
  <div class="FaceComparison" >
    <br>
    <!-- <img id="face1" src="https://dwz.cn/kXUrwcGG">
    <img id="face2" src="https://dwz.cn/Fi5mUbYK">-->
    <div style="position: relative" class="margin">
      <img class="inputImg" id="inputImg" src="" style="max-width: 800px;" />
      <canvas class="overlay" id="overlay" style="max-width: 800px;"/>
    </div>
     <!-- face_detector_selection_control -->
      <div id="face_detector_selection_control" class="row input-field" style="margin-right: 20px;">
        <select id="selectFaceDetector">
          <option value="ssd_mobilenetv1">SSD Mobilenet V1</option>
          <option value="tiny_face_detector">Tiny Face Detector</option>
          <option value="mtcnn">MTCNN</option>
        </select>
        <label>Select Face Detector</label>
      </div>
      <!-- face_detector_selection_control -->

    <!-- image_selection_control -->
      <div id="image_selection_control"></div>
        <div id="selectList"></div>
        <div class="row">
          <label for="imgUrlInput">Get image from URL:</label>
          <input id="imgUrlInput" type="text" class="bold">
        </div>
        <button
          class="waves-effect waves-light btn"
          onclick="loadImageFromUrl()"
        >
          Ok
        </button>
      <div id="image_selection_control"></div>
      <!-- image_selection_control -->

      <!-- ssd_mobilenetv1_controls -->
    <span id="ssd_mobilenetv1_controls">
      <div class="row side-by-side">
        <div class="row">
          <label for="minConfidence">Min Confidence:</label>
          <input disabled value="0.5" id="minConfidence" type="text" class="bold">
        </div>
        <button
          class="waves-effect waves-light btn"
          onclick="onDecreaseMinConfidence()"
        >
          <i class="material-icons left">-</i>
        </button>
        <button
          class="waves-effect waves-light btn"
          onclick="onIncreaseMinConfidence()"
        >
          <i class="material-icons left">+</i>
        </button>
      </div>
    </span>
    <!-- ssd_mobilenetv1_controls -->
  </div>
</template>

<style> 
.inputImg{position:absolute; left:80px;  z-index: 0; width:400px; height:400px}
.overlay{position:absolute; left:80px;  z-index: 1; width:400px; height:400px}
.div-relative{position:relative; color:#000; border:1px solid #000; width:500px; height:400px} 
.div-a{ position:absolute; left:30px; top:30px; background:#F00; width:200px; height:100px} 
/* css注释说明： 背景为红色 */ 
.div-b{ position:absolute; left:50px; top:60px; background:#FF0; width:400px; height:200px} 
/* 背景为黄色 */ 
.div-c{ position:absolute; left:80px; top:80px; background:#00F; width:300px; height:300px} 
/* DIV背景颜色为蓝色 */ 
</style>

<script>
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs"
import * as bbt from "../utils/bbt.js"
import * as imageSelectionControls from "../utils/imageSelectionControls"
import * as faceDetectionControls from "../utils/faceDetectionControls"
import * as commons from "../utils/commons"
import * as faceComparison from "../utils/faceComparison"
import * as cnntfjs from "../utils/cnntfjs"
import * as mtcnnLoad from "../utils/mtcnnLoad"
import TS1 from "../assets/images/bernadette/bernadette1.png"
import TS2 from "../assets/images/howard/howard1.png"
import jsonModel from "../assets/model/minist-2019_11_19 上午9_57_57.json"

export default {
  name: "FaceComparison",
  data() {
    return {
      // 差值
      threshold: 0.6,
      descriptors: {
        desc1: null,
        desc2: null
      },
      faceMatcher: null
    };
  },
  mounted() {
    // 同步执行避免报错
    this.init();
  },
  methods: {
    // 初始加载数据模型
    async init() {
      await cnntfjs.train()
      console.log(jsonModel)
      let model = await mtcnnLoad.loadLayersModel(jsonModel)
      model.summary()
      //model.loadWeights("https://storage.googleapis.com/tfjs-models/savedmodel/ssd_mobilenet_v1/weights_manifest.json")
      model.predict(tf.zeros([1, 224, 224, 3])).print()
      imageSelectionControls.initImageSelectionControls()
      faceDetectionControls.initFaceDetectionControls()
      // await faceapi.loadFaceDetectionModel("/models")
      // await faceapi.loadFaceLandmarkModel("/models")
      // await faceapi.loadFaceRecognitionModel("/models")
      await faceDetectionControls.changeFaceDetector('ssd_mobilenetv1')
      await faceapi.loadFaceRecognitionModel("/models")
      await faceapi.loadFaceLandmarkModel("/models")
      await this.run()
    },
    async updateResults() {
      if (!faceDetectionControls.isFaceDetectionModelLoaded()) {
        console.log("222")
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
      console.log(results)
      this.drawFaceRecognitionResults(results)
    },

    drawFaceRecognitionResults(results) {
      const canvas = $('#overlay').get(0)
      const inputImgEl = $('#inputImg').get(0)
      console.log("1111")
      console.log(canvas)
      faceapi.matchDimensions(canvas, inputImgEl)
      // resize detection and landmarks in case displayed image is smaller than
      // original size
      const resizedResults = faceapi.resizeResults(results, inputImgEl)

      //
      resizedResults.forEach(({ detection, descriptor }) => {
        const label = this.faceMatcher.findBestMatch(descriptor).toString()//找到最distance最小的对应的label
        const options = { label }
        const drawBox = new faceapi.draw.DrawBox(detection.box, options)
        drawBox.draw(canvas)
      })
    },
    // 运行对比
    async run() {
      console.log("对比识别");
      // 图片一
      const input1 = await faceapi.fetchImage(TS1);
      this.descriptors[`desc1`] = await faceapi.computeFaceDescriptor(input1);
      // 图片二
      const input2 = await faceapi.fetchImage(TS2);
      this.descriptors[`desc2`] = await faceapi.computeFaceDescriptor(input2);
      // 图片相识度
      const distance = faceapi.round(
        faceapi.euclideanDistance(
          this.descriptors.desc1,
          this.descriptors.desc2
        )
      );
      // 判断
      console.log("值越小越相似:", distance);
      if (distance > this.threshold) {
        console.log(distance, "相似度<0.6 不比配");
      }
      this.faceMatcher = await bbt.createBbtFaceMatcher(1)
      this.updateResults()
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
