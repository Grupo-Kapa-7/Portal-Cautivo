import {Entity, model, property} from '@loopback/repository';

@model()
export class Portal extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  greeting: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;


  constructor(data?: Partial<Portal>) {
    super(data);
  }
}

export interface PortalRelations {
  // describe navigational properties here
}

export type PortalWithRelations = Portal & PortalRelations;
