<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/style.css" />
</head>
<body>
<div class="login-wrapper">
    <div class="login-card">
        <h2>Welcome <span>Back</span></h2>
        <c:if test="${not empty error}">
            <div class="error-msg">${error}</div>
        </c:if>
        <form action="/login" method="post" onsubmit="return validateLogin()">
            <div class="form-group-login">
                <label>Email</label>
                <input type="text" id="login-email" name="email" placeholder="example@gmail.com" />
                <span class="field-error" id="err-login-email"></span>
            </div>
            <div class="form-group-login">
                <label>Password</label>
                <input type="password" id="login-password" name="password" placeholder="••••••" />
                <span class="field-error" id="err-login-password"></span>
            </div>
            <button type="submit" class="btn-login">Login</button>
        </form>
    </div>
</div>
<script>
    function validateLogin() {
        let valid = true;
        document.getElementById('err-login-email').innerText    = '';
        document.getElementById('err-login-password').innerText = '';
        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        if (!email) {
            document.getElementById('err-login-email').innerText = 'Email is required.'; valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('err-login-email').innerText = 'Invalid email format.'; valid = false;
        }
        if (!password) {
            document.getElementById('err-login-password').innerText = 'Password is required.'; valid = false;
        } else if (password.length < 6) {
            document.getElementById('err-login-password').innerText = 'Min. 6 characters.'; valid = false;
        }
        return valid;
    }
</script>
</body>
</html>