/**
 * Converts the base64 images and locally stores them
 *
 * @param images
 * @returns [paths]
 */

import logger from './logger'
import * as fs from 'fs'

const fileUpload = (images): any => {
  logger.info('Request to upload the images received')
  const paths: any = []
  if (images !== '' && Array.isArray(images)) {
    images.forEach((val) => {
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
      if ((getChar === '/') || (getChar === 'i')) {
        const bitmap = Buffer.from(image, 'base64') // Convert to image
        const path = `./src/uploads/${fileName}.${extension}`
        paths.push({ path, name: `${fileName}.${extension}` }) // Collect the paths

        // Do the upload
        fs.writeFile(path, bitmap, (err) => {
          if (err !== null) {
            logger.error(`Failed to uploaded the images. Error ${JSON.stringify(err)}`)
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
