import { Column, Entity, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from './User'
@Entity()

export class Photo {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    name: string

  @Column()
    url: string

  @CreateDateColumn()
    createdAt: Date

  @CreateDateColumn()
    updatedAt: Date

  @ManyToOne(() => User, (user) => user.photos, { cascade: true })
    user: User
}
