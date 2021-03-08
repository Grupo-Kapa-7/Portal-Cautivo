import {Entity, hasMany, model, property} from '@loopback/repository';
import { hasMagic } from 'glob';
import { GuestMacAddress } from './guest-mac-address.model';

@model({
  name: "GuestUser",
  settings: {idInjection: false, mysql: {schema: 'captiveportal', table: 'GuestUser'}}
})
export class GuestUser extends Entity {
  @property({
    type: 'number',
    required: false,
    precision: 10,
    scale: 0,
    id: 1,
    length: 10,
    unsigned: true,
    generated: true,
    mysql: {columnName: 'id', dataType: 'int', dataLength: null, unsigned: true, dataPrecision: 10, dataScale: 0, nullable: 'N'},
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    length: 50,
    mysql: {columnName: 'firstName', dataType: 'varchar', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'N'},
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
    length: 50,
    mysql: {columnName: 'lastName', dataType: 'varchar', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'N'},
  })
  lastName: string;

  @property({
    type: 'string',
    required: true,
    length: 50,
    index: {
      unique: true,
    },
    mysql: {columnName: 'email', dataType: 'varchar', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'N'},
  })
  email: string;

  @property({
    type: 'string',
    length: 25,
    index: {
      unique: true,
    },
    mysql: {columnName: 'mobilePhoneNumber', dataType: 'varchar', dataLength: 25, dataPrecision: null, dataScale: null, nullable: 'Y'},
  })
  mobilePhoneNumber?: string;

  @hasMany(() => GuestMacAddress, {keyTo: 'guestUser'})
  macAddresses: GuestMacAddress[];

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<GuestUser>) {
    super(data);
  }
}

export interface GuestUserRelations {
  // describe navigational properties here
}

export type GuestUserWithRelations = GuestUser & GuestUserRelations;
