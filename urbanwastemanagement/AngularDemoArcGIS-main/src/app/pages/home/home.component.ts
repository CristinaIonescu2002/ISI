import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { FirebaseService, IDatabaseItem } from "../services/firebase";
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';

import * as Papa from 'papaparse';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

    // firebase sync
    isConnected: boolean = false;
    subscriptionList: Subscription;
    subscriptionObj: Subscription;

    displayedColumns: string[] = ['nume', 'plastic', 'hartie', 'locatie'];

    csvData: any[] = []; // Array pentru datele CSV
    currentIndex: number = 0; // Index pentru punctul curent
    listItems: IDatabaseItem[] = []; // Datele afișate în tabel
    csvIndex: number = 0;

    usedIndexes: Set<number> = new Set<number>(); // Pentru a păstra indexurile deja folosite


    constructor(
        private fbs: FirebaseService,
        private dbService: DatabaseService,
        private authService: AuthService
    ) {

    }

   

    ngOnInit() {
        this.dbService.getEntries().subscribe(entries => {
            this.listItems = entries;
            console.log('Entries updated: ', this.listItems);
        });
    }
    

    connectFirebase() {
        if (this.isConnected) {
            return;
        }
        this.isConnected = true;
    
        this.fbs.connectToDatabase();
    
        // Preia datele inițiale
        this.dbService.getEntries().subscribe(entries => {
            console.log('Entries from Database Service: ', entries); // Debugging
            this.listItems = entries; // Actualizează lista locală
        });
    
        // Ascultă modificările ulterioare
        this.subscriptionList = this.fbs.getChangeFeedList().subscribe((items: IDatabaseItem[]) => {
            console.log("list updated from Firebase: ", items); // Debugging
    
            // Combina datele existente cu cele noi
            if (items.length > 0) {
                this.listItems = [...this.listItems, ...items];
            }
        });
    
        this.subscriptionObj = this.fbs.getChangeFeedObject().subscribe((stat: IDatabaseItem) => {
            console.log("object updated: ", stat); // Debugging
        });
    }

    


    loadCSV(event: any) {
        const file = event.target.files[0];
        const reader = new FileReader();
    
        reader.onload = () => {
            const text = reader.result as string;
            Papa.parse(text, {
                header: true, // Prima linie este folosită ca antet pentru coloane
                skipEmptyLines: true,
                complete: (result) => {
                    this.csvData = result.data.map((row: any) => ({
                        nume: row.Nume || 'Necunoscut',
                        plastic: row.Plastic === 'Da',
                        hartie: row.Hartie === 'Da',
                        carti: row.Carti === 'Da',
                        sticla: row.Sticla === 'Da',
                        metal: row.Metal === 'Da',
                        haine: row.Haine === 'Da',
                        electronice: row.Electronice === 'Da',
                        electrocasnice: row.Electrocasnice === 'Da',
                        ochelari: row.Ochelari === 'Da',
                        baterii: row.Baterii === 'Da',
                        vapes: row.Vapes === 'Da',
                        vopsea: row.Vopsea === 'Da',
                        automobile: row.Automobile === 'Da',
                        antigel: row.Antigel === 'Da',
                        ulei: row.Ulei === 'Da',
                        moloz: row.Moloz === 'Da',
                        telefon: row.Telefon || 'N/A',
                        zileLucrate: row.ZileLucrate || 'N/A',
                        program: row.Program || 'N/A',
                        adresa: row.Adresa || 'N/A',
                        latitudine: parseFloat(row.Latitudine) || 0,
                        longitudine: parseFloat(row.Longitudine) || 0,
                        descriere: row.Descriere || 'N/A'
                    }));
                    console.log('CSV Data Loaded:', this.csvData);
                }
            });
        };
    
        reader.readAsText(file);
    }
    
    
    addListItem() {
        if (this.currentIndex < this.csvData.length) {
            // Verifică dacă indexul curent a fost deja folosit
            if (this.usedIndexes.has(this.currentIndex)) {
                alert(`Indexul ${this.currentIndex} a fost deja folosit!`);
                this.currentIndex++; // Avansează la următorul index
                return;
            }
    
            const newRow = this.csvData[this.currentIndex];
    
            this.dbService.addEntry(newRow); // Adaugă datele în Firebase
            this.listItems.push(newRow);    // Actualizează lista locală
            this.usedIndexes.add(this.currentIndex); // Marchează indexul ca folosit
    
            console.log(`Adăugat punct de la indexul ${this.currentIndex}:`, newRow);
            this.currentIndex++; // Crește indexul pentru următorul rând
        } else {
            alert("Toate datele au fost adăugate!");
        }
    }
    
    
    clearEntries() {
        this.dbService.clearEntries();
        this.listItems = []; 
        this.currentIndex = 0;
        this.usedIndexes.clear(); // Golește lista de indexuri folosite
        console.log("Toate datele au fost șterse și contorul a fost resetat.");
    }
    
    
    
    
    removeItems() {
        this.dbService.clearEntries();
    }
    
    clearAllData() {
        if (confirm('Ești sigur că vrei să ștergi toate datele?')) {
            this.dbService.clearEntries(); // Apelează metoda din serviciu pentru ștergere
            this.listItems = []; // Golește și lista locală
            console.log('Toate datele au fost șterse.');
        }
    }

    setCustomIndex() {
        const input = prompt("Introdu indexul de la care să înceapă adăugarea:");
        const parsedIndex = parseInt(input || '', 10);
    
        if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < this.csvData.length) {
            this.currentIndex = parsedIndex;
            console.log(`Indexul curent a fost setat la ${this.currentIndex}`);
        } else {
            alert("Index invalid! Introdu un număr valid între 0 și " + (this.csvData.length - 1));
        }
    }
    
    addAllRemainingItems() {
        let addedCount = 0; // Număr de date adăugate
    
        for (let i = 0; i < this.csvData.length; i++) {
            if (!this.usedIndexes.has(i)) { // Dacă indexul nu a fost folosit
                const newRow = this.csvData[i];
                this.dbService.addEntry(newRow); // Adaugă în Firebase
                this.listItems.push(newRow);    // Actualizează lista locală
                this.usedIndexes.add(i);        // Marchează indexul ca folosit
                addedCount++;                   // Crește contorul de adăugări
            }
        }
    
        if (addedCount > 0) {
            console.log(`${addedCount} punct(e) au fost adăugate.`);
        } else {
            alert("Toate datele au fost deja adăugate!");
        }
    }
    


    
    importCSV(event: any) {
        const file = event.target.files[0]; // Preia fișierul selectat
        const reader = new FileReader();
        
        reader.onload = () => {
            const csvData = reader.result as string;
            Papa.parse(csvData, {
                header: true, // Tratează prima linie ca antet
                skipEmptyLines: true,
                complete: (result) => {
                    const data = result.data;
                    console.log('Parsed CSV Data:', data);

                    // Adaugă fiecare rând în Firebase
                    data.forEach((row: any) => {
                        this.dbService.addEntry(row);
                    });
                }
            });
        };

        reader.readAsText(file); // Citește fișierul
    }


    disconnectFirebase() {
        if (this.subscriptionList != null) {
            this.subscriptionList.unsubscribe();
        }
        if (this.subscriptionObj != null) {
            this.subscriptionObj.unsubscribe();
        }
    }

    ngOnDestroy(): void {
        this.disconnectFirebase();
    }

  
}