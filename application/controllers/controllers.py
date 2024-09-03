from flask import current_app as app,render_template,request,jsonify
from flask_jwt_extended import create_access_token,get_jwt_identity,jwt_required
from application.data.models import User,Role,Rolesusers,Section,Book,BookRequest,Rating
from datetime import datetime
from application.data.database import db
from werkzeug.security import check_password_hash,generate_password_hash
from application.jobs import tasks
from main import cache


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/userlogin",methods=["POST"])
def userlogin():
    username=request.json["username"]
    password=request.json["password"]
    user=User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"message":"user not found"})
    if check_password_hash(user.password,password):
        user.last_login_at=datetime.now()
        db.session.commit()
        access_token=create_access_token(identity=user.id)
        return jsonify({"token":access_token,"role":user.roles[0].name})
    else:
        return jsonify({"error":"invalid credentials"})
    
@app.route("/registers",methods=["POST"])
def register():
    username=request.json["username"]
    email=request.json["email"]
    password=request.json["password"]
    user=User.query.filter_by(username=username).first()
    if user is not None:
        return jsonify({"error":"user already exists"})
    with app.app_context():
        user_datastore=app.security.datastore
        user=user_datastore.create_user(username=username,password=generate_password_hash(password),email=email)
        user=User.query.filter_by(username=username).first()
        role=Role.query.filter_by(name="user").first()
        roles_users=Rolesusers(user_id=user.id,role_id=role.id)
        db.session.add(roles_users)
        db.session.commit()
        return jsonify({"message":"User created successfully"}),201
    

@app.route("/section/<id>",methods=["GET"])
@cache.cached(timeout=60,key_prefix="section")
@jwt_required()
def get_section(id):
    section=Section.query.filter_by(id=id).first()
    if section is None:
        return jsonify({"error":"Section not found"})
    return jsonify({"id":section.id,"name":section.name,"date_created":section.date_created,"description":section.description})

@app.route("/book/<id>",methods=["GET"])
@jwt_required()
def get_book(id):
    book=Book.query.filter_by(id=id).first()
    if book is None:
        return jsonify({"error":"Book not found"})
    return jsonify({"id":book.id,"title":book.title,"author":book.author,"section_id":book.section_id,"date_issued":book.date_issued,"content":book.content,"date_return":book.date_return})


@app.route("/sections",methods=["GET"])
@cache.cached(timeout=60,key_prefix="sections")
@jwt_required()
def get_sections():
    sections=Section.query.all()
    return jsonify([{"id":section.id,
                     "name":section.name,
                     "date_created":section.date_created,
                     "description":section.description,
                     "books":[{"id":book.id,
                               "title":book.title,
                               "author":book.author,
                               "section_id":book.section_id,
                               "date_issued":book.date_issued,
                               "content":book.content,
                               "date_return":book.date_return} for book in section.books]
                     } for section in sections])

@app.route("/bookrequest/<book_id>",methods=["POST"])
@jwt_required()
def bookrequest(book_id):
    user_id=get_jwt_identity()
    return_date=request.json["returnDate"]
    return_date=datetime.strptime(return_date,"%Y-%m-%d")
    book=Book.query.filter_by(id=book_id).first()
    if book is None:
        return jsonify({"error":"Book not found"})
    book_request=BookRequest.query.filter_by(book_id=book_id,user_id=user_id).all()
    if book_request!=[]:
        if book_request[-1].status=="pending" or book_request[-1].status=="issued":
            return jsonify({"error":"Book already requested"})
    book_request=BookRequest(book_id=book_id,user_id=user_id,date_requested=datetime.now(),date_return=return_date,status="pending")
    db.session.add(book_request)
    db.session.commit()
    return jsonify({"message":"Book requested successfully"}),201

@app.route("/search", methods=["GET", "POST"])
@jwt_required()
def search():
    sections = Section.query.all()
    if request.method == "POST":
        query = request.json.get("search")
        if query:
            sections = Section.query.filter(Section.name.ilike(f"%{query}%")).all()
            if sections:
                data = []
                for section in sections:
                    books = Book.query.filter_by(section_id=section.id).all()
                    books_details = [{"id": book.id,"title": book.title,"author": book.author,"content": book.content,"date_issued": book.date_issued,"return_date": book.date_return} for book in books]

                    if books_details:
                        data.append({
                            "id": section.id,
                            "name": section.name,
                            "description": section.description,
                            "books": books_details,
                        })
                return jsonify(data)
            sections = Section.query.all()
            data = []
            for section in sections:
                books = Book.query.filter_by(section_id=section.id).all()
                books_details = [{"id": book.id,"title": book.title, "author": book.author, "content": book.content, "date_issued": book.date_issued, "return_date": book.date_return
                } for book in books if query.lower() in book.title.lower() or query.lower() in book.author.lower()]

                if books_details:
                    data.append({
                        "id": section.id,
                        "name": section.name,
                        "description": section.description,
                        "books": books_details,
                    })
            return jsonify(data)
    data = []
    for section in sections:
        books = Book.query.filter_by(section_id=section.id).all()
        books_details = [{
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "content": book.content,
            "date_issued": book.date_issued,
            "return_date": book.date_return
        } for book in books]

        if books_details:
            data.append({
                "id": section.id,
                "name": section.name,
                "description": section.description,
                "books": books_details,
            })
    
    if not data:
        return jsonify({"error": "No sections found"})
    
    return jsonify(data)

@app.route("/usersection", methods=["GET", "POST"])
@cache.cached(timeout=60, key_prefix="usersection")
@jwt_required()
def get_usersections():
    def fetch_sections(query=None):
        if query:
            sections = Section.query.filter(Section.name.ilike(f"%{query}%")).all()
            if not sections:
                sections = Section.query.all()
        else:
            sections = Section.query.all()
        
        data = []
        for section in sections:
            books = Book.query.filter_by(section_id=section.id).all()
            books_info = [{
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "content": book.content,
                "date_issued": book.date_issued,
                "return_date": book.date_return
            } for book in books if not query or query.lower() in book.title.lower() or query.lower() in book.author.lower()]
            
            if books_info:
                data.append({
                    "id": section.id,
                    "name": section.name,
                    "description": section.description,
                    "books": books_info,
                })
        
        return data

    query = request.json.get("search") if request.method == "POST" else None
    data = fetch_sections(query)

    if not data:
        return jsonify({"message": "No sections found"}), 404
    
    return jsonify(data)


@app.route("/mybooks", methods=["GET"])
@cache.cached(timeout=60, key_prefix="mybooks")
@jwt_required()
def my_books():
    user_id = get_jwt_identity()
    book_requests = BookRequest.query.filter_by(user_id=user_id).all()
    if not book_requests:
        return jsonify({"message": "No books found"}), 404
    
    data = []
    for book_request in book_requests:
        book = Book.query.filter_by(id=book_request.book_id).first()
        data.append({
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "content": book.content,
            "date_issued": book.date_issued,
            "return_date": book.date_return,
            "status": book_request.status,
            "section_name": Section.query.filter_by(id=book.section_id).first().name,
            "book_id": book_request.book_id,
        })
    
    return jsonify(data)

@app.route("/userrequests", methods=["GET"])
@jwt_required()
def user_requests():
    user_id = get_jwt_identity()

    user=User.query.filter_by(id=user_id).first().roles[0].name
    if user!="librarian":
        return jsonify({"error":"You are not a librarian"})
    
    requests = BookRequest.query.all()
    
    data = []
    for request in requests:
        book = Book.query.filter_by(id=request.book_id).first()
        data.append({
            "id": request.id,
            "book_id": book.id,
            "title": book.title,
            "author": book.author,
            "content": book.content,
            "date_issued": book.date_issued,
            "return_date": book.date_return,
            "status": request.status,
            "book_id": request.book_id,
            "section_name": Section.query.filter_by(id=book.section_id).first().name,
            "user_name": User.query.filter_by(id=request.user_id).first().username,
            "days_requested": (request.date_return - request.date_requested).days
        })
    
    return jsonify(data)

@app.route("/approverequest/<id>", methods=["PUT"])
@jwt_required()
def approve_request(id):
    user_id = get_jwt_identity()
    user=User.query.filter_by(id=user_id).first().roles[0].name
    if user!="librarian":
        return jsonify({"error":"You are not a librarian"})
    
    req = BookRequest.query.filter_by(id=id).first()
    if not req:
        return jsonify({"error": "Request not found"}), 404
    
    req.status = "issued"
    db.session.commit()
    
    return jsonify({"message": "Request approved successfully"})

@app.route("/rejectrequest/<id>", methods=["PUT"])
@jwt_required()
def reject_request(id):
    user_id = get_jwt_identity()
    user=User.query.filter_by(id=user_id).first().roles[0].name
    if user!="librarian":
        return jsonify({"error":"You are not a librarian"})
    
    req = BookRequest.query.filter_by(id=id).first()
    if not req:
        return jsonify({"error": "Request not found"}), 404
    
    db.session.delete(req)
    db.session.commit()
    
    return jsonify({"message": "Request rejected successfully"})

@app.route("/returnbook/<id>", methods=["PUT"])
@jwt_required()
def return_book(id):
    user_id = get_jwt_identity()
    
    req = BookRequest.query.filter_by(id=id).first()
    if not req:
        return jsonify({"error": "Request not found"}), 404
    
    req.status = "returned"
    db.session.commit()
    
    return jsonify({"message": "Book returned successfully"})

@app.route("/revokebook/<id>", methods=["PUT"])
@jwt_required()
def revoke_book(id):
    user_id = get_jwt_identity()
    user=User.query.filter_by(id=user_id).first().roles[0].name
    if user!="librarian":
        return jsonify({"error":"You are not a librarian"})
    
    req = BookRequest.query.filter_by(id=id).first()
    if not req:
        return jsonify({"error": "Request not found"}), 404
    
    req.status = "revoked"
    db.session.commit()
    
    return jsonify({"message": "Book revoked successfully"})

@app.route("/ratebook/<id>", methods=["POST"])
@jwt_required()
def rate_book(id):
    user_id = get_jwt_identity()
    rating = request.json.get("rating")
    feedback = request.json.get("feedback")
    if not rating:
        return jsonify({"error": "Rating is required"}), 400
    
    book = Book.query.filter_by(id=id).first()
    if not book:
        return jsonify({"error": "Book not found"}), 404
    
    rate = Rating.query.filter_by(book_id=id, user_id=user_id).first()
    if rate:
        rate.rating = rating
    else:
        rate = Rating(book_id=id, user_id=user_id, rating=rating, feedback=feedback)
        db.session.add(rate)
    
    db.session.commit()
    
    return jsonify({"message": "Book rated successfully"})

@app.route("/bookrating/<id>", methods=["GET"])
@jwt_required()
def book_rating(id):
    book = Book.query.filter_by(id=id).first()
    if not book:
        return jsonify({"error": "Book not found"}), 404
    
    ratings = Rating.query.filter_by(book_id=id).all()
    if not ratings:
        return jsonify({"message": "No ratings found"}), 404
    
    data = []
    for rate in ratings:
        data.append({
            "id": rate.id,
            "rating": rate.rating,
            "feedback": rate.feedback,
            "user_name": User.query.filter_by(id=rate.user_id).first().username
        })
    
    return jsonify(data)


@app.route("/user/statistics", methods=["GET"])
@cache.cached(timeout=60, key_prefix="user_statistics")
@jwt_required()
def user_statistics():
    user_id = get_jwt_identity()
    returned_books = BookRequest.query.filter_by(user_id=user_id, status='returned').all()
    if not returned_books:
        return jsonify({"message": "No statistics available!"}), 404
    
    books_count = {}
    section_count = {}
    for request in returned_books:
        book_name = request.book.title
        section_name = request.book.section.name
        books_count[book_name] = books_count.get(book_name, 0) + 1
        section_count[section_name] = section_count.get(section_name, 0) + 1

    return jsonify({"books_read": books_count, "sections": section_count})


@app.route("/librarian/statistics", methods=["GET"])
@cache.cached(timeout=60, key_prefix="librarian_statistics")
@jwt_required()
def librarian_statistics():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    librarian_role = Role.query.filter_by(name="librarian").first()
    if librarian_role not in user.roles:
        return jsonify({"message": "Access denied!"}), 401
    
    relevant_book_requests = BookRequest.query.filter(BookRequest.status.in_(['returned', 'issued', 'revoked'])).all()
    if not relevant_book_requests:
        return jsonify({"message": "No statistics available!"}), 404
    
    issued_books_count = {}
    section_distribution = {}
    for request in relevant_book_requests:
        book_name = request.book.title
        section_name = request.book.section.name
        issued_books_count[book_name] = issued_books_count.get(book_name, 0) + 1
        section_distribution[section_name] = section_distribution.get(section_name, 0) + 1

    return jsonify({"books_issued": issued_books_count, "sections": section_distribution})

@app.route("/export/section/<int:section_id>", methods=["GET"])
@jwt_required()
def export_section_csv(section_id):
    task = tasks.export_section_to_csv.apply_async(args=[section_id])
    return jsonify({"message": "Export task has been initiated successfully."})
