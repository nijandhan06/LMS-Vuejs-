from flask_restful import Resource, reqparse, request
from flask import jsonify
from application.data.models import User, Role, Rolesusers, Section, Book, BookRequest, Rating
from application.data.database import db
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity




class SectionAPI(Resource):

    @jwt_required()
    def get(self):
        sections = Section.query.all()
        return jsonify([{
            'id': section.id,
            'name': section.name,
            'date_created': section.date_created,
            'description': section.description
        } for section in sections])
    
    @jwt_required()
    def post(Self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True)
        parser.add_argument('description', type=str, required=True)
        args = parser.parse_args()
        sec=Section.query.filter_by(name=args['name']).first()
        if sec:
            return jsonify({"error":"Section already exists!"})
        section = Section(name=args['name'], description=args['description'], date_created=datetime.now())
        db.session.add(section)
        db.session.commit()
        return jsonify({"message":"Section added successfully!"})
    
    @jwt_required()
    def put(self,id):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True)
        parser.add_argument('description', type=str, required=True)
        args = parser.parse_args()
        section = Section.query.filter_by(id=id).first()
        if not section:
            return jsonify({"error":"Section does not exist!"})
        section.name=args['name']
        section.description=args['description']
        db.session.commit()
        return jsonify({"message":"Section updated successfully!"})
    
    @jwt_required()
    def delete(self,id):
        section = Section.query.filter_by(id=id).first()
        if not section:
            return jsonify({"error":"Section does not exist!"})
        for book in section.books:
            for bookrequest in book.bookrequest:
                db.session.delete(bookrequest)
            for rating in book.rating:
                db.session.delete(rating)
            db.session.delete(book)
        db.session.delete(section)
        db.session.commit()
        return jsonify({"message":"Section deleted successfully!"})
    

    
class BookAPI(Resource):

    @jwt_required()
    def get(self,section_id):
        books=Book.query.filter_by(section_id=section_id).all()
        return jsonify([{
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'content': book.content,
            'date_issued': book.date_issued,
            'date_return': book.date_return
        } for book in books])
    
    @jwt_required()
    def post(self,section_id):
        parser = reqparse.RequestParser()
        parser.add_argument('title', type=str, required=True)
        parser.add_argument('author', type=str, required=True)
        parser.add_argument('content', type=str, required=True)
        parser.add_argument('date_return', type=str, required=False)
        args = parser.parse_args()
        date_return = args['date_return']
        if date_return:
            date_return = datetime.strptime(date_return, '%Y-%m-%d')
        book = Book(title=args['title'], author=args['author'], content=args['content'], section_id=section_id, date_issued=datetime.now(), date_return=date_return)
        db.session.add(book)
        db.session.commit()
        return jsonify({"message":"Book added successfully!"})
    
    @jwt_required()
    def put(self,book_id):
        parser = reqparse.RequestParser()
        parser.add_argument('title', type=str, required=True)
        parser.add_argument('author', type=str, required=True)
        parser.add_argument('content', type=str, required=True)
        parser.add_argument('date_return', type=str, required=False)
        args = parser.parse_args()
        date_return = args['date_return']
        if date_return:
            date_return = datetime.strptime(date_return, '%Y-%m-%d')
        book = Book.query.filter_by(id=book_id).first()
        if not book:
            return jsonify({"error":"Book does not exist!"})
        book.title=args['title']
        book.author=args['author']
        book.content=args['content']
        book.date_return=date_return
        db.session.commit()
        return jsonify({"message":"Book updated successfully!"})
    
    @jwt_required()
    def delete(self,book_id):
        book = Book.query.filter_by(id=book_id).first()
        if not book:
            return jsonify({"error":"Book does not exist!"})
        for bookrequest in book.bookrequest:
            db.session.delete(bookrequest)
        for rating in book.rating:
            db.session.delete(rating)
        db.session.delete(book)
        db.session.commit()
        return jsonify({"message":"Book deleted successfully!"})

