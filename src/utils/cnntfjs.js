const tf = require("@tensorflow/tfjs");
import MnistData from "./data"

function cnn() {
    const model = tf.sequential();
    model.add(tf.layers.conv2d({
      inputShape: [28, 28, 1],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
    model.add(tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense(
      {units: 10, kernelInitializer: 'varianceScaling', activation: 'softmax'}));
    return model;
  }


async function train() {
  const BATCH_SIZE = 16;
  const TRAIN_BATCHES = 10;
  const TEST_BATCH_SIZE = 100;
  const TEST_ITERATION_FREQUENCY = 5;

  const model = cnn();
  const LEARNING_RATE = 0.15;
  const optimizer = tf.train.sgd(LEARNING_RATE);
  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  let data;

  async function load() {
    data = new MnistData();
    await data.load();
  }

  async function mnist() {
    await load();
    console.log("Data loaded!");
  }

  await mnist()

  for (let i = 0; i < TRAIN_BATCHES; i++) {
    console.log("hihi2")
    const batch = data.nextTrainBatch(BATCH_SIZE);

    let testBatch;
    let validationData;
    // Every few batches test the accuracy of the mode.
    if (i % TEST_ITERATION_FREQUENCY === 0 && i > 0 ) {
      testBatch = data.nextTestBatch(TEST_BATCH_SIZE);
      validationData = [
        testBatch.xs.reshape([TEST_BATCH_SIZE, 28, 28, 1]), testBatch.labels
      ];
    }

    // The entire dataset doesn't fit into memory so we call fit repeatedly
    // with batches.
    const history = await model.fit(
        batch.xs.reshape([BATCH_SIZE, 28, 28, 1]), batch.labels,
        {batchSize: BATCH_SIZE, validationData, epochs: 1});
    for(let i=0; i<history.history.loss.length; i++){
      let loss = history.history.loss[i];
      let accuracy = history.history.acc[i];
      console.log(loss)
      console.log(accuracy)
    }
    batch.xs.dispose();
    batch.labels.dispose();
    if (testBatch != null) {
      testBatch.xs.dispose();
      testBatch.labels.dispose();
    }

    await tf.nextFrame();
  }
  let myDate = new Date()
  //await model.save('downloads://minist-'+myDate.toLocaleString().toString());
  //await model.save('indexeddb://my-model-1');
}

export{
  train as train
}