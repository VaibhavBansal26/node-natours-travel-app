/*eslint-disable*/
import axios from 'axios';
import {showAlert} from './alerts';

export const login = async(email,password) => {
  
    try{
        const res = await axios({
            method:'POST',
            url:'http://localhost:8000/api/v1/users/login',
            data:{
                email,
                password
            }
        });
        if(res.data.status === 'success'){
            showAlert('success','Logged in Sucessfully');
            window.setTimeout(() =>{
                location.assign('/');
            },1500);
        }
        console.log(res)
    }catch(err){
        showAlert('error',err.response.data.message);
    }
};

export const logout = async() =>{
    try{
        const res = await axios({
            method:'GET',
            url:'http://localhost:8000/api/v1/users/logout',
        });
        if((res.data.status == 'success'))location.reload(true);
    }catch(err){
        console.log(err.response);
        showAlert('error','Error logging out try again');
    }
}

/*
document.querySelector('.form').addEventListener('submit',e =>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email,password);
});*/