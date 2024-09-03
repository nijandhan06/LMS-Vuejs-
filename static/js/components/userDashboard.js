const UserDashboard = Vue.component("UserDashboard", {
  template: `
      <div>
        <div class="container">
          <div class="search-bar">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search by Section, Title, Author" 
              v-model="searchQuery" 
              style="width:100%; margin: 20px auto;" 
              @input="performSearch" 
            />
          </div>
          <div v-for="section in sections" :key="section.id" class="card my-3">
            <div class="card-body">
              <h2 class="card-title">{{ section.name }}</h2>
              <div class="row" style="overflow-x: auto;">
                <div class="col-md-2" v-for="book in section.books" :key="book.id">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">{{ book.title }}</h5>
                      <p class="card-text">{{ book.author }}</p>
                      <p class="card-text">{{ formatDate(book.return_date) }}</p>
                      <button class="btn btn-primary" @click="showRequestModal(book.id)">Request</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
            <div class="modal fade" id="requestModal" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalLabel">Book Return Policy</h5>
                    <button type="button" class="btn btn-close" data-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul class="list-unstyled">
                    <li><strong>Book Return Policy:</strong></li>
                    <li>1. The return date must be selected from the date picker below.</li>
                    <li>2. Ensure the book is returned in the same condition as it was issued.</li>
                    <li>3. Late returns will incur a late fee, as outlined in our fee structure.</li>
                    <li>4. If the book is not returned by the chosen date, it will be flagged as overdue.</li>
                    <li>5. Repeated late returns may lead to restricted borrowing privileges.</li>
                    <li>6. If the book is damaged or lost, please report it immediately to avoid additional penalties.</li>
                    <li>7. You will receive a notification before the due date to remind you of the return deadline.</li>
                    <li>8. Failure to return the book by the due date may result in a hold on your library account.</li>
                    </ul>
                    <input type="date" v-model="selectedReturnDate" class="form-control">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="makeRequest">Confirm</button>
                </div>
                </div>
            </div>
            </div>

        </div>
      </div>
    `,
  data() {
    return {
      sections: [],
      selectedBookId: null,
      selectedReturnDate: null,
      searchQuery: "",
    };
  },
  mounted() {
    if (!localStorage.getItem("userToken")) {
      this.$router.push("/login");
    }
    this.fetchSections();
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    performSearch() {
      fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
        body: JSON.stringify({ search: this.searchQuery }),
      })
        .then((response) => response.json())
        .then((data) => {
          this.sections = data;
        })
        .catch((error) => {
          console.error("Search Error:", error);
        });
    },
    fetchSections() {
      fetch("/usersection", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.sections = data;
        })
        .catch((error) => {
          console.error("Fetch Sections Error:", error);
        });
    },
    showRequestModal(bookId) {
      this.selectedBookId = bookId;
      $("#requestModal").modal("show");
    },
    makeRequest() {
      const requestData = {
        returnDate: this.selectedReturnDate,
      };

      if (!requestData.returnDate) {
        alert("Please select a return date.");
        return;
      }

      fetch(`/bookrequest/${this.selectedBookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          if (data.message) {
            alert(data.message);
          } else {
            alert(data.error);
          }
          $("#requestModal").modal("hide");
        })
        .catch((error) => {
          console.error("Request Error:", error);
        });
    },
  },
});

export default UserDashboard;
