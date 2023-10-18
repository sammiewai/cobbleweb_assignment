import { secret } from '../config/authConfig'
import * as jwt from 'jsonwebtoken'
import logger from '../helpers/logger'

/**
 * Verifies the JWT
 * @param req
 * @param res
 * @param next
 * @returns
 */
const verifyToken = (req, res, next) => {
  const token: string = req.headers['x-access-token']

  if (token === '') {
    const errMsg = 'No token provided. Kindly check.'

    logger.error(errMsg)
    return res.status(403).send({
      message: errMsg
    })
  }

  jwt.verify(token,
    secret,
    (err, decoded) => {
      if (err) {
        const msg: string = err?.message || 'Unauthorized'
        logger.error(msg)
        return res.status(401).send({
          success: false,
          error: msg
        })
      }
      logger.info('Request successfully validated')
      req.userId = decoded.id
      next()
    })
}

export default verifyToken
