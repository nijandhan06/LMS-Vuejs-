from flask import Flask
from flask_restful import Api
from flask_security import Security, SQLAlchemySessionUserDatastore
from application.config import LocalDevelopmentConfig
from application.data.database import db
from application.data.models import User, Role
from flask_jwt_extended import JWTManager
from flask_caching import Cache
from werkzeug.security import generate_password_hash
from application.jobs import workers
from application.jobs import tasks

app = api = celery = cache = None

def create_app():
    app = Flask(__name__, template_folder="templates")
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    api = Api(app)
    app.app_context().push()
    jwt = JWTManager(app)
    datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    celery=workers.celery
    celery.conf.update(
        broker_url = app.config["CELERY_BROKER_URL"],
        result_backend = app.config["CELERY_RESULT_BACKEND"],
        timezone = 'Asia/Kolkata',
         broker_connection_retry_on_startup = True
    )

    celery.Task=workers.CeleryWorker
    app.app_context().push()
    cache=Cache(app)
    app.app_context().push()

    return app, api, celery, cache


app, api, celery, cache = create_app()

def create_roles_librain():
    with app.app_context():
        db.create_all()
        if Role.query.filter_by(name='librarian').first() is None:
            role_lib=Role(name='librarian',description='Librarian ROLE')
        if Role.query.filter_by(name='user').first() is None:
            role_user=Role(name='user',description='User ROLE')
            db.session.add_all([role_lib,role_user])
            db.session.commit()
        user=User.query.filter_by(username='librarian').first()
        if user is None:
            datastore = app.security.datastore
            user = datastore.create_user(username='librarian',email='librarian@gmail.com', password=generate_password_hash('admin'))
            db.session.commit()
            role = Role.query.filter_by(name='librarian').first()
            datastore.add_role_to_user(user, role)
            db.session.commit()


from application.controllers.controllers import *

from application.controllers.api import *

api.add_resource(SectionAPI, '/api/section', '/api/section/<int:id>')
api.add_resource(BookAPI, '/api/section_book/<int:section_id>', '/api/book/<int:book_id>')


if __name__ == "__main__":
    create_roles_librain()
    app.run(debug=True, port=8000)