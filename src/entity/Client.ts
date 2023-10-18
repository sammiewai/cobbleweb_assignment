import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm'
import { User } from './User'

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    avatar: string

  @Column('text', { array: true })
    photos: string[]

  @OneToOne(() => User, (user) => user.client, { cascade: true })
  @JoinColumn()
    user: User
}
