import * as commons from "./commons"
import * as faceapi from "face-api.js";
import * as faceComparison from "./faceComparison"

async function onSelectedImageChanged(uri) {
  const img = await faceapi.fetchImage(require("../assets/images/"+uri))
  $(`#inputImg`).get(0).src = img.src
  faceComparison.updateResults()
}

async function loadImageFromUrl(url) {
  const img = await requestExternalImage($('#imgUrlInput').val())
  $('#inputImg').get(0).src = img.src
  faceComparison.updateResults()
}

function renderImageSelectList(selectListId, onChange, initialValue, withFaceExpressionImages) {
  let images = [1, 2, 3, 4, 5].map(idx => `bbt${idx}.jpg`)
  if (withFaceExpressionImages) {
    images = [
      'happy.jpg',
      'sad.jpg',
      'angry.jpg',
      'disgusted.jpg',
      'surprised.jpg',
      'fearful.jpg',
      'neutral.jpg'
    ].concat(images)
  }

  function renderChildren(select) {
    images.forEach(imageName =>
      commons.renderOption(
        select,
        imageName,
        imageName
      )
    )
  }
  
  commons.renderSelectList(
    selectListId,
    onChange,
    initialValue,
    renderChildren
  )
}

function initImageSelectionControls(initialValue = 'bbt1.jpg', withFaceExpressionImages = false) {
  renderImageSelectList(
    '#selectList',
    async (uri) => {
      await onSelectedImageChanged(uri)
    },
    initialValue,
    withFaceExpressionImages
  )
  onSelectedImageChanged($('#selectList select').val())
}

export{
  initImageSelectionControls as initImageSelectionControls
}