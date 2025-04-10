document.addEventListener('DOMContentLoaded', () => {
    // Main DOM elements
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const usernameDisplay = document.getElementById('username-display');
    const roleDisplay = document.getElementById('role-display');
    const userInfo = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn');
    const adminPanel = document.getElementById('admin-panel');
    const facultyPanel = document.getElementById('faculty-panel');

    // Config and global variables
    // Dynamically determine the API URL based on the current host
    const API_URL = window.location.origin + '/api';
    // Add null check before setting date value
    const attendanceDateField = document.getElementById('attendance-date');
    if (attendanceDateField) {
        attendanceDateField.valueAsDate = new Date();
    }

    // Check stored authentication and dark mode preference
    init();

    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    document.getElementById('add-user-btn').addEventListener('click', showUserForm);
    document.getElementById('cancel-user-btn').addEventListener('click', hideUserForm);
    document.getElementById('user-form').addEventListener('submit', createUser);
    document.getElementById('add-class-btn').addEventListener('click', showClassForm);
    document.getElementById('cancel-class-btn').addEventListener('click', hideClassForm);
    document.getElementById('class-form').addEventListener('submit', createClass);
    document.getElementById('generate-report-btn').addEventListener('click', generateReport);
    document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);

    // Initialize the application
    function init() {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        if (!token || !role || !username) {
            showLogin();
            showToast('No valid session found, please log in', 'error');
            return;
        }
        showApp(username, role);
        setupTabNavigation();
        // Apply dark mode preference on load
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
            if (darkModeCheckbox) {
                darkModeCheckbox.checked = true;
            }
        }
    }

    // Dark mode toggle function
    function toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
        darkModeCheckbox.checked = isDarkMode;
        showToast(`Switched to ${isDarkMode ? 'Dark' : 'Light'} Mode`, 'success');
    }

    // Authentication functions
    async function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invalid credentials');
            }
            
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', username);
            showApp(username, data.role);
            showToast(`Welcome, ${username}!`, 'success');
        } catch (error) {
            showToast(`Login failed: ${error.message}`, 'error');
            console.error('Login error:', error);
        }
    }

    function handleLogout() {
        localStorage.clear();
        showLogin();
        showToast('You have been logged out', 'success');
    }

    // UI Display functions
    function showApp(username, role) {
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userInfo.classList.remove('hidden');
        usernameDisplay.textContent = username;
        roleDisplay.textContent = `(${role})`;
        
        if (role === 'admin') {
            adminPanel.classList.remove('hidden');
            loadUsers();
            loadClasses('admin');
        } else if (role === 'faculty') {
            facultyPanel.classList.remove('hidden');
            loadClasses('faculty');
        }
    }

    function showLogin() {
        appContainer.classList.add('hidden');
        adminPanel.classList.add('hidden');
        facultyPanel.classList.add('hidden');
        userInfo.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        loginForm.reset();
    }

    function setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                tabContents.forEach(content => content.classList.add('hidden'));
                document.getElementById(tabId).classList.remove('hidden');
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    // Toast notification function
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        toast.prepend(icon, ' ');
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    // Enhanced toast with undo option
    function showToastWithUndo(message, type, undoCallback) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const text = document.createElement('span');
        text.textContent = message;
        
        const undoButton = document.createElement('button');
        undoButton.textContent = 'Undo';
        undoButton.style.marginLeft = '10px';
        undoButton.style.background = 'none';
        undoButton.style.border = 'none';
        undoButton.style.color = '#fff';
        undoButton.style.textDecoration = 'underline';
        undoButton.style.cursor = 'pointer';
        
        undoButton.onclick = async () => {
            await undoCallback();
            toast.remove();
            loadClasses('admin');
            showToast('Class creation undone', 'success');
        };

        toast.appendChild(document.createElement('i')).className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        toast.append(' ', text, undoButton);
        document.body.appendChild(toast);
        
        setTimeout(() => !undoButton.clicked && toast.remove(), 5000);
    }

    // User Management functions
    async function loadUsers() {
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '<tr><td colspan="4">Loading users...</td></tr>';
        
        try {
            console.log('Fetching users from:', API_URL);
            const token = localStorage.getItem('token');
            console.log('Using token:', token ? 'present' : 'missing');
            const response = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Users response status:', response.status);
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.clear();
                    showLogin();
                    showToast('Session expired, please log in again', 'error');
                    return;
                }
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }

            // Check if content-type is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Unexpected response format: Expected JSON');
            }

            const users = await response.json();
            
            if (users.length === 0) {
                usersList.innerHTML = '<tr><td colspan="4">No users found</td></tr>';
                return;
            }
            
            usersList.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id || 'N/A'}</td>
                    <td>${user.username || 'N/A'}</td>
                    <td><span class="badge badge-${user.role || 'unknown'}">${user.role || 'Unknown'}</span></td>
                    <td>
                        <button class="edit-user-btn" data-id="${user.id || ''}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete-user-btn" data-id="${user.id || ''}"><i class="fas fa-trash-alt"></i> Delete</button>
                    </td>
                `;
                
                row.querySelector('.edit-user-btn').addEventListener('click', () => editUser(user));
                row.querySelector('.delete-user-btn').addEventListener('click', () => deleteUser(user.id));
                
                usersList.appendChild(row);
            });
        } catch (error) {
            usersList.innerHTML = '<tr><td colspan="4">Error loading users</td></tr>';
            console.error('Error loading users:', error);
            showToast(`Error loading users: ${error.message}`, 'error');
        }
    }

    function showUserForm() {
        document.getElementById('user-form-container').classList.remove('hidden');
        document.getElementById('user-form').reset();
        document.getElementById('new-password').required = true;
    }

    function hideUserForm() {
        document.getElementById('user-form-container').classList.add('hidden');
    }

    async function createUser(e) {
        e.preventDefault();
        const username = document.getElementById('new-username').value.trim();
        const password = document.getElementById('new-password').value;
        const role = document.getElementById('role').value;

        // Input validation
        if (!username || !role) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (password && password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        // Log the request data for debugging
        console.log('Creating user with data:', { username, password, role });

        try {
            const response = await fetch(`${API_URL}/admin/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, role })
            });

            // Log the raw response for debugging
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));

            // Check if the response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Unexpected response format: Expected JSON');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create user');
            }

            hideUserForm();
            loadUsers();
            showToast('User created successfully', 'success');
        } catch (error) {
            console.error('Error creating user:', error);
            showToast(`Error creating user: ${error.message}`, 'error');
        }
    }

    function editUser(user) {
        const formContainer = document.getElementById('user-form-container');
        formContainer.classList.remove('hidden');
        
        document.getElementById('new-username').value = user.username;
        document.getElementById('new-password').value = '';
        document.getElementById('new-password').required = false;
        document.getElementById('role').value = user.role;
        
        document.getElementById('user-form').onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('new-username').value.trim();
            const password = document.getElementById('new-password').value;
            const role = document.getElementById('role').value;
            
            if (!username || !role) {
                showToast('Username and role are required', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/admin/users/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password: password || undefined, role })
                });
                
                if (!response.ok) throw new Error('Failed to update user');
                
                formContainer.classList.add('hidden');
                loadUsers();
                showToast('User updated successfully', 'success');
            } catch (error) {
                showToast(`Error updating user: ${error.message}`, 'error');
                console.error('Error updating user:', error);
            }
        };
    }

    async function deleteUser(id) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        try {
            const response = await fetch(`${API_URL}/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (!response.ok) throw new Error('Failed to delete user');
            
            loadUsers();
            showToast('User deleted successfully', 'success');
        } catch (error) {
            showToast(`Error deleting user: ${error.message}`, 'error');
            console.error('Error deleting user:', error);
        }
    }

    // Class Management functions
    async function loadClasses(userRole) {
        const classesList = document.getElementById('classes-list');
        if (userRole === 'admin') classesList.innerHTML = '<tr><td colspan="4">Loading classes...</td></tr>';

        try {
            console.log('Fetching classes from:', API_URL);
            const token = localStorage.getItem('token');
            console.log('Using token:', token ? 'present' : 'missing');
            const response = await fetch(`${API_URL}/classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Classes response status:', response.status);
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.clear();
                    showLogin();
                    showToast('Session expired, please log in again', 'error');
                    return;
                }
                throw new Error(`Failed to fetch classes: ${response.statusText}`);
            }
            
            const classes = await response.json();
            
            if (userRole === 'admin') {
                classesList.innerHTML = '';
                classes.forEach(cls => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${cls.id}</td>
                        <td>${cls.name}</td>
                        <td>${cls.strength}</td>
                        <td>
                            <button class="edit-class-btn" data-id="${cls.id}"><i class="fas fa-edit"></i> Edit</button>
                            <button class="delete-class-btn" data-id="${cls.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                        </td>
                    `;
                    
                    // Add event listeners to the edit and delete buttons
                    row.querySelector('.edit-class-btn').addEventListener('click', () => editClass(cls));
                    row.querySelector('.delete-class-btn').addEventListener('click', () => deleteClass(cls.id));
                    
                    classesList.appendChild(row);
                });

                const reportClassSelect = document.getElementById('report-class');
                reportClassSelect.innerHTML = '<option value="">Select a class</option>';
                classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.id;
                    option.textContent = cls.name;
                    reportClassSelect.appendChild(option.cloneNode(true));
                });
            } else if (userRole === 'faculty') {
                const classSelect = document.getElementById('class-select');
                classSelect.innerHTML = '<option value="">Select a class</option>';
                classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.id;
                    option.textContent = cls.name;
                    classSelect.appendChild(option);
                });
                
                classSelect.addEventListener('change', function() {
                    if (this.value) loadClassStudents(this.value);
                    else document.getElementById('attendance-buttons').innerHTML = '';
                });
            }
        } catch (error) {
            if (userRole === 'admin') classesList.innerHTML = '<tr><td colspan="4">Error loading classes</td></tr>';
            console.error('Error loading classes:', error);
            showToast(`Error loading classes: ${error.message}`, 'error');
        }
    }

    function showClassForm() {
        document.getElementById('class-form-container').classList.remove('hidden');
        document.getElementById('class-form').reset();
        document.getElementById('student-data-container').classList.add('hidden');
    }

    function hideClassForm() {
        document.getElementById('class-form-container').classList.add('hidden');
        // Reset the form to its default state for creating a new class
        document.getElementById('class-form').reset();
        document.getElementById('class-form').onsubmit = createClass;
    }
    
    function editClass(cls) {
        const formContainer = document.getElementById('class-form-container');
        formContainer.classList.remove('hidden');
        
        // Populate the form with existing class data
        document.getElementById('class-name').value = cls.name;
        document.getElementById('class-strength').value = cls.strength;
        
        // Change the form submission handler to update instead of create
        document.getElementById('class-form').onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('class-name').value.trim();
            const strength = parseInt(document.getElementById('class-strength').value);
            
            if (!name || isNaN(strength) || strength < 1 || strength > 1000) {
                showToast('Invalid class name or strength', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/admin/classes/${cls.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, strength })
                });
                
                if (!response.ok) throw new Error('Failed to update class');
                
                formContainer.classList.add('hidden');
                loadClasses('admin');
                showToast('Class updated successfully', 'success');
            } catch (error) {
                showToast(`Error updating class: ${error.message}`, 'error');
                console.error('Error updating class:', error);
            }
        };
    }
    
    async function deleteClass(id) {
        if (!confirm('Are you sure you want to delete this class?')) return;
        
        try {
            const response = await fetch(`${API_URL}/admin/classes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (!response.ok) throw new Error('Failed to delete class');
            
            loadClasses('admin');
            showToast('Class deleted successfully', 'success');
        } catch (error) {
            showToast(`Error deleting class: ${error.message}`, 'error');
            console.error('Error deleting class:', error);
        }
    }

    // Toggle student data container visibility based on checkbox
    document.getElementById('add-student-data').addEventListener('change', function() {
        const studentDataContainer = document.getElementById('student-data-container');
        const jsonDataContainer = document.getElementById('json-data-container');
        
        if (this.checked) {
            generateStudentFields();
            studentDataContainer.classList.remove('hidden');
            // If JSON import is checked, uncheck it
            if (document.getElementById('import-json-data').checked) {
                document.getElementById('import-json-data').checked = false;
                jsonDataContainer.classList.add('hidden');
            }
        } else {
            studentDataContainer.classList.add('hidden');
        }
    });

    // Toggle JSON data container visibility based on checkbox
    document.getElementById('import-json-data').addEventListener('change', function() {
        const jsonDataContainer = document.getElementById('json-data-container');
        const studentDataContainer = document.getElementById('student-data-container');
        
        if (this.checked) {
            jsonDataContainer.classList.remove('hidden');
            // If manual student data entry is checked, uncheck it
            if (document.getElementById('add-student-data').checked) {
                document.getElementById('add-student-data').checked = false;
                studentDataContainer.classList.add('hidden');
            }
        } else {
            jsonDataContainer.classList.add('hidden');
        }
    });

    // Generate student input fields based on class strength
    document.getElementById('class-strength').addEventListener('change', function() {
        if (document.getElementById('add-student-data').checked) {
            generateStudentFields();
        }
    });

    function generateStudentFields() {
        const strength = parseInt(document.getElementById('class-strength').value) || 0;
        const container = document.getElementById('student-data-container');
        container.innerHTML = '';
        
        if (strength <= 0 || strength > 100) {
            container.innerHTML = '<p class="error-message">Please enter a valid class strength (1-100)</p>';
            return;
        }

        for (let i = 0; i < strength; i++) {
            const studentDiv = document.createElement('div');
            studentDiv.className = 'student-entry';
            studentDiv.innerHTML = `
                <h4>Student ${i + 1}</h4>
                <div class="form-group">
                    <label for="student-name-${i}"><i class="fas fa-user"></i> Name:</label>
                    <input type="text" id="student-name-${i}" name="student-name-${i}" placeholder="Student name">
                </div>
                <div class="form-group">
                    <label for="student-roll-${i}"><i class="fas fa-id-card"></i> Roll Number:</label>
                    <input type="text" id="student-roll-${i}" name="student-roll-${i}" placeholder="Roll number">
                </div>
            `;
            container.appendChild(studentDiv);
        }
    }

    async function createClass(e) {
        e.preventDefault();
        const name = document.getElementById('class-name').value.trim();
        const strength = parseInt(document.getElementById('class-strength').value);

        if (!name || isNaN(strength) || strength < 1 || strength > 1000) {
            showToast('Invalid class name or strength', 'error');
            return;
        }

        let students = [];
        
        // If student data checkbox is checked, collect student data
        if (document.getElementById('add-student-data').checked) {
            for (let i = 0; i < strength; i++) {
                const studentName = document.getElementById(`student-name-${i}`)?.value.trim() || `Student ${i + 1}`;
                const rollNumber = document.getElementById(`student-roll-${i}`)?.value.trim() || `${i + 1}`;
                
                students.push({
                    id: i + 1,
                    name: studentName,
                    rollNumber: rollNumber,
                    attendance: []
                });
            }
        } else {
            // Default student data if not provided
            students = Array.from({ length: strength }, (_, i) => ({
                id: i + 1,
                name: `Student ${i + 1}`,
                rollNumber: `${i + 1}`,
                attendance: []
            }));
        }

        try {
            const response = await fetch(`${API_URL}/admin/classes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, strength, students })
            });
            
            if (!response.ok) throw new Error('Failed to create class');
            
            hideClassForm();
            loadClasses('admin');
            showToast('Class created successfully', 'success');
        } catch (error) {
            showToast(`Error creating class: ${error.message}`, 'error');
            console.error('Error creating class:', error);
        }
    }

    // Attendance functions
    async function loadClassStudents(classId) {
        const attendanceButtons = document.getElementById('attendance-buttons');
        attendanceButtons.innerHTML = 'Loading students...';
        
        try {
            const response = await fetch(`${API_URL}/classes/${classId}/students`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.clear();
                    showLogin();
                    showToast('Session expired, please log in again', 'error');
                    return;
                }
                throw new Error(`Failed to fetch students: ${response.statusText}`);
            }
            
            const students = await response.json();
            attendanceButtons.innerHTML = '';
            
            students.forEach(student => {
                const button = document.createElement('button');
                button.className = 'student-btn';
                button.dataset.id = student.id;
                button.dataset.present = 'false';
                button.innerHTML = `${student.rollNumber}<br>${student.name}`;
                button.addEventListener('click', function() {
                    const isPresent = this.dataset.present === 'true';
                    this.dataset.present = !isPresent;
                    this.classList.toggle('present');
                });
                attendanceButtons.appendChild(button);
            });
            
            document.getElementById('mark-all-btn').onclick = () => {
                document.querySelectorAll('.student-btn').forEach(btn => {
                    btn.dataset.present = 'true';
                    btn.classList.add('present');
                });
            };
            
            document.getElementById('unmark-all-btn').onclick = () => {
                document.querySelectorAll('.student-btn').forEach(btn => {
                    btn.dataset.present = 'false';
                    btn.classList.remove('present');
                });
            };
            
            document.getElementById('save-attendance-btn').onclick = () => saveAttendance(classId);
        } catch (error) {
            attendanceButtons.innerHTML = 'Error loading students';
            console.error('Error loading students:', error);
            showToast(`Error loading students: ${error.message}`, 'error');
        }
    }

    async function saveAttendance(classId) {
        try {
            const buttons = document.querySelectorAll('.student-btn');
            const presentStudents = Array.from(buttons)
                .filter(btn => btn.dataset.present === 'true')
                .map(btn => btn.dataset.id);
            const date = document.getElementById('attendance-date').value;
            
            if (!date) {
                showToast('Please select a date', 'error');
                return;
            }
            
            const response = await fetch(`${API_URL}/attendance`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ classId, date, presentStudents })
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.clear();
                    showLogin();
                    showToast('Session expired, please log in again', 'error');
                    return;
                }
                throw new Error(`Failed to save attendance: ${response.statusText}`);
            }
            
            showToast('Attendance saved successfully', 'success');
        } catch (error) {
            showToast(`Error saving attendance: ${error.message}`, 'error');
            console.error('Error saving attendance:', error);
        }
    }

    // Export to Google Sheets function
    async function exportToGoogleSheets() {
        const classId = document.getElementById('report-class').value;
        const fromDate = document.getElementById('report-date-from').value;
        const toDate = document.getElementById('report-date-to').value;
        const sheetName = 'Attendance Data';
        // Use the specific Google Sheet ID provided by the user
        const spreadsheetId = '1zEqCh3q9u7mNFu6MMAUMqt4aROLTCvEAZZtC2lPgzIA';
        
        if (!classId || !fromDate || !toDate) {
            showToast('Please select class and date range', 'error');
            return;
        }
        
        const resultDiv = document.getElementById('report-result');
        resultDiv.innerHTML = 'Exporting to Google Sheets...';
        
        try {
            // Get user email from localStorage or prompt the user
            let email = localStorage.getItem('email');
            if (!email) {
                email = prompt('Please enter your email address to share the Google Sheet with you:', '');
                if (email) {
                    localStorage.setItem('email', email);
                }
            }
            
            // Make sure token exists and is properly formatted
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Authentication token missing. Please log in again.', 'error');
                localStorage.clear();
                showLogin();
                return;
            }

            // Refresh token before making the request
            try {
                await refreshToken();
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
                // Continue with the current token
            }

            const response = await fetch(`${API_URL}/export-to-sheets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ classId, fromDate, toDate, sheetName, email, spreadsheetId })
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.clear();
                    showLogin();
                    showToast('Session expired, please log in again', 'error');
                    return;
                }
                throw new Error(`Failed to export to Google Sheets: ${response.statusText}`);
            }
            
            const data = await response.json();
            resultDiv.innerHTML = `
                <h4>Export Successful</h4>
                <p>Your attendance data has been exported to Google Sheets.</p>
                <p><a href="${data.spreadsheetUrl}" target="_blank" class="btn-primary">
                    <i class="fas fa-external-link-alt"></i> Open Spreadsheet
                </a></p>
            `;
            showToast('Exported to Google Sheets successfully', 'success');
        } catch (error) {
            resultDiv.innerHTML = 'Error exporting to Google Sheets';
            showToast(`Error exporting to Google Sheets: ${error.message}`, 'error');
            console.error('Error exporting to Google Sheets:', error);
        }
    }
    
    // Report function
    async function generateReport() {
        const classId = document.getElementById('report-class').value;
        const fromDate = document.getElementById('report-date-from').value;
        const toDate = document.getElementById('report-date-to').value;
        
        if (!classId || !fromDate || !toDate) {
            showToast('Please select class and date range', 'error');
            return;
        }
        
        const resultDiv = document.getElementById('report-result');
        resultDiv.innerHTML = 'Generating report...';
        
        try {
            const response = await fetch(`${API_URL}/attendance/${classId}?fromDate=${fromDate}&toDate=${toDate}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.clear();
                    showLogin();
                    showToast('Session expired, please log in again', 'error');
                    return;
                }
                throw new Error(`Failed to generate report: ${response.statusText}`);
            }
            
            const data = await response.json();
            resultDiv.innerHTML = '<h4>Attendance Report</h4>';
            const table = document.createElement('table');
            
            // Check the structure of the data and handle it accordingly
            if (data && data.length > 0) {
                // Create table header
                let tableHTML = '<thead><tr><th>Date</th><th>Attendance</th></tr></thead><tbody>';
                
                // Process data based on its structure
                if (Array.isArray(data[0].date)) {
                    // Handle case where date is an array
                    tableHTML += data.map(row => 
                        row.date.map((date, index) => 
                            `<tr><td>${date}</td><td>${row.attendance && row.attendance[index] || 'N/A'}</td></tr>`
                        ).join('')
                    ).join('');
                } else if (typeof data[0] === 'object') {
                    // Handle case where each item is a record with date and status
                    tableHTML += data.map(row => 
                        `<tr><td>${row.date || 'Unknown'}</td><td>${row.status || row.attendance || 'N/A'}</td></tr>`
                    ).join('');
                }
                
                tableHTML += '</tbody>';
                table.innerHTML = tableHTML;
            } else {
                table.innerHTML = '<thead><tr><th>Date</th><th>Attendance</th></tr></thead><tbody><tr><td colspan="2">No data available</td></tr></tbody>';
            }
            resultDiv.appendChild(table);
            showToast('Report generated successfully', 'success');
        } catch (error) {
            resultDiv.innerHTML = 'Error generating report';
            showToast(`Error generating report: ${error.message}`, 'error');
            console.error('Error generating report:', error);
        }
    }

    // Placeholder for token refresh
    async function refreshToken() {
        try {
            const response = await fetch(`${API_URL}/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: localStorage.getItem('token') })
            });
            if (!response.ok) throw new Error('Failed to refresh token');
            const data = await response.json();
            localStorage.setItem('token', data.token);
            return data.token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }
});