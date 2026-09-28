async function api(url, options = {}) {
    const response = await fetch(url, {
        headers: {"Content-Type": "application/json"},
        ...options
    });
    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; }
    catch { data = {error: text}; }
    if (!response.ok) {
        throw new Error(data.error || JSON.stringify(data.fields || data));
    }
    return data;
}

function message(id, text) {
    document.getElementById(id).textContent = text;
}

document.getElementById("studentForm").addEventListener("submit", async e => {
    e.preventDefault();
    try {
        await api("/api/students", {
            method:"POST",
            body:JSON.stringify({
                name:document.getElementById("studentName").value.trim(),
                email:document.getElementById("studentEmail").value.trim(),
                department:document.getElementById("studentDepartment").value.trim()
            })
        });
        message("studentMsg","Student added successfully.");
        e.target.reset();
        loadAll();
    } catch(err) { message("studentMsg",err.message); }
});

document.getElementById("subjectForm").addEventListener("submit", async e => {
    e.preventDefault();
    try {
        await api("/api/subjects", {
            method:"POST",
            body:JSON.stringify({
                name:document.getElementById("subjectName").value.trim()
            })
        });
        message("subjectMsg","Subject added successfully.");
        e.target.reset();
        loadAll();
    } catch(err) { message("subjectMsg",err.message); }
});

document.getElementById("groupForm").addEventListener("submit", async e => {
    e.preventDefault();
    try {
        await api("/api/groups", {
            method:"POST",
            body:JSON.stringify({
                name:document.getElementById("groupName").value.trim(),
                description:document.getElementById("groupDescription").value.trim(),
                capacity:Number(document.getElementById("groupCapacity").value),
                subjectId:Number(document.getElementById("groupSubjectId").value)
            })
        });
        message("groupMsg","Study group created successfully.");
        e.target.reset();
        loadAll();
    } catch(err) { message("groupMsg",err.message); }
});

document.getElementById("joinForm").addEventListener("submit", async e => {
    e.preventDefault();
    try {
        await api("/api/memberships/join?studentId=" +
            Number(document.getElementById("joinStudentId").value) +
            "&groupId=" + Number(document.getElementById("joinGroupId").value), {
            method:"POST"
        });
        message("joinMsg","Student joined the group successfully.");
        e.target.reset();
        loadAll();
    } catch(err) { message("joinMsg",err.message); }
});

async function loadAll() {
    try {
        const [students, subjects, groups, memberships] = await Promise.all([
            api("/api/students"), api("/api/subjects"),
            api("/api/groups"), api("/api/memberships")
        ]);

        let html = "<h3>Students</h3><table><tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th></tr>";
        students.forEach(s => html += `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.email}</td><td>${s.department}</td></tr>`);
        html += "</table><h3>Subjects</h3><table><tr><th>ID</th><th>Name</th></tr>";
        subjects.forEach(s => html += `<tr><td>${s.id}</td><td>${s.name}</td></tr>`);
        html += "</table><h3>Groups</h3><table><tr><th>ID</th><th>Name</th><th>Capacity</th><th>Subject</th></tr>";
        groups.forEach(g => html += `<tr><td>${g.id}</td><td>${g.name}</td><td>${g.capacity}</td><td>${g.subject.name}</td></tr>`);
        html += "</table><h3>Memberships</h3><table><tr><th>ID</th><th>Student</th><th>Group</th></tr>";
        memberships.forEach(m => html += `<tr><td>${m.id}</td><td>${m.student.name}</td><td>${m.group.name}</td></tr>`);
        html += "</table>";
        document.getElementById("output").innerHTML = html;
    } catch(err) {
        document.getElementById("output").textContent = err.message;
    }
}

loadAll();
