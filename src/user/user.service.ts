import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      username,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }

  async findUserByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.findUserByUsername(username);
    console.log('validateUser', user);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async saveDeviceToken(userId: number, deviceToken: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (user) {
      user.deviceToken = deviceToken;
      await this.userRepository.save(user);
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user;
  }
}
