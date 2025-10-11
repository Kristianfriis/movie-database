import { authHeaders } from './auth-helper.js'

/**
 * @typedef {Object} Movie
 * @property {number|string} id
 * @property {string} title
 * @property {string} format
 * @property {number} year
 */

/**
 * @typedef {Object} Collection
 * @property {string} id
 * @property {string} name
 * @property {string} ownerId
 * @property {Movie[]} [movies]
 */

export const MovieService = {
  /** @type {Movie[]} */
  movies: [
    { id: 1, title: "The Matrix", format: "Blu-ray", year: 1999 },
    { id: 2, title: "Inception", format: "DVD", year: 2010 },
    { id: 3, title: "Interstellar", format: "Blu-ray", year: 2014 }
  ],

  /**
 * @returns {Promise<Movie[]>}
 */
  async getAll() {
    return Promise.resolve(this.movies)
  },

  /**
 * @returns {Promise<Collection[]>}
 */
  async getAllCollections() {
    var userId = this.getUserId();
    if (!userId) {
      return [];
    }

    const response = await fetch(window.appConfig.apiUrl + '/collections/' + userId, {
      headers: {
        ...await authHeaders(),
      }
    });

    if (!response.ok) {
      return [];
    }

    var collections = await response.json();



    return Promise.resolve(collections || []);
  },
  /**
   * Create a collection for the current user.
   * @param {string} name
   * @returns {Promise<void>}
   */
  async createCollection(name) {
    var userId = this.getUserId();
    if (!userId) {
      return;
    }

    const response = await fetch(window.appConfig.apiUrl + '/collections', {
      method: 'POST',
      headers: {
        ...await authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        ownerId: userId
      })
    })

    if (!response.ok) {
      return null;
    }

    var responseJson = await response.json();
    return responseJson.id;
  },

  search(query) {
    const q = query.toLowerCase()
    const results = this.movies.filter(m =>
      m.title.toLowerCase().includes(q)
    )
    return Promise.resolve(results)
  },

  add(movie) {
    movie.id = Date.now()
    this.movies.push(movie)
    return Promise.resolve(movie)
  },

  getUserId() {
    var user = localStorage.getItem('user');
    if (!user) {
      return null;
    }
    user = JSON.parse(user);
    if (!user || !user.id) {
      return null;
    }

    return user.id;
  }
}
