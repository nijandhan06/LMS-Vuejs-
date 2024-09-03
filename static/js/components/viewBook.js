const viewBook = Vue.component("view-book", {
  template: `
      <div class="container">
        <div class="row">
          <!-- Book Details -->
          <div class="col-md-6">
            <div class="card my-3 book-card">
              <div class="card-body">
                <h2 class="card-title">{{ book.title }}</h2>
                <p class="card-text">{{ book.author }}</p>
                <p class="card-text">{{ book.section_name }}</p>
                <div class="content-card">
                  <p class="card-text">{{ book.content }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Ratings -->
          <div class="col-md-6">
            <div class="card my-3 rate-card">
              <div class="card-body">
                <h2 class="card-title">Ratings</h2>
                <div class="ratings">
                  <div class="rating" v-for="rating in ratings" :key="rating.id">
                    <h6>{{ rating.user_name }}</h6>
                    <div v-html="displayStars(rating.rating)" class="star-rating"></div>
                    <p>{{ rating.feedback }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  data() {
    return {
      book: {},
      ratings: [],
      bookId: this.$route.params.id,
    };
  },
  mounted() {
    this.fetchBookDetails();
    this.fetchRatings();
  },
  methods: {
    displayStars(rating) {
      return "&#9733;".repeat(rating);
    },
    fetchBookDetails() {
      fetch(`/book/${this.bookId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.book = data;
        })
        .catch((error) => console.error("Error fetching book details:", error));
    },
    fetchRatings() {
      fetch(`/bookrating/${this.bookId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.ratings = data;
        })
        .catch((error) => console.error("Error fetching ratings:", error));
    },
  },
});

export default viewBook;
