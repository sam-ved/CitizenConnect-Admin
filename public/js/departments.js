// Departments page logic

document.addEventListener('DOMContentLoaded', () => {
  redirectToLoginIfNeeded();
  loadDepartments();
  setupEventListeners();
});

function setupEventListeners() {
  const addBtn = document.getElementById('addDepartmentBtn');
  if (addBtn) {
    addBtn.addEventListener('click', openAddDepartmentForm);
  }
}

async function loadDepartments() {
  try {
    const data = await apiCall('/api/departments');
    if (data) {
      renderDepartmentsTable(data.departments);
    }
  } catch (error) {
    showNotification('Failed to load departments', 'error');
  }
}

function renderDepartmentsTable(departments) {
  const tableBody = document.getElementById('departmentsTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (departments.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="5" class="text-center">No departments found</td></tr>';
    return;
  }

  departments.forEach((dept) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(dept.name)}</td>
      <td>${escapeHtml(dept.description || 'N/A')}</td>
      <td>
        <span class="badge ${dept.is_active ? 'badge-success' : 'badge-danger'}">
          ${dept.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>${dept.complaint_count || 0}</td>
      <td>
        <button class="btn-small btn-edit" onclick="openEditDepartmentForm('${dept.id}')">Edit</button>
        <button class="btn-small btn-delete" onclick="deleteDepartmentConfirm('${dept.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function openAddDepartmentForm() {
  const modal = document.getElementById('departmentModal') || createDepartmentModal();
  const modalContent = modal.querySelector('.modal-content');

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Add New Department</h2>
      <button class="close-btn" onclick="closeDepartmentModal()">&times;</button>
    </div>
    <form id="departmentForm">
      <div class="form-group">
        <label>Department Name</label>
        <input type="text" id="deptName" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="deptDescription"></textarea>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="deptActive" checked>
          Active
        </label>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeDepartmentModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Create Department</button>
      </div>
    </form>
  `;

  document.getElementById('departmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addNewDepartment();
  });

  modal.style.display = 'block';
}

async function addNewDepartment() {
  try {
    const newDept = {
      name: document.getElementById('deptName').value,
      description: document.getElementById('deptDescription').value,
      is_active: document.getElementById('deptActive').checked,
    };

    await apiCall('/api/departments', 'POST', newDept);
    showNotification('Department created successfully', 'success');
    closeDepartmentModal();
    loadDepartments();
  } catch (error) {
    showNotification('Failed to create department', 'error');
  }
}

async function openEditDepartmentForm(id) {
  try {
    // We need to get department data from the table or fetch it
    const data = await apiCall('/api/departments');
    const dept = data.departments.find((d) => d.id === id);

    if (!dept) {
      showNotification('Department not found', 'error');
      return;
    }

    const modal = document.getElementById('departmentModal') || createDepartmentModal();
    const modalContent = modal.querySelector('.modal-content');

    modalContent.innerHTML = `
      <div class="modal-header">
        <h2>Edit Department</h2>
        <button class="close-btn" onclick="closeDepartmentModal()">&times;</button>
      </div>
      <form id="departmentForm">
        <div class="form-group">
          <label>Department Name</label>
          <input type="text" id="deptName" value="${escapeHtml(dept.name)}" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="deptDescription">${escapeHtml(dept.description || '')}</textarea>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="deptActive" ${dept.is_active ? 'checked' : ''}>
            Active
          </label>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeDepartmentModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    `;

    document.getElementById('departmentForm').addEventListener('submit', (e) => {
      e.preventDefault();
      updateDepartment(id);
    });

    modal.style.display = 'block';
  } catch (error) {
    showNotification('Failed to load department', 'error');
  }
}

async function updateDepartment(id) {
  try {
    const updatedDept = {
      name: document.getElementById('deptName').value,
      description: document.getElementById('deptDescription').value,
      is_active: document.getElementById('deptActive').checked,
    };

    await apiCall(`/api/departments/${id}`, 'PUT', updatedDept);
    showNotification('Department updated successfully', 'success');
    closeDepartmentModal();
    loadDepartments();
  } catch (error) {
    showNotification('Failed to update department', 'error');
  }
}

async function deleteDepartmentConfirm(id) {
  if (!confirm('Are you sure you want to delete this department?')) {
    return;
  }

  try {
    await apiCall(`/api/departments/${id}`, 'DELETE');
    showNotification('Department deleted successfully', 'success');
    loadDepartments();
  } catch (error) {
    showNotification('Failed to delete department: ' + error.message, 'error');
  }
}

function createDepartmentModal() {
  const modal = document.createElement('div');
  modal.id = 'departmentModal';
  modal.className = 'modal';
  modal.innerHTML = '<div class="modal-content"></div>';
  document.body.appendChild(modal);
  return modal;
}

function closeDepartmentModal() {
  const modal = document.getElementById('departmentModal');
  if (modal) modal.style.display = 'none';
}

// Close modal on background click
window.addEventListener('click', (e) => {
  const modal = document.getElementById('departmentModal');
  if (e.target === modal) modal.style.display = 'none';
});
