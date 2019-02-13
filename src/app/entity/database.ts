import * as Nedb from 'nedb';
import { bindNodeCallback, Observable } from 'rxjs';
import { GenericDocEntity } from './generic-doc.entity';

export class Database<T extends GenericDocEntity> {

   database: Nedb;

   constructor(databaseName) {
      this.database = new Nedb({ filename: `./db/${databaseName}.db`, autoload: true , timestampData: true});
   }

   upsert(doc: T): Observable<[number, T, boolean]> {
      const toSaveDoc: any = doc.getRaw();
      toSaveDoc._id = doc.getId();
      return this.bindMethod(this.database.update)({ _id: toSaveDoc._id }, toSaveDoc, { upsert: true , returnUpdatedDocs : true});
   }

   find(_id: string): Observable<T> {
      return this.bindMethod(this.database.findOne)({ _id: _id });
   }

   private bindMethod(method) {
      return bindNodeCallback(method).bind(this.database);
   }
}
