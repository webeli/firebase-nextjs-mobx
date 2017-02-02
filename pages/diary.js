import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { initializePage } from '~/utils';
import { BaseLayout } from '~/ui/layouts';
import { initHashStore } from '~/env/stores';
import { HashList, HashInput} from '../ui/diary';

@observer
class Diary extends Component {
    state = {
        hashStore: null
    };

    constructor(props) {
        super(props);
        this.state ={
            hashStore: initHashStore()
        };
    }

    componentDidMount () {
        this.state.hashStore.start()
    }

    componentWillUnmount () {
        this.state.hashStore.stop()
    }

    render() {
        return (
            <BaseLayout>
                <HashList hashes={this.state.hashStore.hashes.values()} />
                <HashInput disabled={!this.state.hashStore.ready} value={this.state.hashStore.hash} callback={(v) => this.state.hashStore.hash = v} />
            </BaseLayout>
        );
    }
}

export default initializePage(Diary);