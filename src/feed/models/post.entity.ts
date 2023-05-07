import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '../../auth/models/user.entity';

@Entity('feed_post')
export class FeedPostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  body: string;

  @Column({default:''})
  imagePath: string;

  @Column({default:''})
  videoPath: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ type: 'simple-array', default:'[]' })
  likedByUserIds: number[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.feedPosts)
  author: UserEntity;
}
