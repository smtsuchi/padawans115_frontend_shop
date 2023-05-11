import React, { useEffect, useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDatabase, ref, set, child, get } from "firebase/database";
import Message from './Message';

const BACK_END_URL = process.env.REACT_APP_BACK_END_URL
const STRIPE_API_KEY = process.env.REACT_APP_STRIPE_API_KEY


const ProductCard = ({ productInfo, addToCart }) => {
  const p = productInfo
  return (
    <div className="card" style={{ width: '18rem' }}>
      <div className="card-body">
        <h5 className="card-title">{p.name}</h5>
        <p className="card-text">{p.description}</p>
        <button className="btn btn-primary" onClick={() => { addToCart(p) }}>Add to Cart</button>
      </div>
    </div>
  )
}

export default function App() {
  const getUserFromLS = () => {
    const found = localStorage.getItem('user_shop');
    if (found){
      return JSON.parse(found)
    }
    return {}
  }


  const [products, setProducts] = useState([])
  const [user, setUser] = useState(getUserFromLS)
  const [cart, setCart] = useState({ size: 0 })
  const [messages, setMessages] = useState([])

  const addToCart = (item) => {
    const copy = { ...cart }
    if (item.id in copy) {
      copy[item.id].qty++
    }
    else {
      copy[item.id] = item;
      copy[item.id].qty = 1
    }
    copy.size++;
    setCart(copy);
    if (user.uid){
      addToDB(copy)
    }
  }
  const addToDB = (cart) => {
    const db = getDatabase()
    set(ref(db, `/cart/${user.uid}`), cart)
  }
  const getCart = async (user) => {
    const dbRef = ref(getDatabase())
    const snapshot = await get(child(dbRef, `/cart/${user.uid}`))
    if (snapshot.exists()){
      const myCart = snapshot.val()
      console.log(myCart)
      setCart(myCart)
    }
    else {
      setCart({size:0})
    }
  };

  useEffect(()=>{
    getCart(user)
  }, [user])

  const createPopup = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    console.log(token)
    console.log(credential)
    const user = result.user
    if (user) {
      localStorage.setItem('user_shop', JSON.stringify(user))
      setUser(user)
    }
  }

  useEffect(() => {
    getProducts()
  }, [])


  const getProducts = async () => {
    const url = 'https://api.stripe.com/v1/products';
    const options = {
      method: "GET", // method is GET by default but we are being explicit for good measure
      headers: {
        Authorization: `Bearer ${STRIPE_API_KEY}`
      }
    };

    const res = await fetch(url, options);
    const data = await res.json();
    console.log(res.status)
    if (res.status === 200) {
      setProducts(data.data)
    }
  };

  const showProducts = () => {
    return products.map(p => <ProductCard productInfo={p} key={p.id} addToCart={addToCart} />)
  }
  const showCart = () => {
    return Object.keys(cart).map(key => (key==='size'? <></>: <p key={`cart_${key}`}>
      {cart[key].name} x{cart[key].qty}
    </p>))
  }
  const generateInputTags = () => {
    return Object.keys(cart).map(key => (key==='size'? <></>: <input key={`input_${key}`} name={cart[key].default_price} defaultValue={cart[key].qty} hidden />))
  };

  const showMessages = () => {
    return messages.map(({text, color}, index) => <Message key={index} text={text} color={color} messages={messages} setMessages={setMessages} index={index}/>)
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    const copy = [...messages]

    if (query.get("success")) {
      copy.push({
        text: "Order placed! You will receive an email confirmation.",
        color: 'success'
      })
      setMessages(copy);
    }

    if (query.get("canceled")) {
      copy.push({
        text: "Order canceled -- continue to shop around and checkout when you're ready.",
        color: 'warning'
      })
      setMessages(copy);
    }
  }, []);


  return (
    <div>
      <h1>My Shop</h1>
      <h2>Hello, {user.uid ? user.displayName : "GUEST"}</h2>
      <h4>You have {cart.size} items in your cart.</h4>
      { showMessages() }

      <div className="container">
        <div className="row">
          {showProducts()}
        </div>
      </div>
      {user.uid?
      <button onClick={()=>{setUser({}); localStorage.removeItem('user_shop')}}>Log Out</button>
      :
      <button onClick={createPopup}>Sign In With Google</button>
      }
      { showCart() }
      {
        cart.size===0?<></>:
        <form action={BACK_END_URL+ '/api/checkout'} method='POST'>
          {generateInputTags()}
          <button className='btn btn-success'>Check Out</button>
        </form>
      }

    </div>
  )
}
