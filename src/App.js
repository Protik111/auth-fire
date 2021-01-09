import React, { useState } from 'react';
import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {

  const [newUser, setNewUser] = useState(false);

  const [user, setUser] = useState({
    isSignedIn : false,
    name : '',
    email : '',
    password : '',
    photo : ''
  })
  const provider = new firebase.auth.GoogleAuthProvider();

  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
    .then(res => {
      const {displayName, email, photoURL} = res.user;
      const signedInUser = {
        isSignedIn : true,
        name : displayName,
        email : email,
        photo : photoURL
      }
      setUser(signedInUser);
      // console.log(displayName, email, photoURL);
    })
    .catch(err => {
      console.error(err);
      console.error(err.message);
    })
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
    .then(res => {
      const signedOutUser = {
        isSignedIn : false,
        name : '',
        email : '',
        photo : '',
        error: '',
        success: false
      }
      setUser(signedOutUser)
    })
    .catch(err => {
      console.error(err)
    })
  }

  //Module 42 started

  const handleSubmit = (event) => {
    console.log(user.email, user.password);
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = {...user};
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserInfo(user.name);
        })
        .catch(function(error) {
          const newUserInfo = {...user};
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then((res) => {
          const newUserInfo = {...user};
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log('user sign in info', res.user);
      })
      .catch((error) => {
          const newUserInfo = {...user};
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
      });
    }

    event.preventDefault();
  }

  const updateUserInfo = name => {
    const user = firebase.auth().currentUser;

      user.updateProfile({
        displayName: name
      }).then(function() {
        console.log('user name updated');
      }).catch(function(error) {
        console.log(error)
      });
  }

  const handleBlur = (event) => {
    let isFormValid = true;
    if(event.target.name === 'email'){
      isFormValid = /\S+@\S+|.S+/.test(event.target.value);
    }
    if(event.target.name === 'password'){
      const isPasswordValid = event.target.value.length > 6;
      const hasPasswordNumber = /\d{1}/.test(event.target.value);
      isFormValid = isPasswordValid && hasPasswordNumber;
    }
    if(isFormValid){
      const newUserInfo = {...user};
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  }

  const fbProvider = new firebase.auth.FacebookAuthProvider();
  
  const handleFbSignIn = () => {
    firebase.auth().signInWithPopup(fbProvider)
      .then((res) => {
        // {firebase.auth.OAuthCredential}
        // var credential = result.credential;

        // The signed-in user info.
        const user = res.user;
        console.log('fb user after sign  in', user.displayName);

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        // var accessToken = credential.accessToken;

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        // ...
      });
  }
  return (
    <div className="App">
      { user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> :
        <button onClick={handleSignIn}>Sign In</button>
      }
      <br/>
      <button onClick={handleFbSignIn}>Sign In With Facebook</button>
      {
        user.isSignedIn && <div>
          <p>Welcome, {user.name}</p>
          <p>Email : {user.email}</p>
          <img src={user.photo} alt=""/>
        </div>
      }
      <h1>Our Authwntication</h1>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id=""/>
      <label htmlFor="newUser">A New User?</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input onBlur={handleBlur} type="text" name="name"  placeholder="Enter Name"/>}
        <br/>
        <input onBlur={handleBlur} type="text" name="email"  placeholder="Enter Email" required/>
        <br/>
        <input onBlur={handleBlur} type="password" name="password" placeholder="Enter Password" required/>
        <br/>
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}/>
        </form>
        <p style={{color: 'red'}}>{user.error}</p>
          {
          user.success && <p style={{color: 'green'}}>User {newUser ? 'Created' : 'Logged In'} Succesfully</p>
          }
    </div>
  );
}

export default App;
