import { authHeaders } from './auth-helper.js'

export const PersonService = {
    endpoint: window.appConfig.apiUrl + '/people',

    async search(query) {
        const q = (query || '').toLowerCase();
        const response = await fetch(this.endpoint + '/search/' + q, {
            headers: {
                ...await authHeaders(),
                'Content-Type': 'application/json'
            }
        });

        return await response.json();
    },
    async createPerson(person) {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                ...await authHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(person)
        });

        return await response.json();
    },

    async updatePerson(person) {
        const response = await fetch(this.endpoint + '/' + person.id, {
            method: 'PUT',
            headers: {
                ...await authHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(person)
        });

        return await response.json();

    }
}