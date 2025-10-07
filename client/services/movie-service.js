export const MovieService = {
  movies: [
    { id: 1, title: "The Matrix", format: "Blu-ray", year: 1999 },
    { id: 2, title: "Inception", format: "DVD", year: 2010 },
    { id: 3, title: "Interstellar", format: "Blu-ray", year: 2014 }
  ],

  getAll() {
    return Promise.resolve(this.movies)
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
  }
}
