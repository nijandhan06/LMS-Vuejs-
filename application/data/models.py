from .database import db
from datetime import datetime
from flask_security import RoleMixin,UserMixin


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255), nullable=True)

class Rolesusers(db.Model):
    __tablename__ = 'rolesusers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column('user_id', db.Integer, db.ForeignKey('user.id'), nullable=False)
    role_id = db.Column('role_id', db.Integer, db.ForeignKey('role.id'), nullable=False) 

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String,nullable=False,unique=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    login_time = db.Column(db.DateTime(), nullable=True, default=datetime.now())
    active = db.Column(db.Boolean(), default=True)
    fs_uniquifier = db.Column(db.String(256), unique=True)
    roles = db.relationship('Role', secondary='rolesusers',backref=db.backref('users', lazy='dynamic'))

class Section(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    name = db.Column(db.String(100), nullable=False, unique=True)
    date_created=db.Column(db.DateTime, default=datetime.now(), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    books = db.relationship('Book', backref='section', lazy=True)

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    title = db.Column(db.String(100), nullable=False, unique=True)
    author = db.Column(db.String(100), nullable=False)
    content=db.Column(db.String, nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)
    date_issued=db.Column(db.DateTime, default=datetime.now(), nullable=False)
    date_return=db.Column(db.DateTime, nullable=False)

class BookRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    date_requested=db.Column(db.DateTime, default=datetime.now(), nullable=False)
    date_return=db.Column(db.DateTime, nullable=False)
    status=db.Column(db.String, nullable=False)
    user=db.relationship('User', backref='bookrequest', lazy=True)
    book=db.relationship('Book', backref='bookrequest', lazy=True)

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    feedback = db.Column(db.String, nullable=False)
    user=db.relationship('User', backref='rating', lazy=True)
    book=db.relationship('Book', backref='rating', lazy=True)

    
