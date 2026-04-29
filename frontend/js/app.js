const API_BASE = "/api";

async function applyLeave() {
    const data = {
        user_id: document.getElementById('userId').value,
        leave_type: document.getElementById('leaveType').value,
        start_date: document.getElementById('startDate').value,
        end_date: document.getElementById('endDate').value,
        reason: document.getElementById('reason').value
    };

    const response = await fetch(`${API_BASE}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        alert("Leave applied successfully!");
    }
}

async function fetchRequests() {
    const container = document.getElementById('requestList');
    try {
        const response = await fetch(`${API_BASE}/admin/requests`);
        const requests = await response.json();
        
        container.innerHTML = ''; // Clear the "Click to load" text

        requests.forEach(req => {
            const div = document.createElement('div');
            div.className = "flex justify-between items-center p-3 border-b bg-gray-50 rounded mb-2";
            div.innerHTML = `
                <span><strong>Emp ID: ${req.user_id}</strong> - ${req.leave_type} (${req.status})</span>
                <div class="space-x-2">
                    <button onclick="updateStatus(${req.id}, 'Approved')" class="bg-green-500 text-white px-3 py-1 rounded text-xs">Approve</button>
                    <button onclick="updateStatus(${req.id}, 'Rejected')" class="bg-red-500 text-white px-3 py-1 rounded text-xs">Reject</button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        container.innerHTML = "Error loading requests. Is the server running?";
    }
}

async function updateStatus(id, status) {
    await fetch(`${API_BASE}/admin/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: id, status: status })
    });
    alert(`Request ${status}`);
}
