# StudyBuddy - Study Group Management

## Requirements
- Java 24
- Maven 3.9+
- MySQL 8.x

## 1. Configure MySQL password
Open:
src/main/resources/application.properties

Change:
spring.datasource.password=

to your MySQL root password, for example:
spring.datasource.password=your_password

If your MySQL root account has no password, leave it empty.

## 2. Create the database
Open MySQL Workbench and run:
CREATE DATABASE IF NOT EXISTS study_group_db;

The application will create/update the tables automatically.

## 3. Build
Open Command Prompt in this folder and run:
mvn clean install

You should see BUILD SUCCESS.

## 4. Start
Run:
mvn spring-boot:run

Wait until you see:
Started StudyBuddyApplication

## 5. Open
http://localhost:8080/

## API examples

Create student:
POST /api/students
{
  "name": "Anu Priya",
  "email": "anu.priya@gmail.com",
  "department": "Computer Science"
}

Create subject:
POST /api/subjects
{
  "name": "Java"
}

Create group:
POST /api/groups
{
  "name": "Java Exam Group",
  "description": "Preparation for Java exam",
  "capacity": 5,
  "subjectId": 1
}

Join:
POST /api/memberships/join?studentId=1&groupId=1

Business rules:
- A student cannot join the same group twice.
- A group cannot exceed its capacity.
