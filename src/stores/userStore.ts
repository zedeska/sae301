import { writable } from 'svelte/store';  
import User from '../user';
  
const user : User = new User(136, false, false, false, false);
const stored = localStorage.getItem('user');

if (stored) {
const parsed = JSON.parse(stored);
user.hauteur = parsed.hauteur;
user.pmr = parsed.pmr;
user.dspOnly = parsed.dspOnly;
user.elec = parsed.elec;
user.free = parsed.free;
user.username = parsed.username;
user.token = parsed.token || "";
}

const UserContent = writable(user);

UserContent.subscribe(value => {
    localStorage.setItem('user', JSON.stringify(value));
});

export { UserContent };