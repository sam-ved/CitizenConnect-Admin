// Complaints page logic

let currentPage = 1;
let currentFilters = {};
let allDepartments = [];

document.addEventListener('DOMContentLoaded', () => {
  redirectToLoginIfNeeded();
  initializeComplaints();
});

async function initializeComplaints() {
  try {
    await loadDepartments();
    await loadComplaints();
    setupEventListeners();
  } catch (error) {
    showNotification('Failed to initialize complaints page', 'error');
  }
}

async function loadDepartments() {
  try {
    const data = await apiCall('/api/departments');
    allDepartments = data.departments || [];
    populateDepartmentFilter();
  } catch (error) {
    console.error('Failed to load departments', error);
  }
}

function populateDepartmentFilter() {
  const deptSelect = document.getElementById('departmentFilter');
  if (!deptSelect) return;

  deptSelect.innerHTML = '<option value="">All Departments</option>';
  allDepartments.forEach((dept) => {
    const option = document.createElement('option');
    option.value = dept.id;
    option.textContent = dept.name;
    deptSelect.appendChild(option);
  });
}

function setupEventListeners() {
  const filterBtn = document.getElementById('applyFiltersBtn');
  if (filterBtn) {
    filterBtn.addEventListener('click', applyFilters);
  }

  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    searchBox.addEventListener('input', debounce(applyFilters, 300));
  }
}

async function applyFilters() {
  currentPage = 1;
  currentFilters = {
    department: document.getElementById('departmentFilter')?.value || '',
    status: document.getElementById('statusFilter')?.value || '',
    search: document.getElementById('searchBox')?.value || '',
    fromDate: document.getElementById('fromDate')?.value || '',
    toDate: document.getElementById('toDate')?.value || '',
  };

  await loadComplaints();
}

async function loadComplaints() {
  try {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', 20);

    if (currentFilters.department) params.append('department', currentFilters.department);
    if (currentFilters.status) params.append('status', currentFilters.status);
    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.fromDate) params.append('fromDate', currentFilters.fromDate);
    if (currentFilters.toDate) params.append('toDate', currentFilters.toDate);

    const data = await apiCall(`/api/complaints?${params}`);
    if (data) {
      renderComplaintsTable(data.complaints);
      renderPagination(data.total_pages, data.page);
    }
  } catch (error) {
    showNotification('Failed to load complaints', 'error');
  }
}

function renderComplaintsTable(complaints) {
  const tableBody = document.getElementById('complaintsTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (complaints.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="7" class="text-center">No complaints found</td></tr>';
    return;
  }

  complaints.forEach((complaint) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <input type="checkbox" class="complaint-checkbox" data-id="${complaint.id}">
      </td>
      <td>${complaint.id.slice(0, 8)}</td>
      <td>${escapeHtml(complaint.title)}</td>
      <td>${escapeHtml(complaint.citizen_name)}</td>
      <td><span class="badge ${getStatusBadgeClass(complaint.status)}">${complaint.status}</span></td>
      <td>${formatDate(complaint.created_at)}</td>
      <td>
        <button class="btn-small btn-view" onclick="viewComplaint('${complaint.id}')">View</button>
        <button class="btn-small btn-edit" onclick="editComplaint('${complaint.id}')">Edit</button>
        <button class="btn-small btn-delete" onclick="deleteComplaint('${complaint.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function renderPagination(totalPages, currentPageNum) {
  const paginationDiv = document.getElementById('pagination');
  if (!paginationDiv || totalPages <= 1) {
    if (paginationDiv) paginationDiv.innerHTML = '';
    return;
  }

  let html = '';
  if (currentPageNum > 1) {
    html += `<button class="btn-page" onclick="goToPage(${currentPageNum - 1})">Previous</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="btn-page ${i === currentPageNum ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  if (currentPageNum < totalPages) {
    html += `<button class="btn-page" onclick="goToPage(${currentPageNum + 1})">Next</button>`;
  }

  paginationDiv.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  loadComplaints();
}

async function viewComplaint(id) {
  try {
    const complaint = await apiCall(`/api/complaints/${id}`);
    if (complaint) {
      showComplaintModal(complaint);
    }
  } catch (error) {
    showNotification('Failed to load complaint', 'error');
  }
}

function showComplaintModal(complaint) {
  const modal = document.getElementById('complaintModal') || createComplaintModal();
  const modalContent = modal.querySelector('.modal-content');

  const deptName = allDepartments.find((d) => d.id === complaint.department_id)?.name || 'Unknown';

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Complaint Details</h2>
      <button class="close-btn" onclick="closeComplaintModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="complaint-detail">
        <p><strong>ID:</strong> ${complaint.id}</p>
        <p><strong>Title:</strong> ${escapeHtml(complaint.title)}</p>
        <p><strong>Description:</strong> ${escapeHtml(complaint.description)}</p>
        <p><strong>Department:</strong> ${escapeHtml(deptName)}</p>
        <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(complaint.status)}">${complaint.status}</span></p>
        <p><strong>Citizen Name:</strong> ${escapeHtml(complaint.citizen_name)}</p>
        <p><strong>Citizen Email:</strong> ${escapeHtml(complaint.citizen_email)}</p>
        <p><strong>Citizen Phone:</strong> ${formatPhoneNumber(complaint.citizen_phone)}</p>
        <p><strong>Created Date:</strong> ${formatDateTime(complaint.created_at)}</p>
        <p><strong>Updated Date:</strong> ${formatDateTime(complaint.updated_at)}</p>
        ${complaint.resolved_at ? `<p><strong>Resolved Date:</strong> ${formatDateTime(complaint.resolved_at)}</p>` : ''}
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="openEditComplaintForm('${complaint.id}')">Edit</button>
      <button class="btn btn-danger" onclick="deleteComplaintConfirm('${complaint.id}')">Delete</button>
      <button class="btn btn-secondary" onclick="closeComplaintModal()">Close</button>
    </div>
  `;

  modal.style.display = 'block';
}

function createComplaintModal() {
  const modal = document.createElement('div');
  modal.id = 'complaintModal';
  modal.className = 'modal';
  modal.innerHTML = '<div class="modal-content"></div>';
  document.body.appendChild(modal);
  return modal;
}

function closeComplaintModal() {
  const modal = document.getElementById('complaintModal');
  if (modal) modal.style.display = 'none';
}

async function editComplaint(id) {
  try {
    const complaint = await apiCall(`/api/complaints/${id}`);
    if (complaint) {
      openEditComplaintForm(id, complaint);
    }
  } catch (error) {
    showNotification('Failed to load complaint', 'error');
  }
}

function openEditComplaintForm(id, complaint = null) {
  const modal = document.getElementById('complaintEditModal') || createEditModal();
  const modalContent = modal.querySelector('.modal-content');

  if (complaint) {
    const deptId = complaint.department_id;
    modalContent.innerHTML = `
      <div class="modal-header">
        <h2>Edit Complaint</h2>
        <button class="close-btn" onclick="closeEditModal()">&times;</button>
      </div>
      <form id="editComplaintForm">
        <div class="form-group">
          <label>Title</label>
          <input type="text" id="editTitle" value="${escapeHtml(complaint.title)}" required maxlength="200">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="editDescription" required>${escapeHtml(complaint.description)}</textarea>
        </div>
        <div class="form-group">
          <label>Department</label>
          <select id="editDepartment" required>
            ${allDepartments
              .map(
                (d) =>
                  `<option value="${d.id}" ${d.id === deptId ? 'selected' : ''}>${d.name}</option>`,
              )
              .join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="editStatus" required>
            <option value="pending" ${complaint.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in_progress" ${complaint.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${complaint.status === 'resolved' ? 'selected' : ''}>Resolved</option>
            <option value="rejected" ${complaint.status === 'rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </div>
        <div class="form-group">
          <label>Citizen Name</label>
          <input type="text" id="editCitizenName" value="${escapeHtml(complaint.citizen_name)}" required>
        </div>
        <div class="form-group">
          <label>Citizen Email</label>
          <input type="email" id="editCitizenEmail" value="${escapeHtml(complaint.citizen_email)}" required>
        </div>
        <div class="form-group">
          <label>Citizen Phone</label>
          <input type="tel" id="editCitizenPhone" value="${escapeHtml(complaint.citizen_phone)}" required>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    `;

    document.getElementById('editComplaintForm').addEventListener('submit', (e) => {
      e.preventDefault();
      saveComplaintChanges(id);
    });
  }

  modal.style.display = 'block';
}

function createEditModal() {
  const modal = document.createElement('div');
  modal.id = 'complaintEditModal';
  modal.className = 'modal';
  modal.innerHTML = '<div class="modal-content"></div>';
  document.body.appendChild(modal);
  return modal;
}

function closeEditModal() {
  const modal = document.getElementById('complaintEditModal');
  if (modal) modal.style.display = 'none';
}

async function saveComplaintChanges(id) {
  try {
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const email = document.getElementById('editCitizenEmail').value.trim();
    const phone = document.getElementById('editCitizenPhone').value.trim();

    // Validation
    if (!title || title.length < 1 || title.length > 200) {
      showNotification('Title must be between 1-200 characters', 'error');
      return;
    }

    if (!description || description.length < 10) {
      showNotification('Description must be at least 10 characters', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    if (!validatePhone(phone)) {
      showNotification('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    const updateData = {
      title,
      description,
      department_id: document.getElementById('editDepartment').value,
      status: document.getElementById('editStatus').value,
      citizen_name: document.getElementById('editCitizenName').value.trim(),
      citizen_email: email,
      citizen_phone: phone,
    };

    await apiCall(`/api/complaints/${id}`, 'PUT', updateData);
    showNotification('Complaint updated successfully', 'success');
    closeEditModal();
    loadComplaints();
  } catch (error) {
    showNotification('Failed to update complaint', 'error');
  }
}

async function deleteComplaint(id) {
  if (confirm('Are you sure you want to delete this complaint?')) {
    deleteComplaintConfirm(id);
  }
}

async function deleteComplaintConfirm(id) {
  try {
    await apiCall(`/api/complaints/${id}`, 'DELETE');
    showNotification('Complaint deleted successfully', 'success');
    closeComplaintModal();
    closeEditModal();
    loadComplaints();
  } catch (error) {
    showNotification('Failed to delete complaint', 'error');
  }
}

// Close modals on background click
window.addEventListener('click', (e) => {
  const complaintModal = document.getElementById('complaintModal');
  if (e.target === complaintModal) complaintModal.style.display = 'none';

  const editModal = document.getElementById('complaintEditModal');
  if (e.target === editModal) editModal.style.display = 'none';
});
