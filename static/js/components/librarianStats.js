const libStats = Vue.component("lib-stats", {
  template: `
      <div>
        <div class="container">
          <div style="display: flex; justify-content: space-between; gap: 30px;">
            <div class="chart-container" style="width: 50%;">
              <canvas id="booksIssuedChart"></canvas>
            </div>
            <div class="chart-container" style="width: 50%;">
              <canvas id="sectionsChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    `,
  data() {
    return {
      booksIssuedChart: null,
      sectionsChart: null,
    };
  },
  methods: {
    fetchLibrarianStatistics() {
      fetch("/librarian/statistics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.books_issued && data.sections) {
            this.createBooksIssuedChart(data.books_issued);
            this.createSectionsChart(data.sections);
          } else {
            console.error("No statistics available:", data);
          }
        })
        .catch((error) => console.error("Error fetching statistics:", error));
    },
    createBooksIssuedChart(data) {
      const ctx = document.getElementById("booksIssuedChart").getContext("2d");
      this.booksIssuedChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              label: "Books Issued",
              data: Object.values(data),
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },
    createSectionsChart(data) {
      const ctx = document.getElementById("sectionsChart").getContext("2d");
      this.sectionsChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              data: Object.values(data),
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
          },
        },
      });
    },
  },
  mounted() {
    this.fetchLibrarianStatistics();
  },
});

export default libStats;
