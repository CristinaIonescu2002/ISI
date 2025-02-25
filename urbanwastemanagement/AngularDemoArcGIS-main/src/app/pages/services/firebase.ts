import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

export interface IDatabaseItem {
    name: string;
    val: string;
    lat?: number;
    long?: number;
}

@Injectable()
export class FirebaseService {

    listFeed: Observable<any[]>;
    objFeed: Observable<any>;

    constructor(public db: AngularFireDatabase) {

    }

    getPuncteColectare(): Observable<any[]> {
        return this.db.list('puncteColectare').valueChanges();
    }

    connectToDatabase() {
        this.listFeed = this.db.list('list').valueChanges();
        this.objFeed = this.db.object('obj').valueChanges();
    }

    getChangeFeedList(): Observable<IDatabaseItem[]> {
        return this.db.list<IDatabaseItem>('list').valueChanges();
    }

    getChangeFeedObject() {
        return this.objFeed;
    }

    removeListItems() {
        this.db.list('list').remove();
    }

    addListObject(val: string) {
        let item: IDatabaseItem = {
            name: "test",
            val: val
        };
        this.db.list('list').push(item);
    }

    // addlistobject 2 should have longitudes and latitudes
    addListObject2(val: string, lat: number, long: number) {
        let item: IDatabaseItem = {
            name: "test",
            val: val,
            lat: lat,
            long: long
        };
        this.db.list('list').push(item);
    }
    

    updateObject(val: string) {
        let item: IDatabaseItem = {
            name: "test",
            val: val
        };
        this.db.object('obj').set([item]);
    }

    setUserPosition(lat: number, long: number) {
        let item: IDatabaseItem = {
            name: "test",
            val: "test",
            lat: lat,
            long: long
        };
        this.db.object('user').set(item);
    }
}
