import React from 'react';
import {Link} from 'react-router';
import {connect} from "react-redux";
import FormattedAsset from '../elements/FormattedAsset';
import TimeAgoWrapper from '../elements/TimeAgoWrapper';

const renderSponsorList = (items) => (
  <div className="row">
    {items.map(item => (
      <div className="columns large-4 medium-4 small-12" key={`item_sponsor_${item.accountname}`}>
        <div className="sponsor-card">
          <Link to={`@${item.accountname}`}><h2>{item.accountname}</h2></Link>
          <Link to={`@${item.accountname}`}><img src={`${$STM_Config.img_proxy_prefix}profileimage/${item.accountname}/128x128`}/></Link>
          <div className="module fade">
            <p><FormattedAsset amount={item.amount} asset="SMOKE" classname={''}/></p>
          </div>
          <p className="elipsis"><TimeAgoWrapper date={item.txdatetime * 1000}/></p>
        </div>
      </div>
    ))}
  </div>
);

class Sponsors extends React.Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="large-12 medium-12 small-12 text-center">
            <h1 className="title">Our Sponsors</h1>
            <a className="button">Become A Sponsor</a>
          </div>
        </div>

        {this.props.sponsors && renderSponsorList(this.props.sponsors.toJS())}
      </div>
    );
  }
}

module.exports = {
  path: 'sponsors',
  component: connect(
    state => {
      return {
        sponsors: state.global.get('sponsors')
      }
    },
    dispatch => ({})
  )(Sponsors)
};
