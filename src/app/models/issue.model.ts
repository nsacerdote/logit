import { GenericDocEntity } from '../entity/generic-doc.entity';

export class Issue implements GenericDocEntity {
   constructor(public key: string = '', public description: string = '') {}

   static of(raw: any): Issue {
      return Object.assign(new Issue(), raw);
   }

   getRaw(): any {
      return Object.assign({}, this);
   }

   getId(): string {
      return this.key;
   }
}
