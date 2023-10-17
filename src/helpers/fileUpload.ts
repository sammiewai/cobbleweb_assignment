/**
 * Converts the base64 images and locally stores them
 * 
 * @param images 
 * @returns [paths]
 */

const fs = require('fs');

const fileUpload = (images) => {
  let paths = [];
  if (images && images != "" && Array.isArray(images)) {
    images.map((val) => {
      const { file, name } = val;
      const image = file;
      const getChar = image.charAt(0);
      const fileName = name;
      const extensionMap = {
        '/': "jpg",
        'i': "png"
      };
      const extension = extensionMap[getChar]; // File extension

      // Validate the Base64 string
      if ((getChar == '/') || (getChar == 'i')) {
        const bitmap = Buffer.from(image, 'base64'); // Convert to image
        const path = `./src/uploads/${fileName}.${extension}`;
        paths.push({path: path, name: `${fileName}.${extension}`}); // Collect the paths

        // Do the upload
        fs.writeFile(path, bitmap, (err) => {
          if (err) { console.error(`Failed to uploaded the images. Error ${err}`); }
          else {
            console.log(`Successfully uploaded the image. Path: ${path}`)
          }
        })
      } else {
        console.error(`Invalid Base64 image string.`);
      }
    })

  } else {
    console.error("No images to process.");
  }

  return paths

}

export default fileUpload;