// src/chat/entities/chat-room.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ChatMessage } from './chat.entity';
import { User } from 'src/user/entities/user.entities';

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: false })
  isGroup: boolean;

  @ManyToMany(() => User, (user) => user.chatRooms)
  @JoinTable()
  participants: User[];

  @OneToMany(() => ChatMessage, (message) => message.chatRoom)
  messages: ChatMessage[];

  @ManyToOne(() => User, (user) => user.ownedChatRooms)
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
