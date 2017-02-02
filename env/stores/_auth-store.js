import { action, computed, observable } from 'mobx';
const firebase = require('firebase/app');
import { auth } from './';

let store = null;

class Store {
    @observable user = null;

    constructor(isServer) {
        if (isServer) return;
        this.unwatchAuth = auth.onAuthStateChanged(user => {
            this.user = user;
        });
    }

    cleanup() {
        if (this.unwatchAuth) {
            this.unwatchAuth();
        }
    }

    signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).then(function(result) {
            // console.log(result);
        }).catch(function(error) {
            // const errorMessage = error.message;
        });
    }

    signOut = () => {
        auth.signOut().then(function() {
            // Sign-out successful.
        }, function(error) {
            // An error happened.
        });
    }

}

export default function initStore (isServer) {
    if (isServer && typeof window === 'undefined') {
        return;
    } else {
        if (store === null) {
            store = new Store(isServer)
        }
        return store
    }
}