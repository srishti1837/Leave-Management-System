document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'employee') { window.location.href = "index.html"; return; }
    document.getElementById('empWelcome').innerHTML = `<b>${user.username}</b> (ID: ${user.emp_id})`;
    loadHistory();
});

async function submitLeave() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const data = {
        emp_id: user.emp_id,
        leave_type: document.getElementById('leaveType').value,
        start_date: document.getElementById('startDate').value,
        end_date: document.getElementById('endDate').value,
        reason: document.getElementById('leaveReason').value
    };
    const res = await fetch('/api/leave/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { 
        document.getElementById('leaveStatusMsg').innerText = "Applied Successfully!";
        loadHistory(); 
    }
}

async function loadHistory() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const res = await fetch(`/api/leave/history/${user.emp_id}`);
    const data = await res.json();
    document.getElementById('empHistoryTable').innerHTML = data.map(req => `
        <tr class="border-b text-sm">
            <td class="p-3">${req.type}</td>
            <td class="p-3">${req.dates}</td>
            <td class="p-3 italic text-gray-500">${req.reason}</td>
            <td class="p-3 font-bold ${req.status === 'Approved' ? 'text-green-600' : 'text-red-600'}">${req.status}</td>
        </tr>
    `).join('');
}
function logout() { localStorage.clear(); window.location.href = "index.html"; }
