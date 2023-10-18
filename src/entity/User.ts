import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, OneToMany } from 'typeorm'
import { IsEmail, Length, IsAlphanumeric, Matches } from 'class-validator'
import { Client } from './Client'
import { Photo } from './Photo'
@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
  @Length(2, 25)
    firstName: string

  @Column()
  @Length(2, 25)
    lastName: string

  @Column({ type: 'varchar', unique: true })
  @IsEmail()
    email: string

  @Column()
  @Length(6, 100)
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
    client: Client

  @OneToMany(() => Photo, (photo) => photo.user)
    photos: Photo[]
}
