import { authHeaders } from './auth-helper.js'

export const PersonService = {
    endpoint: window.appConfig.apiUrl + '/people',

    async search(query){
        const q = (query || '').toLowerCase();
        const response = await fetch(this.endpoint + '/search/' + q, {
            headers: {
                ...await authHeaders(),
            }
        });

        return await response.json();
    },
    async createPerson(person){
        alert("not implemented")    

        person.id = 12123123123;

        return person
    }
}