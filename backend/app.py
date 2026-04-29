from flask import Flask, request, jsonify, send_from_directory # Added send_from_directory
from models import db, User, LeaveRequest
from datetime import datetime
import os
from flask_cors import CORS

app = Flask(__name__, 
            static_folder='../frontend', 
            template_folder='../frontend')

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

SECRET_KEYS = {
    "employee": "EMP_789",
    "manager": "MGR_000"
}

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///leave_system.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# ==========================================
# FRONTEND ROUTES (To access your pages)
# ==========================================

@app.route('/')
def index():
    # Serves the main login/index page
    return send_from_directory(app.template_folder, 'index.html')

@app.route('/register')
def registration_page():
    # Serves the registration page
    return send_from_directory(app.template_folder, 'emp_reg.html')

@app.route('/dashboard/employee')
def emp_dashboard():
    return send_from_directory(app.template_folder, 'emp_dashboard.html')

@app.route('/dashboard/manager')
def mgr_dashboard():
    return send_from_directory(app.template_folder, 'mgr_dashboard.html')

# Essential for serving CSS, JS, and Images from the 'assets' and 'js' folders
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)



@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "up"}), 200

# Endpoint for Employees to submit leave
@app.route('/api/leave/apply', methods=['POST'])
def apply_leave():
    data = request.json
    new_req = LeaveRequest(
        emp_id=data['emp_id'],
        leave_type=data['leave_type'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        reason=data.get('reason', '') # Now capturing reason
    )
    db.session.add(new_req)
    db.session.commit()
    return jsonify({"message": "Applied successfully"}), 201


# 2. View Own History (Used by emp_dashboard.js)
@app.route('/api/leave/history/<emp_id>', methods=['GET'])
def get_emp_history(emp_id):
    reqs = LeaveRequest.query.filter_by(emp_id=emp_id).all()
    return jsonify([{
        "id": r.id,
        "type": r.leave_type,
        "dates": f"{r.start_date} to {r.end_date}",
        "reason": r.reason, # Returning reason
        "status": r.status
    } for r in reqs])

# 3. View Team Requests (Used by mgr_dashboard.js)
@app.route('/api/manager/pending/<mgr_id>', methods=['GET'])
def get_mgr_tasks(mgr_id):
    team = User.query.filter_by(manager_id=mgr_id).all()
    team_ids = [member.emp_id for member in team]
    reqs = LeaveRequest.query.filter(LeaveRequest.emp_id.in_(team_ids), LeaveRequest.status == 'Pending').all()
    return jsonify([{
        "id": r.id,
        "emp_id": r.emp_id,
        "type": r.leave_type,
        "dates": f"{r.start_date} to {r.end_date}",
        "reason": r.reason # Manager needs to see why they are applying
    } for r in reqs])


# 4. Approve/Decline (Used by mgr_dashboard.js)
@app.route('/api/leave/update', methods=['POST'])
def update_leave():
    data = request.json
    req = LeaveRequest.query.get(data['req_id'])
    if req:
        req.status = data['status'] # 'Approved' or 'Rejected'
        db.session.commit()
        return jsonify({"message": "Status updated successfully"}), 200
    return jsonify({"message": "Request not found"}), 404

# Get all employees under a specific manager
@app.route('/api/manager/team/<mgr_id>', methods=['GET'])
def get_manager_team(mgr_id):
    team = User.query.filter_by(manager_id=mgr_id, role='employee').all()
    return jsonify([{
        "emp_id": e.emp_id,
        "username": e.username,
        "email": e.email
    } for e in team])


@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    data = request.json
    
    # Extract fields
    email = data.get('email')
    username = data.get('username')
    emp_id = data.get('user_id')
    password = data.get('password')
    role = data.get('role')
    user_key = data.get('secret_key') # The key entered on the reg page
    mgr_id = data.get('manager_id')  # Grabbed from the new Employee field

    # 1. Backend Validation of Secret Key
    if user_key != SECRET_KEYS.get(role):
        return jsonify({"message": "Invalid Registration Secret Key!"}), 403

    # 2. Hierarchy Check: Employee MUST have a valid Manager
    if role == 'employee':
        if not mgr_id:
            return jsonify({"message": "Manager ID is required for employees!"}), 400
        
        # Look for the manager in the database
        manager = User.query.filter_by(emp_id=mgr_id, role='manager').first()
        if not manager:
            return jsonify({"message": f"Manager ID '{mgr_id}' does not exist. They must register first!"}), 400

    # 3. Duplicate User Check
    if User.query.filter((User.emp_id == emp_id) | (User.email == email)).first():
        return jsonify({"message": "Employee ID or Email already registered!"}), 400

    # 4. Save to Database
    try:
        new_user = User(
            emp_id=emp_id, 
            email=email, 
            username=username, 
            password=password, 
            role=role,
            manager_id=mgr_id if role == 'employee' else None # Managers get NULL
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Registration successful!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database Error: {str(e)}"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    # Updated to ensure emp_id is used for both
    user = User.query.filter_by(emp_id=data.get('emp_id'), password=data.get('password')).first()
    
    if user:
        return jsonify({
            "status": "success",
            "role": user.role,
            "username": user.username,
            "emp_id": user.emp_id,
            "manager_id": user.manager_id # Send this back so the frontend knows the hierarchy
        }), 200
    
    return jsonify({"message": "Invalid ID or Password"}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)