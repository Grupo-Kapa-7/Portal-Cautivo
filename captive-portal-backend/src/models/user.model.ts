import {Entity, model, property, hasOne} from '@loopback/repository';
import {UserCredentials} from './user-credentials.model';

@model({
  name: "User"
  // settings: {
  //   idInjection: false,
  //   mysql: {schema: 'captiveportal', table: 'User'}
  // }
})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'uuidv4',
    mysql: {columnName: 'id', dataType: 'varchar', dataLength: 36, nullable: 'N'},
  })
  id: string;

  @property({
    type: 'string',
    mysql: {columnName: 'realm', dataType: 'varchar', dataLength: 36, nullable: 'Y'},
  })
  realm?: string;

  @property({
    type: 'string',
    mysql: {columnName: 'username', dataType: 'varchar', dataLength: 256, nullable: 'Y'},
  })
  username?: string;

  @property({
    type: 'string',
    required: true,
    mysql: {columnName: 'email', dataType: 'varchar', dataLength: 256, nullable: 'N'},
  })
  email: string;

  @property({
    type: 'boolean',
    required: true,
    mysql: {columnName: 'emailVerified', dataType: 'tinyint', dataLength: 1, nullable: 'Y', default: 0},
  })
  emailVerified?: boolean;

  @property({
    type: 'string',
    mysql: {columnName: 'verificationToken', dataType: 'varchar', dataLength: 256, nullable: 'N'},
  })
  verificationToken?: string;

  @hasOne(() => UserCredentials, {keyTo: 'userId'})
  userCredentials: UserCredentials;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;