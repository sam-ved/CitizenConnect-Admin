// Users page logic

let currentUserPage = 1;
let userSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  redirectToLoginIfNeeded();
  initializeUsers();
});

function initializeUsers() {
  setupUserEventListeners();
  loadUsers();
}

function setupUserEventListeners() {
  const searchBox = document.getElementById('userSearchBox');
  if (searchBox) {
    searchBox.addEventListener('input', debounce(applyUserSearch, 300));
  }
}

function applyUserSearch() {
  currentUserPage = 1;
  userSearchQuery = document.getElementById('userSearchBox')?.value || '';
  loadUsers();
}

async function loadUsers() {
  try {
    const params = new URLSearchParams();
    params.append('page', currentUserPage);
    params.append('limit', 25);
    if (userSearchQuery) params.append('search', userSearchQuery);

    const data = await apiCall(`/api/users?${params}`);
    if (data) {
      renderUsersTable(data.users);
      renderUserPagination(data.total_pages, data.page);
    }
  } catch (error) {
    showNotification('Failed to load users', 'error');
  }
}

function renderUsersTable(users) {
  const tableBody = document.getElementById('usersTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (users.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="5" class="text-center">No users found</td></tr>';
    return;
  }

  users.forEach((user) => {
    const row = document.createElement('tr');
    row.style.cursor = 'pointer';
    row.innerHTML = `
      <td>${escapeHtml(user.citizen_name)}</td>
      <td>${escapeHtml(user.citizen_email)}</td>
      <td>${formatPhoneNumber(user.citizen_phone)}</td>
      <td>${user.total_complaints}</td>
      <td>${formatDate(user.last_complaint_date)}</td>
      <td>
        <button class="btn-small btn-view" onclick="viewUserDetails('${user.citizen_email}')">View</button>
      </td>
    `;

    row.addEventListener('click', () => {
      viewUserDetails(user.citizen_email);
    });

    tableBody.appendChild(row);
  });
}

function renderUserPagination(totalPages, currentPageNum) {
  const paginationDiv = document.getElementById('userPagination');
  if (!paginationDiv || totalPages <= 1) {
    if (paginationDiv) paginationDiv.innerHTML = '';
    return;
  }

  let html = '';
  if (currentPageNum > 1) {
    html += `<button class="btn-page" onclick="goToUserPage(${currentPageNum - 1})">Previous</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="btn-page ${i === currentPageNum ? 'active' : ''}" onclick="goToUserPage(${i})">${i}</button>`;
  }

  if (currentPageNum < totalPages) {
    html += `<button class="btn-page" onclick="goToUserPage(${currentPageNum + 1})">Next</button>`;
  }

  paginationDiv.innerHTML = html;
}

function goToUserPage(page) {
  currentUserPage = page;
  loadUsers();
}

async function viewUserDetails(email) {
  try {
    const data = await apiCall(`/api/users/${encodeURIComponent(email)}`);
    if (data) {
      showUserDetailModal(data);
    }
  } catch (error) {
    showNotification('Failed to load user details', 'error');
  }
}

function showUserDetailModal(userData) {
  const modal = document.getElementById('userDetailModal') || createUserDetailModal();
  const modalContent = modal.querySelector('.modal-content');

  const complaintsHtml = userData.complaints
    .map(
      (complaint) => `
    <tr>
      <td>${complaint.id.slice(0, 8)}</td>
      <td>${escapeHtml(complaint.title)}</td>
      <td><span class="badge badge-secondary">${complaint.status}</span></td>
      <td>${formatDate(complaint.created_at)}</td>
    </tr>
  `,
    )
    .join('');

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Citizen Details</h2>
      <button class="close-btn" onclick="closeUserDetailModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="user-detail">
        <p><strong>Name:</strong> ${escapeHtml(userData.citizen_name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(userData.citizen_email)}</p>
        <p><strong>Phone:</strong> ${formatPhoneNumber(userData.citizen_phone)}</p>
        <p><strong>Total Complaints:</strong> ${userData.total_complaints}</p>

        <h3>Status Breakdown</h3>
        <ul style="list-style: none; padding: 0;">
          <li>Pending: ${userData.status_breakdown.pending}</li>
          <li>In Progress: ${userData.status_breakdown.in_progress}</li>
          <li>Resolved: ${userData.status_breakdown.resolved}</li>
          <li>Rejected: ${userData.status_breakdown.rejected}</li>
        </ul>

        <h3>Complaints</h3>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${complaintsHtml}
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeUserDetailModal()">Close</button>
    </div>
  `;

  modal.style.display = 'block';
}

function createUserDetailModal() {
  const modal = document.createElement('div');
  modal.id = 'userDetailModal';
  modal.className = 'modal';
  modal.innerHTML = '<div class="modal-content"></div>';
  document.body.appendChild(modal);
  return modal;
}

function closeUserDetailModal() {
  const modal = document.getElementById('userDetailModal');
  if (modal) modal.style.display = 'none';
}

// Close modal on background click
window.addEventListener('click', (e) => {
  const modal = document.getElementById('userDetailModal');
  if (e.target === modal) modal.style.display = 'none';
});
