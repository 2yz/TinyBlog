// 在Cloud code里初始化express框架
var express = require('express');
var app = express();
var name = require('cloud/name.js');
var avosExpressHttpsRedirect = require('avos-express-https-redirect');
var avosExpressCookieSession = require('avos-express-cookie-session');
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
function renderIndex(req, res){
	var name = req.query.name;
	var username;
	if(!name)
		name = 'AVOS Cloud';
	var query = new AV.Query(Visitor);
	var queryPosts = new AV.Query(Posts);
	var postsList;
	var resultsList;
	var email;
	console.log(req.session);
	if(AV.User.current()) {
		console.log("username: " + username);
		username = AV.User.current().getUsername();
		console.log("username: " + username);
		console.log(req.session);
		console.log(req.session.username);
	}
	query.skip(0);
	query.limit(10);
	query.descending('createdAt');
	queryPosts.skip(0);
	queryPosts.limit(5);
	queryPosts.descending('createdAt');
	query.find().then(function(results) {
		resultsList = results;
		//console.log(resultsList);
		console.log("resultsQuery successfully");
		return queryPosts.find();
	}).then(function(posts) {
		postsList = posts;
		//console.log("queryPosts: ");
		//console.log(resultsList);
		//console.log("queryPosts: ");
		//console.log(postsList);
		console.log("PostsQuery successfully");
		res.render('index',{ name: name, visitors: resultsList, email: email, postsList: postsList, username: username});
		console.log("render successfully");
	},function(error) {
		console.log(error);
		res.render('500',500);
	});
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
		res.redirect('/');
	},function(error) {
		//res.redirect('/');
		//console.log("send error");
		//res.send("error");
		res.send({ret:false,msg:'Error',data:error});
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
			console.log('success');
			console.log(user);
			res.redirect('/');
		},
		error: function(user, error) {
			console.log('fail');
			console.log(user);
			console.log(error);
		}
	});

});
app.get('/signout', function(req, res) {
	AV.User.logOut();
	res.redirect('/');
});

app.get('/post/:id', function(req, res) {
	console.log(req.params.id);
	res.send('get: ' + req.params.id);
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
