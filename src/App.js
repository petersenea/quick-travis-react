import React, { useEffect, useState } from 'react';
import { Card, Column, Button, Container, Message } from 'rbx';
import Sidebar from "react-sidebar";
import "rbx/index.css";
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

var firebaseConfig = {
  apiKey: "AIzaSyAyFTsJYPUIc3tcerqB8fDeJ5LA_7fSxrY",
  authDomain: "shopping-cart-b9a00.firebaseapp.com",
  databaseURL: "https://shopping-cart-b9a00.firebaseio.com",
  projectId: "shopping-cart-b9a00",
  storageBucket: "shopping-cart-b9a00.appspot.com",
  messagingSenderId: "765408944194",
  appId: "1:765408944194:web:4506e7f0d211a3f3764ddb",
  measurementId: "G-2J1MFXD1L2"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref();

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

var cart_items = [];

// firebase.auth().signOut();


const App = () => {
  const [data, setData] = useState({});
  const products = Object.values(data);

  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState("");
  const [items, setItems] = useState([]);

  const [inventory, setInventory] = useState(null);

  const [user, setUser] = useState(null);

  const [trueInventory, setTrueInventory] = useState(null);

  const [cartState, setCartState] = useState(true);


  const Banner = ({ user }) => (
    <React.Fragment>
      {user ? <Welcome user={user} /> : <SignIn />}
      {/* <Title>{ title || '[loading...]' }</Title> */}
    </React.Fragment>
  );

  const Welcome = ({ user }) => (
    <Message color="info">
      <Message.Header>
        Welcome, {user.displayName}
        {/* <Button primary onClick={() => { setUser(null); setItems([]); firebase.auth().signOut() }}> */}
        <Button primary onClick={() => { setItems([]); firebase.auth().signOut() }}>

          Log out
        </Button>
      </Message.Header>
    </Message>
  );

  const SignIn = () => (
    <StyledFirebaseAuth
      uiConfig={uiConfig}
      firebaseAuth={firebase.auth()}
    />
  );

  useEffect(() => {
    firebase.auth().onAuthStateChanged(setUser);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('./data/products.json');
      const json = await response.json();
      setData(json);
    };
    fetchProducts();
  }, []);

  // useEffect(() => {
  //   console.log("hello");
  //   const handleData = snap => {
  //     if (snap.val()) {
  //       // true_inventory = snap.val()["inventory"];
  //       setInventory(snap.val()["inventory"]);
  //     }
  //     // console.log(snap.val())
  //   }
  //   db.on('value', handleData, error => alert(error));
  //   return () => { db.off('value', handleData); };
  // }, []);

  useEffect(() => {
    const handleData = snap => {
      if (snap.val()) {
        console.log("user change")
        var true_inventory = snap.val()["inventory"];
        var inv = snap.val()["inventory"];
        // setInventory(snap.val()["inventory"]);

        if (user != null) {
          var carts = snap.val()["carts"]
          if (carts != null) {
            var user_cart = snap.val()["carts"][user.uid];
            // var inv = snap.val()["inventory"];
            if (user_cart != null) {
              // console.log("potato")
              // console.log(snap.val()["carts"][user.uid]["cart"])
              // setItems(items.concat(user_cart["cart"]));

              var cart = items;

              if (cart.length == 0) {
                cart_items = [];
              }
              // if (cart.length != 0) {
              // console.log("items", items);
              var cart_things = user_cart["cart"];

              for (var i = 0; i < cart_things.length; i++) {
                var things = cart_things[i].split(' ');
                var j = cart_items.indexOf(things[0] + ' ' + things[1]);
                // var j = cart.indexOf(things[0] + ' ' + things[1]);

                var new_quant;
                if (j == -1) {
                  cart_items = cart_items.concat(things[0] + ' ' + things[1]);
                  new_quant = parseInt(things[2], 10);
                  var new_item = things[0] + ' ' + things[1] + ' ' + new_quant;
                  cart = cart.concat(new_item);
                }
                else {
                  console.log(cart);
                  console.log(cart_items);
                  var stuff = cart[j].split(' ');
                  new_quant = parseInt(stuff[2], 10) + parseInt(things[2], 10);
                  cart[j] = things[0] + ' ' + things[1] + ' ' + new_quant;
                }
                setItems(cart);
              }

              // }


              for (let i = 0; i < cart.length; i++) {
                var item = cart[i];
                var item_split = item.split(" ");
                var item_sku = item_split[0];
                var item_size = item_split[1];
                // var item_quant = item_split[2];
                var item_quant = parseInt(item_split[2], 10);


                // var item_obj = products.find(element => element.sku == item_sku)

                // total_price += item_obj.price * item_quant;

                // inventory[item_sku][item_size] = inventory[item_sku][item_size] - item_quant;

                // setInventory(inventory);
                // console.log(inventory);

                // console.log(inventory);
                if (inventory != null) {
                  inventory[item_sku][item_size] = inventory[item_sku][item_size] - item_quant;

                  if (inventory[item_sku][item_size] < 0) {
                    setCartState(false);
                  }

                  setInventory(inventory);
                  // console.log(inventory);
                }
                else {
                  inv[item_sku][item_size] = inv[item_sku][item_size] - item_quant;

                  if (inv[item_sku][item_size] < 0) {
                    setCartState(false);
                  }

                  setInventory(inv);
                  // console.log(inv);
                }

              };


            }

          }
          setIsOpen(true);

        }
        else {
          cart_items = [];
          setInventory(inv);
        }
        setTrueInventory(true_inventory);
      }
    };
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };

  }, [user]);

  // useEffect(() => {
  //   var cart_st = true;
  //   for (var k = 0; k < items.length; k++) {
  //     var things = items[k].split(' ');
  //     if (inventory[things[0]][things[1]] < 0) {
  //       cart_st = false;
  //     }
  //   }
  //   setCartState(cart_st);

  // }, [isOpen]);

  // useEffect(() => {

  //   for (let i = 0; i < items.length; i++){
  //     var item = items[i];
  //     var item_split = item.split(" ");
  //     var item_sku = item_split[0];
  //     var item_size = item_split[1];
  //     var item_quant = item_split[2];

  //     // var item_obj = products.find(element => element.sku == item_sku)

  //     // total_price += item_obj.price * item_quant;
  //     inventory[item_sku][item_size] = inventory[item_sku][item_size] - item_quant;
  //     setInventory(inventory);

  //   }

  // }, [user]);


  var total_price = 0;
  // firebase.auth().signOut();

  return (

    (inventory === null) ? null :


      <Container>
        <Banner user={user} />
        <Container>
          <Column.Group>
            <Column size={1}>
              <Sidebar
                sidebar={
                  <div>
                    <button onClick={() => { setIsOpen(false); setSize("") }}>Close Cart</button>
                    <ul>
                      {items.map(item => {

                        var item_split = item.split(" ");
                        var item_sku = item_split[0];
                        var item_size = item_split[1];
                        // var item_quant = item_split[2];
                        var item_quant = parseInt(item_split[2], 10);


                        var item_obj = products.find(element => element.sku == item_sku)

                        total_price += item_obj.price * item_quant;
                        // console.log("trueinv", trueInventory[item_sku][item_size]);

                        // var cart_state = cartState;

                        // if (inventory[item_sku][item_size] < 0) {
                        //   cart_state = false;
                        // }
                        // setCartState(cart_state);

                        return (
                          <li>
                            <h1>{item_obj.title}</h1>
                            <p>size: {item_size}</p>
                            <p>quantity: {item_quant}</p>
                            <p>price: {(item_obj.price * item_quant).toFixed(2)}</p>

                            {inventory[item_sku][item_size] < 0 ?
                              <h1 style={{ color: "red" }}>Only {trueInventory[item_sku][item_size]} left!</h1>
                              // <h1 style={{color: "red"}}>AHH</h1>
                              :
                              null}

                            <button onClick={() => {
                              var j = cart_items.indexOf(item_sku + ' ' + item_size);
                              cart_items.splice(j, 1);

                              var i = items.indexOf(item);
                              items.splice(i, 1);

                              var cart_st = true;
                              for (var k = 0; k < items.length; k++) {
                                var things = items[k].split(' ');
                                if (inventory[things[0]][things[1]] < 0) {
                                  cart_st = false;
                                }
                              }
                              setCartState(cart_st);

                              setSize("");
                              setItems(items);
                              setIsOpen(false);
                              if (inventory[item_sku][item_size] < 0) {
                                inventory[item_sku][item_size] = trueInventory[item_sku][item_size];
                              }
                              else {

                                inventory[item_sku][item_size] = inventory[item_sku][item_size] + item_quant;
                              }
                              // console.log(inventory[item_sku][item_size]);
                              setInventory(inventory);
                              if (user != null) {
                                firebase.database().ref('carts/' + user.uid).set({
                                  cart: items
                                });
                              };
                            }}>remove</button>
                          </li>
                        )
                      })}
                    </ul>
                    <h1>Total: {total_price.toFixed(2)} </h1>
                    {cartState ?
                      <button onClick={() => {
                        console.log("checkout");

                        setItems([]);

                        // for (var i = 0; i < inventory.length; i++);
                        firebase.database().ref('inventory').transaction(() => inventory);
                        firebase.database().ref('carts/' + user.uid).transaction(() => null);
                      }}>Check out</button>
                      :
                      <button onClick={() => {
                        console.log("items", items);
                        console.log("cart_items", cart_items);
                        for (var i = 0; i < items.length; i++) {
                          var things = items[i].split(' ');
                          var item_sku = things[0];
                          var item_size = things[1];
                          var item_quant = parseInt(things[2], 10);

                          if (inventory[item_sku][item_size] < 0) {
                            inventory[item_sku][item_size] = 0;
                            items[i] = item_sku + ' ' + item_size + ' ' + trueInventory[item_sku][item_size];

                          }
                        };
                        setInventory(inventory);
                        setItems(items);
                        setIsOpen(false);
                        setCartState(true);


                      }}>Update Cart</button>
                    }

                  </div>
                }
                open={isOpen}
                // onSetOpen={() => {setIsOpen(true)}}
                styles={{ sidebar: { background: "white", width: "200px" } }}>
                <button onClick={() => setIsOpen(true)}>
                  Open Cart
          </button>
              </Sidebar>
            </Column>
            <Column>
              <Column.Group multiline={true}>
                {
                  products.map(product =>
                    <Column size="one-quarter">
                      <Card>
                        <Card.Image>
                          <img src={"data/products/" + product.sku + "_2.jpg"} alt="product"></img>
                        </Card.Image>
                        <Card.Footer>
                          <h1>
                            Title: {product.title}
                          </h1>
                        </Card.Footer>
                        <Card.Footer>
                          <h1>
                            Description: {product.description !== '' ? product.description : "N/A"}
                          </h1>
                        </Card.Footer>
                        <Card.Footer>
                          <h1>
                            $ {product.price.toFixed(2)}
                          </h1>
                        </Card.Footer>
                        <Card.Footer>
                          <Button.Group>

                            {(inventory[product.sku]["S"] > 0) ?
                              <Button id={product.sku + " S"} onClick={() => setSize("S")}> S </Button>
                              :
                              null}

                            {(inventory[product.sku]["M"] > 0) ?
                              <Button id={product.sku + " M"} onClick={() => setSize("M")}> M </Button>
                              :
                              null}

                            {(inventory[product.sku]["L"] > 0) ?
                              <Button id={product.sku + " L"} onClick={() => setSize("L")}> L </Button>
                              :
                              null}
                            {(inventory[product.sku]["XL"] > 0) ?
                              <Button id={product.sku + " XL"} onClick={() => setSize("XL")}> XL </Button>
                              :
                              null}
                            {(inventory[product.sku]["S"] + inventory[product.sku]["M"] + inventory[product.sku]["L"] + inventory[product.sku]["XL"] <= 0) ?
                              <Button disabled>Out of Stock</Button>
                              :
                              null}

                          </Button.Group>
                        </Card.Footer>
                        <Card.Footer>
                          <Button onClick={() => {
                            // console.log(cart_items);
                            if (size !== "") {
                              var cart = items;
                              var i = cart_items.indexOf(product.sku + ' ' + size);
                              // console.log(i);
                              var new_quant;
                              if (i == -1) {
                                cart_items = cart_items.concat(product.sku + ' ' + size);
                                new_quant = 1;
                                var new_item = product.sku + ' ' + size + ' ' + new_quant;
                                cart = cart.concat(new_item);
                              }
                              else {
                                var things = cart[i].split(' ');
                                new_quant = parseInt(things[2], 10) + 1;
                                cart[i] = product.sku + ' ' + size + ' ' + new_quant;
                              }

                              // var cart = items.concat(product.sku + ' ' + size)
                              setItems(cart);
                              if (user != null) {
                                firebase.database().ref('carts/' + user.uid).set({
                                  cart
                                });
                              };
                              inventory[product.sku][size] = inventory[product.sku][size] - 1;

                              if (inventory[product.sku][size] < 0) {
                                setCartState(false);
                              }

                              console.log("cart_items", cart_items);
                              console.log("items", items);

                              setInventory(inventory);
                              setIsOpen(true);

                            }
                          }}> Buy </Button>
                        </Card.Footer>
                      </Card>
                    </Column>
                  )
                }
              </Column.Group>
            </Column>
          </Column.Group>
        </Container>
      </Container>

    // <h1>hello</h1>

  );
};

export default App;
