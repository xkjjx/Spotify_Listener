import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Listener from './Listener'



function App() {
  const [Listeners, setListeners] = useState([])
  fetch("keys.json").then((res) => res.json())
    .then((data) => {
      console.log(data);
      const clientId = data.clientId;
    });
    
  const redirectUri = 'http://localhost:5173';
  const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  }
  const sha256 = (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
  }
  const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
  const urlParams = new URLSearchParams(window.location.search);
  let code = urlParams.get('code');

  function setUp()
  {if (localStorage.getItem('access_token') === null || localStorage.getItem('access_token') === "undefined") {
    if(localStorage.getItem("count") === null){
      localStorage.setItem("count","0");
    }
    if(localStorage.getItem("count") === "0"){
      localStorage.setItem("count","1");
      addListener();
    }
    
    let codeVerifier = localStorage.getItem('code_verifier');
    console.log(codeVerifier);
    const url = 'https://accounts.spotify.com/api/token';
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    };
    fetch(url, payload)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        localStorage.setItem('access_token', data.access_token);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  let access_token = localStorage.getItem('access_token');
  fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + access_token }
  }).then((res) => res.json())
    .then((data) => {
      console.log(data);
      setListeners([...Listeners, {
        key: Listeners.length + 1,
        id: data.id,
        email: data.email,
        uri: data.uri,
        link: data.external_urls.spotify,
      }]);
    }).catch((err) => {
      console.error(err);
    });
  }
    

  function addListener() {
    const codeVerifier  = generateRandomString(64);
    const hashed = sha256(codeVerifier)
    const codeChallenge = base64encode(hashed);
    const scope = 'user-read-private user-read-email';
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    console.log(codeVerifier);
    window.localStorage.setItem('code_verifier', codeVerifier);
    const params =  {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    }
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  }
  setUp();
  return (
    <>
      {Listeners.map((listener) => (
        <Listener listener={listener} key={listener.key} />
      ))}
      <button onClick={addListener}>Add Listener</button>
    </>
  )
}

export default App
