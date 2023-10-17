/**
 * Converts the base64 images and locally stores them
 *
 * @param images
 * @returns [paths]
 */

import logger from './logger'
const fs = require('fs')

const fileUpload = (images) => {
  logger.info('Request to upload the images received')
  const paths: any = []
  if (images && images != '' && Array.isArray(images)) {
    images.map((val) => {
      const { file, name } = val
      const image = file
      const getChar = image.charAt(0)
      const fileName = name
      const extensionMap = {
        '/': 'jpg',
        i: 'png'
      }
      const extension = extensionMap[getChar] // File extension

      // Validate the Base64 string
      if ((getChar == '/') || (getChar == 'i')) {
        const bitmap = Buffer.from(image, 'base64') // Convert to image
        const path = `./src/uploads/${fileName}.${extension}`
        paths.push({ path, name: `${fileName}.${extension}` }) // Collect the paths

        // Do the upload
        fs.writeFile(path, bitmap, (err) => {
          if (err) {
            logger.error(`Failed to uploaded the images. Error ${err}`)
          } else {
            logger.info(`Successfully uploaded the image. Path: ${path}`)
          }
        })
      } else {
        logger.error('Invalid Base64 image string passed. Kindly check.')
      }
    })
  } else {
    logger.error('No images in the request to process.')
  }

  return paths
}

export default fileUpload
