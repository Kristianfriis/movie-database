export class User {
    constructor({
        id = null,
        username = '',
        email = '',
        avatarUrl = null,
        createdAt = null,
    } = {}) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt ? new Date(createdAt) : null;
    }

    static fromJSON(data) {
        if (!data) return null;
        let obj = data;
        if (typeof data === 'string') {
            try {
                obj = JSON.parse(data);
            } catch (e) {
                return null;
            }
        }
        return new User({
            id: obj.id ?? null,
            username: obj.username ?? '',
            email: obj.email ?? '',
            avatarUrl: obj.avatarUrl ?? null,
            createdAt: obj.createdAt ?? null,
        });
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            avatarUrl: this.avatarUrl,
            createdAt: this.createdAt ? this.createdAt.toISOString() : null,
        };
    }

    clone() {
        return User.fromJSON(this.toJSON());
    }

    equals(other) {
        if (!other) return false;
        return String(this.id) === String(other.id);
    }
}