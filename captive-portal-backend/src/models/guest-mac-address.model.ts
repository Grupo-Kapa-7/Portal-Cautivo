import {belongsTo, Entity, model, property} from '@loopback/repository';
import {GuestUser} from './guest-user.model';

@model({
  name: "GuestMacAddress",
  settings: {idInjection: false, mysql: {schema: 'captiveportal', table: 'GuestMacAddress'}, foreignKeys: {
    fkGuestUserId: {
      name: 'fkGuestUserId',
      entity: 'GuestUser',
      entityKey: 'id',
      foreignKey: 'guestUserId',
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }
  }
}})
export class GuestMacAddress extends Entity {

  @property({
    type: 'string',
    required: true,
    length: 50,
    id: 1,
    index: {
      unique: true
    },
    mysql: {columnName: 'macAddress', dataType: 'varchar', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'N'},
  })
  macAddress: string;

  @belongsTo(() => GuestUser, {name: 'guestUser'}, {required: true, type: 'number', length: 10, unsigned: true})
  guestUserId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<GuestMacAddress>) {
    super(data);
  }
}

export interface GuestMacAddressRelations {
  // describe navigational properties here
}

export type GuestMacAddressWithRelations = GuestMacAddress & GuestMacAddressRelations;
