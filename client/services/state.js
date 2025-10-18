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
  movieSelectList: []
})