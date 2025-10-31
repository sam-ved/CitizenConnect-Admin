// Dashboard page logic

let dashboardCache = {
  data: null,
  timestamp: 0,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
};

document.addEventListener('DOMContentLoaded', () => {
  redirectToLoginIfNeeded();
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const now = Date.now();
    if (
      dashboardCache.data &&
      now - dashboardCache.timestamp < dashboardCache.cacheExpiry
    ) {
      renderDashboard(dashboardCache.data);
      return;
    }

    const data = await apiCall('/api/dashboard/stats');
    if (data) {
      dashboardCache.data = data;
      dashboardCache.timestamp = now;
      renderDashboard(data);
    }
  } catch (error) {
    showNotification('Failed to load dashboard data', 'error');
  }
}

function renderDashboard(data) {
  renderStatisticsCards(data);
  renderCharts(data);
  loadRecentComplaints();
}

function renderStatisticsCards(data) {
  const cardsContainer = document.getElementById('statisticsCards');
  if (!cardsContainer) return;

  cardsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-header">Total Complaints</div>
      <div class="stat-number">${data.total_complaints || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">Pending</div>
      <div class="stat-number" style="color: #FFC107;">${data.pending_count || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">Resolved</div>
      <div class="stat-number" style="color: #4CAF50;">${data.resolved_count || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">Rejected</div>
      <div class="stat-number" style="color: #F44336;">${data.rejected_count || 0}</div>
    </div>
  `;
}

function renderCharts(data) {
  // Prepare data for custom charts
  const chartData = data.departments_data.map((dept) => ({
    label: dept.department_name,
    value: parseInt(dept.complaint_count),
  }));

  if (chartData.length === 0) {
    const pieContainer = document.getElementById('pieChart');
    const barContainer = document.getElementById('barChart');
    if (pieContainer)
      pieContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">No data available</p>';
    if (barContainer)
      barContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">No data available</p>';
    return;
  }

  // Draw custom charts
  drawPieChart(chartData);
  drawBarChart(chartData);
}

function drawPieChart(chartData) {
  const container = document.getElementById('pieChart');
  if (!container) return;

  // Create canvas element
  container.innerHTML =
    '<canvas id="pieChartCanvas" style="width: 100%; height: 100%;"></canvas>';

  // Create and render pie chart
  new PieChart('pieChartCanvas', chartData, {
    title: 'Complaints Distribution by Department',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'],
    padding: 50,
  });
}

function drawBarChart(chartData) {
  const container = document.getElementById('barChart');
  if (!container) return;

  // Create canvas element
  container.innerHTML =
    '<canvas id="barChartCanvas" style="width: 100%; height: 100%;"></canvas>';

  // Create and render bar chart
  new BarChart('barChartCanvas', chartData, {
    title: 'Complaints Count per Department',
    color: '#4285F4',
    padding: 60,
  });
}

async function loadRecentComplaints() {
  try {
    const data = await apiCall('/api/complaints?page=1&limit=10');
    if (data) {
      renderRecentComplaintsTable(data.complaints);
    }
  } catch (error) {
    console.error('Failed to load recent complaints', error);
  }
}

function renderRecentComplaintsTable(complaints) {
  const tableBody = document.getElementById('recentComplaintsBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (complaints.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No complaints yet</td></tr>';
    return;
  }

  complaints.forEach((complaint) => {
    const row = document.createElement('tr');
    row.className = 'complaint-row';
    row.style.cursor = 'pointer';
    row.innerHTML = `
      <td>${complaint.id.slice(0, 8)}</td>
      <td>${escapeHtml(complaint.title)}</td>
      <td>${escapeHtml(complaint.citizen_name)}</td>
      <td><span class="badge ${getStatusBadgeClass(complaint.status)}">${complaint.status}</span></td>
      <td>${formatDate(complaint.created_at)}</td>
      <td>
        <button class="btn-small btn-view" data-id="${complaint.id}">View</button>
      </td>
    `;

    row.addEventListener('click', () => {
      window.location.href = `/complaints?view=${complaint.id}`;
    });

    tableBody.appendChild(row);
  });
}
