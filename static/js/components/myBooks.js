const myBooks = Vue.component("my-books", {
  template: `
          <div>
              <div class="container tableDetails">
                  <h1>My Books</h1>
                  <div v-if="!hasIssuedOrPendingBooks">
                      <p>No books available</p>
                  </div>
                  <table v-else class="table table-light">
                      <thead>
                          <tr>
                              <th scope="col">Book</th>
                              <th scope="col">Author</th>
                              <th scope="col">Section</th>
                              <th scope="col">Return Date</th>
                              <th scope="col">Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="book in books" :key="book.id" v-if="book.status === 'issued' || book.status === 'pending'">
                              <td>{{ book.title }}</td>
                              <td>{{ book.author }}</td>
                              <td>{{ book.section_name }}</td>
                              <td>{{ formatDate(book.return_date) }}</td>
                              <td>
                                  <button @click="viewBook(book.book_id)" class="btn btn-success" v-if="book.status === 'issued'">View Book</button>
                                  <button @click="returnBook(book.id)" class="btn btn-danger" v-if="book.status === 'issued'">Return</button>
                                  <button v-else class="btn btn-secondary" disabled>Return</button>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
              <div class="container tableDetails">
                  <h1>Completed Books</h1>
                  <div v-if="!hasReturnedBooks">
                      <p>No completed books available</p>
                  </div>
                  <table v-else class="table table-dark">
                      <thead>
                          <tr>
                              <th scope="col">Book</th>
                              <th scope="col">Author</th>
                              <th scope="col">Section</th>
                              <th scope="col">Return Date</th>
                              <th scope="col">Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="book in books" :key="book.id" v-if="book.status === 'returned'">
                              <td>{{ book.title }}</td>
                              <td>{{ book.author }}</td>
                              <td>{{ book.section_name }}</td>
                              <td>{{ formatDate(book.return_date) }}</td>
                              <td>
                                  <button @click="openRateModal(book.book_id)" class="btn btn-danger" v-if="!book.is_rated">Rate</button>
                                  <button v-else class="btn btn-secondary" disabled>Rated</button>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
              <!-- Rating Modal -->
              <div class="modal fade" id="rateModal" tabindex="-1" role="dialog" aria-labelledby="rateModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="rateModalLabel">Rate Book</h5>
                      <button type="button" class="btn btn-close" data-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <form>
                        <div class="form-group">
                          <label for="rating">Rating</label>
                          <input type="number" class="form-control" id="rating" v-model="rating" min="1" max="5">
                        </div>
                        <div class="form-group">
                          <label for="comment">Comment</label>
                          <textarea class="form-control" id="comment" v-model="comment"></textarea>
                        </div>
                      </form>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                      <button type="button" class="btn btn-primary" @click="submitRating(currentBookId)">Submit</button>
                    </div>
                  </div>
                </div>
              </div>
          </div>
      `,
  data() {
    return {
      books: [],
      currentBookId: null,
      rating: 1,
      comment: "",
    };
  },
  computed: {
    hasIssuedOrPendingBooks() {
      return this.books.some(
        (book) => book.status === "issued" || book.status === "pending"
      );
    },
    hasReturnedBooks() {
      return this.books.some((book) => book.status === "returned");
    },
  },
  mounted() {
    this.fetchBooks();
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    viewBook(id) {
      this.$router.push(`/view_book/${id}`);
    },
    fetchBooks() {
      fetch("/mybooks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch books.");
          }
          return response.json();
        })
        .then((data) => {
          this.books = data;
        });
    },
    openRateModal(id) {
      this.currentBookId = id;
      $("#rateModal").modal("show");
    },
    returnBook(id) {
      fetch(`/returnbook/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Return failed.");
          }
          return response.json();
        })
        .then(() => {
          this.fetchBooks();
        });
    },
    submitRating(id) {
      fetch(`/ratebook/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
        body: JSON.stringify({
          rating: this.rating,
          feedback: this.comment,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Rating failed.");
          }
          return response.json();
        })
        .then((data) => {
          if (data.message) {
            alert(data.message);
            $("#rateModal").modal("hide");
            this.fetchBooks();
          } else {
            alert(data.error);
          }
        });
    },
  },
});

export default myBooks;
