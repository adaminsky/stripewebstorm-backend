'use latest';

import express from 'express';
import { fromExpress } from 'webtask-tools';
import bodyParser from 'body-parser';
import stripe from 'stripe';
var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyAI0hjtt6DpgtboWpyOcWsh_Xn6BxVYjMY",
    authDomain: "bobago-c7da5.firebaseapp.com",
    databaseURL: "https://bobago-c7da5.firebaseio.com",
    projectId: "bobago-c7da5",
    Storagebucket: "bobago-c7da5.appspot.com",
    messagingSenderId: "246035056974"
};
firebase.initializeApp(config);

var database = firebase.database();

bodyParser.urlencoded();

var app = express();
app.use(bodyParser.urlencoded());


app.post('/payment', (req,res) => {
  var ctx = req.webtaskContext;
  var STRIPE_SECRET_KEY = ctx.secrets.STRIPE_SECRET_KEY;

 var token = req.body.id;

 stripe(STRIPE_SECRET_KEY).customers.create({
  email: "some email",
  source: token,
 }).then(function(customer) {
    //save customer
     database.ref("Customer ID").child(customer.email).set(customer.id);
     database.ref("Users").child("hi").set("sucks");

    stripe(STRIPE_SECRET_KEY).charges.create({
      amount: req.query.amount,
      currency: req.query.currency,
      description: req.query.description,
      customer: customer.id,
 }, (err, charge) => {
    const status = err ? 400 : 200;
    const message = err ? err.message : 'Payment done!';
    res.writeHead(status, { 'Content-Type': 'text/html' });
    return res.end('<h1>' + message + '</h1>');
    });
  });
});

// comment this to disable the test form
app.get('/', (req, res) => {
  var ctx = req.webtaskContext; 
  res.send(renderView(ctx));
});

function renderView(ctx) {
  //change /stripe-payment below to your task name
  return `
  <form action="/stripe-payment/payment?currency=USD&amount=2000&description=Test%20item" method="POST">
    <script
      src="https://checkout.stripe.com/checkout.js" class="stripe-button"
      data-key="${ctx.secrets.STRIPE_PUBLISHABLE_KEY}"
      data-amount="2000"
      data-name="Stripe.com"
      data-description="Test item"
      data-locale="auto">
    </script>
  </form>
  `;
}

module.exports = fromExpress(app);  