from application.jobs.workers import celery
from datetime import datetime, timedelta
from celery.schedules import crontab
from jinja2 import Template
from application.jobs.email import email_send
from application.data.models import *
import os,csv,zipfile

@celery.on_after_finalize.connect
def setup_daily_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=19, minute=30),
        send_daily_reminder.s(),
        name="send_daily_reminder",
    )


@celery.on_after_finalize.connect
def setup_monthly_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(day_of_month="27", hour=19, minute=30),
        send_monthly_summary.s(),
        name="send_monthly_summary",
    )


@celery.task()
def send_daily_reminder():
    all_users = User.query.all()
    for user in all_users:
        if datetime.now() - user.login_time >= timedelta(minutes=0):
            with open("templates/daily_reminder_template.html") as template_file:
                email_template = Template(template_file.read())
                email_body = email_template.render(username=user.username)

            email_send(
                to=user.email, 
                subject="Daily Reminder", 
                message=email_body
            )
    return "Daily reminder emails sent successfully!"



@celery.task
def send_monthly_summary():
    
    all_ratings = Rating.query.all()
    ratings_details = [
        {
            "book_name": Book.query.get(rating.book_id).title,
            "rating_value": rating.rating,
            "user_feedback": rating.feedback
        }
        for rating in all_ratings
    ]

    issued_books = BookRequest.query.all()

    with open('templates/monthly_summary.html') as template_file:
        template_content = Template(template_file.read())
        rendered_content = template_content.render(
            ratings=ratings_details,
            issued_books=issued_books
        )

    email_send(
        to="librarian@gmail.com",
        subject="Monthly Report",
        message=rendered_content
    )

    return "Monthly summary emails have been successfully sent."

@celery.task
def export_section_to_csv(section_id):
    section = Section.query.get(section_id)
    section_books = section.books

    csv_data = [["Book Name", "Author", "Issue Date", "Return Date", "Content"]]
    for book in section_books:
        csv_data.append([book.title, book.author, book.date_issued, book.date_return, book.content])

    csv_filename = f'{section.name}_export.csv'
    with open(csv_filename, 'w', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerows(csv_data)

    zip_filename = f'{section.name}_data.zip'
    with zipfile.ZipFile(zip_filename, 'w') as zip_file:
        zip_file.write(csv_filename)

    with open("templates/export_notification.html") as template_file:
        email_template = Template(template_file.read())
        email_body = email_template.render(section_name=section.name)

    email_send(
        to="librarian@gmail.com",
        subject="Section Data Export",
        message=email_body,
        files=zip_filename
    )

    os.remove(csv_filename)
    os.remove(zip_filename)

    return f"CSV and ZIP files for section '{section.name}' have been created and emailed successfully."
