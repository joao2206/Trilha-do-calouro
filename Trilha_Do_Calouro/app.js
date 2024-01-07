/*comandos npm
npm init
npm instal nodemon -g 
npm install -- save express
npm install express-session
npm install --save body-parser
npm install --save mysql
npm install ejs -save
*/

//require do express e do session
const express = require('express');
const session = require("express-session");
const path = require('path');
const app = express();

//require do bodyparser responsável por capturar valores do form
const bodyParser = require("body-parser");

//require do mysql
const mysql = require("mysql"); 
const { resolveSoa } = require('dns');

//criando a sessão
app.use(session({secret: "ssshhhhh"}));

//definindo pasta pública para acesso
app.use(express.static('public'));

//config engines
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public'));

//config bodyparser para leitura de post
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// middleware para passar o objeto req para o EJS
app.use(function(req, res, next) {
    res.locals.req = req;
    next();
});



//conexão com banco mysql
function conectiondb(){
    var con = mysql.createConnection({
        host: 'localhost', // O host do banco
        user: 'root', // Um usuário do banco
        password: '', // A senha do usuário. 
        database: 'mydb' // O nome do banco de dados 
    });

    //verifica conexao com o banco
    con.connect((err) => {
        if (err) {
            console.log('Erro connecting to database...', err)
            return
        }
        console.log('Connection established!')
    });

    return con;
}

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydb',
    connectionLimit: 10, // Ajuste conforme necessário
  });

//rota padrao
app.get('/', (req, res) => {
    var message = ' ';
    req.session.destroy();
    res.render('views/registro', { message: message });
});


//rota para registro
app.get('/views/registro', (req, res)=>{
    res.redirect('../');
    //res.render('views/registro', {message:message});
});

//rota para home
app.get("/views/home", function (req, res){
    if (req.session.user){
        var con = conectiondb();
        var query2 = 'SELECT * FROM calouro WHERE email LIKE ?';
        con.query(query2, [req.session.user], function (err, results){
            req.session.userName = results[0].nome; // Atualizar nome do usuário
            res.render('views/home', {message:results});
        });
    } else {
        res.redirect("/views/login");
    }
});


// Rota para o fórum
app.get('/forum', function(req, res) {
    var con = conectiondb();
    var query = `
    SELECT
    ForumPosts.postId,
    ForumPosts.question,
    ForumReplies.answer,
    ForumReplies.userId AS answerUserId,
    ForumPosts.userId AS questionUserId,
    ForumPosts.userName AS questionUserName,
    Calouro.nome AS answerUserName
FROM ForumPosts
LEFT JOIN ForumReplies ON ForumPosts.postId = ForumReplies.postId
LEFT JOIN Calouro ON ForumReplies.userId = Calouro.matricula;
`;

    con.query(query, function(err, results) {
        if (err) {
            console.error('Erro ao obter dados do banco:', err);
        } else {
            console.log('Perguntas e respostas encontradas:', results);
            res.render('views/forum', { posts: results });
        }
    });
});


// Rota para enviar uma nova pergunta
app.post('/forum/posts', function(req, res) {
    const questionText = req.body.question;
    const userEmail = req.session.user; // Email do usuário logado (ajuste se necessário)
    const userName = req.session.userName; // Nome do usuário logado

    pool.getConnection(function(err, connection) {
        if (err) {
            console.error('Erro ao obter conexão do pool:', err);
            throw err;
        }
    
        // Recupera o ID do usuário a partir do email
        const getUserIdQuery = 'SELECT matricula FROM calouro WHERE email = ?';
        connection.query(getUserIdQuery, [userEmail], function(err, results) {
            if (err) {
                connection.release();
                console.error('Erro ao executar a query de obtenção do ID do usuário:', err);
                throw err;
            }
    
            if (results.length > 0) {
                const userId = results[0].matricula;
    
                // Insere a pergunta no fórum
                const insertQuestionQuery = 'INSERT INTO ForumPosts (userId, userName, question) VALUES (?, ?, ?)';
                connection.query(insertQuestionQuery, [userId, userName, questionText], function(err, results) {
                    connection.release();
    
                    if (err) {
                        console.error('Erro ao executar a query de inserção de pergunta:', err);
                        throw err;
                    }
    
                    res.redirect('/forum');
                });
            } else {
                connection.release();
                console.error('Nenhum usuário encontrado com o email fornecido:', userEmail);
                res.status(500).send('Erro ao recuperar o ID do usuário.');
            }
        });
    });    
});


// Rota para enviar uma resposta a uma pergunta
app.post('/forum/answer', function(req, res) {
    const questionId = parseInt(req.body.questionId);
    const answerText = req.body.answer;
    const userEmail = req.session.user; // Email do usuário logado (ajuste se necessário)

    pool.getConnection(function(err, connection) {
        if (err) {
            console.error('Erro ao obter conexão do pool:', err);
            throw err;
        }
    
        // Recupera o ID do usuário a partir do email
        const getUserIdQuery = 'SELECT matricula FROM calouro WHERE email = ?';
        connection.query(getUserIdQuery, [userEmail], function(err, results) {
            if (err) {
                connection.release();
                console.error('Erro ao executar a query de obtenção do ID do usuário:', err);
                throw err;
            }
    
            if (results.length > 0) {
                const userId = results[0].matricula;
    
                // Insere a resposta no fórum
                const insertAnswerQuery = 'INSERT INTO ForumReplies (postId, userId, questionUserId, answer) VALUES (?, ?, ?, ?)';
                connection.query(insertAnswerQuery, [questionId, userId, userId, answerText], function(err, results) {
                    connection.release();
    
                    if (err) {
                        console.error('Erro ao executar a query de inserção de resposta:', err);
                        throw err;
                    }
    
                    res.redirect('/forum');
                });
            } else {
                connection.release();
                console.error('Nenhum usuário encontrado com o email fornecido:', userEmail);
                res.status(500).send('Erro ao recuperar o ID do usuário.');
            }
        });
    });
});





//rota para login
app.get("/views/login", function(req, res){
    var message = ' ';
    res.render('views/login', {message:message});
});


//método post do register
app.post('/register', function (req, res){

    var username = req.body.nome;
    var senha = req.body.senha;
    var email = req.body.email;
    var matricula = req.body.matricula;   

    var con = conectiondb();

    var queryConsultaMatricula = 'SELECT * FROM calouro WHERE matricula = ?';
    var queryConsultaEmail = 'SELECT * FROM calouro WHERE email = ?';

    con.query(queryConsultaMatricula, [matricula], function (err, resultsMatricula){
        if (resultsMatricula.length > 0){            
            var message = 'Matrícula já cadastrada';
            res.render('views/registro', { message: message });
        } else {
            con.query(queryConsultaEmail, [email], function (err, resultsEmail){
                if (resultsEmail.length > 0){            
                    var message = 'E-mail já cadastrado';
                    res.render('views/registro', { message: message });
                } else {
                    var query = 'INSERT INTO calouro VALUES (?, ?, ?, ?, ?, ?)';

                    con.query(query, [matricula, username, email, senha, null, null], function (err, results){
                        if (err){
                            throw err;
                        } else {
                            console.log("Usuário adicionado com o email " + email);
                            var message = "ok";
                            res.render('views/registro', { message: message });
                        }        
                    });
                }
            });
        }
    });
});


//método post do login
app.post('/log', function (req, res){
    // Pega os valores digitados pelo usuário
    var email = req.body.email;
    var senha = req.body.senha;
    // Conexão com banco de dados
    var con = conectiondb();
    // Query de execução
    var query = 'SELECT * FROM calouro WHERE senha = ? AND email LIKE ?';

    // Execução da query
    con.query(query, [senha, email], function (err, results){
        if (results.length > 0){
            // Configuração das informações na sessão
            req.session.user = email; // Seção de identificação
            req.session.userName = results[0].nome; // Nome do usuário
            console.log("Login feito com sucesso!");
            res.render('views/home', {message: results});
        } else {
            var message = 'Login incorreto!';
            res.render('views/login', { message: message });
        }
    });
});


app.post('/update', function (req, res){
    //pega os valores digitados pelo usuário
    
    console.log("entrou");
    
    var email = req.body.email;
    var senha = req.body.senha;
    var nome = req.body.nome;    
    //conexão com banco de dados
    var con = conectiondb();
    //query de execução
    var query = 'UPDATE calouro SET nome = ?, senha = ? WHERE email LIKE ?';
    

    //execução da query
    con.query(query, [nome, senha, req.session.user], function (err, results){
        
        var query2 = 'SELECT * FROM calouro WHERE email LIKE ?';
        con.query(query2, [req.session.user], function (err, results){
            res.render('views/home', {message:results});    
        });
        
    });
});

app.post('/delete', function (req, res){
    //pega os valores digitados pelo usuário
    
    var username = req.body.nome;
    
    //conexão com banco de dados
    var con = conectiondb();
    //query de execução
    var query = 'DELETE FROM calouro WHERE email LIKE ?';
    

    //execução da query
    con.query(query, [req.session.user], function (err, results){
        res.redirect ('/');
    });
});


// Rota para deslogar
// Rota para deslogar
app.get('/logout', function (req, res) {
    if (req.session) {
        req.session.destroy(function(err) {
            if (err) {
                console.log(err);
            } else {
                // Limpar outras variáveis de sessão, se houver
                req.session = null;
                res.redirect('/views/login');
            }
        });
    } else {
        res.redirect('/views/login');
    }
});



  

//executa servidor
app.listen(3000, () => console.log(`App listening on port!`));
