import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { User } from "../entity/User"
import { secret } from "../config/authConfig"
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ttl = 86400; // Expires in 24 hours

export class UserController {

    private userRepository = AppDataSource.getRepository(User)

    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find()
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id)


        const user = await this.userRepository.findOne({
            where: { id }
        })

        if (!user) {
            return "unregistered user"
        }
        return user
    }

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

    async remove(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id)

        let userToRemove = await this.userRepository.findOneBy({ id })

        if (!userToRemove) {
            return "this user not exist"
        }

        await this.userRepository.remove(userToRemove)

        return "user has been removed"
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
            accessToken: token
        }
    }
}