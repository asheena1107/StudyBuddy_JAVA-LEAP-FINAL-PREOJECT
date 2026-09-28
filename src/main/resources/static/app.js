let students = [];
let subjects = [];
let groups = [];
let memberships = [];

const API = {
    students: "/api/students",
    subjects: "/api/subjects",
    groups: "/api/groups",
    memberships: "/api/memberships"
};


/* =========================
   NAVIGATION
========================= */

function showSection(id, button = null) {

    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
    });

    const selected = document.getElementById(id);

    if (selected) {
        selected.classList.add("active");
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    const titles = {
        dashboard: ["Dashboard", "Manage your study community"],
        students: ["Students", "Manage students registered in StudyBuddy"],
        subjects: ["Subjects", "Manage available study subjects"],
        groups: ["Study Groups", "Create and manage collaborative learning groups"],
        memberships: ["Memberships", "Manage student group memberships"]
    };

    if (titles[id]) {
        document.getElementById("pageTitle").textContent = titles[id][0];
        document.getElementById("pageSubtitle").textContent = titles[id][1];
    }
}


/* =========================
   MODALS
========================= */

function openModal(id) {
    document.getElementById(id).classList.add("show");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("show");
}

window.addEventListener("click", function(event) {
    document.querySelectorAll(".modal").forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove("show");
        }
    });
});


/* =========================
   TOAST
========================= */

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


/* =========================
   LOAD DATA
========================= */

async function loadAllData() {

    try {
        const [studentResponse, subjectResponse, groupResponse, membershipResponse] =
            await Promise.all([
                fetch(API.students),
                fetch(API.subjects),
                fetch(API.groups),
                fetch(API.memberships)
            ]);

        if (studentResponse.ok) {
            students = await studentResponse.json();
        }

        if (subjectResponse.ok) {
            subjects = await subjectResponse.json();
        }

        if (groupResponse.ok) {
            groups = await groupResponse.json();
        }

        if (membershipResponse.ok) {
            memberships = await membershipResponse.json();
        }

        updateDashboard();
        renderStudents();
        renderSubjects();
        renderGroups();
        renderMemberships();
        populateSelects();

    } catch (error) {

        console.error(error);

        showToast("Unable to load some data");

        updateDashboard();
    }
}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {

    const values = {
        studentCount: students.length,
        subjectCount: subjects.length,
        groupCount: groups.length,
        membershipCount: memberships.length
    };

    Object.keys(values).forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = values[id];
        }
    });

    document.getElementById("overviewStudents").textContent = students.length;
    document.getElementById("overviewSubjects").textContent = subjects.length;
    document.getElementById("overviewGroups").textContent = groups.length;
    document.getElementById("overviewMemberships").textContent = memberships.length;
}


/* =========================
   STUDENTS
========================= */

function renderStudents(list = students) {

    const table = document.getElementById("studentTable");

    if (!list.length) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No students found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = list.map(student => `
        <tr>
            <td>#${student.id ?? "-"}</td>
            <td><strong>${escapeHtml(student.name ?? student.studentName ?? "-")}</strong></td>
            <td>${escapeHtml(student.email ?? "-")}</td>
            <td>${escapeHtml(student.department ?? "Computer Science")}</td>
            <td>${escapeHtml(student.year ?? "-")}</td>
        </tr>
    `).join("");
}


function filterStudents() {

    const value = document.getElementById("studentSearch")
        .value
        .toLowerCase();

    const filtered = students.filter(student => {

        const name = String(student.name ?? student.studentName ?? "").toLowerCase();
        const email = String(student.email ?? "").toLowerCase();

        return name.includes(value) || email.includes(value);
    });

    renderStudents(filtered);
}


async function addStudent(event) {

    event.preventDefault();

    const data = {
        name: document.getElementById("studentName").value,
        email: document.getElementById("studentEmail").value,
        department: document.getElementById("studentDepartment").value,
        year: document.getElementById("studentYear").value
    };

    try {

        const response = await fetch(API.students, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Student creation failed");
        }

        closeModal("studentModal");

        event.target.reset();

        showToast("Student added successfully");

        await loadAllData();

    } catch (error) {

        console.error(error);

        showToast("Could not add student");
    }
}


/* =========================
   SUBJECTS
========================= */

function renderSubjects() {

    const container = document.getElementById("subjectCards");

    if (!subjects.length) {
        container.innerHTML = `
            <div class="empty-card">
                No subjects available. Add your first subject.
            </div>
        `;
        return;
    }

    container.innerHTML = subjects.map(subject => `
        <div class="subject-card">

            <div class="card-top">
                <div class="card-icon">B</div>
                <span class="badge">
                    ${escapeHtml(subject.code ?? "SUBJECT")}
                </span>
            </div>

            <h3>${escapeHtml(subject.name ?? subject.subjectName ?? "Subject")}</h3>

            <p>
                ${escapeHtml(
                    subject.description ??
                    "Available for collaborative study groups."
                )}
            </p>

        </div>
    `).join("");
}


async function addSubject(event) {

    event.preventDefault();

    const data = {
        name: document.getElementById("subjectName").value,
        code: document.getElementById("subjectCode").value,
        description: document.getElementById("subjectDescription").value
    };

    try {

        const response = await fetch(API.subjects, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Subject creation failed");
        }

        closeModal("subjectModal");

        event.target.reset();

        showToast("Subject added successfully");

        await loadAllData();

    } catch (error) {

        console.error(error);

        showToast("Could not add subject");
    }
}


/* =========================
   GROUPS
========================= */

function renderGroups() {

    const container = document.getElementById("groupCards");

    const search = document.getElementById("groupSearch")
        .value
        .toLowerCase();

    const subjectFilter = document.getElementById("groupSubjectFilter").value;

    const filtered = groups.filter(group => {

        const name = String(group.name ?? group.groupName ?? "")
            .toLowerCase();

        const description = String(group.description ?? "")
            .toLowerCase();

        const subjectId = String(
            group.subject?.id ??
            group.subjectId ??
            ""
        );

        const matchesSearch =
            name.includes(search) ||
            description.includes(search);

        const matchesSubject =
            !subjectFilter ||
            subjectId === subjectFilter;

        return matchesSearch && matchesSubject;
    });


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-card">
                No study groups found.
            </div>
        `;

        return;
    }


    container.innerHTML = filtered.map(group => {

        const capacity = Number(group.capacity ?? 5);

        const memberCount =
            Number(group.memberCount ??
            group.members?.length ??
            0);

        const percent =
            Math.min(100, (memberCount / capacity) * 100);

        const subjectName =
            group.subject?.name ??
            findSubjectName(group.subjectId);

        return `
            <div class="group-card">

                <div class="card-top">
                    <div class="card-icon">G</div>
                    <span class="badge">
                        ${escapeHtml(subjectName)}
                    </span>
                </div>

                <h3>
                    ${escapeHtml(group.name ?? group.groupName ?? "Study Group")}
                </h3>

                <p>
                    ${escapeHtml(
                        group.description ??
                        "Collaborative study group."
                    )}
                </p>

                <div class="capacity">

                    <div class="capacity-text">
                        <span>Group Capacity</span>
                        <strong>${memberCount}/${capacity}</strong>
                    </div>

                    <div class="progress">
                        <div style="width:${percent}%"></div>
                    </div>

                </div>

                <button class="join-btn"
                    onclick="openJoinForGroup(${group.id})">
                    Join This Group
                </button>

            </div>
        `;
    }).join("");
}


function findSubjectName(id) {

    const subject = subjects.find(
        item => String(item.id) === String(id)
    );

    return subject
        ? subject.name ?? subject.subjectName
        : "General";
}


/* =========================
   GROUP CREATE
========================= */

async function addGroup(event) {

    event.preventDefault();

    const data = {
        name: document.getElementById("groupName").value,
        description: document.getElementById("groupDescription").value,
        capacity: Number(document.getElementById("groupCapacity").value),
        subjectId: Number(document.getElementById("groupSubjectId").value)
    };

    try {

        const response = await fetch(API.groups, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Group creation failed");
        }

        closeModal("groupModal");

        event.target.reset();

        showToast("Study group created successfully");

        await loadAllData();

    } catch (error) {

        console.error(error);

        showToast("Could not create study group");
    }
}


/* =========================
   MEMBERSHIPS
========================= */

function renderMemberships() {

    const table = document.getElementById("membershipTable");

    if (!memberships.length) {

        table.innerHTML = `
            <tr>
                <td colspan="4" class="empty">
                    No memberships found.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = memberships.map(membership => {

        const student =
            membership.student?.name ??
            membership.studentName ??
            findStudentName(membership.studentId);

        const group =
            membership.studyGroup?.name ??
            membership.group?.name ??
            membership.groupName ??
            findGroupName(membership.groupId);

        return `
            <tr>

                <td>#${membership.id ?? "-"}</td>

                <td>
                    <strong>${escapeHtml(student)}</strong>
                </td>

                <td>
                    ${escapeHtml(group)}
                </td>

                <td>
                    <span class="badge">Active</span>
                </td>

            </tr>
        `;

    }).join("");
}


function findStudentName(id) {

    const student = students.find(
        item => String(item.id) === String(id)
    );

    return student
        ? student.name ?? student.studentName
        : "Student";
}


function findGroupName(id) {

    const group = groups.find(
        item => String(item.id) === String(id)
    );

    return group
        ? group.name ?? group.groupName
        : "Study Group";
}


async function addMembership(event) {

    event.preventDefault();

    const data = {
        studentId: Number(
            document.getElementById("membershipStudentId").value
        ),

        groupId: Number(
            document.getElementById("membershipGroupId").value
        )
    };

    try {

        const response = await fetch(API.memberships, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Membership failed");
        }

        closeModal("membershipModal");

        event.target.reset();

        showToast("Student joined the group");

        await loadAllData();

    } catch (error) {

        console.error(error);

        showToast("Could not join group. Check capacity or duplicate membership.");
    }
}


function openJoinForGroup(groupId) {

    document.getElementById("membershipGroupId").value = groupId;

    openModal("membershipModal");
}


/* =========================
   DROPDOWN DATA
========================= */

function populateSelects() {

    const subjectSelect =
        document.getElementById("groupSubjectId");

    const filterSelect =
        document.getElementById("groupSubjectFilter");

    subjectSelect.innerHTML =
        `<option value="">Select Subject</option>`;

    filterSelect.innerHTML =
        `<option value="">All Subjects</option>`;


    subjects.forEach(subject => {

        const id = subject.id;

        const name =
            subject.name ??
            subject.subjectName ??
            "Subject";

        subjectSelect.innerHTML += `
            <option value="${id}">
                ${escapeHtml(name)}
            </option>
        `;

        filterSelect.innerHTML += `
            <option value="${id}">
                ${escapeHtml(name)}
            </option>
        `;
    });


    const studentSelect =
        document.getElementById("membershipStudentId");

    studentSelect.innerHTML =
        `<option value="">Select Student</option>`;

    students.forEach(student => {

        studentSelect.innerHTML += `
            <option value="${student.id}">
                ${escapeHtml(student.name ?? student.studentName)}
            </option>
        `;
    });


    const groupSelect =
        document.getElementById("membershipGroupId");

    groupSelect.innerHTML =
        `<option value="">Select Study Group</option>`;

    groups.forEach(group => {

        groupSelect.innerHTML += `
            <option value="${group.id}">
                ${escapeHtml(group.name ?? group.groupName)}
            </option>
        `;
    });
}


/* =========================
   SECURITY
========================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   START
========================= */

document.addEventListener("DOMContentLoaded", function() {

    showSection("dashboard");

    loadAllData();

});
