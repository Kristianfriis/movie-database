import { MovieService } from '../services/movie-service.js'
import { store } from '../services/state.js'

export default {
  template: /*html*/`
<ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" @click="goBack"></ion-back-button>
          </ion-buttons>
          <ion-title>Edit: {{ movie.title }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="updateMovie">
              <ion-icon slot="icon-only" name="save"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
        
        <ion-item>
          <ion-label position="stacked">Title</ion-label>
          <ion-input v-model="movie.title" type="text" placeholder="Enter movie title"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Format</ion-label>
          <ion-select v-model="movie.format" placeholder="Select Format" ref="formatSelect">
            <ion-select-option value="dvd">DVD</ion-select-option>
            <ion-select-option value="BluRay">Blu-ray</ion-select-option>
            <ion-select-option value="digital">Digital</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Genres</ion-label>
          <ion-select 
            v-model="movie.genre" 
            multiple="true" 
            placeholder="Select Genres"
            ref="genreSelect"
          >
            <ion-select-option 
              v-for="genreName in availableGenres" 
              :key="genreName" 
              :value="genreName"
            >
              {{ genreName }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Overview</ion-label>
          <ion-textarea v-model="movie.overview" rows="6" placeholder="Enter movie description"></ion-textarea>
        </ion-item>
      
    </ion-page>
  `,
  data() {
    return {
      movie: {
        id: null,
        title: '',
        format: '',
        overview: '',
        genres: []
      },
      store: store,
      availableGenres: [
        'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
        'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
        'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
        'TV Movie', 'Thriller', 'War', 'Western'
      ]
    }
  },

  created() {
    const id = this.$route.params.id;

    // NOTE: This getAll() call should ideally be changed to a getById(id) call
    // for efficiency in a real application, especially if you have many movies.
    MovieService.getAll().then(movies => {
      // Find the movie and assign a deep copy to `this.movie`
      // This prevents editing the reactive state directly before saving
      const foundMovie = movies.find(m => m.id == id);
      if (foundMovie) {
        // Create a working copy for editing
        this.movie = JSON.parse(JSON.stringify(foundMovie));
      }
    });

    this.store.showBackButton = true
  },
  mounted() {
    this.$refs.formatSelect.addEventListener('ionChange', (e) => {
      this.movie.format = e.detail.value;
    });

    this.$refs.genreSelect.addEventListener('ionChange', (e) => {
      this.movie.genres = e.detail.value;
    });
  },
  methods: {
    goBack() {
      this.$router.back();
    },
    async updateMovie() {
      try {
        // Prepare the data to be sent for update
        const movieToUpdate = {
          id: this.movie.id,
          title: this.movie.title,
          format: this.movie.format,
          overview: this.movie.overview,
          genres: JSON.stringify(this.movie.genres),
          // Only send fields that are editable or necessary for the update
        };

        // Assuming MovieService has an update method that takes the movie object
        //await MovieService.update(movieToUpdate); 
        console.log(movieToUpdate)

        // alert('Movie updated successfully!');
        alert('Update movie not implemented.');

        // Optional: Navigate back or update the global store state
        this.goBack();

      } catch (error) {
        console.error('Failed to update movie:', error);
        alert('Error updating movie. Check console for details.');
      }
    }
  }
}