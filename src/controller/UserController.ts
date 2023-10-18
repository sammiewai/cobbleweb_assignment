import 'dotenv/config'
import logger from '../helpers/logger'
import { AppDataSource } from '../data-source'
import { type NextFunction, type Request, type Response } from 'express'
import { User } from '../entity/User'
import { Photo } from '../entity/Photo'
import { Client } from '../entity/Client'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import fileUpload from '../helpers/fileUpload'
import { validate } from 'class-validator'
import { validatePassword } from '../helpers/validator'

let ttl: number = 1800

if (process.env.TOKEN_TTL !== undefined) {
  ttl = process.env.TOKEN_TTL !== '' ? parseInt(process.env.TOKEN_TTL) : ttl // Expires in 1 hour
}

export class UserController {
  /**
        * Registers a new user
        *
        * @param request
        * @param response
        * @param next
        * @returns
    */

  private readonly userRepository = AppDataSource.getRepository(User)
  private readonly clientRepository = AppDataSource.getRepository(Client)
  private readonly photoRepository = AppDataSource.getRepository(Photo)

  async save (request: Request, response: Response, next: NextFunction) {
    const { firstName, lastName, email, password, role, active, images } = request.body
    logger.info(`Register request received. Email: ${email}`)

    /**
     * Validate the password
     * We cannot use the entity check because we are encrypting the password which changes it from alphanumeric
    */
    const isValidPass = await validatePassword(password)
    if (!isValidPass) {
      logger.error(`Password verification failed for user: ${email}`)
      response.status(400); return { success: false, error: [{ message: 'Password should be between 6 and 50 characters long with at least 1 digit' }] }
    }
    logger.info(`Password validated successfully for user: ${email}. Proceeding with registration.`)

    // 0. Save the images and get the uploaded paths
    const paths = await fileUpload(images)

    // Get paths
    const photoPaths: any = []

    if (Array.isArray(paths) && paths.length > 0) {
      paths.forEach((val) => {
        photoPaths.push(val.path)
      })
    }

    logger.info(`Saving user-client details. Email: ${email}`)
    // User details
    const user: User = new User()
    user.firstName = firstName
    user.lastName = lastName
    user.email = email
    user.password = bcrypt.hashSync(password, 8) // Hash password
    user.role = role
    user.active = active

    // Client details
    const client: Client = new Client()
    client.avatar = 'https://i.pravatar.cc/200'
    client.photos = photoPaths
    client.user = user

    // Save the user-client relationship..do validation
    const validations = await validate(user, { validationError: { target: false, value: false } })
    if (validations.length > 0) {
      logger.error(`User entity failed validation. Error(s): ${JSON.stringify(validations)}`)

      // Format error
      const error = validations.map((val) => {
        return { field: val.property, error: val.constraints }
      })

      response.status(400); return { success: false, error }
    } else {
      await this.clientRepository.save(client)
    }

    // Save the photo details
    if (Array.isArray(paths) && paths.length > 0) {
      logger.info(`Saving the clients photos. Email: ${email}`)
      const photo: Photo = new Photo()

      for (const path of paths) {
        photo.name = path.name
        photo.url = path.path
        photo.user = user

        void this.photoRepository.save(photo)
      }
    }

    logger.info(`User successfully registered. Email: ${email}`)
    response.status(201); return { success: true, message: `${email} successfully registered!` }
  }

  // Login
  async login (request: Request, response: Response, next: NextFunction) {
    // 1. Check if user exists by email
    const { email, password } = request.body
    logger.info(`Login request received. Email: ${email}`)
    const user = await this.userRepository.findOne({
      where: { email }
    })

    if (user === null) {
      const errMsg = `Invalid email or user with email '${email}' does not exist.`
      logger.error(errMsg)

      response.status(403); return { success: false, message: errMsg }
    }

    // 2. Check if valid password
    const passwordIsValid: boolean = bcrypt.compareSync(
      password,
      user.password
    )

    if (!passwordIsValid) {
      const errMsg = 'Invalid password entered. Kindly check.'
      logger.error(`${errMsg} Email: test1@test.com`)

      response.status(401); return {
        success: false,
        data: {
          accessToken: null,
          message: errMsg
        }
      }
    }

    // 3. If all well, respond with access token
    const token = jwt.sign({ id: user.id },
      process.env.TOKEN_SECRET,
      {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: ttl
      })
    logger.info(`User successfully logged in. Email: ${email}`)
    return {
      success: true,
      data: {
        id: user.id,
        username: `${user.firstName} ${user.lastName}`,
        email: user.email,
        accessToken: token,
        validity: ttl
      }
    }
  }
}
