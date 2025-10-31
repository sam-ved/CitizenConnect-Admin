// Authentication page logic

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorDiv = document.getElementById('error');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.innerHTML = '';

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (!username || !password) {
        errorDiv.innerHTML = '<p>Please enter both username and password</p>';
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      try {
        const response = await apiCall('/api/auth/login', 'POST', {
          username,
          password,
        });

        if (response) {
          setToken(response.token);
          showNotification('Login successful!', 'success');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 500);
        }
      } catch (error) {
        errorDiv.innerHTML = `<p>${error.message}</p>`;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    });
  }
});
