import {Entity, model, property, hasOne} from '@loopback/repository';
import {PortalTerms} from './portal-terms.model';

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

  @property({
    type: 'boolean',
    required: true,
  })
  default: boolean;

  @hasOne(() => PortalTerms)
  portalTerms: PortalTerms;

  @property({
    type: 'number',
  })
  portalTermsId?: number;

  constructor(data?: Partial<Portal>) {
    super(data);
  }
}

export interface PortalRelations {
  // describe navigational properties here
}

export type PortalWithRelations = Portal & PortalRelations;
