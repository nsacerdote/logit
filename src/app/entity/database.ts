import * as Nedb from 'nedb';
import { bindNodeCallback, Observable } from 'rxjs';
import { GenericDocEntity } from './generic-doc.entity';
import { map } from 'rxjs/operators';

export class Database<T extends GenericDocEntity> {
   database: Nedb;

   constructor(databaseName) {
      this.database = new Nedb({
         filename: `./db/${databaseName}.db`,
         autoload: true,
         timestampData: true
      });
   }

   upsert(doc: T): Observable<T> {
      const toSaveDoc: any = doc.getRaw();
      toSaveDoc._id = doc.getId();
      const bindedUpdate = this.bindMethod(this.database.update);
      return bindedUpdate({ _id: toSaveDoc._id }, toSaveDoc, {
         upsert: true,
         returnUpdatedDocs: true
      }).pipe(map(upsertResult => upsertResult[1]));
   }

   findById(_id: string): Observable<T> {
      return this.bindMethod(this.database.findOne)({ _id: _id });
   }

   find(query: any): Observable<T[]> {
      return this.bindMethod(this.database.find)(query);
   }

   deleteAll(): Observable<number> {
      return this.bindMethod(this.database.remove)({}, { multi: true });
   }

   private bindMethod(method) {
      return bindNodeCallback(method).bind(this.database);
   }
}
