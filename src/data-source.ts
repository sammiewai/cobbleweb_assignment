import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Client } from "./entity/Client"
import { Photo } from "./entity/Photo"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "",
    database: "testorm",
    synchronize: true,
    logging: false,
    entities: [User, Client, Photo],
    migrations: [],
    subscribers: [],
})
