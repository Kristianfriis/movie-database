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
  movies: [],

  /** in-memory cache keyed by collectionId -> Movie[] */
  moviesCache: {},

  /** currently loaded collectionId for this.movies */
  currentCollectionId: null,

  /** currently loaded collections */
  collections: [],

  /**
 * @returns {Promise<Movie[]>}
 */
  async getAll() {
    return Promise.resolve(this.movies)
  },

  /**
 * @returns {Promise<Collection[]>}
 */
  async getAllCollections(forceRefresh = false) {
    var userId = this.getUserId();
    if (!userId) {
      return [];
    }

    // return cached copy unless forceRefresh
    if (!forceRefresh && this.collections && this.collections.length) {
      // return a shallow copy to avoid external mutation of cache
      this.collections = [...this.collections];
      return Promise.resolve(this.collections);
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

    // store in cache and set current movies
    this.collections = collections;
    // assign a copy for reactivity
    this.collections = [...collections];

    return Promise.resolve(this.collections || []);
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

  /**
    * Search movies in the current collection (or across all if no collectionId provided).
    * @param {string} query
    * @param {string} [collectionId]
    * @returns {Promise<Movie[]>}
    */
  async search(query, collectionId) {
    const q = (query || '').toLowerCase();

    let source = [];

    if (collectionId) {
      // ensure we have the movies for the requested collection (will use cache when possible)
      source = await this.getAllMovies(collectionId);
    } else {
      // prefer current loaded movies, otherwise search all cached movies
      if (this.movies && this.movies.length) {
        source = this.movies;
      } else {
        source = Object.values(this.moviesCache).flat();
      }
    }

    return source.filter(m => (m.title || '').toLowerCase().includes(q));
  },

  /**
  * Add a movie to a collection.
  * @param {Movie} movie
  * @param {string} collectionId
  * @returns {Promise<Movie>}
  */
  async add(movie, collectionId) {

    if (!collectionId) {
      return [];
    }

    const response = await fetch(window.appConfig.apiUrl + '/collections/' + collectionId + '/movies', {
      method: 'POST',
      headers: {
        ...await authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(movie)
    })

    if (!response.ok) {
      return null;
    }

    var responseJson = await response.json();

    var movieToReturn = {
      id: responseJson.id,
      title: movie.title,
      format: movie.format,
      year: movie.year
    }

    // update in-memory cache for this collection
    if (!this.moviesCache[collectionId]) {
      this.moviesCache[collectionId] = [];
    }
    this.moviesCache[collectionId].push(movieToReturn);

    // if currently viewing this collection, update this.movies so UI re-renders
    if (this.currentCollectionId === collectionId) {
      // assign a new array to ensure reactivity
      this.movies = [...this.moviesCache[collectionId]];
    }

    return movieToReturn;
  },

  /**
   * Get all movies in a collection.
   * @param {string} collectionId
   * @param {boolean} [forceRefresh=false] - set true to bypass cache and fetch from server
   * @returns {Promise<Movie[]>}
   */
  async getAllMovies(collectionId, forceRefresh = false) {
    if (!collectionId) {
      return [];
    }

    // return cached copy unless forceRefresh
    if (!forceRefresh && this.moviesCache[collectionId]) {
      this.currentCollectionId = collectionId;
      // return a shallow copy to avoid external mutation of cache
      this.movies = [...this.moviesCache[collectionId]];
      return Promise.resolve(this.movies);
    }

    const response = await fetch(window.appConfig.apiUrl + '/collections/' + collectionId + '/movies', {
      headers: {
        ...await authHeaders(),
      }
    });

    if (!response.ok) {
      return [];
    }

    var movies = await response.json() || [];

    // store in cache and set current movies
    this.moviesCache[collectionId] = movies;
    this.currentCollectionId = collectionId;
    // assign a copy for reactivity
    this.movies = [...movies];

    return this.movies;
  },

  /**
 * Clear movies cache. If collectionId is provided clears only that collection, otherwise clears all.
 * @param {string} [collectionId]
 */
  clearMoviesCache(collectionId) {
    if (collectionId) {
      delete this.moviesCache[collectionId];
      if (this.currentCollectionId === collectionId) {
        this.currentCollectionId = null;
        this.movies = [];
      }
    } else {
      this.moviesCache = {};
      this.currentCollectionId = null;
      this.movies = [];
    }
  },

  async generateInviteLink(collectionId) {
    if (!collectionId) {
      return null;
    }

    var response = await fetch(window.appConfig.apiUrl + '/collections/' + collectionId + '/invite', {
      method: 'POST',
      headers: {
        ...await authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    if (!response.ok) {
      return null;
    }

    var responseJson = await response.json();

    return responseJson;
  },

  /**
   * Accept an invite to join a collection.
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async acceptInvite(token) {
    if (!token) {
      return false;
    }

    var userId = this.getUserId();
    if (!userId) {
      return false;
    }

    var requestBody = { token, userId };

    var response = await fetch(window.appConfig.apiUrl + '/collections/join', {
      method: 'POST',
      headers: {
        ...await authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      return false;
    }

    return true;
  },

  async addUserToCollection(collectionId, userId, role) {
    var requestBody = {
      collectionId,
      userId,
      role
    }

    var response = await fetch(window.appConfig.apiUrl + '/collections/join', {
      method: 'POST',
      headers: {
        ...await authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      return false;
    }

    return true;
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
