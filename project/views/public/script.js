
registerbtn = document.getElementById('register');
loginbtn = document.getElementById('login');

message = document.querySelector('.message');
message_exist = document.querySelector('.message_exist');
menu = document.querySelector('.menu');
menu_register = document.querySelector('.menu_register');
menu_name = document.querySelector('.menu_name');

main = document.querySelector('.main');

add_tasks = document.querySelector('.add_tasks');

sectionRegister = document.querySelector('.register');
sectionMain = document.querySelector('.login');
sectionStatus = document.querySelector('.statuses');

sectionTasksStatus = document.querySelector('.task_status');
sectionGroups = document.querySelector('.groups');

fixed_bottom = document.querySelector('.fixed-bottom');
  
registerbtn.addEventListener('click', function() {
  sectionRegister.style.display = 'block'; 
  sectionMain.style.display = 'none';
  message.style.display = 'none';
  message_exist.style.display = 'none';
  sectionTasksStatus.style.display = 'none';
  sectionGroups.style.display ='none';


});

loginbtn.addEventListener('click', function() {
  sectionRegister.style.display = 'none'; 
  sectionMain.style.display = 'block';
  message.style.display = 'none';
  message_exist.style.display = 'none';
  sectionTasksStatus.style.display = 'none';
  sectionGroups.style.display ='none'; 
});

if (message.id == "user not found") {
  message.style.display ='block';
}

if (message_exist.id == "user exist") {
  message_exist.style.display ='block';
}

if (menu.id == "registred") {
  menu.style.display = 'block';
  main.style.display = 'none';
  menu_register.style.display ='none';
  menu_name.style.display ='block';
  add_tasks.style.display ='block';
  sectionTasksStatus.style.display = 'none';
  sectionGroups.style.display ='none';
  fixed_bottom.style.display = 'none';
}

if (sectionStatus.id =="status") {
  menu.style.display ='block';
  menu_name.style.display ='block';
  main.style.display = 'none';
  add_tasks.style.display ='none';
  menu_register.style.display ='none';
  sectionStatus.style.display = 'block';
  sectionTasksStatus.style.display = 'none';
  sectionGroups.style.display ='none';
  fixed_bottom.style.display = 'none';
}

if(sectionTasksStatus.id == "tasks_status") {
  menu.style.display ='block';
  menu_name.style.display ='block';
  main.style.display = 'none';
  add_tasks.style.display ='none';
  menu_register.style.display ='none';
  sectionStatus.style.display = 'none';
  sectionTasksStatus.style.display = 'block';
  sectionGroups.style.display ='none';
  fixed_bottom.style.display = 'none';
}

if (sectionGroups.id == 'groups') {
  menu.style.display ='block';
  menu_name.style.display ='block';
  main.style.display = 'none';
  add_tasks.style.display ='none';
  menu_register.style.display ='none';
  sectionStatus.style.display = 'none';
  sectionTasksStatus.style.display = 'none';
  sectionGroups.style.display ='block';
  fixed_bottom.style.display = 'none';
}

function callBack(e, formID){
  e.preventDefault();
  let flag = true;
  let form = document.getElementById(formID);
  if(form.name.value == '') {
    document.getElementById("nameAbsent").style.display = "block";
    flag = false;
  }
  if(form.email.value == '') {
    document.getElementById("emailAbsent").style.display = "block";
    flag = false;
  }
  if(form.password.value == '') {
    document.getElementById("passwordAbsent").style.display = "block";
    flag = false;
  }
  if(form.confPassword.value == '') {
    document.getElementById("confPasswordAbsent").style.display = "block";
    flag = false;
  }
  if(flag) document.getElementById(formID).submit();
}

let name = document.getElementById('name');
name.addEventListener('click', function() {
  document.getElementById("nameAbsent").style.display = "none";
});
 
let email = document.getElementById('email');
email.addEventListener('click', function() {
  document.getElementById("emailAbsent").style.display = "none";
}); 

let pwd = document.getElementById('pwd');
pwd.addEventListener('click', function() {
  document.getElementById("passwordAbsent").style.display = "none";
}); 

let config_pwd = document.getElementById('config_pwd');
config_pwd.addEventListener('click', function() {
  document.getElementById("confPasswordAbsent").style.display = "none";
}); 