function validateComment() {
	var author = document.forms["comment"]["author"].value;
	var content = document.forms["comment"]["content"].value;
	if(author == null || author == "") {
		alert("Your name is required");
		return false;
	}
	if(content == null || content == "") {
		alert("Your comment is required");
		return false;
	}
}

$().ready(function () {
	$('#signin').click(function () {
		if ($('#username').val() == "" || $('#password').val() == "") {
			alert("Username or password can't be empty.");
		} else {
			$.ajax({
				type: "POST",
				url: "/signin",
				data: "username=" + escape($('#username').val()) + "&password=" + escape($('#password').val()),
				success: function (msg) {
					if (msg == "success") {
						//document.location.href = "/";
						location.replace(location.href);
					}
					if (msg == "fail") {
						alert("Login Failed");
					}
				},					
				error: function (XMLHttpRequest, textStatus, thrownError) {
					alert("Network Error");
				}
			});
		}
	});
});