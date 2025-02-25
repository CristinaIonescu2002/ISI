import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    user: User | null = null;

    profile = {
        username: 'john_doe',
        phone: '+1 (123) 456-7890',
        email: 'john.doe@example.com',
        password: "",
        counter: 0,
        rankName: "",
        rankUrl: "https://via.placeholder.com/100"
    };

    // pe profil ar trebui sa salvam cv counter de locatii vizitate
    // si in functie de cat de mare e ala ar trebui afisata o imagine a rangului
    // denumirea ei si eventual cate locatii a vizitat clientu;
    // asta va trebui adaugat

    isEditing: boolean = false;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        // Initializare date profil
        this.authService.currentUser.subscribe((user) => {
            if (user) {
                this.profile.username = user.username;
                this.profile.phone = user.phone;
                this.profile.email = user.email;
                this.profile.password = user.password;
                this.profile.counter = user.visits || 0;

                this.updateRank(user.visits || 0);
            }
        });
    }

    updateRank(visitedLocations: number): void {
        if (visitedLocations < 3) {
            this.profile.rankName = 'Noobie';
            this.profile.rankUrl = 'assets/images/noob.png';

        } 
        else if (visitedLocations < 10) 
        {
            this.profile.rankName = 'Beginner';
            this.profile.rankUrl = 'assets/images/entry.png';
        } 
        else if (visitedLocations < 20) 
        {
            this.profile.rankName = 'Medium';
            this.profile.rankUrl = 'assets/images/medium.png';
        }
        else if (visitedLocations < 40) 
        {
            this.profile.rankName = 'Advanced';
            this.profile.rankUrl = 'assets/images/entry.png';
        } 
        else if (visitedLocations < 60) 
        {
            this.profile.rankName = 'The Recycler';
            this.profile.rankUrl = 'assets/images/theRecycler.png';
        } 
        else 
        {
            this.profile.rankName = 'Master Recycler';
            this.profile.rankUrl = 'assets/images/boss.png';
        }
    }

    editProfile(): void {
        this.isEditing = true;
    }

    saveProfile(): void {
        if (this.isEditing) {
            // Pregătește datele actualizate
            const updatedData = {
                username: this.profile.username,
                email: this.profile.email,
                phone: this.profile.phone,
                password: this.profile.password
            };

            // Apelează serviciul pentru a salva datele
            this.authService.updateUserData(this.profile.email, updatedData).then(() => {
                console.log('Profile updated successfully:', updatedData);
                
                this.authService.ngOnInit();

                console.error('Error updating profile:', this.profile.username);
                this.isEditing = false; // Ieși din modul de editare

            }).catch((error) => {
                console.error('Error updating profile:', error);
            });
        }
    }

    incrementVisitedLocations(): void {
        if (this.user && this.user.email) {
          const newCount = (this.user.visits || 0) + 1;
    
          // Actualizează baza de date și contorul local
          this.authService.updateUserData(this.user.email, { visits: newCount });
          this.user.visits = newCount;
          this.updateRank(newCount);
        }
      }
}
