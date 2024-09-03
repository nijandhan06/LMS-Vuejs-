const librarianUserRequests = Vue.component("librarian-user-requests", {
  template: `
        <div>
          <div class="container tableDetails">
            <h1>Requests</h1>
            <div v-if="!hasPendingRequests">
              <p>No requests available</p>
            </div>
            <table v-else class="table table-light">
              <thead>
                <tr>
                  <th scope="col">Book</th>
                  <th scope="col">Author</th>
                  <th scope="col">Section</th>
                  <th scope="col">Status</th>
                  <th scope="col">Return Date</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="req in requests" :key="req.id" v-if="req.status === 'pending'">
                  <td><a href="/#/librarian_requests" @click="showDetails(req)">{{ req.title }}</a></td>
                  <td>{{ req.author }}</td>
                  <td>{{ req.section_name }}</td>
                  <td>{{ req.status }}</td>
                  <td>{{ formatDate(req.return_date) }}</td>
                  <td>
                    <button @click="updateRequestStatus(req.id, 'approve')" class="btn btn-success">Approve</button>
                    <button @click="updateRequestStatus(req.id, 'reject')" class="btn btn-danger">Reject</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="container tableDetails">
            <h1>Book Status</h1>
            <div v-if="!hasIssuedBooks">
              <p>No issued books available</p>
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
                <tr v-for="req in requests" :key="req.id" v-if="req.status === 'issued'">
                  <td>{{ req.title }}</td>
                  <td>{{ req.author }}</td>
                  <td>{{ req.section_name }}</td>
                  <td>{{ formatDate(req.return_date) }}</td>
                  <td>
                    <button @click="updateRequestStatus(req.id, 'revoke')" class="btn btn-danger">Revoke</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
    
          <!-- Book Details Modal -->
          <div class="modal fade" id="bookDetailsModal" tabindex="-1" role="dialog" aria-labelledby="bookDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="bookDetailsModalLabel">Request Details</h5>
                  <button type="button" class="btn btn-close" data-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <p><strong>UserName:</strong> {{ selectedBook.user_name }}</p>
                  <p><strong>Days Requested:</strong> {{ selectedBook.days_requested }}</p>
                  <p><strong>Title:</strong> {{ selectedBook.title }}</p>
                  <p><strong>Author:</strong> {{ selectedBook.author }}</p>
                  <p><strong>Section:</strong> {{ selectedBook.section_name }}</p>
                </div>
                <div class="modal-footer" style="display:flex; justify-content:space-between;">
                  <button type="button" class="btn btn-success" @click="viewBook(selectedBook.book_id)">View Book</button>
                  <button @click="updateRequestStatus(selectedBook.id, 'approve')" class="btn btn-warning">Approve</button>
                  <button @click="updateRequestStatus(selectedBook.id, 'reject')" class="btn btn-danger">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
  data() {
    return {
      requests: [],
      selectedBook: {},
    };
  },
  computed: {
    hasPendingRequests() {
      return this.requests.some((req) => req.status === "pending");
    },
    hasIssuedBooks() {
      return this.requests.some((req) => req.status === "issued");
    },
  },
  mounted() {
    this.fetchRequests();
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    viewBook(id) {
      this.$router.push("/view_book/" + id);
      location.reload();
    },
    fetchRequests() {
      fetch("/userrequests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.requests = data;
        });
    },
    showDetails(req) {
      this.selectedBook = req;
      $("#bookDetailsModal").modal("show");
    },
    updateRequestStatus(id, action) {
      let confirmationMessage;
      let url;

      switch (action) {
        case "approve":
          confirmationMessage =
            "Are you sure you want to approve this request?";
          url = `/approverequest/${id}`;
          break;
        case "reject":
          confirmationMessage = "Are you sure you want to reject this request?";
          url = `/rejectrequest/${id}`;
          break;
        case "revoke":
          confirmationMessage = "Are you sure you want to revoke this request?";
          url = `/revokebook/${id}`;
          break;
        default:
          return;
      }

      if (confirm(confirmationMessage)) {
        fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              alert("Something went wrong. Please try again later.");
              return;
            }
            return response.json();
          })
          .then(() => {
            this.fetchRequests();
          });
      }
    },
  },
});

export default librarianUserRequests;
