import {Entity, model, property, hasOne} from '@loopback/repository';
import {Portal} from './portal.model';

@model()
export class PortalTerms extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    mysql: {
      dataType: 'text',
    },
  })
  terms: string;

  @hasOne(() => Portal)
  portal: Portal;

  constructor(data?: Partial<PortalTerms>) {
    super(data);
  }
}

export interface PortalTermsRelations {
  // describe navigational properties here
}

export type PortalTermsWithRelations = PortalTerms & PortalTermsRelations;
