document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'manager') {
        window.location.href = "index.html";
        return;
    }

    // Fixed ID to match your HTML
    document.getElementById('mgrName').innerText = user.username;
    document.getElementById('mgrIdDisplay').innerText = `ID: ${user.emp_id}`;
    
    loadManagerTasks();
    loadTeamList(); // Call the grid loader
});

async function loadManagerTasks() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    // console.log("Fetching tasks for Manager ID:", user.emp_id);
    
    const res = await fetch(`/api/manager/pending/${user.emp_id}`);
    const data = await res.json();
    
    // console.log("Data received from server:", data); // Check your F12 console for this!

    const tbody = document.getElementById('mgrTaskTable');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-500">No pending requests found for your team IDs.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(req => `
        <tr class="border-b border-slate-700">
            <td class="p-4 text-indigo-400 font-bold">${req.emp_id}</td>
            <td class="p-4">
                <div class="text-sm text-slate-200">${req.type}</div>
                <div class="text-xs italic text-slate-500">"${req.reason}"</div>
            </td>
            <td class="p-4 text-sm text-slate-400">${req.dates}</td>
            <td class="p-4 space-x-2">
                <button onclick="updateStatus(${req.id}, 'Approved')" class="bg-emerald-600 text-white px-3 py-1 rounded text-xs">Approve</button>
                <button onclick="updateStatus(${req.id}, 'Rejected')" class="bg-red-500 text-white px-3 py-1 rounded text-xs">Reject</button>
            </td>
        </tr>
    `).join('');
}

async function loadTeamList() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const res = await fetch(`/api/manager/team/${user.emp_id}`);
    const team = await res.json();
    
    const grid = document.getElementById('mgrTeamGrid');
    
    if (team.length === 0) {
        grid.innerHTML = `<p class="text-slate-500">No employees registered under your ID yet.</p>`;
        return;
    }

    grid.innerHTML = team.map(emp => `
        <div class="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl hover:border-indigo-500 transition-all group">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xl uppercase">
                    ${emp.username.charAt(0)}
                </div>
                <div>
                    <h3 class="font-bold text-white group-hover:text-indigo-400 transition">${emp.username}</h3>
                    <p class="text-xs text-slate-500">ID: ${emp.emp_id}</p>
                </div>
            </div>
            <button onclick="viewEmployeeHistory('${emp.emp_id}', '${emp.username}')" 
                    class="w-full py-2 bg-slate-700 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition">
                View History & Reasons
            </button>
        </div>
    `).join('');
}

async function viewEmployeeHistory(empId, name) {
    const res = await fetch(`/api/leave/history/${empId}`);
    const history = await res.json();
    
    document.getElementById('modalTitle').innerText = `Leave History: ${name}`;
    document.getElementById('modalSubtitle').innerText = `Employee ID: ${empId}`;
    
    const tbody = document.getElementById('modalHistoryBody');
    
    if (history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="py-8 text-center text-slate-400">No previous leave records found.</td></tr>`;
    } else {
        tbody.innerHTML = history.map(req => `
            <tr class="border-b border-slate-100 text-sm">
                <td class="py-4">
                    <p class="font-bold text-slate-800">${req.type}</p>
                    <p class="text-xs italic text-slate-400">"${req.reason || 'N/A'}"</p>
                </td>
                <td class="py-4 text-slate-600">${req.dates}</td>
                <td class="py-4 text-right">
                    <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                        req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }">${req.status}</span>
                </td>
            </tr>
        `).join('');
    }
    
    document.getElementById('historyModal').classList.remove('hidden');
}

async function updateStatus(reqId, status) {
    const res = await fetch('/api/leave/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ req_id: reqId, status: status })
    });
    if (res.ok) {
        loadManagerTasks();
    }
}

function closeModal() { document.getElementById('historyModal').classList.add('hidden'); }

function logout() { 
    localStorage.clear(); 
    window.location.href = "index.html"; 
}