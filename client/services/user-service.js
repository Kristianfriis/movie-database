import { authHeaders } from './auth-helper.js'

export const UserService = {
    endpoint: window.appConfig.apiUrl + '/user',

    async getUser() {
        const cached = localStorage.getItem('user');
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                // corrupted cache — remove it and continue to fetch
                localStorage.removeItem('user');
            }
        }

        const response = await fetch(this.endpoint, {
            headers: {
                ...await authHeaders(),
            }
        });

        if (!response.ok) {
            return null;
        }

        var user = await response.json();

        if(user.exists === false){
            return null;
        }

        try {
            localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {
            // ignore storage errors
        }
        return user;
    },

    clearCache() {
        localStorage.removeItem('user');
    },

    async createUser(user) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...await authHeaders(),
                },
                body: JSON.stringify(user),
            });

            if (!response.ok) {
                return null;
            }
            
            var savedUser = await response.json();
            try {
                localStorage.setItem('user', JSON.stringify(savedUser));
            } catch (e) {
                // ignore storage errors
            }
            return savedUser;
        } catch (e) {
            return null;
        }
    },

    async updateUser(user) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...await authHeaders(),
                },
                body: JSON.stringify(user),
            });

            if (!response.ok) {
                return null;
            }
            
            var savedUser = await response.json();
            try {
                localStorage.setItem('user', JSON.stringify(savedUser));
            } catch (e) {
                // ignore storage errors
            }
            return savedUser;
        } catch (e) {
            return null;
        }
    }
}