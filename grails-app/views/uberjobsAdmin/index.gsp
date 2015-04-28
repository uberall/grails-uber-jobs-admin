<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title>UberJobs-Admin</title>
    <link href='//fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
    <asset:stylesheet src="uberjobs-admin" />
    <asset:javascript src="uberjobs-admin" />
    <script type="text/javascript">
    	window.baseUrl = "${baseUrl}";
    </script>
</head>

<body>
    <asset:reactTemplate src="uberjobs-app.jsx" />
</body>
</html>