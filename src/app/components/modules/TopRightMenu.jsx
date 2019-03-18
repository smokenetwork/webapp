import React from 'react';
import {browserHistory} from 'react-router';
import {connect} from 'react-redux';
import Icon from '../elements/Icon';
import user from '../../redux/User';
import Userpic from '../elements/Userpic';
import LoadingIndicator from '../elements/LoadingIndicator';
import NotifiCounter from '../elements/NotifiCounter';
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
      {!vertical && <Link to="/post"><Icon name="pencil"/></Link>}
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
        {!vertical && <li className={lcn}><Link to="/created"><Icon name="lighter"/></Link></li>}
        {!vertical && <li className={lcn}><Link to="/trending"><Icon name="trending"/></Link></li>}
        {/*{!vertical && <li className={'Header__userpic ' + lcn}>*/}
          {/*<Link to="/sponsors">*/}
            {/*<Icon name="medal"/>*/}
          {/*</Link>*/}
        {/*</li>}*/}
        {!vertical && <li className={lcn}><a href="/static/search.html"><Icon name="search"/></a></li>}
        {logoutbutton}
        {submitStory}
        {!vertical && <li className={'Header__userpic ' + lcn}>
          <Link to={accountLink} title={username}>
            <Userpic account={username}/>
          </Link>
          <div className="TopRightMenu__notificounter"><NotifiCounter fields="total"/></div>
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
      {!vertical && <li className={lcn}><a href="/pick_account"><Icon name="smoke"/>{tt('g.sign_up')}</a></li>}
      {!vertical && <li className={lcn}><a href="/login.html" onClick={showLogin}><Icon name="mascot"/>{tt('g.login')}</a></li>}
      {!vertical && <li className={lcn}><a href="/static/search.html"><Icon name="search"/></a></li>}
      {!vertical && <li className={'Header__userpic ' + lcn}>
        <Link to="/sponsors">
          <Icon name="medal"/>
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

TopRightMenu.propTypes = {
  username: React.PropTypes.string,
  loggedIn: React.PropTypes.bool,
  probablyLoggedIn: React.PropTypes.bool,
  showLogin: React.PropTypes.func.isRequired,
  logout: React.PropTypes.func.isRequired,
  vertical: React.PropTypes.bool,
  navigate: React.PropTypes.func,
  toggleOffCanvasMenu: React.PropTypes.func,
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
