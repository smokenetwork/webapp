/* eslint react/prop-types: 0 */
import React, {Component} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux'
import user from "../../redux/User";
import SvgImage from '../elements/SvgImage';
import tt from 'counterpart';

class EligibleDialog extends Component {

  constructor() {
    super();
    this.readnContinue = this.readnContinue.bind(this);
  }

  readnContinue(e) {
    this.props.hideEligible();
    window.location.href = window.location.href;
  }

  static propTypes = {};

  render() {
    return (
      <div className="EligibleWelcome">
        <div className="text-center">
          <SvgImage name="smoke" width="300px" className="Header__logo"></SvgImage>
          <h2>{tt('navigation.intro_tagline')}</h2>
          <br/>
          <hr/>
          <a className="button button--primary EligibleButton" onClick={this.readnContinue} href="/pick_account">
            <b>{tt('navigation.sign_up')}</b> </a>
          <a className="button button--primary EligibleButton" onClick={this.readnContinue} href="/login.html">
            <b>{tt('g.login')}</b> </a>
          <br />
          Or <a type="submit" onClick={this.readnContinue}>
              continue without signing up...
          </a>
          <hr />
          <h4>Are you eligible to visit smoke.io?</h4>
          By entering, I am at least 21 years old or a valid medical marijuana patient and agree to the <Link to='/tos.html'>Terms of
          Service</Link> and <Link to='/privacy.html'>Privacy Policy</Link>.
        </div>
      </div>
    )
  }
}

export default connect(
  state => {
    return {}
  },
  dispatch => ({
    hideEligible: e => {
      if (e) e.preventDefault();

      if (process.env.BROWSER) {
        localStorage.setItem('user/show_eligible_modal', JSON.stringify(false));
      }

      dispatch(user.actions.hideEligible())
    }
  })
)(EligibleDialog)
