import { DocumentType } from '@typegoose/typegoose';

import CreateUserDto from '@modules/user/dto/create-user.dto.js';
import { UserEntity } from '@modules/user/user.entity.js';

export interface UserServiceInterface {
  create(dto: CreateUserDto): Promise<DocumentType<UserEntity>>;
  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;
  findOrCreate(dto: CreateUserDto): Promise<DocumentType<UserEntity>>;
}
