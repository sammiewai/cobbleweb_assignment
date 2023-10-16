import { Column, Entity, CreateDateColumn, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";
@Entity()

export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    url: string

    @CreateDateColumn()
    createdAt: Date

    @CreateDateColumn()
    updatedAt: Date

    @OneToOne(() => User, (user) => user.id, { cascade: true })
    @JoinColumn()
    user: User;
}