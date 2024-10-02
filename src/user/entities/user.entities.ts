// src/user/entities/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ChatMessage } from '../../chat/entities/chat.entity';
import { ChatRoom } from '../../chat/entities/chat-room.entity';

@Entity()
@Index('user_username_unique', ['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToMany(() => ChatMessage, (message) => message.user)
  messages: ChatMessage[];

  @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.participants)
  chatRooms: ChatRoom[];

  @Column({ nullable: true })
  deviceToken: string;

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.owner)
  ownedChatRooms: ChatRoom[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
