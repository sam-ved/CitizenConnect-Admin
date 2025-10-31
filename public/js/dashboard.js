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
  // Check if Google Charts is loaded
  if (typeof google === 'undefined') {
    console.warn('Google Charts not loaded, trying again in 500ms');
    setTimeout(() => renderCharts(data), 500);
    return;
  }

  google.charts.load('current', { packages: ['corechart'] });
  google.charts.setOnLoadCallback(() => {
    drawPieChart(data.departments_data);
    drawBarChart(data.departments_data);
  });
}

function drawPieChart(departmentsData) {
  const container = document.getElementById('pieChart');
  if (!container) return;

  const chartData = [['Department', 'Complaints']];
  departmentsData.forEach((dept) => {
    chartData.push([dept.department_name, parseInt(dept.complaint_count)]);
  });

  const data = google.visualization.arrayToDataTable(chartData);
  const options = {
    title: 'Complaints Distribution by Department',
    pieHole: 0.4,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
    chartArea: { width: '90%', height: '90%' },
  };

  const chart = new google.visualization.PieChart(container);
  chart.draw(data, options);

  window.addEventListener('resize', () => {
    chart.draw(data, options);
  });
}

function drawBarChart(departmentsData) {
  const container = document.getElementById('barChart');
  if (!container) return;

  const chartData = [['Department', 'Count']];
  departmentsData.forEach((dept) => {
    chartData.push([dept.department_name, parseInt(dept.complaint_count)]);
  });

  const data = google.visualization.arrayToDataTable(chartData);
  const options = {
    title: 'Complaints Count per Department',
    legend: { position: 'none' },
    colors: ['#4285F4'],
    hAxis: {
      title: 'Department',
    },
    vAxis: {
      title: 'Number of Complaints',
    },
    chartArea: { width: '90%', height: '70%' },
  };

  const chart = new google.visualization.BarChart(container);
  chart.draw(data, options);

  window.addEventListener('resize', () => {
    chart.draw(data, options);
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
