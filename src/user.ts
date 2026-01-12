import { GetParams, Login, Register, UpddateParams } from "./api";

class User{

    hauteur: number;
    pmr: boolean;
    dspOnly: boolean;
    electrique: boolean;
    username: string = "";
    token:  string = "";
    
    constructor(hauteur: number, pmr: boolean, dspOnly: boolean, electrique: boolean){
        this.hauteur = hauteur;
        this.pmr = pmr;
        this.dspOnly = dspOnly;
        this.electrique = electrique;
    }

    async login(username: string, password: string): Promise<void>{
        try {
            this.token = await Login(username, password);
            this.username = username;
        } catch (error) {
            throw error;
        }
    }

    async register(username: string, password: string): Promise<void>{
        try {
            this.token = await Register(username, password);
            this.username = username;
        } catch (error) {
            throw error;
        }
    }

    async updateParams(): Promise<void>{
        try {
            await UpddateParams(this.token, this.hauteur, this.pmr, this.dspOnly, this.electrique);
        } catch (error) {
            throw error;
        }
    }

    async fetchParams(): Promise<void>{
        try {
            const data = await GetParams(this.token);
            this.hauteur = data.hauteur;
            this.pmr = data.pmr;
            this.dspOnly = data.dspOnly;
            this.electrique = data.electrique;
        } catch (error) {
            throw error;
        }
    }
}

export default User;