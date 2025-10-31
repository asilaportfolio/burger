// Check if user is admin and show/hide admin actions accordingly
async function checkAdminStatus() {
  try {
    const response = await fetch('/api/check-admin');
    const data = await response.json();
    
    if (data.isAdmin) {
      showAdminActions();
      document.getElementById('adminLogoutBtn').style.display = 'block';
      document.getElementById('adminPanelBtn').style.display = 'none';
    } else {
      hideAdminActions();
      document.getElementById('adminLogoutBtn').style.display = 'none';
      document.getElementById('adminPanelBtn').style.display = 'block';
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    hideAdminActions();
    document.getElementById('adminLogoutBtn').style.display = 'none';
    document.getElementById('adminPanelBtn').style.display = 'block';
  }
}

// Function to show admin actions (called after login)
function showAdminActions() {
  try {
    // Show all admin action buttons
    const adminActions = document.querySelectorAll('.admin-card-actions');
    adminActions.forEach(action => {
      action.style.display = 'block';
    });
  } catch (error) {
    console.error('Error showing admin actions:', error);
  }
}

// Function to hide admin actions
function hideAdminActions() {
  try {
    // Hide all admin action buttons
    const adminActions = document.querySelectorAll('.admin-card-actions');
    adminActions.forEach(action => {
      action.style.display = 'none';
    });
  } catch (error) {
    console.error('Error hiding admin actions:', error);
  }
}

// Call this function when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  checkAdminStatus();
  // Show admin panel button by default
  document.getElementById('adminPanelBtn').style.display = 'block';
});

// Check admin status when page is loaded
window.addEventListener('load', function() {
  checkAdminStatus();
});

// Logout function
async function logout() {
  try {
    const response = await fetch('/admin-logout', { method: 'GET' });
    if (response.ok) {
      // Hide admin actions immediately
      hideAdminActions();
      // Hide logout button and show admin panel button
      const adminLogoutBtn = document.getElementById('adminLogoutBtn');
      const adminPanelBtn = document.getElementById('adminPanelBtn');
      if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';
      if (adminPanelBtn) adminPanelBtn.style.display = 'block';
      // Redirect to home page
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

// Add to cart functionality
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-btn') || e.target.closest('.add-btn')) {
    const button = e.target.classList.contains('add-btn') ? e.target : e.target.closest('.add-btn');
    const card = button.closest('.card');
    const productName = card.querySelector('.card-title').textContent;
    const productPrice = card.querySelector('.card-text').textContent;
    
    // Add to cart logic here
    alert(`${productName} savatchaga qo'shildi!`);
  }
});