import React from 'react';
import PropTypes from 'prop-types';
import {formatDecimal, parsePayoutAmount} from "../../utils/ParsersAndFormatters";
import tt from 'counterpart';
import {connect} from "react-redux";

class PostPayout extends React.Component {
  static propTypes = {
    // HTML properties
    post: PropTypes.string.isRequired,
    flag: PropTypes.bool,
    showList: PropTypes.bool,

    // Redux connect properties
    vote: PropTypes.func.isRequired,
    author: PropTypes.string, // post was deleted
    permlink: PropTypes.string,
    username: PropTypes.string,
    is_comment: PropTypes.bool,
    active_votes: PropTypes.object,
    loggedin: PropTypes.bool,
    post_obj: PropTypes.object,
    net_vesting_shares: PropTypes.number,
    voting: PropTypes.bool,
  };

  static defaultProps = {
    showList: true,
    flag: false
  };

  render() {
    const {isComment, post} = this.props;

    const totalVotes = post.getIn(['stats', 'total_votes']);
    const cashoutTime = post.get('cashout_time');
    const maxPayout = parsePayoutAmount(post.get('max_accepted_payout'));
    const pendingPayout = parsePayoutAmount(post.get('pending_payout_value'));
    const totalAuthorPayout = parsePayoutAmount(post.get('total_payout_value'));
    const totalCuratorPayout = parsePayoutAmount(post.get('curator_payout_value'));
    let payout = pendingPayout + totalAuthorPayout + totalCuratorPayout;

    if (payout < 0.0) {
      payout = 0.0;
    }
    if (payout > maxPayout) {
      payout = maxPayout;
    }

    const payoutLimitHit = payout >= maxPayout;

    // Show pending payout amount for declined payment posts
    if (maxPayout === 0) {
      payout = pendingPayout;
    }
    const isCashoutActive = pendingPayout > 0 || (cashoutTime.indexOf('1969') !== 0 && !(isComment && totalVotes === 0));
    const payoutItems = [];

    if (isCashoutActive) {
      payoutItems.push({value: tt('voting_jsx.pending_payout', {value: formatDecimal(pendingPayout).join('')})});
    }
    if (isCashoutActive) {
      payoutItems.push({value: <TimeAgoWrapper date={cashoutTime}/>});
    }

    if (maxPayout == 0) {
      payoutItems.push({value: tt('voting_jsx.payout_declined')})
    } else if (maxPayout < 1000000) {
      payoutItems.push({value: tt('voting_jsx.max_accepted_payout', {value: formatDecimal(maxPayout).join('')})})
    }
    if (totalAuthorPayout > 0) {
      payoutItems.push({value: tt('voting_jsx.past_payouts', {value: formatDecimal(totalAuthorPayout + totalCuratorPayout).join('')})});
      payoutItems.push({value: tt('voting_jsx.past_payouts_author', {value: formatDecimal(totalAuthorPayout).join('')})});
      payoutItems.push({value: tt('voting_jsx.past_payouts_curators', {value: formatDecimal(totalCuratorPayout).join('')})});
    }


    return <DropdownMenu el="div" items={payoutItems}>
            <span style={payoutLimitHit ? {opacity: '0.5'} : {}}>
                <FormattedAsset amount={payout} asset="$" classname={maxPayout === 0 ? 'strikethrough' : ''}/>
              {payoutItems.length > 0 && <Icon name="dropdown-arrow"/>}
            </span>
    </DropdownMenu>;
  }
}

export default connect(
  // mapStateToProps
  (state, ownProps) => {
    const post = state.global.getIn(['content', ownProps.post]);

    if (!post) {
      return ownProps;
    }

    const author = post.get('author');
    const permlink = post.get('permlink');
    const active_votes = post.get('active_votes');
    const is_comment = post.get('parent_author') !== '';

    const current_account = state.user.get('current');
    const username = current_account ? current_account.get('username') : null;
    const vesting_shares = current_account ? current_account.get('vesting_shares') : 0.0;
    const delegated_vesting_shares = current_account ? current_account.get('delegated_vesting_shares') : 0.0;
    const received_vesting_shares = current_account ? current_account.get('received_vesting_shares') : 0.0;
    const net_vesting_shares = vesting_shares - delegated_vesting_shares + received_vesting_shares;
    const voting = state.global.get(`transaction_vote_active_${author}_${permlink}`);

    return {
      post,
      flag: ownProps.flag,
      showList: ownProps.showList,
      author,
      permlink,
      username,
      active_votes,
      net_vesting_shares,
      is_comment,
      loggedin: username != null,
      voting
    }
  },
)(PostPayout)
