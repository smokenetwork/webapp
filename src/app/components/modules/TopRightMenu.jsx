import React from 'react';
import PropTypes from 'prop-types';
import {browserHistory} from 'react-router';
import {connect} from 'react-redux';
import Icon from '../elements/Icon';
import user from '../../redux/User';
import Userpic from '../elements/Userpic';
import LoadingIndicator from '../elements/LoadingIndicator';
import tt from 'counterpart';
import {Link} from 'react-router';


const defaultNavigate = (event) => {
  if (event.metaKey || event.ctrlKey) {
    // prevent breaking anchor tags
  } else {
    event.preventDefault();
  }
  const a = event.target.nodeName.toLowerCase() === 'a' ? event.target : event.target.parentNode;
  browserHistory.push(a.pathname + a.search + a.hash);
};

function TopRightMenu({username, showLogin, logout, loggedIn, vertical, navigate, probablyLoggedIn, toggleOffCanvasMenu}) {
  const mcn = 'menu' + (vertical ? ' vertical' : '');
  const hcl = vertical ? '' : 'hide';
  const mcl = vertical ? '' : ' sub-menu';
  const lcn = vertical ? '' : 'show-for-medium';

  const nav = navigate || defaultNavigate;
  const submitStory = $STM_Config.read_only_mode ? null : (
    <li className={lcn + ' submit-story' + (vertical ? ' last' : '')}>
      {!vertical && <Link to="/post"><Icon className="icon-border" name="pencil"/></Link>}
    </li>);
  const logoutbutton = (
    <li className={hcl}>
      <a onClick={logout}>
        <Icon name="exit"/>{tt('g.logout')}
      </a>
    </li>);
  const accountLink = `/@${username}`;
  if (loggedIn) {
    return (
      <ul className={mcn + mcl}>
        {!vertical && <li className={lcn}><Link to="/trending"><Icon className="icon-border" name="trending"/></Link></li>}
        {!vertical && <li className={lcn}><Link to="/created"><Icon className="icon-border" name="lighter"/></Link></li>}
        {!vertical && <li className={lcn}><Link to="/tags"><Icon className="icon-border" name="tagspop"/></Link></li>}
        {!vertical && <li className={'Header__userpic ' + lcn}>
          <Link to="/sponsors">
            <Icon className="icon-border" name="medal"/>
          </Link>
        </li>}
        {!vertical && <li className={lcn}><a href="/static/search.html"><Icon className="icon-border" name="search"/></a></li>}
        {logoutbutton}
        {submitStory}
        {!vertical && <li className={'Header__userpic ' + lcn}>
          <Link to={accountLink} title={username}>
            <Userpic account={username}/>
          </Link>
        </li>}
        {toggleOffCanvasMenu && <li className="toggle-menu Header__hamburger">
          <a href="#" onClick={toggleOffCanvasMenu}>
            <span className="hamburger"/>
          </a>
        </li>}
      </ul>
    );
  }
  if (probablyLoggedIn) {
    return (
      <ul className={mcn + mcl}>
        <li className={lcn} style={{paddingTop: 0, paddingBottom: 0}}>
          <LoadingIndicator type="circle" inline/>
        </li>
        {toggleOffCanvasMenu && <li className="toggle-menu Header__hamburger">
          <a href="#" onClick={toggleOffCanvasMenu}>
            <span className="hamburger"/>
          </a>
        </li>}
      </ul>
    );
  }
  return (
    <ul className={mcn + mcl}>
      {!vertical && <li className={lcn}><Link to="/trending"><Icon className="icon-border" name="trending"/></Link></li>}
      {!vertical && <li className={lcn}><Link to="/created"><Icon className="icon-border" name="lighter"/></Link></li>}
      {!vertical && <li className={lcn}><Link to="/tags"><Icon className="icon-border" name="tagspop"/></Link></li>}
      {!vertical && <li className={'Header__userpic ' + lcn}>
        <Link to="/sponsors">
          <Icon className="icon-border" name="medal"/>
        </Link>
      </li>}
      {!vertical && <li className={lcn}><a href="/static/search.html"><Icon className="icon-border" name="search"/></a></li>}
      {!vertical && <li className={lcn}><a className="button signin" href="/login.html" onClick={showLogin}><Icon name="mascot"/>{tt('g.login')} / {tt('g.sign_up')}</a></li>}
      {toggleOffCanvasMenu && <li className="toggle-menu Header__hamburger">
        <a href="#" onClick={toggleOffCanvasMenu}>
          <span className="hamburger"/>
        </a>
      </li>}
    </ul>
  );
}

TopRightMenu.propTypes = {
  username: PropTypes.string,
  loggedIn: PropTypes.bool,
  probablyLoggedIn: PropTypes.bool,
  showLogin: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  vertical: PropTypes.bool,
  navigate: PropTypes.func,
  toggleOffCanvasMenu: PropTypes.func,
};

export default connect(
  state => {
    if (!process.env.BROWSER) {
      return {
        username: null,
        loggedIn: false,
        probablyLoggedIn: !!state.offchain.get('account')
      }
    }
    const username = state.user.getIn(['current', 'username']);
    const loggedIn = !!username;
    return {
      username,
      loggedIn,
      probablyLoggedIn: false,
    }
  },
  dispatch => ({
    showLogin: (e) => {
      if (e) e.preventDefault();
      dispatch(user.actions.showLogin())
    },
    logout: (e) => {
      if (e) e.preventDefault();
      dispatch(user.actions.logout())
    },
  })
)(TopRightMenu);
