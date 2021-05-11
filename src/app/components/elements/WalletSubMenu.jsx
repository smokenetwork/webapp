import React from 'react';
import {Link} from 'react-router';
import tt from 'counterpart';

export default ({account_name}) => {
  return <div className="WalletSubMenu menu">
    <div>
      <Link to={`/@${account_name}/transfers`} className="button slim hollow secondary" activeClassName="active">
        {tt('g.balances')}
      </Link>
    </div>
    <div>
      <Link to={`/@${account_name}/permissions`} className="button slim hollow secondary" activeClassName="active">
        {tt('g.permissions')}
      </Link>
    </div>
    <div>
      <Link to={`/@${account_name}/password`} className="button slim hollow secondary" activeClassName="active">{tt('g.password')}</Link>
    </div>
  </div>
}
