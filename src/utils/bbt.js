import * as faceapi from "face-api.js";

const classes = ['amy', 'bernadette', 'howard', 'leonard', 'penny', 'raj', 'sheldon', 'stuart', 'TaylorSwift']


function getFaceImageUri(className, idx) {
  return require("../assets/images/"+className+"/"+className+idx+".png"||"../assets/images/"+className+"/"+className+idx+".jpg"||"../assets/images/"+className+"/"+className+idx+".jpeg")
  //`/src/assets/images/${className}/${className}${idx}.png`
}

function renderFaceImageSelectList(selectListId, onChange, initialValue) {
  const indices = [1, 2, 3, 4, 5]
  function renderChildren(select) {
    classes.forEach(className => {
      const optgroup = document.createElement('optgroup')
      optgroup.label = className
      select.appendChild(optgroup)
      indices.forEach(imageIdx =>
        renderOption(
          optgroup,
          `${className} ${imageIdx}`,
          getFaceImageUri(className, imageIdx)
        )
      )
    })
  }

  renderSelectList(
    selectListId,
    onChange,
    getFaceImageUri(initialValue.className, initialValue.imageIdx),
    renderChildren
  )
}

// fetch first image of each class and compute their descriptors
//将每个人所属文件夹的第一张图片取出再计算他们的特征
async function createBbtFaceMatcher(numImagesForTraining = 1) {
  const maxAvailableImagesPerClass = 5
  numImagesForTraining = Math.min(numImagesForTraining, maxAvailableImagesPerClass)

  const labeledFaceDescriptors = await Promise.all(classes.map(
    async className => {
      let descriptors = []
      for (let i = 1; i < (numImagesForTraining + 1); i++) {
        const img = await faceapi.fetchImage(getFaceImageUri(className, i))
        descriptors.push(await faceapi.computeFaceDescriptor(img))
      }
      for(let j=0; j<128; j++){
        for(let i=1; i<descriptors.length; i++){
          descriptors[0][j] += descriptors[i][j]
        }
        descriptors[0][j] = descriptors[0][j] / descriptors.length
      }

      // for(let j=0; j<128; j++){
      //   let arr = []
      //   for(let i=1; i<descriptors.length; i++){
      //     arr.push(descriptors[i][j])
      //   }
      //   arr.sort((a,b)=>{return a-b})
      //   descriptors[0][j] = arr[2]
      // }

      let descriptor = []
      descriptor.push(descriptors[0])
      return new faceapi.LabeledFaceDescriptors(
        className,
        descriptor
      )
    }
  ))
  console.log(labeledFaceDescriptors)
  return new faceapi.FaceMatcher(labeledFaceDescriptors)
}

export{
  renderFaceImageSelectList as renderFaceImageSelectList,
  createBbtFaceMatcher as createBbtFaceMatcher
}