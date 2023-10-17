import * as express from "express"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
import { User } from "./entity/User"
import verifyToken from "./middleware/authJwt"

AppDataSource.initialize().then(async () => {
    const app = express()
    app.use(express.json({ limit: '100mb' }))

    // Protected routes
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get(
        "/api/users/me",
        [verifyToken],
        async (req, res, next) => {
            // User profile relevant data
            const user = await AppDataSource.getRepository(User)
                .createQueryBuilder("user")
                .select(['user.firstName AS firstName', 'user.lastName AS lastName', 'user.email AS email', 'user.role AS role', 'user.active AS active'])
                .where("user.id = :id", { id: req.userId })
                .getRawOne();

            res.json(user);
        }
    );

    // Other routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next)
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)

            } else if (result !== null && result !== undefined) {
                res.json(result)
            }
        })
    })

    // start express server
    app.listen(3000)
    console.log("Express server has started on port 3000.")
}).catch(error => console.log(error))
