var express=require('express')
var router=express.Router()
var mysql= require('mysql')
var passport=require('passport')
var LocalStrategy=require('passport-local').Strategy

var connection=mysql.createConnection({
    host:'localhost',
    port: 3306,
    user: 'youngji',
    password:'tjrud2509026@@',
    database:'nodeServerViemo'
})

connection.connect();

router.get('/', function(req,res) {
    var msg;
    var errMsg = req.flash('error')
    console.log("login page req.user",req.user)
	if(errMsg) msg = errMsg;
	res.render('login.ejs',{'message':msg});
})


passport.serializeUser(function(user, done) {
    console.log('passport session save : ', user.id)
    done(null, user.id); 
})

passport.deserializeUser(function(id, done){
    console.log('passport session get id : ', id)
    done(null, id);
})


passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true
}, function(req, email, password, done) {
    var query = connection.query('select * from user where email=?', [email], function(err,rows) {
        if(err) return done(err);
        if(rows.length) { 
            return done(null, {'email' : email, 'id' : rows[0].index})
        } else {
                return done(null, false, {'message' : 'Incorrect email or password'})
        }
    })
}
));

router.post('/', function(req, res, next) {
	passport.authenticate('local-login', function(err, user, info) {
		if(err) res.status(500).json(err);
		if (!user) return res.status(401).json(info.message);

		req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.json(user);
    });

	})(req, res, next);
})

module.exports=router;

/*
로그인인 경우 ajax통신으로 인해 json응답을 해주어야하므로 authenticate함수를 커스터마이징하였다
커스터마이징한 경우 라우터에 콜백함수를 사용하므로써 req,res에 직접 접근할 수 있다 
즉 여기에서 세션객체에 접근할 수 있다
*/