import { writable } from 'svelte/store';  
import User from '../user';
  
const user : User = new User(136, false, false, false);
const stored = localStorage.getItem('user');

if (stored) {
const parsed = JSON.parse(stored);
user.hauteur = parsed.hauteur;
user.pmr = parsed.pmr;
user.dspOnly = parsed.dspOnly;
user.electrique = parsed.electrique;
user.username = parsed.username;
user.token = parsed.token;
} 

try {
    await user.fetchParams();
} catch (error) {
    console.error("Failed to fetch user params:", error);
}

const UserContent = writable(user);

UserContent.subscribe(value => {
    value.updateParams()
    localStorage.setItem('user', JSON.stringify(value));
});

export { UserContent };