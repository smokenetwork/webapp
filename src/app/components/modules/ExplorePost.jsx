import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {serverApiRecordEvent} from '../../utils/ServerApiClient';
import Icon from '../elements/Icon';
import CopyToClipboard from 'react-copy-to-clipboard';
import tt from 'counterpart';

class ExplorePost extends Component {

    static propTypes = {
        permlink: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            copied: false
        };
        this.onCopy = this.onCopy.bind(this);
        this.Smoked = this.Smoked.bind(this);
        this.Smokedb = this.Smokedb.bind(this);
        this.Busy = this.Busy.bind(this);
        this.Phist = this.Phist.bind(this);
    }

    Smoked() {
        serverApiRecordEvent('SmokedView', this.props.permlink);
    }

    Smokedb() {
        serverApiRecordEvent('SmokedbView', this.props.permlink);
    }

    Busy() {
        serverApiRecordEvent('Busy view', this.props.permlink);
    }

    Phist() {
        serverApiRecordEvent('PhistView', this.props.permlink);
    }

    onCopy() {
        this.setState({
            copied: true
        });
    }

    render() {
        const link = this.props.permlink;
        const steemd = 'https://steemd.com' + link;
        const steemdb = 'https://steemdb.com' + link;
        const busy = 'https://busy.org' + link;
        const steemit = 'https://smoke.io' + link;
        const phist = 'https://phist.steemdata.com/history?identifier=smoke.io' + link;
        let text = this.state.copied == true ? tt('explorepost_jsx.copied') : tt('explorepost_jsx.copy');
        return (
            <span className="ExplorePost">
                <h4>{tt('g.share_this_post')}</h4>
                <hr/>
                <div className="input-group">
                    <input className="input-group-field share-box" type="text" value={steemit}
                           onChange={(e) => e.preventDefault()}/>
                    <CopyToClipboard text={steemit} onCopy={this.onCopy}
                                     className="ExplorePost__copy-button input-group-label">
                      <span>{text}</span>
                    </CopyToClipboard>
                </div>
                <h5>{tt('explorepost_jsx.alternative_sources')}</h5>
                <ul>
                    <li><a href={steemd} onClick={this.Smoked} target="_blank"
                           rel="noopener noreferrer">steemd.com <Icon name="extlink"/></a></li>
                    <li><a href={steemdb} onClick={this.Smokedb} target="_blank"
                           rel="noopener noreferrer">steemdb.com <Icon name="extlink"/></a></li>
                    <li><a href={busy} onClick={this.Busy} target="_blank" rel="noopener noreferrer">busy.org <Icon
                        name="extlink"/></a></li>
                    <li><a href={phist} onClick={this.Phist} target="_blank"
                           rel="noopener noreferrer">phist.steemdata.com <Icon name="extlink"/></a></li>
                </ul>
            </span>
        )
    }
}

export default connect(
)(ExplorePost)
