import React, {Component} from 'react'
import PropTypes from 'prop-types';
import shouldComponentUpdate from '../../utils/shouldComponentUpdate'
import {connect} from 'react-redux';
import ChangePassword from './ChangePassword'

class PasswordReset extends Component {
  static propTypes = {
    // HTML
    account: PropTypes.object.isRequired,
    // Redux
    isMyAccount: PropTypes.bool.isRequired,
    accountName: PropTypes.string.isRequired,
  }

  constructor() {
    super()
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'PasswordReset')
  }

  render() {
    const {accountName} = this.props

    return (<div className="row">
      <div className="column large-12 small-12">
        <ChangePassword username={accountName}/>
      </div>
    </div>)
  }
}

export default connect(
  (state, ownProps) => {
    const {account} = ownProps
    const accountName = account.get('name')
    const current = state.user.get('current')
    const username = current && current.get('username')
    const isMyAccount = username === accountName
    return {...ownProps, isMyAccount, accountName}
  },
  dispatch => ({})
)(PasswordReset)
