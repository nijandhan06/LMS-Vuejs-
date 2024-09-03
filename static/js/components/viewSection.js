const sectionBooks = Vue.component("sectionBooks", {
  template: `
      <div>
        <div class="container">
          <h1>{{ name }}</h1>
          <button @click="addBook" class="btn btn-primary">Add Book</button>
          <div v-if="books.length === 0">
            <h2>No books available</h2>
          </div>
          <div v-else>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Book ID</th>
                  <th>Book Name</th>
                  <th>Author</th>
                  <th>Date Return</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in books" :key="book.id">
                  <td>{{ book.id }}</td>
                  <td>{{ book.title }}</td>
                  <td>{{ book.author }}</td>
                  <td>{{ formatDate(book.date_return) }}</td>
                  <td>
                    <button class="btn btn-primary" @click="viewBook(book.id)">View</button>
                    <button class="btn btn-warning" @click="editBook(book.id)">Edit</button>
                    <button class="btn btn-danger" @click="deleteBook(book.id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,
  data() {
    return {
      id: this.$route.params.id,
      name: "",
      description: "",
      books: [],
    };
  },
  mounted() {
    this.fetchSection();
    this.fetchBooks();
    if (!localStorage.getItem("userToken")) {
      this.$router.push("/login");
    }
  },
  methods: {
    viewBook(id) {
      this.$router.push("/view_book/" + id);
    },
    fetchSection() {
      fetch("/section/" + this.id, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.name = data.name;
          this.description = data.description;
        });
    },
    fetchBooks() {
      fetch("/api/section_book/" + this.id, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.books = data;
        });
    },
    addBook() {
      this.$router.push("/add_book/" + this.id);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    deleteBook(id) {
      if (!confirm("Are you sure you want to delete this book?")) {
        return;
      }
      fetch("/api/book/" + id, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      }).then((response) => {
        if (response.ok) {
          this.fetchBooks();
        }
      });
    },
    editBook(id) {
      this.$router.push("/edit_book/" + id);
    },
  },
});

export default sectionBooks;
