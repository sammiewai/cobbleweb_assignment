import 'dotenv/config'
import * as express from 'express'
import { type Request, type Response } from 'express'
import { AppDataSource } from './data-source'
import { Routes } from './routes'
import { User } from './entity/User'
import verifyToken from './middleware/authJwt'
import logger from './helpers/logger'

AppDataSource.initialize().then(async () => {
  const app = express()
  app.use(express.json({ limit: '100mb' }))

  // Protected routes
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    )
    next()
  })

  app.get(
    '/api/users/me',
    [verifyToken],
    async (req, res, next) => {
      // User profile relevant data
      const user = await AppDataSource.getRepository(User)
        .createQueryBuilder('user')
        .select(['user.firstName', 'user.lastName', 'user.email', 'user.role', 'user.active', 'client.avatar', 'client.photos', 'photo.name', 'photo.url'])
        .leftJoin('user.client', 'client')
        .leftJoin('user.photos', 'photo')
        .where('user.id = :id', { id: 1 })
        .getOne()

      let success: boolean = false
      if (user !== null) {
        success = true
      }
      res.json({ success, data: user })
    }
  )

  // Other routes
  Routes.forEach(route => {
    (app as any)[route.method](route.route, (req: Request, res: Response, next) => {
      const result = (new (route.controller as any)())[route.action](req, res, next)
      if (result instanceof Promise) {
        void result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)
      } else if (result !== null && result !== undefined) {
        res.json(result)
      }
    })
  })

  // start express server
  const PORT = process.env.APP_PORT
  app.listen(PORT)
  logger.info(`Server started on port ${PORT}`)
}).catch(error => { console.log(error) })
