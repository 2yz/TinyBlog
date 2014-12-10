// 在Cloud code里初始化express框架
var express = require('express');
var app = express();
var name = require('cloud/name.js');
var avosExpressHttpsRedirect = require('avos-express-https-redirect');
var avosExpressCookieSession = require('avos-express-cookie-session');
//var Encoder = require('node-html-encoder').Encoder;
//var session = require('cookie-session'); // cookie session configuration




// App全局配置
//设置模板目录
app.set('views', 'cloud/views');
app.set('view engine', 'ejs');    // 设置template引擎
//app.set('trust proxy', 1); // cookie session configuration
app.use(avosExpressHttpsRedirect()); //启用HTTPS
app.use(express.bodyParser());    // 读取请求body的中间件
app.use(express.cookieParser('FrENkCieRk'));// cookie secure
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 }, fetchUser: true, key: 'TinyBlog'}));
app.use(express.cookieSession({ key:'TinyBlog.sess'}));



//使用express路由API服务/hello的http GET请求
app.get('/hello', function(req, res) {
	res.render('hello', { message: 'Congrats, you just set up your app!' });
});

var Visitor = AV.Object.extend('Visitor');
var Posts = AV.Object.extend('Posts');
var Board = AV.Object.extend('Board');
var Comments = AV.Object.extend('Comments');

function renderIndex(req, res){
	var username;
	var postsList;
	var queryPosts = new AV.Query(Posts);
	if(AV.User.current()) {
		username = AV.User.current().getUsername();
		console.log("username: " + username);
		console.log(req.session.username);
	}
	queryPosts.skip(0);
	queryPosts.limit(5);
	queryPosts.descending('createdAt');
	queryPosts.find().then(function(posts) {
		console.log("PostsQuery successfully");
		res.render('index',{postsList: posts, username: username});
		console.log("render successfully");
	},function(error) {
		console.log(error);
		res.render('500',500);
	});
}

/*
function recentPost() {
	console.log("post");
	var queryPosts = new AV.Query(Posts);
	queryPosts.skip(0);
	queryPosts.limit(5);
	queryPosts.descending('createdAt');
	queryPosts.find().then(function(posts) {
		console.log("post");
		return posts;
	},function(error) {
		//console.log(error);
		//res.render('500',500);
		return null;
	});
}

function recentComment() {

}
*/

function recentComment() {

}

app.get('/', function(req, res){
	renderIndex(req, res);
});

app.post('/',function(req, res){
	var name = req.body.name;
	if(name && name.trim() !=''){
		//Save visitor
		var visitor = new Visitor();
		visitor.set('name', name);
		visitor.save(null, {
			success: function(gameScore) {
				res.redirect('/?name=' + name);
			},
			error: function(gameScore, error) {
				res.render('500', 500);
			}
		});
	}else{
		res.redirect('/');
	}
});

app.post('/signin', function(req, res) {
	AV.User.logIn(req.body.username, req.body.password).then(function() {
		var currentUser = AV.User.current();
		console.log(currentUser);
		var username = currentUser.getUsername();
		console.log('signin successfully: %j', username);
		req.session.username = username;
		console.log('session username');
		console.log(req.session.username);
		console.log(req.session);
		//res.redirect('back');
		res.send("success");
	},function(error) {
		//res.redirect('/');
		//console.log("send error");
		//res.send("error");
		//res.send({ret:false,msg:'Error',data:error});
		//res.send(error);
		res.send("fail");
	})
});

app.get('/signup', function(req, res) {
	res.render('signup');

});
app.post('/signup', function(req, res) {
	var user = new AV.User();
	console.log(req.body.username);
	console.log(req.body.password);
	user.set("username", req.body.username);
	user.set("password", req.body.password);
	user.signUp(null, {
		success: function(user) {
			//console.log('success');
			//console.log(user);
			res.redirect('/');
		},
		error: function(user, error) {
			//console.log('fail');
			//console.log(user);
			//console.log(error);
			res.send(error.message);
		}
	});

});
app.get('/signout', function(req, res) {
	AV.User.logOut();
	res.redirect('back');
});

app.get('/post/:id', function(req, res) {
	//var postId = req.params.id;
	var username;
	var post;
	var comments;
	var postId = Number(req.params.id);
	console.log(req.params.id);
	if(AV.User.current()) {
		username = AV.User.current().getUsername();
	}
	var query = new AV.Query(Posts);
	var commentQuery = new AV.Query(Comments);
	var queryPosts = new AV.Query(Posts);
	query.equalTo("postId", postId);
	queryPosts.skip(0);
	queryPosts.limit(5);
	queryPosts.descending('createdAt');
	query.first().then(function(postObject) {
		if(postObject){
			post = postObject;
			commentQuery.equalTo("post", post);
			return commentQuery.find();
		} else {
			res.send("error")
		}
	}, function(error) {
		//console.log(error);
		res.send(error);
	}).then(function(commentsArray) {
		//console.log(post);
		//console.log(comments);
		comments = commentsArray;
		return queryPosts.find();
	}, function(error) {
		console.log(error);
		res.send(error);
	}).then(function(posts) {
		res.render('post',{username: username, post: post, comments: comments, postsList: posts});
		//res.render('index',{postsList: posts, username: username});
	},function(error) {
		console.log(error);
		res.render('500',500);
	});
	/*
	query.find({
		success: function(results) {
			if(results[0])
			{
				res.render('post',{username: username, post: results[0]});
			} else {
				res.send("error");
			}
			
		},
		error: function(error) {
			res.render('500', 500);
		}
	});
*/
});

app.post('/comment/:id',function(req, res) {
	var postId = Number(req.params.id);
	var author  = req.body.author;
	var email = req.body.email;
	var content = req.body.content;
	var postsQuery = new AV.Query(Posts);
	var comment = new Comments();
	postsQuery.equalTo("postId", postId);
	comment.set("commentAuthor", author);
	comment.set("commentAuthorEmail", email);
	comment.set("commentContent", content);
	postsQuery.first().then(function(post) {
		if(post){
			comment.set("post", post);
			comment.save({
				success: function(result) {
					res.redirect('back');
				},
				error: function(error) {
					console.log(error);
					res.send(error);
				}
			});
		} else {
			res.send("error")
		}
		
		//res.render('index',{postsList: posts, username: username});
	},function(error) {
		console.log(error);
		res.send(error);
	});
	//console.log(req.body.email);
	//console.log(req.body.content);
	//res.send(postId+"<br/>"+email+"<br/>"+content);
});

app.get('/board', function(req, res) {
	var username;
	var boardMessages;
	var query = new AV.Query(Board);
	var queryPosts = new AV.Query(Posts);
	var currentMessage;
	if(req.query.message) {
		currentMessage = req.query.message;
	}
	if(AV.User.current()) {
		username = AV.User.current().getUsername();
	}
	query.skip(0);
	query.limit(10);
	query.descending('createdAt');
	queryPosts.skip(0);
	queryPosts.limit(5);
	queryPosts.descending('createdAt');
	query.find().then(function(boardMessagesArray) {
		console.log("BoardQuery successfully");
		boardMessages = boardMessagesArray;
		return queryPosts.find();
	},function(error) {
		console.log(error);
		res.render('500',500);
	}).then(function(posts) {
		res.render('board',{boardMessages: boardMessages, username: username, currentMessage: currentMessage, postsList: posts});
		
	},function(error) {
		console.log(error);
		res.render('500',500);
	});
});

app.post('/board', function(req, res) {
	var message = req.body.message;
	if(message && message.trim() !=''){
		//Save visitor
		var board = new Board();
		board.set('message', message);
		board.save(null, {
			success: function(gameScore) {
				res.redirect('/board?message=' + message);
			},
			error: function(gameScore, error) {
				res.render('500', 500);
			}
		});
	}else{
		res.redirect('back');
	}
});

//require('cloud/test.js');
app.get('/test', function(req, res){
	res.render('test');
});


app.post('/test1', function(req, res){
	var email =  req.body.email;
	var password = req.body.password;
	var postsList;
	var resultsList;
	console.log(email);
	console.log(password);
	var query = new AV.Query(Visitor);
	query.skip(0);
	query.limit(10);
	query.descending('createdAt');
	query.find({
		success: function(results){
			//res.render('index',{ name: "Yezersky", visitors: results});
			res.render('index',{ name: name, visitors: results, email: email, postsList: postsList});

			//res.render('index',{visitors: results});
		},
		error: function(error){
			console.log(error);
			res.render('500',500)
		}
	});
});

app.post('/test1', function(req, res){
	var email =  req.body.email;
	var password = req.body.password;
	console.log(email);
	console.log(password);
	if (email === password) {
		res.send(email+" "+password+"get!");
	};
});
// This line is required to make Express respond to http requests.
app.listen();
