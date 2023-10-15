import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { User } from "../entity/User"
import { secret } from "../config/authConfig"
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

const ttl = 3600; // Expires in 1 hour

export class UserController {

    private userRepository = AppDataSource.getRepository(User)

    // Register
    async save(request: Request, response: Response, next: NextFunction) {
        // Hash password
        const user = { ...request.body }
        user.password = bcrypt.hashSync(user.password, 8)

        const saved = this.userRepository.save(user);

        if (!saved) {
            return { "message": "An error occured while registering the user. Kindly check." }
        }

        return { "message": `${user.email} successfully saved!` }
    }

    // Login
    async login(request: Request, response: Response, next: NextFunction) {
        // 1. Check if user exists by email
        const { email, password } = request.body;
        const user = await this.userRepository.findOne({
            where: { email }
        })

        if (!user) {
            return { "message": `User with email \'${email}\' does not exist.` }
        }

        //2. Check if valid password
        var passwordIsValid = bcrypt.compareSync(
            password,
            user.password
        );

        if (!passwordIsValid) {
            return {
                accessToken: null,
                message: "Invalid Password!"
            };
        }

        // 3. If all well, respond with access token
        const token = jwt.sign({ id: user.id },
            secret,
            {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                expiresIn: ttl
            });

        return {
            id: user.id,
            username: `${user.firstName} ${user.lastName}`,
            email: user.email,
            accessToken: token,
            validity: ttl
        }
    }

    // Get client details
    async profile(request: Request, response: Response, next: NextFunction) {
        return { "message": `profile fetched` }
    }
}