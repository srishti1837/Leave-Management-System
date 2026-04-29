// Function 1: Logic for the Gatekeeper on index.html
function checkAccessCode() {
    const code = document.getElementById('accessCodeInput').value;
    const message = document.getElementById('accessMessage');

    // These must match your SECRET_KEYS in app.py
    const EMP_CODE = "EMP2026"; 
    const MGR_CODE = "MGR2026";

    if (code === EMP_CODE) {
        window.location.href = "emp_reg.html";
    } else if (code === MGR_CODE) {
        window.location.href = "mgr_reg.html";
    } else {
        message.innerText = "Invalid Access Code!";
        message.className = "mt-2 text-xs font-semibold text-red-400";
    }
}

// Function 2: Universal Registration Logic
async function registerUser(event) {
    if (event) event.preventDefault();

    const pass = document.getElementById('regPass').value;
    const rePass = document.getElementById('regRePass').value;
    const messageElement = document.getElementById('regMessage');

    if (pass !== rePass) {
        messageElement.innerText = "Passwords do not match!";
        messageElement.className = "mt-4 text-center text-sm font-semibold text-red-500";
        return;
    }

    // Check if Manager ID field exists (it only exists on emp_reg.html)
    const mgrIdField = document.getElementById('regMgrId');

    const data = {
        email: document.getElementById('regEmail').value,
        username: document.getElementById('regUsername').value,
        user_id: document.getElementById('regUserId').value,
        password: pass,
        role: document.getElementById('regRole').value, // From hidden input
        secret_key: document.getElementById('regKey').value,
        manager_id: mgrIdField ? mgrIdField.value : null // Only sends if field exists
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/api/register', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json(); 
        
        if (response.ok) {
            messageElement.className = "mt-4 text-center text-sm font-semibold text-green-500";
            messageElement.innerText = "Account Created! Redirecting to Login...";
            
            setTimeout(() => { 
                window.location.href = "index.html"; 
            }, 2000); 

        } else {
            messageElement.className = "mt-4 text-center text-sm font-semibold text-red-500";
            messageElement.innerText = result.message;
        }
    } catch (err) {
        console.error("Registration error:", err);
        messageElement.innerText = "Server Error. Is Flask running?";
    }
}

// Function 3: Login Logic
async function login() {
    const data = {
        emp_id: document.getElementById('loginId').value,
        password: document.getElementById('loginPass').value
    };

    const messageElement = document.getElementById('loginMessage');

    try {
        const response = await fetch('http://127.0.0.1:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // 1. Save the user session data
            localStorage.setItem('currentUser', JSON.stringify(result));
            
            messageElement.className = "mt-4 text-center text-sm text-green-500 font-bold";
            messageElement.innerText = "Access Granted! Redirecting...";
            
            // 2. Redirect based on role
            setTimeout(() => { 
                if (result.role === 'manager') {
                    window.location.href = "mgr_dashboard.html";
                } else if (result.role === 'employee') {
                    window.location.href = "emp_dashboard.html";
                } else {
                    messageElement.innerText = "Error: Role not recognized.";
                }
            }, 1000);

        } else {
            messageElement.className = "mt-4 text-center text-sm text-red-500 font-semibold";
            messageElement.innerText = result.message;
        }
    } catch (err) {
        messageElement.className = "mt-4 text-center text-sm text-red-500";
        messageElement.innerText = "Connection Error. Is the server running?";
    }
}