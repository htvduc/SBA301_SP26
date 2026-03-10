<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
    <title>Manage Students</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/style.css" />
</head>
<body>

<!-- TOAST -->
<div id="toast" class="toast" style="display:none;"></div>

<div class="main-wrapper">

    <!-- LEFT: Form -->
    <div class="left-panel">
        <div class="left-header">
            <h2>Student Form</h2>
            <a href="/logout" class="btn-logout">Logout</a>
        </div>

        <div id="form-error" class="form-error-msg" style="display:none;"></div>

        <div class="form-group">
            <label>ID</label>
            <input type="text" id="f-id" readonly placeholder="Auto-generated" />
        </div>
        <div class="form-group">
            <label>Email</label>
            <input type="text" id="f-email" placeholder="example@gmail.com" />
            <span class="field-error" id="err-email"></span>
        </div>
        <div class="form-group">
            <label>Password</label>
            <input type="password" id="f-password" placeholder="Min. 6 characters" />
            <span class="field-error" id="err-password"></span>
        </div>
        <div class="form-group">
            <label>First Name</label>
            <input type="text" id="f-firstname" placeholder="First name" />
            <span class="field-error" id="err-firstname"></span>
        </div>
        <div class="form-group">
            <label>Last Name</label>
            <input type="text" id="f-lastname" placeholder="Last name" />
            <span class="field-error" id="err-lastname"></span>
        </div>
        <div class="form-group">
            <label>Mark (0 – 10)</label>
            <input type="number" id="f-marks" placeholder="0 - 10" min="0" max="10" />
            <span class="field-error" id="err-marks"></span>
        </div>

        <div class="btn-group">
            <button class="btn-add"    id="btn-add"    onclick="handleAdd()">Add</button>
            <button class="btn-update" id="btn-update" onclick="updateStudent()">Update</button>
            <button class="btn-delete" id="btn-delete" onclick="deleteStudent()">Delete</button>
        </div>
    </div>

    <!-- RIGHT: Table -->
    <div class="right-panel">
        <h2>
            User Lists
            <span class="count">${students.size()} students</span>
        </h2>

        <div class="table-wrapper">
            <table>
                <thead>
                <tr>
                    <th></th>
                    <th>#</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Mark</th>
                </tr>
                </thead>
                <tbody>
                <c:forEach var="s" items="${students}" varStatus="i">
                    <tr class="student-row"
                        data-id="${s.id}"
                        data-index="${i.count}"
                        data-email="${s.email}"
                        data-password="${s.password}"
                        data-firstname="${s.firstname}"
                        data-lastname="${s.lastname}"
                        data-marks="${s.marks}">
                        <td><input type="radio" name="sel" /></td>
                        <td>${i.count}</td>
                        <td>${s.email}</td>
                        <td>${s.password}</td>
                        <td>${s.firstname}</td>
                        <td>${s.lastname}</td>
                        <td>
                            <c:choose>
                                <c:when test="${s.marks >= 8}">
                                    <span class="badge-marks badge-high">${s.marks}</span>
                                </c:when>
                                <c:when test="${s.marks >= 5}">
                                    <span class="badge-marks badge-mid">${s.marks}</span>
                                </c:when>
                                <c:otherwise>
                                    <span class="badge-marks badge-low">${s.marks}</span>
                                </c:otherwise>
                            </c:choose>
                        </td>
                    </tr>
                </c:forEach>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
    var isAddMode = false;
    var rows = document.querySelectorAll('.student-row');

    // ─── Show toast nếu có flash message ─────────────
    // ─── Show toast nếu có flash message ─────────────
    var successMsg = '<c:out value="${successMsg}"/>';
    var errorMsg   = '<c:out value="${errorMsg}"/>';

    if (successMsg && successMsg.trim() !== '') {
        showToast(successMsg, 'success');
    }
    if (errorMsg && errorMsg.trim() !== '') {
        showToast(errorMsg, 'error');
    }

    // ─── Click row -> fill form ───────────────────────
    for (var i = 0; i < rows.length; i++) {
        rows[i].addEventListener('click', function () {
            isAddMode = false;
            document.getElementById('btn-add').innerText = 'Add';

            for (var j = 0; j < rows.length; j++) rows[j].classList.remove('selected');
            this.classList.add('selected');
            this.querySelector('input[type=radio]').checked = true;

            var idField = document.getElementById('f-id');
            idField.value = this.getAttribute('data-index');
            idField.setAttribute('data-real-id', this.getAttribute('data-id'));

            document.getElementById('f-email').value     = this.getAttribute('data-email');
            document.getElementById('f-password').value  = this.getAttribute('data-password');
            document.getElementById('f-firstname').value = this.getAttribute('data-firstname');
            document.getElementById('f-lastname').value  = this.getAttribute('data-lastname');
            document.getElementById('f-marks').value     = this.getAttribute('data-marks');

            clearErrors();
            hideMessage();
        });
    }

    // ─── Toast ────────────────────────────────────────
    function showToast(msg, type) {
        var toast = document.getElementById('toast');
        toast.innerText     = msg;
        toast.style.display = 'block';
        toast.className     = 'toast ' + (type === 'error' ? 'toast-error' : 'toast-success');
        toast.classList.add('show');
        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () { toast.style.display = 'none'; }, 400);
        }, 3000);
    }

    // ─── Helpers ─────────────────────────────────────
    function clearErrors() {
        document.getElementById('err-email').innerText     = '';
        document.getElementById('err-password').innerText  = '';
        document.getElementById('err-firstname').innerText = '';
        document.getElementById('err-lastname').innerText  = '';
        document.getElementById('err-marks').innerText     = '';
    }

    function hideMessage() {
        document.getElementById('form-error').style.display = 'none';
    }

    function showError(msg) {
        var box = document.getElementById('form-error');
        box.className     = 'form-error-msg error';
        box.innerText     = msg;
        box.style.display = 'block';
    }

    function showInfo(msg) {
        var box = document.getElementById('form-error');
        box.className     = 'form-error-msg info';
        box.innerText     = msg;
        box.style.display = 'block';
    }

    function clearForm() {
        var idField = document.getElementById('f-id');
        idField.value = '';
        idField.setAttribute('data-real-id', '');
        document.getElementById('f-email').value     = '';
        document.getElementById('f-password').value  = '';
        document.getElementById('f-firstname').value = '';
        document.getElementById('f-lastname').value  = '';
        document.getElementById('f-marks').value     = '';
        for (var i = 0; i < rows.length; i++) rows[i].classList.remove('selected');
        var radios = document.querySelectorAll('input[name=sel]');
        for (var i = 0; i < radios.length; i++) radios[i].checked = false;
        clearErrors();
        hideMessage();
    }

    // ─── Validate ─────────────────────────────────────
    function validate() {
        var valid = true;
        clearErrors();

        var email    = document.getElementById('f-email').value.trim();
        var password = document.getElementById('f-password').value.trim();
        var fname    = document.getElementById('f-firstname').value.trim();
        var lname    = document.getElementById('f-lastname').value.trim();
        var marks    = document.getElementById('f-marks').value.trim();

        if (email === '') {
            document.getElementById('err-email').innerText = 'Email is required.'; valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('err-email').innerText = 'Invalid email format.'; valid = false;
        }
        if (password === '') {
            document.getElementById('err-password').innerText = 'Password is required.'; valid = false;
        } else if (password.length < 6) {
            document.getElementById('err-password').innerText = 'Min. 6 characters.'; valid = false;
        }
        if (fname === '') {
            document.getElementById('err-firstname').innerText = 'First name is required.'; valid = false;
        }
        if (lname === '') {
            document.getElementById('err-lastname').innerText = 'Last name is required.'; valid = false;
        }
        if (marks === '') {
            document.getElementById('err-marks').innerText = 'Mark is required.'; valid = false;
        } else if (Number(marks) < 0 || Number(marks) > 10) {
            document.getElementById('err-marks').innerText = 'Mark must be 0 – 10.'; valid = false;
        }
        return valid;
    }

    // ─── Submit ───────────────────────────────────────
    function submitForm(action, includeId) {
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = action;
        var fields = {
            email:     document.getElementById('f-email').value.trim(),
            password:  document.getElementById('f-password').value.trim(),
            firstname: document.getElementById('f-firstname').value.trim(),
            lastname:  document.getElementById('f-lastname').value.trim(),
            marks:     document.getElementById('f-marks').value.trim()
        };
        if (includeId) {
            fields.id = document.getElementById('f-id').getAttribute('data-real-id');
        }
        var keys = Object.keys(fields);
        for (var i = 0; i < keys.length; i++) {
            var inp = document.createElement('input');
            inp.type = 'hidden'; inp.name = keys[i]; inp.value = fields[keys[i]];
            form.appendChild(inp);
        }
        document.body.appendChild(form);
        form.submit();
    }

    // ─── ADD ──────────────────────────────────────────
    function handleAdd() {
        isAddMode = true;
        document.getElementById('btn-add').innerText = 'Save';

        // Nếu form trống hoàn toàn thì mới clear và hiện info
        var email = document.getElementById('f-email').value.trim();
        var hasData = email !== ''
            || document.getElementById('f-firstname').value.trim() !== ''
            || document.getElementById('f-lastname').value.trim() !== '';

        if (!hasData) {
            clearForm();
            showInfo('Fill in the form and click Save to add.');
            document.getElementById('f-email').focus();
            return;
        }

        // Có data rồi thì validate và submit, không clear
        if (!validate()) return;
        submitForm('/students/save', false);
    }

    // ─── UPDATE ───────────────────────────────────────
    function updateStudent() {
        var realId = document.getElementById('f-id').getAttribute('data-real-id');
        if (!realId || realId === '') {
            showError('Please select a student from the list first!'); return;
        }
        if (!validate()) return;
        submitForm('/students/update', true);
    }

    // ─── DELETE ───────────────────────────────────────
    function deleteStudent() {
        var realId = document.getElementById('f-id').getAttribute('data-real-id');
        if (!realId || realId === '') {
            showError('Please select a student from the list first!'); return;
        }
        if (confirm('Are you sure you want to delete this student?')) {
            window.location.href = '/students/delete/' + realId;
        }
    }
</script>
</body>
</html>