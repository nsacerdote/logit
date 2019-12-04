import { GenericDocEntity } from '../entity/generic-doc.entity';

export class Setting implements GenericDocEntity {

   constructor(public id: string = null, public value: any = null) {
   }

   getId(): string {
      return this.id;
   }

   getRaw(): any {
      return Object.assign({}, this);
   }
}
