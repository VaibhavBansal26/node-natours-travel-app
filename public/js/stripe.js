/*eslint-disable*/
import axios from 'axios';
import {showAlert} from './alerts';

const stripe = Stripe('pk_test_51GuCxhGAvbykC2XsnqXirqsc72g94NYqbgF0jUu2TKyoe70pFUhspD0WfwV7aieZqX1M3GxK4GlSJrSYwomzx2Nj00uII6fRQZ');

export const bookTour = async tourId => {
    //1.Get checkoutsession from server api endpoint
    try{
        const session = await axios(`http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`);
        await stripe.redirectToCheckout({
            sessionId:session.data.session.id
        })
    }catch(err){
        console.log(err);
        showAlert('error',err);
    }
   
    //console.log(session)
    //2.Create stripe checkout form + change cresit card
};