import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from "typeorm"
import { Client } from "./Client";
import { Photo } from "./Photo";
@Entity()
export class User {
    // TODO: Set min values and password At least contains 1 number

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 25 })
    firstName: string

    @Column({ type: "varchar", length: 25 })
    lastName: string

    @Column({ type: "varchar", unique: true })
    email: string

    @Column({ type: "varchar", length: 100 })
    password: string

    @Column('varchar', { default: 'user' })
    role: string

    @Column('boolean', { default: true })
    active: boolean = true

    @CreateDateColumn()
    createdAt: Date

    @CreateDateColumn()
    updatedAt: Date

    @OneToOne(() => Client, (client) => client.id)
    client: Client;

    @OneToOne(() => Photo, (photo) => photo.id)
    photo: Photo;
}
