import React, { Component, PropTypes } from 'react';
import { Provider } from 'mobx-react';
import { initBaseStore, initAuthStore } from '~/env/stores';

export default function initializePage(UI) {
    return class PageComponent extends Component {
        static getInitialProps({req}) {
            const isServer = !!req;
            const baseStore = initBaseStore(isServer);
            const authStore = initAuthStore(isServer);
            return {helloMessage: baseStore.helloMessage, isServer}
        }

        constructor(props) {
            super(props);
            this.baseStore = initBaseStore(props.isServer, props.helloMessage);
            this.authStore = initAuthStore(props.isServer);
        }

        render() {
            return (
                <Provider BaseStore={this.baseStore} AuthStore={this.authStore}>
                    <div>
                        <style jsx global>{`body { margin: 0; padding: 0; }`}</style>
                        <UI />
                    </div>
                </Provider>
            )
        }
    }
}