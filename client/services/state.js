export const StateService = {
  showBackButton: false,
  toggleBackButton() {
    this.showBackButton = !this.showBackButton;
  }
}

import { reactive } from 'vue'

export const store = reactive({
  showBackButton: false,
  genres: [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
    'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
    'TV Movie', 'Thriller', 'War', 'Western'
  ],
  formats: [
    'DVD', 'Bluray', 'Digital', 'Unknown'
  ],
  languages: [
    { name: "Danish", code: "da-DK"},
    { name: "English", code: "en-US"},
  ],
  currentLanguage: null,
  movieSelectList: [],
  movieSelectFormat: null,
  currentCollectionMovies: [],
  collections: [],
  collectionMovies: {},
  getCollectionInfo(collectionId){
    return this.collections.find(c => c.id === collectionId);
  },
  getIsMaintainer(collectionId){
    var collectionInfo = this.getCollectionInfo(collectionId);
    if(!collectionInfo){
      return false;
    }

    return collectionInfo.role.toLowerCase() === 'maintainer';
  },
  collectionMovies: {},
  getCollectionMovies(collectionId) {
    return this.collectionMovies[collectionId];
  },
  setCollectionMovies(collectionId, movies) {
    this.collectionMovies[collectionId] = movies;
  },
  setCurrentCollectionMovies(movies) {
    this.currentCollectionMovies = movies;
  },
  addCollectionMovie(collectionId, movie) {
    this.collectionMovies[collectionId].push(movie);
  },
  removeCollectionMovie(collectionId, movieId) {
    this.collectionMovies[collectionId] = this.collectionMovies[collectionId].filter(m => m.id !== movieId);
  },
  searchCollectionMovies(collectionId, query) {
    if(this.currentCollectionMovies.length === 0){
      var collectionMovies = this.collectionMovies[collectionId];
      if(!collectionMovies){
        return [];
      }

      this.currentCollectionMovies = collectionMovies;
    }

    return this.currentCollectionMovies
      .filter(m => (m.title || '')
      .toLowerCase()
      .includes(query.toLowerCase()));
  }
})