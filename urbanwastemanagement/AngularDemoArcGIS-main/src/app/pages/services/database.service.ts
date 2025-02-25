import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

interface IDatabaseItem {

  name: string;

  val: string;

  lat?: number;

  long?: number;

}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private databaseRef: any;

  constructor(private db: AngularFireDatabase) {
    this.databaseRef = this.db.database.ref('puncteColectare');
  }

  // Adaugă un obiect în baza de date
  addEntry(data: any){
    this.db.list('puncteColectare').push(data);
  }

  // Obține toate intrările din baza de date
  getEntries(): Observable<IDatabaseItem[]> {
    return new Observable(observer => {
      this.databaseRef.once('value', snapshot => {
          const data = snapshot.val();
          console.log('Raw data from Firebase: ', data); // Debugging
          const items: IDatabaseItem[] = data ? Object.values(data) : [];
          observer.next(items);
          observer.complete();
      });
  });
  }

  // Șterge toate intrările din baza de date
  clearEntries(): void {
    this.db.list('puncteColectare').remove();
  }
}
