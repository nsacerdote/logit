export class Issue {
   constructor(public key: string = '',
               public description: string = '') {
   }

   static of(raw: any): Issue {
      return Object.assign(new Issue(), raw);
   }

   getRaw(): any {
      return Object.assign({}, this);
   }
}
