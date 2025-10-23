import { authHeaders } from './auth-helper.js'
import { store } from './state.js'

/**
 * @typedef {Object} Movie
 * @property {number|string} id
 * @property {string} title
 * @property {string} format
 * @property {number} year
 */

/**
 * @typedef {Object} AddMovieResponse
 * @property {Movie} movie
 * @property {boolean} showAddDetailsMessage
 * @property {boolean} redirectToMovieSelector
 */


/**
 * @typedef {Object} Collection
 * @property {string} id
 * @property {string} name
 * @property {string} ownerId
 * @property {Movie[]} [movies]
 */

/**
 * @typedef {Object} CollectionUser
 * @property {number|string} id
 * @property {string} name
 * @property {string} currentRole
 */

/**  
 * @typedef {Object} CollectionInfo
 * @property {string} id
 * @property {string} name
 * @property {string} roleForCurrentUser
 * @property {boolean} isMaintainer,
 * @property {CollectionUser[]} Users,
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

  /** currently loaded collectionInfos */
  collectionInfos: [],
  newMovieCache: [],

  /**
 * @returns {Promise<Movie[]>}
 */
  async getAll() {
    return Promise.resolve(this.movies)
  },

  /** 
  *  @param {string} name
  * @returns {Promise<Movie[]>}
  */
  async GetMovieById(id, collectionId) {
    const foundMovie = this.newMovieCache.find(m => m.id == id);
    if (foundMovie) {
      // Create a working copy for editing
      return JSON.parse(JSON.stringify(foundMovie));
    }

    var response = await fetch(window.appConfig.apiUrl + '/movies/' + id + '/' + collectionId, {
      headers: {
        ...await authHeaders(),
      }

    })

    if (!response.ok) {
      return null;
    }

    var movie = await response.json();
    this.newMovieCache.push(movie);
    return movie;
  },

  /**
 * @returns {Promise<Collection[]>}
 */
  async getAllCollections(forceRefresh = false) {
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
  * @returns {Promise<AddMovieResponse>}
  */
  async add(movie, collectionId) {

    if (!collectionId) {
      return [];
    }

    const response = await fetch(window.appConfig.apiUrl + '/collections/' + collectionId + '/movies?' + 'searchLanguage=' + store.currentLanguage.code, {
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

    if (responseJson.movies.length === 1) {
      var movieToReturn = {
        id: responseJson.movies[0].id,
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

      var showAddDetailsMessage = true;
      if (responseJson.needMoreInfo) {
        showAddDetailsMessage = false;
      }
      var redirectToMovieSelector = false;

      return { movie: movieToReturn, showAddDetailsMessage, redirectToMovieSelector };
    } else if (responseJson.movies.length > 1) {
      store.movieSelectList = responseJson.movies;
      return { movie: movieToReturn, showAddDetailsMessage: false, redirectToMovieSelector: true };
    }

    return null;
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
    this.newMovieCache = [];

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
      UserIdToAdd: userId,
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

  /**
   * Returns true if collection is in cache
   * @param {string} collectionId 
   * @returns {boolean}
   */
  collectionInCache(collectionId) {
    if (!collectionId) {
      return false;
    }

    if (this.moviesCache[collectionId]) {
      return true;
    }

    return false;
  },

  /**
 * Returns the collection info. Use forceRefresh to clear cache.
 * @param {string} collectionId
 * @param {boolean} forceRefresh
 * @returns {Promise<CollectionInfo>}
 */
  async getCollectionInfo(collectionId, forceRefresh = false) {

    var response = await fetch(window.appConfig.apiUrl + '/collections/collectionInfo/' + collectionId, {
      headers: {
        ...await authHeaders(),
      }
    })

    if (!response.ok) {
      return null;
    }

    var result = await response.json()

    result.isMaintainer = result.roleForCurrentUser.toLowerCase() === 'maintainer';;

    return result;
  },

  async removeMovieFromCollection(collectionId, movieId) {
    var response = await fetch(window.appConfig.apiUrl + '/collections/' + collectionId + '/movies/' + movieId, {
      method: 'DELETE',
      headers: {
        ...await authHeaders(),
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return false;
    }

    return true;
  },

  async removeUserFromCollection(collectionId, userId) {
    var requestBody = {
      collectionId,
      userId
    }

    var response = await fetch(window.appConfig.apiUrl + '/collections/' + collectionId + '/removeMember', {
      method: 'DELETE',
      headers: {
        ...await authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      var result = await response.json();
      return { error: result.error, success: result.success };
    }

    return { error: null, success: true };
  },

  async changeRoleForUser(collectionId, userId, newRole) {
    var requestBody = {
      collectionId,
      userIdToChange: userId,
      role: newRole
    }

    var response = await fetch(window.appConfig.apiUrl + '/collections/' + collectionId + '/changeRole', {
      method: 'PUT',
      headers: {
        ...await authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      var result = await response.json();
      return { error: result.error, success: result.success };
    }

    return { error: null, success: true };

  },

  async updateMovie(movie, collectionId) {
    const response = await fetch(window.appConfig.apiUrl + '/movies/' + movie.id + '/' + collectionId, {
      method: 'PUT',
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

    return responseJson;
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
