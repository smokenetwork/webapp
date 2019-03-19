import React from 'react';

import {Link} from 'react-router';
import {connect} from "react-redux";


class Sponsors extends React.Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="large-12 medium-12 small-12 text-center">
            <h1 className="title">Our Sponsors</h1>
            <a className="button">Become A Sponsor</a>

            {this.props.sponsors}
          </div>
          <div className="columns large-4 medium-4 small-12">
            <div className="sponsor-card">
               <Link to="username"><h2>Display Name/Username</h2></Link>
               <Link to="username"><img src="https://via.placeholder.com/150" /></Link>
               <div className="module fade">
                <p>ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOUT ABOU</p>
               </div>
               <p className="elipsis"><a href="https://settingsurl.com">https://website.com/skhfkshfkshshk</a></p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = {
  path: 'sponsors',
  component: connect(
    state => {
      let sponsors = state.global.get('sponsors');
      if (sponsors === undefined) {
        sponsors = [];
      }

      return {
        sponsors
      }
    },
    dispatch => ({})
  )(Sponsors)
};
