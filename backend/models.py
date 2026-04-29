from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    emp_id = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'manager' or 'employee'
    manager_id = db.Column(db.String(50), nullable=True) 

class LeaveRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    emp_id = db.Column(db.String(50), nullable=False)
    leave_type = db.Column(db.String(50))
    start_date = db.Column(db.String(20))
    end_date = db.Column(db.String(20))
    reason = db.Column(db.Text, nullable=True) # New Column
    status = db.Column(db.String(20), default='Pending')
    applied_on = db.Column(db.DateTime, default=datetime.utcnow)