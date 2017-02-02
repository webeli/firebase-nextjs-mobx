import firebase from 'firebase';
import { action, computed, observable, asMap, autorun } from 'mobx';
import { db, initAuthStore } from './';
import isSameDay from 'date-fns/is_same_day';

let store = null;

class Store {
    @observable hash = '';
    @observable hashes = observable.map([]);
    @observable ready = false;

    constructor() {
        this.authStore = initAuthStore(false);
        autorun(() => {
            if (!this.ready) return;
            this.hash;  // hack to run this autorun on every change of this.hash
            if (this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                // check if it's an update or insert
                const hashes = this.hashes.entries();
                const last = hashes[hashes.length - 1];
                if (hashes && last && isSameDay(new Date(last[1].created), new Date())) {
                    this.update(last[0]);
                } else {
                    this.addHash();
                }
            }, 200)
        })
    }

    @action start = () => {
        const disposer = autorun(() => {
            if (this.authStore.user) {
                disposer();
                const userId = this.authStore.user.uid;
                this.ref = db.ref(`/hashes/${userId}`);
                this.ref.once('value', (snapshot) => {
                    snapshot.forEach((childSnapshot) => {
                        this.hashes.set(childSnapshot.key, childSnapshot.val());
                    });
                    const hashes = this.hashes.entries();
                    const last = hashes[hashes.length - 1];
                    if (hashes && last && isSameDay(new Date(last[1].created), new Date())) {
                        this.hash = last[1].text;
                    }
                    this.ready = true;
                });
                this.ref.on('child_added', (data) => {
                    this.hashes.set(data.key, data.val());
                });
                this.ref.on('child_changed', (data) => {
                    this.hashes.set(data.key, data.val());
                });
                this.ref.on('child_removed', function(data) {
                    this.hashes.delete(data.key);
                });
            }
        })
    }

    stop = () => this.ref ? this.ref.off() : null;

    getHash(id) {
        return this.hashes.get(id);
    }

    update = (hashId) => {
        const ref = this.ref.child(`${hashId}`);
        const stamp = firebase.database.ServerValue.TIMESTAMP;
        const updates = {
            text: this.hash,
            modified: stamp,
        };
        ref.update(updates)
            .then(() => {
                console.log("update success");
            }).catch(error => {
                console.log(error);
            });
    }

    addHash() {
        const stamp = firebase.database.ServerValue.TIMESTAMP;
        const ref = this.ref.push();
        ref.set({ text: this.hash, created: stamp, modified: stamp })
            .then(() => {
                console.log("insert success");
            }).catch(error => {
                console.log(error);
            });
    }
}

export default function initStore (isServer) {
    if (isServer && typeof window === 'undefined') {
        return new Store(isServer)
    } else {
        if (store === null) {
            store = new Store(isServer)
        }
        return store
    }
}