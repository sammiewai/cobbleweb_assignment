import {Column, Entity, CreateDateColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()

export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    url: string

    @Column()
    user: number

    @CreateDateColumn()
    createdAt: Date

    @CreateDateColumn()
    updatedAt: Date
}