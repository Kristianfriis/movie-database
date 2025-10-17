import { MovieService } from '../services/movie-service.js'
import { store } from '../services/state.js'
import { loadingController, toastController } from '@ionic/core';
import { PersonService } from '../services/person-service.js';

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
      
        <ion-card>
  <ion-card-header>
    <ion-card-title>Directors</ion-card-title>
  </ion-card-header>
  <ion-card-content>
    <ion-list>
      <ion-item v-for="(person, index) in movie.directors" :key="'dir-' + index">
        <ion-label>{{ person.name }}</ion-label>

        <ion-buttons slot="end">
          <ion-button color="danger" @click="removePerson('directors', index)">
            <ion-icon slot="icon-only" name="remove-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    </ion-list>
    
    <ion-button expand="full" color="secondary" @click="addPerson('directors')">
      <ion-icon slot="start" name="add-circle"></ion-icon>
      Add Director
    </ion-button>
  </ion-card-content>
</ion-card>

<ion-card>
  <ion-card-header>
    <ion-card-title>Cast</ion-card-title>
  </ion-card-header>
  <ion-card-content>
    <ion-list>
      <ion-item v-for="(person, index) in movie.cast" :key="'cast-' + index">
        <ion-label>{{ person.name }}</ion-label>
        <ion-buttons slot="end">
          <ion-button color="danger" @click="removePerson('cast', index)">
            <ion-icon slot="icon-only" name="remove-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    </ion-list>
    <ion-button expand="full" color="secondary" @click="addPerson('cast')">
      <ion-icon slot="start" name="add-circle"></ion-icon>
      Add Actor
    </ion-button>
  </ion-card-content>
</ion-card>

 <ion-modal :is-open="showModal" @didDismiss="closeModal">
          <ion-header>
            <ion-toolbar>
              <ion-title>Add {{ personType }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
        <ion-content class="ion-padding">
            <ion-list>
                <ion-item>
                    <ion-input v-model="searchQuery" @input="search" placeholder="Search name..."></ion-input>
                </ion-item>

                <div v-if="searched.length > 0">
                    <ion-item v-for="person in searched" :key="person.id" button detail="true" @click="addPersonToMovie(person)">
                        {{ person.name }} (ID: {{ person.id }})
                    </ion-item>
                </div>
                
                <div v-else-if="searchQuery.length > 0">
                    <ion-item>
                        <ion-button expand="block" @click="addNewPersonAndAdd({ name: searchQuery })">
                            Add Person: "{{ searchQuery }}"
                        </ion-button>
                    </ion-item>
                </div>

            </ion-list>
        </ion-content>
    </ion-modal>
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
      store: store,
      showModal: false,
      personType: 'cast',
      searchQuery: '',
      searched: [],
      persons: [],
      debounceTimeout: null,
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
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    goBack() {
      this.$router.back();
    },
    async addPerson(roleType) {
      this.personType = roleType;
      this.searchQuery = ''; // Clear previous search
      this.searched = [];

      this.openModal();
    },
    search() {
        // Clear the previous timeout if the user typed another character quickly
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // Set a new timeout (e.g., 400 milliseconds)
        this.debounceTimeout = setTimeout(() => {
            // Call the actual search implementation
            this.executeSearch();
        }, 400); // Debounce time in milliseconds
    },
    async executeSearch() {
      if (this.searchQuery.length < 3) {
        this.searched = [];
        return;
      }

      // Assume MovieService has a searchPeople method
      // This service method should query your 'people' table in Supabase
      this.searched = await PersonService.search(this.searchQuery);
    },
    // Method to remove a person entry from the list
    removePerson(roleType, index) {
      this.movie[roleType].splice(index, 1);
    },
    addPersonToMovie(person) {
      // 1. Create a person object in the format the movie array expects
      const newPerson = {
        id: person.id,
        name: person.name,
        externalId: person.externalId // or other necessary fields
      };

      // 2. Add to the correct array (cast or directors)
      this.movie[this.personType].push(newPerson);

      // 3. Close the modal
      this.closeModal();
    },
    async addNewPersonAndAdd(newPersonData) {
      const loading = await loadingController.create({
        message: 'Creating new person...',
      });
      await loading.present();

      try {
        // Assume MovieService.createPerson creates a new person in the DB 
        // and returns the object with its new ID.
        const createdPerson = await PersonService.createPerson(newPersonData);

        // Add the newly created person to the movie list and close the modal
        this.addPersonToMovie(createdPerson);

        await loading.dismiss();

      } catch (error) {
        await loading.dismiss();
        const toast = await toastController.create({
          message: `Error creating person: ${error.message}`,
          duration: 2000,
          color: "danger"
        });
        await toast.present();
      }
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
  },
  beforeRouteLeave(to, from, next) {
    if (this.showModal) {
      this.closeModal();
      // Prevent navigation
      next(false);
    } else {
      next();
    }
  }
}