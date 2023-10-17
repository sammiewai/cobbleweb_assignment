import logger from '../helpers/logger'
import { AppDataSource } from '../data-source'
import { type NextFunction, type Request, type Response } from 'express'
import { User } from '../entity/User'
import { Photo } from '../entity/Photo'
import { Client } from '../entity/Client'
import { secret } from '../config/authConfig'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import fileUpload from '../helpers/fileUpload'

const ttl = 3600 // Expires in 1 hour

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

    // Save the user-client relationship
    await this.clientRepository.save(client)

    // Save the photo details
    if (Array.isArray(paths) && paths.length > 0) {
      logger.info(`Saving the clients photos. Email: ${email}`)
      const photo: Photo = new Photo()

      for (const path of paths) {
        photo.name = path.name
        photo.url = path.path
        photo.user = user

        this.photoRepository.save(photo)
      }
    }

    logger.info(`User successfully registered. Email: ${email}`)
    return { message: `${email} successfully saved!` }
  }

  // Login
  async login (request: Request, response: Response, next: NextFunction) {
    // 1. Check if user exists by email
    const { email, password } = request.body
    logger.info(`Login request received. Email: ${email}`)
    const user = await this.userRepository.findOne({
      where: { email }
    })

    if (!user) {
      const errMsg = `User with email \'${email}\' does not exist.`
      logger.error(errMsg)
      return { message: errMsg }
    }

    // 2. Check if valid password
    const passwordIsValid = bcrypt.compareSync(
      password,
      user.password
    )

    if (!passwordIsValid) {
      const errMsg = `Invalid password for email \'${email}\'`
      logger.error(errMsg)
      return {
        accessToken: null,
        message: errMsg
      }
    }

    // 3. If all well, respond with access token
    const token = jwt.sign({ id: user.id },
      secret,
      {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: ttl
      })
    logger.info(`User successfully logged in. Email: ${email}`)
    return {
      id: user.id,
      username: `${user.firstName} ${user.lastName}`,
      email: user.email,
      accessToken: token,
      validity: ttl
    }
  }
}
