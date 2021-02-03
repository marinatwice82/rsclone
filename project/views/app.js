const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");
const engine = require('consolidate');
const JSAlert = require("js-alert");
const multer  = require("multer");
let curentId = 0;
let currentUser = '';

const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});
 
const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  database: "project_js",
  password: ""
});

const poolPromise = pool.promise();
 
app.set('views', __dirname);
app.engine('html', engine.mustache); 
app.set("view engine", "hbs");
app.use('/public',express.static(__dirname +'/public'));
//app.use(express.static(__dirname +'/public'));

const hbs = require('hbs');
const fs = require('fs');

let partialsDir = __dirname ;
let filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
  let matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  let name = matches[1];
  let template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});

app.listen(3000, function(){
  console.log("Сервер ожидает подключения...");
});

// получение списка пользователей
app.get("/", function(req, res){
  pool.query("SELECT * FROM users", function(err, data) {
    if(err) return console.log(err);
      return res.render("index.hbs", {
        users: data
      });
  });
});

// регистрируем посетителя в Базе данных (записываем данные в БД)
app.post("/register", urlencodedParser, function (req, res) {
         
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  pool.query("SELECT * FROM users WHERE name=? AND email=?",[name, email], function(err, data) {
    if(data.length === 0) {
    //входим на первую страницу нашего приложения и записываем в БД
    poolPromise.execute("INSERT INTO users (name, email, password) VALUES (?,?,?)",[name, email, password]) // изменение объектов
    .then(result =>{ 
      return poolPromise.execute("SELECT * FROM users WHERE name=? AND password=?",[name, password]); // получение объектов
    })
    .then(result =>{
      curentId = result[0][0].id;
      currentUser = result[0][0].name;
      return res.render("index.hbs", {message: 'registred', user: currentUser});    
    })
    .catch(function(err) {
      console.log(err.message);
    }); 
    }
    else {
      //если такой user уже есть в базе данных возвращаем назад на страницу, чтобы он вошел, а не зарегистрировался
      return res.render("index.hbs", {message: 'user exist'});
    }
  });
});

app.post("/login", urlencodedParser, function (req, res) {
  let task_db;
  if(!req.body) return res.sendStatus(400);
  const name_login = req.body.name_login;
  const password_login = req.body.password_login;

  pool.query("SELECT * FROM users WHERE name=? AND password=?",[name_login, password_login], function(err, data) {
    
    if(data.length !== 0) {
      curentId = data[0].id;
      currentUser = data[0].name;

      pool.query("SELECT * FROM tasks WHERE user_id=?",[curentId], function(err, result) {
      pool.query("SELECT * FROM statuses WHERE user_id=?",[curentId], function(err, resStatuses){
  
        let resTasks = result.map(function (el){
        let status = resStatuses.filter((a)=>a.id==el.status_id);

          if(status.length != 0) {
            el.status_id = status[0]['name'];
          }
          else {
            el.status_id = 'статус не определен';
          } 
        return el;
      });
        return res.render("index.hbs", {message: 'registred', user: data[0].name, tasks: resTasks} );
      });        
      });         
    }
    else {
      //если такого user нет в базе данных возвращаем назад на страницу, чтобы он зарегистрировался
      return res.render("index.hbs", {message: 'user not found'});
    }
  });
});

//создаем папку если нет и записываем картинку в папку "uploads"
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) =>{
    cb(null, file.originalname);
  }
});

let upload = multer({storage:storageConfig});

//добавляем в Базу данных задачи user  urlencodedParser
app.post("/add_tasks", upload.single("image_tasks"), function (req, res) {

  if(!req.body) return res.sendStatus(400);
    const name_tasks = req.body.name_tasks;
    
  if(req.file != undefined)  {
    image_tasks = req.file.originalname; 
  } 
  else  {
    image_tasks = '';
  }
  poolPromise.execute("INSERT INTO tasks (name, image, user_id) VALUES (?,?,?)",[name_tasks, image_tasks, curentId]) // изменение объектов
    .then(result =>{ 
      return poolPromise.execute("SELECT * FROM tasks WHERE user_id=?",[curentId]); // получение объектов
    })
    .then(result =>{
      pool.query("SELECT * FROM statuses WHERE user_id=?",[curentId], function(err, resStatuses) {

        let resTasks = result[0].map(function (el) {
        let status = resStatuses.filter((a)=>a.id==el.status_id);
        if(status.length != 0) {
          el.status_id = status[0]['name'];
        }
        else {
          el.status_id = 'статус не определен';
        } 
        return el;
        });
      return res.render("index.hbs", {message: 'registred', user: currentUser, tasks: resTasks} );
      });
    })
    .catch(function(err) {
      console.log(err.message);
    });
});

//удаляем задачу в списке на главной странице
app.get("/delete:id", urlencodedParser, function (req, res){
  const id = req.params.id;
  poolPromise.execute("DELETE FROM tasks WHERE id=?", [id]) 
    .then(result =>{ 
      return poolPromise.execute("SELECT * FROM tasks WHERE user_id=?",[curentId]); // получение объектов
    })
    .then(result =>{
      pool.query("SELECT * FROM statuses WHERE user_id=?",[curentId], function(err, resStatuses) {

      let resTasks = result[0].map(function (el) {
      let status = resStatuses.filter((a)=>a.id==el.status_id);

        if(status.length != 0) {
          el.status_id = status[0]['name'];
        }
        else {
          el.status_id = 'статус не определен';
        } 
        return el;
      });
      return res.render("index.hbs", {message: 'registred', user: currentUser, tasks: resTasks} );
    });
    })
    .catch(function(err) {
      console.log(err.message);
    });
});

//вывод данных с перечнем задач на страничку
app.get("/logout", urlencodedParser, function (req, res){
  currentUser = '';
  curentId = 0;
  return res.render("index.hbs");
});

//переходим на страничку  со статусами
app.get("/status", urlencodedParser, function (req, res){
  pool.query("SELECT * FROM statuses WHERE user_id=?",[curentId], function(err, data) {
    return res.render("index.hbs", {statuses: data, statusMessege: 'status', user: currentUser});
  });
});

//переходим на страничку с перечнем задач
app.get("/main", urlencodedParser, function(req, res) {
  pool.query("SELECT * FROM tasks WHERE user_id=?",[curentId], function(err, result) {
  pool.query("SELECT * FROM statuses WHERE user_id=?",[curentId], function(err, resStatuses){

    let resTasks = result.map(function (el){
    let status = resStatuses.filter((a)=>a.id==el.status_id);

      if(status.length != 0) {
        el.status_id = status[0]['name'];
      }
      else {
        el.status_id = 'статус не определен';
      } 
      return el;
    });

    return res.render("index.hbs", {message: 'registred', user: currentUser, tasks: resTasks} );
  });
  });
});

//записываем статус  в базу данных
app.post("/statuses", urlencodedParser, function (req, res) {

  if(!req.body) return res.sendStatus(400);
  const name_status = req.body.name_status;
    poolPromise.execute("INSERT INTO statuses (name, user_id)VALUES (?,?)", [name_status,curentId])
      .then(result =>{ 
        return poolPromise.execute("SELECT * FROM statuses WHERE user_id=?",[curentId]); // получение объектов
      })
      .then(result =>{
        return res.render("index.hbs", {statuses: result[0], statusMessege: 'status' /* message: 'registred' */, user: currentUser} );
      })
      .catch(function(err) {
        console.log(err.message);
      });
});

//удаляем из базы данных статус 
app.get("/delstatus:id", urlencodedParser, function (req, res){
  const idStatuses = req.params.id;
  poolPromise.execute("DELETE FROM statuses WHERE id=?", [idStatuses]) 
    .then(result =>{ 
      return poolPromise.execute("SELECT * FROM statuses WHERE user_id=?",[curentId]); // получение объектов
    })
    .then(result =>{
      return res.render("index.hbs", {statuses: result[0], statusMessege: 'status' /*message: 'registred'*/, user: currentUser} );
      
    })
    .catch(function(err) {
      console.log(err.message);
    });
});

//переходим по ссылке задачи
app.get("/link:id", urlencodedParser, function (req, res){
  const idLink = req.params.id;
  pool.query("SELECT * FROM tasks WHERE id=?",[idLink], function(err, data) {
    pool.query("SELECT * FROM statuses WHERE user_id=?",[curentId], function(err, dataStatus) {
      pool.query("SELECT * FROM groups WHERE user_id=?",[curentId], function(err, dataGroup) {
        pool.query("SELECT * FROM group_task WHERE task_id=?",[idLink], function(err, dataTasks) {
        return res.render("index.hbs", {task_status: data[0], tasks_statusMessege: 'tasks_status', user: currentUser, userstatuses: dataStatus, usergroup: dataGroup, group_tasks:dataTasks} );
        });
      });
    });
  });
});

//редактируем данные в полях и передаем в базу данных
app.post("/edit", urlencodedParser, function (req, res) {

  if(!req.body) return res.sendStatus(400);
  const tasksStatus = req.body.tasksStatus;
  const statusTasks = req.body.statusTasks;
  const id = req.body.task_id;
  
  pool.query("UPDATE tasks SET name=?, status_id=? WHERE id=?", [tasksStatus, statusTasks, id], function(err, data) {
    pool.query("SELECT * FROM statuses WHERE user_id=?",[curentId], function(err, resStatuses){
      pool.query("SELECT * FROM tasks WHERE user_id=?",[curentId], function(err, result){
        let resTasks = result.map(function (el) {
        let status = resStatuses.filter((a)=>a.id==el.status_id);
          if(status.length != 0) {
            el.status_id = status[0]['name'];
          }
          else {
            el.status_id = 'статус не определен';
          } 
            return el;
        });
    return res.render("index.hbs", {task_id: id, message: 'registred', user: currentUser, tasks: resTasks});
      });
    });
  }); 
});


//возвращаемся на страницу с задачами при нажатии на кнопку Назад
app.get("/back",urlencodedParser, function (req, res) {
  pool.query("SELECT * FROM statuses WHERE user_id=?",[curentId], function(err, resStatuses){
    pool.query("SELECT * FROM tasks WHERE user_id=?",[curentId], function(err, result){
      let resTasks = result.map(function (el) {
      let status = resStatuses.filter((a)=>a.id==el.status_id);
        if(status.length != 0) {
          el.status_id = status[0]['name'];
        }
        else {
          el.status_id = 'статус не определен';
        } 
          return el;
        });
    return res.render("index.hbs", {message: 'registred', user: currentUser, tasks: resTasks});
    });
  });
});


//выводим данные групп на страничку 
app.get("/groups", urlencodedParser, function (req, res){
  pool.query("SELECT * FROM groups WHERE user_id=?",[curentId], function(err, data) {
    return res.render("index.hbs", { groups: data, groupsMessege: 'groups', user: currentUser });
  });
});

//добавляем группу в базу данных и выводим на страницу сразу
app.post("/add_groups", urlencodedParser, function (req, res){
  if(!req.body) return res.sendStatus(400);
  const group = req.body.group;
  pool.query("INSERT INTO groups (name, user_id) VALUES (?,?)", [group,curentId], function(err, data){
    pool.query("SELECT * FROM groups WHERE user_id=?",[curentId], function(err, resGroups){
      return res.render("index.hbs", { groups: resGroups, groupsMessege: 'groups', user: currentUser });
    });
  });
});

//удаляем из базы данных группы
app.post("/remove:id", urlencodedParser, function (req, res){
  const idGroup = req.params.id;
  pool.query("DELETE FROM groups WHERE id=?", [idGroup], function (err, data){
    pool.query("SELECT * FROM groups WHERE user_id=?",[curentId], function(err, resGroups){
      return res.render("index.hbs", { groups: resGroups, groupsMessege: 'groups', user: currentUser });
    });
  }); 
});

//удаляем группу из списка в перечне задач
app.post("/add_task_group",  urlencodedParser, function (req, res) {
  
  const arr = req.body.group.split(':');
  const idGroup_id = parseInt(arr[0]);
  const nameGroup_name = arr[1];
  const idTask_id = req.body.task_id;

  pool.query("INSERT INTO group_task (group_id, group_name, task_id) VALUES (?,?,?)", [idGroup_id, nameGroup_name, idTask_id], function (err, data){
    pool.query("SELECT * FROM tasks WHERE id=?",[idTask_id], function(err, data) {
      pool.query("SELECT * FROM statuses WHERE user_id=?",[curentId], function(err, dataStatus) {
        pool.query("SELECT * FROM groups WHERE user_id=?",[curentId], function(err, dataGroup) {
          pool.query("SELECT * FROM group_task WHERE task_id=?",[idTask_id], function(err, dataTasks) {
        return res.render("index.hbs", {task_status: data[0], tasks_statusMessege: 'tasks_status', user: currentUser, userstatuses: dataStatus, usergroup: dataGroup, group_tasks: dataTasks} );
          });
        });
      });
    });
  });
});


//удаляем группу из базы данных и из перечня в задаче
app.post("/clean:id", urlencodedParser, function (req, res) {
  const group_id = req.params.id;
  const idTask_id = req.body.task_id;

  pool.query("DELETE FROM group_task WHERE id=?", [group_id], function(err, dataIdGroup) {
      pool.query("SELECT * FROM tasks WHERE id=?",[idTask_id], function(err, data) {
      pool.query("SELECT * FROM statuses WHERE user_id=?",[curentId], function(err, dataStatus) {
        pool.query("SELECT * FROM groups WHERE user_id=?",[curentId], function(err, dataGroup) {
          pool.query("SELECT * FROM group_task WHERE task_id=?",[idTask_id], function(err, dataTasks) {

        return res.render("index.hbs", {task_id: idTask_id, task_status: data[0], tasks_statusMessege: 'tasks_status', user: currentUser, userstatuses: dataStatus, usergroup: dataGroup, group_tasks: dataTasks} );
          });
        });
      });
    });
  }); 
});