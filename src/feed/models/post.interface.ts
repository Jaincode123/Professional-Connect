import { User } from '../../auth/models/user.class';

export interface FeedPost {
  id?: number;
  body?: string;
  imagePath?:string;
  videoPath?:string;
  like?:number;
  likedByUserIds?:number[];
  createdAt?: Date;
  author?: User;
}
