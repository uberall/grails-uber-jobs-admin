<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title>UberJobs-Admin</title>
    <asset:stylesheet src="uberjobs-admin" />
    <asset:javascript src="uberjobs-admin" />
    <script type="text/javascript">
    	window.baseUrl = 'http://localhost:8080/uberjobs'
    </script>
</head>

<body>
    <asset:reactTemplate src="uberjobs-app.jsx" />
</body>
</html>