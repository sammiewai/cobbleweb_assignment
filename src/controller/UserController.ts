import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { User } from "../entity/User"
import { Photo } from "../entity/Photo"
import { Client } from "../entity/Client"
import { secret } from "../config/authConfig"
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

const ttl = 3600; // Expires in 1 hour

export class UserController {

    private userRepository = AppDataSource.getRepository(User)
    private clientRepository = AppDataSource.getRepository(Client)
    private photoRepository = AppDataSource.getRepository(Photo)

    // Register
    async save(request: Request, response: Response, next: NextFunction) {
        const { firstName, lastName, email, password, role, active } = request.body;
        /**
         * 0. Save the user details first to get user id
         * 1. Save client photo avatar and path urls as arrays
         * 2. For each photo in the array, save the details in the photos table
         */

        // User details
        const user: User = new User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.password = bcrypt.hashSync(password, 8); // Hash password
        user.role = role;

        // Client details
        let photos: string[] = [];
        photos.push("/local/test/photo1.jpg")
        photos.push("/local/test/photo2.jpg")
        photos.push("/local/test/photo3.jpg")
        photos.push("/local/test/photo4.jpg")

        const client: Client = new Client();
        client.avatar = "https://i.pravatar.cc/200";
        client.photos = photos;
        client.user = user;

        await this.clientRepository.save(client);
        // TODO: Save photo details

        return { "message": `${email} successfully saved!` }
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
}