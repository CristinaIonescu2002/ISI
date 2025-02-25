export interface User {
    email: string;
    password: string;
    role: string; // Poate fi 'admin' sau 'customer'
    visits: number;
    phone: string;
    username: string;
}