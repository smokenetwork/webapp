import React from 'react';
import {Link} from 'react-router';
import NotifiCounter from './NotifiCounter';
import tt from 'counterpart';

export default ({account_name}) => {
  return <div className="WalletSubMenu menu">
    <div>
      <Link to={`/@${account_name}/transfers`} className="button slim hollow secondary" activeClassName="active">
        {tt('g.balances')} <NotifiCounter fields="send,receive"/>
      </Link>
    </div>
    <div>
      <Link to={`/@${account_name}/permissions`} className="button slim hollow secondary" activeClassName="active">
        {tt('g.permissions')} <NotifiCounter fields="account_update"/>
      </Link>
    </div>
    <div>
      <Link to={`/@${account_name}/password`} className="button slim hollow secondary" activeClassName="active">{tt('g.password')}</Link>
    </div>
  </div>
}
