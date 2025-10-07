import { MovieService } from './services/movie-service.js';

document.addEventListener('alpine:init', () => {
  Alpine.data('searchApp', () => ({
    query: '',
    results: [],
    init() {
      MovieService.getAll().then(m => this.results = m);
    },
    search() {
      MovieService.search(this.query).then(m => this.results = m);
    }
  }));

  Alpine.data('addApp', () => ({
    title: '',
    year: '',
    format: 'DVD',
    addMovie() {
      MovieService.add({
        title: this.title,
        year: parseInt(this.year),
        format: this.format
      }).then(() => $router.navigate('/'));
    }
  }));

  Alpine.data('detailsApp', () => ({
    movie: null,
    init() {
      const id = $params.id;
      MovieService.getAll().then(movies => {
        this.movie = movies.find(m => m.id == id);
      });
    }
  }));
});
