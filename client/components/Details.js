import { MovieService } from '../services/movie-service.js'
import { store } from '../services/state.js'
import { loadingController, toastController } from '@ionic/core';

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
          <ion-select-option 
            v-for="formatName in store.formats" 
            :key="formatName" 
            :value="formatName"
            >
            {{formatName}}</ion-select-option>
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
              v-for="genreName in store.genres" 
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
      },
      store: store
    }
  },

  async created() {
    const id = this.$route.params.id;

    var foundMovie = await MovieService.GetMovieById(id)
    if (foundMovie !== null) {
      this.movie = foundMovie;
    }
  },
  mounted() {
    this.$refs.formatSelect.addEventListener('ionChange', (e) => {
      this.movie.format = e.detail.value;
    });

    this.$refs.genreSelect.addEventListener('ionChange', (e) => {
      this.movie.genre = e.detail.value;
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
          genre: this.movie.genre,
          // Only send fields that are editable or necessary for the update
        };

        const loading = await loadingController.create({
          message: `Updating ${this.movie.title}...`,
        });

        loading.present();

        var id = await MovieService.updateMovie(movieToUpdate);

        loading.dismiss();

        if (id === null) {
          const toast = await toastController.create({
            message: 'Error updating movie.',
            duration: 1500,
            swipeGesture: "vertical",
            color: "danger"
          });

          await toast.present();

          return;
        }

        const toast = await toastController.create({
          message: 'Movie updated successfully',
          duration: 1500,
          swipeGesture: "vertical",
          color: "success"
        });

        await toast.present();

        this.goBack();

      } catch (error) {
        const toast = await toastController.create({
          message: `Error updating movie. ${error}`,
          duration: 1500,
          swipeGesture: "vertical",
          color: "danger"
        });

        await toast.present();
      }
    }
  }
}