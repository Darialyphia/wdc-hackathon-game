import { Id } from '../_generated/dataModel';
import { User } from './user.entity';

export type UserDto = {
  _id: Id<'users'>;
  name: string;
  fullName: string;
  discriminator: string;
};

export const toUserDto = (user: User): UserDto => {
  return {
    _id: user._id,
    name: user.name,
    discriminator: user.discriminator,
    fullName: `${user.name}#${user.discriminator}`
  };
};
